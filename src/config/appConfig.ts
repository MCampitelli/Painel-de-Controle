export const APP_CONFIG = {
  github: {
    organization: "philips-internal",
    repositories: [
      "emr-tasy-plsql",
      "emr-tasy-frontend",
      "emr-tasy-backend",
    ],
  },
  azureDevOps: {
    organization: "emr-cm",
    project: "EMR",
    queryId: "1115d570-fcad-44b2-91f8-c658a04125b8",
  },
  jira: {
    apiBaseUrl: "https://api.tasy.com.br/api/jira/issues",
  },
} as const;

export type AppConfig = typeof APP_CONFIG;
