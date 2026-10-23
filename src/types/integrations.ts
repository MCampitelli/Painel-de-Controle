export interface ApiUserIdentity {
  login: string;
  displayName: string;
  email?: string;
}

export interface GitHubPullRequestRaw {
  id: number;
  number: number;
  title: string;
  html_url: string;
  state: string;
  draft: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    login: string;
  };
  requested_reviewers?: Array<{
    login: string;
  }>;
  assignees?: Array<{
    login: string;
  }>;
  head: {
    ref: string;
    sha: string;
  };
  base: {
    ref: string;
  };
}

export interface GitHubCheckRunRaw {
  name: string;
  status: "queued" | "in_progress" | "completed";
  conclusion: "success" | "failure" | "neutral" | "cancelled" | "skipped" | "timed_out" | "action_required" | null;
}

export interface GitHubStatusRaw {
  context: string;
  state: "pending" | "success" | "failure" | "error";
}

export interface GitHubPullRequestDetailsRaw extends GitHubPullRequestRaw {
  mergeable: boolean | null;
  mergeable_state?: string;
}

export interface GitHubReviewRaw {
  state: string;
  user?: {
    login: string;
  };
}

export interface AzureDevOpsWorkItemRaw {
  id: number;
  fields: Record<string, unknown>;
  url: string;
}
