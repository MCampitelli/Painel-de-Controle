export interface UserSettings {
  displayName: string;
  githubToken: string;
  githubUsername: string;
  azureDevOpsPat: string;
}

export type ThemeMode = "light" | "dark";

export type ConnectionState = "not_tested" | "connected" | "failed";

export interface ConnectionStatus {
  state: ConnectionState;
  message: string;
  testedAt?: string;
}
