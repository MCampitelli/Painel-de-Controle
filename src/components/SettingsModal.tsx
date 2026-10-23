import { useEffect, useState } from "react";
import { APP_CONFIG } from "../config/appConfig";
import type { UserSettings, ConnectionStatus } from "../types/settings";

interface SettingsModalProps {
  isOpen: boolean;
  initialSettings: UserSettings;
  githubStatus: ConnectionStatus;
  azureStatus: ConnectionStatus;
  isSaving: boolean;
  onClose: () => void;
  onSave: (settings: UserSettings) => void;
  onClearCredentials: () => void;
  onTestGitHub: (token: string) => Promise<boolean>;
  onTestAzure: (pat: string) => Promise<boolean>;
}

const DEFAULT_GITHUB_STATUS_MESSAGE = "Nao testado";
const DEFAULT_AZURE_STATUS_MESSAGE = "Nao testado";

function getStatusStyles(state: ConnectionStatus["state"]): string {
  if (state === "connected") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (state === "failed") return "bg-red-50 text-red-700 border-red-200";
  return "bg-amber-50 text-amber-700 border-amber-200";
}

function getStatusIcon(state: ConnectionStatus["state"]): string {
  if (state === "connected") return "🟢";
  if (state === "failed") return "🔴";
  return "🟡";
}

export default function SettingsModal({
  isOpen,
  initialSettings,
  githubStatus,
  azureStatus,
  isSaving,
  onClose,
  onSave,
  onClearCredentials,
  onTestGitHub,
  onTestAzure,
}: SettingsModalProps) {
  const [displayName, setDisplayName] = useState(initialSettings.displayName);
  const [githubToken, setGithubToken] = useState(initialSettings.githubToken);
  const [githubUsername, setGithubUsername] = useState(initialSettings.githubUsername);
  const [azureDevOpsPat, setAzureDevOpsPat] = useState(initialSettings.azureDevOpsPat);
  const [busyTest, setBusyTest] = useState<"github" | "azure" | null>(null);

  useEffect(() => {
    setDisplayName(initialSettings.displayName);
    setGithubToken(initialSettings.githubToken);
    setGithubUsername(initialSettings.githubUsername);
    setAzureDevOpsPat(initialSettings.azureDevOpsPat);
  }, [initialSettings]);

  if (!isOpen) return null;

  async function handleTestGitHub() {
    setBusyTest("github");
    try {
      await onTestGitHub(githubToken);
    } finally {
      setBusyTest(null);
    }
  }

  async function handleTestAzure() {
    setBusyTest("azure");
    try {
      await onTestAzure(azureDevOpsPat);
    } finally {
      setBusyTest(null);
    }
  }

  function handleSave() {
    onSave({
      displayName: displayName.trim(),
      githubToken: githubToken.trim(),
      githubUsername: githubUsername.trim(),
      azureDevOpsPat: azureDevOpsPat.trim(),
    });
  }

  const githubReposConfigured = APP_CONFIG.github.repositories.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl rounded-xl bg-white shadow-2xl max-h-[92vh] overflow-y-auto"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Configuracoes</h2>
            <p className="text-xs text-gray-500 mt-0.5">Configure apenas suas credenciais pessoais.</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fechar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          <section>
            <label htmlFor="display-name" className="text-xs font-medium text-gray-700 block mb-1.5">
              Nome de exibicao
            </label>
            <input
              id="display-name"
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Seu nome"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </section>

          <section className="rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">GitHub</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Organizacao: {APP_CONFIG.github.organization}
                </p>
                <p className="text-xs text-gray-500">
                  Repositorios monitorados: {githubReposConfigured}
                </p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${getStatusStyles(githubStatus.state)}`}>
                {getStatusIcon(githubStatus.state)} {githubStatus.message || DEFAULT_GITHUB_STATUS_MESSAGE}
              </span>
            </div>

            <label htmlFor="github-token" className="text-xs font-medium text-gray-700 block mb-1.5">
              Token
            </label>
            <input
              id="github-token"
              type="password"
              value={githubToken}
              onChange={(event) => setGithubToken(event.target.value)}
              placeholder="***************"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              autoComplete="off"
            />

            <label htmlFor="github-username" className="text-xs font-medium text-gray-700 block mb-1.5 mt-3">
              Seu username no GitHub
            </label>
            <input
              id="github-username"
              type="text"
              value={githubUsername}
              onChange={(event) => setGithubUsername(event.target.value)}
              placeholder="ex: MarceloCampitelli"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              autoComplete="off"
            />

            <div className="mt-3">
              <button
                onClick={handleTestGitHub}
                disabled={!githubToken.trim() || busyTest !== null}
                className="text-xs font-medium px-3 py-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {busyTest === "github" ? "Testando..." : "Testar conexao GitHub"}
              </button>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Azure DevOps</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Organizacao: {APP_CONFIG.azureDevOps.organization}
                </p>
                <p className="text-xs text-gray-500">Projeto: {APP_CONFIG.azureDevOps.project}</p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${getStatusStyles(azureStatus.state)}`}>
                {getStatusIcon(azureStatus.state)} {azureStatus.message || DEFAULT_AZURE_STATUS_MESSAGE}
              </span>
            </div>

            <label htmlFor="azure-pat" className="text-xs font-medium text-gray-700 block mb-1.5">
              PAT
            </label>
            <input
              id="azure-pat"
              type="password"
              value={azureDevOpsPat}
              onChange={(event) => setAzureDevOpsPat(event.target.value)}
              placeholder="***************"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              autoComplete="off"
            />

            <div className="mt-3">
              <button
                onClick={handleTestAzure}
                disabled={!azureDevOpsPat.trim() || busyTest !== null}
                className="text-xs font-medium px-3 py-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {busyTest === "azure" ? "Testando..." : "Testar conexao Azure DevOps"}
              </button>
            </div>
          </section>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
          <button
            onClick={onClearCredentials}
            className="text-xs font-medium px-3 py-1.5 rounded-md border border-red-200 text-red-700 hover:bg-red-50 transition-colors"
          >
            Limpar minhas credenciais
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-xs font-medium px-3 py-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="text-xs font-medium px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? "Salvando..." : "Salvar configuracoes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
