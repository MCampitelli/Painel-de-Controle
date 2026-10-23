import { APP_CONFIG } from "../../config/appConfig";
import type { Repository } from "../../types";
import type {
  ApiUserIdentity,
  GitHubCheckRunRaw,
  GitHubPullRequestDetailsRaw,
  GitHubPullRequestRaw,
  GitHubReviewRaw,
  GitHubStatusRaw,
} from "../../types/integrations";
import { ApiServiceError, mapGitHubError } from "../errors/apiErrorMapper";
import { normalizePullRequest } from "./githubNormalizer";

const GITHUB_API_BASE_URL = "https://api.github.com";

function buildHeaders(token: string): HeadersInit {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function fetchGitHub<T>(url: string, token: string): Promise<T> {
  const response = await fetch(url, {
    method: "GET",
    headers: buildHeaders(token),
  });

  if (!response.ok) {
    throw mapGitHubError(response.status);
  }

  return (await response.json()) as T;
}

async function fetchAllPages<T>(baseUrl: string, token: string): Promise<T[]> {
  const results: T[] = [];
  let page = 1;
  while (true) {
    const url = new URL(baseUrl);
    url.searchParams.set("page", String(page));
    url.searchParams.set("per_page", "100");
    const batch = await fetchGitHub<T[]>(url.toString(), token);
    results.push(...batch);
    if (batch.length < 100) break;
    page++;
  }
  return results;
}

function isTrackedRepoConfigured(name: string): boolean {
  return !name.startsWith("REPOSITORIO_");
}

function isPrAuthoredByUser(pr: GitHubPullRequestRaw, userLogin: string): boolean {
  return pr.user?.login?.toLowerCase() === userLogin.toLowerCase();
}

function buildRepositoryModel(name: string, pullRequests: Repository["pullRequests"]): Repository {
  return {
    id: `repo-${name}`,
    name,
    url: `https://github.com/${APP_CONFIG.github.organization}/${name}`,
    pullRequests,
  };
}

export async function testGitHubConnection(token: string): Promise<ApiUserIdentity> {
  const me = await fetchGitHub<{ login: string; name?: string | null; email?: string | null }>(
    `${GITHUB_API_BASE_URL}/user`,
    token,
  );

  return {
    login: me.login,
    displayName: me.name?.trim() || me.login,
    email: me.email ?? undefined,
  };
}

export async function getPullRequestDetails(
  repository: string,
  pullRequestNumber: number,
  token: string,
): Promise<{ details: GitHubPullRequestDetailsRaw; reviews: GitHubReviewRaw[] }> {
  if (!isTrackedRepoConfigured(repository)) {
    throw new ApiServiceError("Repositório de placeholder não pode ser consultado até ser configurado.");
  }

  const details = await fetchGitHub<GitHubPullRequestDetailsRaw>(
    `${GITHUB_API_BASE_URL}/repos/${APP_CONFIG.github.organization}/${repository}/pulls/${pullRequestNumber}`,
    token,
  );

  const reviews = await fetchGitHub<GitHubReviewRaw[]>(
    `${GITHUB_API_BASE_URL}/repos/${APP_CONFIG.github.organization}/${repository}/pulls/${pullRequestNumber}/reviews`,
    token,
  );

  return { details, reviews };
}

export async function getCheckRuns(
  repository: string,
  headSha: string,
  token: string,
): Promise<GitHubCheckRunRaw[]> {
  const commitUrl = `${GITHUB_API_BASE_URL}/repos/${APP_CONFIG.github.organization}/${repository}/commits/${headSha}`;
  const checkRuns: GitHubCheckRunRaw[] = [];
  let page = 1;
  while (true) {
    const checksRes = await fetch(
      `${commitUrl}/check-runs?filter=latest&per_page=100&page=${page}`,
      { method: "GET", headers: buildHeaders(token) },
    );
    if (checksRes.status === 403 && page === 1) {
      console.warn(`[GitHub] Checks API indisponível para ${repository}; exibindo apenas os status do commit.`, mapGitHubError(403));
      break;
    }
    if (!checksRes.ok) throw mapGitHubError(checksRes.status);
    const data = (await checksRes.json()) as { check_runs: GitHubCheckRunRaw[] };
    checkRuns.push(...data.check_runs);
    if (data.check_runs.length < 100) break;
    page++;
  }

  const statuses = await fetchAllPages<GitHubStatusRaw>(`${commitUrl}/statuses`, token);
  // Commit statuses are returned newest first, including previous results for each context.
  const seen = new Set<string>();
  const latestStatuses = statuses
    .filter((status) => {
      if (seen.has(status.context)) return false;
      seen.add(status.context);
      return true;
    })
    .map((s) => ({
      name: s.context,
      status: s.state === "pending" ? "in_progress" : "completed",
      conclusion: s.state === "success" ? "success" : s.state === "pending" ? null : "failure",
    } satisfies GitHubCheckRunRaw));

  return [...checkRuns, ...latestStatuses];
}

export async function getRepositoryPullRequests(
  repository: string,
  token: string,
  userLogin: string,
): Promise<Repository> {
  if (!isTrackedRepoConfigured(repository)) {
    return buildRepositoryModel(repository, []);
  }

  // Mirror the web URL /pulls/{username}: search API filters by author server-side
  const searchUrl =
    `${GITHUB_API_BASE_URL}/search/issues?q=is:pr+state:open` +
    `+author:${encodeURIComponent(userLogin)}` +
    `+repo:${encodeURIComponent(APP_CONFIG.github.organization)}/${encodeURIComponent(repository)}` +
    `&per_page=100`;

  const searchResult = await fetchGitHub<{ total_count: number; items: Array<{ number: number; title: string }> }>(
    searchUrl,
    token,
  );


  const normalizedPullRequests = await Promise.all(
    searchResult.items.map(async ({ number }) => {
      try {
        const { details, reviews } = await getPullRequestDetails(repository, number, token);
        const checkRuns = await getCheckRuns(repository, details.head.sha, token);
        return normalizePullRequest(repository, details, details, reviews, checkRuns);
      } catch (err) {
        console.warn(`[GitHub] Falha ao buscar detalhes do PR #${number} em ${repository}:`, err);
        return null;
      }
    }),
  );

  return buildRepositoryModel(
    repository,
    normalizedPullRequests.filter((pr): pr is NonNullable<typeof pr> => pr !== null),
  );
}

export async function getPullRequests(token: string, overrideUsername?: string): Promise<{
  user: ApiUserIdentity;
  repositories: Repository[];
}> {
  const user = await testGitHubConnection(token);
  const filterLogin = overrideUsername?.trim() || user.login;

  // Use allSettled so a failure in one repo doesn't block the others
  const results = await Promise.allSettled(
    APP_CONFIG.github.repositories.map((repository) =>
      getRepositoryPullRequests(repository, token, filterLogin),
    ),
  );

  const repositories = results.map((result, i) => {
    const repoName = APP_CONFIG.github.repositories[i];
    if (result.status === "rejected") {
      console.error(`[GitHub] Falha ao buscar PRs do repo "${repoName}":`, result.reason);
      return buildRepositoryModel(repoName, []);
    }
    return result.value;
  });

  return { user, repositories };
}
