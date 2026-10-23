import type {
  GitHubCheckRunRaw,
  GitHubPullRequestDetailsRaw,
  GitHubPullRequestRaw,
  GitHubReviewRaw,
} from "../../types/integrations";
import type { CheckRun, CheckStatus, PRStatus, PullRequest } from "../../types";

function resolvePrStatus(
  pullRequest: GitHubPullRequestDetailsRaw,
  reviews: GitHubReviewRaw[],
): PRStatus {
  const hasConflicts = pullRequest.mergeable === false || pullRequest.mergeable_state === "dirty";
  if (pullRequest.draft) return "draft";
  if (hasConflicts) return "conflito";

  const approvals = reviews.filter((review) => review.state === "APPROVED").length;
  const hasRequestedReviewers = (pullRequest.requested_reviewers?.length ?? 0) > 0;

  if (approvals > 0) {
    return "aprovado";
  }

  if (hasRequestedReviewers) {
    return "aguardando_aprovacao";
  }

  return "em_revisao";
}

function resolveReviewState(status: PRStatus): string {
  const map: Record<PRStatus, string> = {
    draft: "draft",
    conflito: "com_conflitos",
    aguardando_aprovacao: "aguardando_aprovacao",
    em_revisao: "em_revisao",
    aprovado: "pronto_para_merge",
  };

  return map[status];
}

function normalizeCheckRun(raw: GitHubCheckRunRaw): CheckRun {
  let status: CheckStatus;
  if (raw.status !== "completed") {
    status = "running";
  } else if (raw.conclusion === "success" || raw.conclusion === "neutral" || raw.conclusion === "skipped") {
    status = "passed";
  } else {
    status = "failed";
  }
  return { name: raw.name, status };
}

export function normalizePullRequest(
  repository: string,
  pullRequest: GitHubPullRequestRaw,
  details: GitHubPullRequestDetailsRaw,
  reviews: GitHubReviewRaw[],
  checkRuns: GitHubCheckRunRaw[],
): PullRequest {
  const approvals = reviews.filter((review) => review.state === "APPROVED").length;
  const firstReviewer = reviews.find((review) => review.user?.login)?.user?.login;
  const status = resolvePrStatus(details, reviews);

  return {
    id: String(pullRequest.id),
    number: pullRequest.number,
    title: pullRequest.title,
    repository,
    branch: pullRequest.head.ref,
    sourceBranch: pullRequest.head.ref,
    targetBranch: pullRequest.base.ref,
    status,
    state: pullRequest.state === "open" ? "open" : "closed",
    draft: pullRequest.draft,
    mergeable: details.mergeable,
    hasConflicts: status === "conflito",
    approvals,
    reviewState: resolveReviewState(status),
    author: pullRequest.user?.login ?? "Desconhecido",
    reviewer: firstReviewer,
    createdAt: pullRequest.created_at,
    updatedAt: pullRequest.updated_at,
    url: pullRequest.html_url,
    checks: checkRuns.map(normalizeCheckRun),
  };
}
