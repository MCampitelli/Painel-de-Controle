export class ApiServiceError extends Error {
  public readonly userMessage: string;

  constructor(userMessage: string) {
    super(userMessage);
    this.name = "ApiServiceError";
    this.userMessage = userMessage;
  }
}

export function sanitizeErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiServiceError) {
    return error.userMessage;
  }

  if (error instanceof Error) {
    if (error.message.toLowerCase().includes("failed to fetch")) {
      return "Erro de rede. Verifique sua conexão e tente novamente.";
    }
  }

  return fallback;
}

export function mapGitHubError(status: number): ApiServiceError {
  if (status === 401) {
    return new ApiServiceError("Não foi possível conectar ao GitHub. Verifique seu Personal Access Token.");
  }

  if (status === 403) {
    return new ApiServiceError("Acesso negado no GitHub ou limite de requisições atingido. Verifique permissões do token.");
  }

  if (status === 404) {
    return new ApiServiceError("Repositório GitHub não encontrado na configuração fixa da aplicação.");
  }

  if (status >= 500) {
    return new ApiServiceError("Serviço do GitHub indisponível no momento. Tente novamente em instantes.");
  }

  return new ApiServiceError("Erro ao consultar o GitHub. Tente novamente.");
}

export function mapAzureError(status: number): ApiServiceError {
  if (status === 401) {
    return new ApiServiceError("Não foi possível conectar ao Azure DevOps. Verifique seu PAT.");
  }

  if (status === 403) {
    return new ApiServiceError("Acesso negado no Azure DevOps. Verifique permissões do PAT.");
  }

  if (status === 404) {
    return new ApiServiceError("Organização, projeto ou board do Azure DevOps não foram encontrados na configuração fixa.");
  }

  if (status >= 500) {
    return new ApiServiceError("Serviço do Azure DevOps indisponível no momento. Tente novamente em instantes.");
  }

  return new ApiServiceError("Erro ao consultar o Azure DevOps. Tente novamente.");
}
