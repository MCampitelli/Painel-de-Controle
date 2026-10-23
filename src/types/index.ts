export type PRStatus = "aguardando_aprovacao" | "aprovado" | "conflito" | "em_revisao" | "draft";

export type WorkItemType = "Bug" | "Story";
export type Priority = "Alta" | "Média" | "Baixa";
export type WorkItemStage =
  | "Em andamento"
  | "Em análise"
  | "Bloqueado"
  | "Em desenvolvimento"
  | "Em teste"
  | "Concluído"
  | "Aguardando";

export type CheckStatus = "running" | "failed" | "passed";

export interface CheckRun {
  name: string;
  status: CheckStatus;
}

export interface PullRequest {
  id: string;
  number: number;
  title: string;
  repository: string;
  branch: string;
  sourceBranch?: string;
  targetBranch?: string;
  status: PRStatus;
  state?: "open" | "closed";
  draft?: boolean;
  mergeable?: boolean | null;
  hasConflicts?: boolean;
  approvals?: number;
  reviewState?: string;
  author?: string;
  reviewer?: string;
  createdAt?: string;
  updatedAt: string;
  url: string;
  checks?: CheckRun[];
}

export interface Repository {
  id: string;
  name: string;
  url: string;
  pullRequests: PullRequest[];
}

export interface WorkItem {
  id: string;
  type: WorkItemType;
  title: string;
  description: string;
  module: string;
  stage: WorkItemStage;
  boardColumn?: string;
  status: string;
  state?: string;
  externalId?: string;
  jiraStatus?: string;
  tags?: string[];
  priority: Priority;
  assignedTo: string;
  sprint?: string;
  createdAt?: string;
  updatedAt: string;
  url: string;
}

export interface JiraComment {
  id?: string;
  body: string;
  author?: string;
  createdAt?: string;
  isInternal?: boolean;
  isCustomer?: boolean;
}

export interface BugByModule {
  module: string;
  count: number;
}
