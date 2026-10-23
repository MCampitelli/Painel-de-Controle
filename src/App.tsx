import { useMemo, useState, useEffect } from "react";
import { APP_CONFIG } from "./config/appConfig";
import { DATA_SOURCE } from "./config/dataSource";
import Header from "./components/Header";
import type { AppView } from "./components/Header";
import PRAccordion from "./components/PRAccordion";
import PRModal from "./components/PRModal";
import BugsChart from "./components/BugsChart";
import DemandsCard from "./components/DemandsCard";
import WorkItemModal from "./components/WorkItemModal";
import SettingsModal from "./components/SettingsModal";
import TemplatesPage from "./components/TemplatesPage";
import StatusVersoesPage from "./components/StatusVersoesPage";
import { mockRepositories, mockWorkItems, computeBugsByModule } from "./data/mockData";
import type { PullRequest, WorkItem } from "./types";
import type { ConnectionStatus, ThemeMode, UserSettings } from "./types/settings";
import {
  clearUserSettings,
  getSavedTheme,
  getUserSettings,
  hasUserSettings,
  saveTheme,
  saveUserSettings,
} from "./services/storage/settingsStorage";
import {
  getPullRequests,
  testGitHubConnection,
} from "./services/github/githubService";
import {
  getMyWorkItems,
  testAzureDevOpsConnection,
} from "./services/azure/azureDevOpsService";
import { sanitizeErrorMessage } from "./services/errors/apiErrorMapper";
import { aggregateBugsByModule } from "./services/azure/azureNormalizer";
import { enrichBugsWithJiraStatus } from "./services/jira/jiraService";

function formatTime(date: Date) {
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function createEmptyRepositories() {
  return APP_CONFIG.github.repositories.map((repository) => ({
    id: `repo-${repository}`,
    name: repository,
    url: `https://github.com/${APP_CONFIG.github.organization}/${repository}`,
    pullRequests: [],
  }));
}

const NOT_TESTED_STATUS: ConnectionStatus = {
  state: "not_tested",
  message: "Não testado",
};

const EMPTY_SETTINGS: UserSettings = {
  displayName: "",
  githubToken: "",
  githubUsername: "",
  azureDevOpsPat: "",
};

export default function App() {
  const [settings, setSettings] = useState<UserSettings>(() => getUserSettings() ?? EMPTY_SETTINGS);
  const [theme, setTheme] = useState<ThemeMode>(() => getSavedTheme());
  const [githubStatus, setGitHubStatus] = useState<ConnectionStatus>(NOT_TESTED_STATUS);
  const [azureStatus, setAzureStatus] = useState<ConnectionStatus>(NOT_TESTED_STATUS);
  const [repositories, setRepositories] = useState(
    DATA_SOURCE === "mock" ? mockRepositories : createEmptyRepositories(),
  );
  const [workItems, setWorkItems] = useState<WorkItem[]>(DATA_SOURCE === "mock" ? mockWorkItems : []);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(formatTime(new Date()));
  const [globalMessage, setGlobalMessage] = useState<string>("");

  const [selectedPR, setSelectedPR] = useState<PullRequest | null>(null);
  const [selectedItem, setSelectedItem] = useState<WorkItem | null>(null);
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<AppView>("home");

  const bugsByModule = useMemo(() => {
    if (DATA_SOURCE === "mock") return computeBugsByModule(workItems);
    return aggregateBugsByModule(workItems);
  }, [workItems]);

  const visibleWorkItems = useMemo(
    () =>
      workItems.filter((item) => {
        const normalizedState = (item.state ?? item.status).trim().toLowerCase();
        if (item.type === "Bug") return normalizedState !== "closed";
        if (item.type === "Story") return normalizedState !== "accepted";
        return true;
      }),
    [workItems],
  );

  const stats = useMemo(() => {
    const allPRs = repositories.flatMap((r) => r.pullRequests);
    return {
      totalPRs: allPRs.length,
      pendingApproval: allPRs.filter((p) => p.status === "aguardando_aprovacao").length,
      withConflict: allPRs.filter((p) => p.status === "conflito").length,
      totalDemands: visibleWorkItems.length,
    };
  }, [repositories, visibleWorkItems]);

  useEffect(() => {
    saveTheme(theme);
    document.documentElement.classList.remove("theme-light", "theme-dark");
    document.documentElement.classList.add(`theme-${theme}`);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (DATA_SOURCE === "mock") {
      setRepositories(mockRepositories);
      setWorkItems(mockWorkItems);
      setLastUpdate(formatTime(new Date()));
      return;
    }

    setRepositories(createEmptyRepositories());

    if (!hasUserSettings()) {
      setIsSettingsOpen(true);
      return;
    }

    void autoTestConnectionsAndRefresh(settings);
  }, []);

  async function autoTestConnectionsAndRefresh(targetSettings: UserSettings) {
    if (!targetSettings.githubToken || !targetSettings.azureDevOpsPat) {
      setIsSettingsOpen(true);
      return;
    }

    const [githubOk, azureOk] = await Promise.all([
      testGitHub(targetSettings.githubToken),
      testAzure(targetSettings.azureDevOpsPat),
    ]);

    if (!githubOk || !azureOk) {
      setRepositories(createEmptyRepositories());
      setWorkItems([]);
      setLastUpdate(formatTime(new Date()));
      setGlobalMessage("Não foi possível validar todas as conexões automaticamente. Revise as credenciais em Configurações.");
      return;
    }

    await refreshDashboard(targetSettings, false);
  }

  async function testGitHub(token: string): Promise<boolean> {
    if (!token.trim()) {
      setGitHubStatus({
        state: "failed",
        message: "Informe o token do GitHub para testar.",
      });
      return false;
    }

    try {
      await testGitHubConnection(token.trim());
      setGitHubStatus({
        state: "connected",
        message: "Conectado",
        testedAt: new Date().toISOString(),
      });
      setGlobalMessage("");
      return true;
    } catch (error) {
      setGitHubStatus({
        state: "failed",
        message: sanitizeErrorMessage(
          error,
          "Não foi possível conectar ao GitHub. Verifique seu Personal Access Token.",
        ),
        testedAt: new Date().toISOString(),
      });
      return false;
    }
  }

  async function testAzure(pat: string): Promise<boolean> {
    if (!pat.trim()) {
      setAzureStatus({
        state: "failed",
        message: "Informe o PAT do Azure DevOps para testar.",
      });
      return false;
    }

    try {
      await testAzureDevOpsConnection(pat.trim());
      setAzureStatus({
        state: "connected",
        message: "Conectado",
        testedAt: new Date().toISOString(),
      });
      setGlobalMessage("");
      return true;
    } catch (error) {
      setAzureStatus({
        state: "failed",
        message: sanitizeErrorMessage(
          error,
          "Não foi possível conectar ao Azure DevOps. Verifique seu PAT.",
        ),
        testedAt: new Date().toISOString(),
      });
      return false;
    }
  }

  async function refreshDashboard(targetSettings: UserSettings, showSpinner = true) {
    if (DATA_SOURCE === "mock") {
      setRepositories(mockRepositories);
      setWorkItems(mockWorkItems);
      setLastUpdate(formatTime(new Date()));
      return;
    }

    if (!targetSettings.githubToken || !targetSettings.azureDevOpsPat) {
      setIsSettingsOpen(true);
      return;
    }

    if (showSpinner) {
      setIsRefreshing(true);
    }
    setGlobalMessage("");

    const [githubResult, azureResult] = await Promise.allSettled([
      getPullRequests(targetSettings.githubToken, targetSettings.githubUsername),
      getMyWorkItems(targetSettings.azureDevOpsPat),
    ]);

    if (githubResult.status === "fulfilled") {
      setRepositories(githubResult.value.repositories);
      setGitHubStatus({
        state: "connected",
        message: "Conectado",
        testedAt: new Date().toISOString(),
      });
    } else {
      setRepositories(createEmptyRepositories());
      setGitHubStatus({
        state: "failed",
        message: sanitizeErrorMessage(
          githubResult.reason,
          "Não foi possível conectar ao GitHub. Verifique seu Personal Access Token.",
        ),
        testedAt: new Date().toISOString(),
      });
    }

    if (azureResult.status === "fulfilled") {
      setWorkItems(await enrichBugsWithJiraStatus(azureResult.value));
      setAzureStatus({
        state: "connected",
        message: "Conectado",
        testedAt: new Date().toISOString(),
      });
    } else {
      setWorkItems([]);
      setAzureStatus({
        state: "failed",
        message: sanitizeErrorMessage(
          azureResult.reason,
          "Não foi possível conectar ao Azure DevOps. Verifique seu PAT.",
        ),
        testedAt: new Date().toISOString(),
      });
    }

    if (githubResult.status === "rejected" || azureResult.status === "rejected") {
      setGlobalMessage("Não foi possível atualizar todos os dados. Revise as conexões em Configurações.");
    }

    setLastUpdate(formatTime(new Date()));
    if (showSpinner) {
      setIsRefreshing(false);
    }
  }

  async function handleSaveSettings(nextSettings: UserSettings) {
    if (!nextSettings.displayName || !nextSettings.githubToken || !nextSettings.azureDevOpsPat) {
      setGlobalMessage("Preencha nome de exibição e os dois tokens para salvar.");
      return;
    }

    setIsSavingSettings(true);
    setGlobalMessage("");

    const [githubOk, azureOk] = await Promise.all([
      testGitHub(nextSettings.githubToken),
      testAzure(nextSettings.azureDevOpsPat),
    ]);

    if (!githubOk || !azureOk) {
      setIsSavingSettings(false);
      return;
    }

    saveUserSettings(nextSettings);
    setSettings(nextSettings);
    setIsSettingsOpen(false);
    setIsSavingSettings(false);
    await refreshDashboard(nextSettings);
  }

  function handleClearCredentials() {
    clearUserSettings();
    setSettings(EMPTY_SETTINGS);
    setRepositories(createEmptyRepositories());
    setWorkItems([]);
    setGitHubStatus(NOT_TESTED_STATUS);
    setAzureStatus(NOT_TESTED_STATUS);
    setGlobalMessage("Credenciais removidas deste navegador.");
    setIsSettingsOpen(true);
  }

  async function handleRefresh() {
    await refreshDashboard(settings);
  }

  function handleToggleTheme() {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }

  return (
    <div className={`${currentView === "home" ? "h-dvh overflow-hidden" : "min-h-screen"} bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col`}>
      {/* Header */}
      <Header
        stats={stats}
        displayName={settings.displayName || "Usuário"}
        theme={theme}
        githubStatus={githubStatus}
        azureStatus={azureStatus}
        lastUpdate={lastUpdate}
        isRefreshing={isRefreshing}
        currentView={currentView}
        onNavigate={setCurrentView}
        onRefresh={handleRefresh}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleTheme={handleToggleTheme}
      />

      {globalMessage && (
        <div className="mx-4 mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {globalMessage}
        </div>
      )}

      {/* Main layout */}
      {currentView === "templates" ? (
        <TemplatesPage />
      ) : currentView === "status-versoes" ? (
        <StatusVersoesPage />
      ) : (
      <div className="flex-1 min-h-0 flex gap-4 p-4 overflow-hidden">
        {/* Left column: ~40% */}
        <div className="flex flex-col min-h-0 overflow-hidden" style={{ width: "38%", minWidth: 320 }}>
          <PRAccordion repositories={repositories} onSelectPR={setSelectedPR} />
        </div>

        {/* Right column: ~60% */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden min-w-0 min-h-0">
          <DemandsCard
            items={visibleWorkItems}
            activeModule={activeModule}
            onSelectItem={setSelectedItem}
          />
          <BugsChart
            data={bugsByModule}
            activeModule={activeModule}
            onModuleClick={setActiveModule}
          />
        </div>
      </div>
      )}

      {/* Modals */}
      {selectedPR && (
        <PRModal pr={selectedPR} onClose={() => setSelectedPR(null)} />
      )}
      {selectedItem && (
        <WorkItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}

      <SettingsModal
        isOpen={isSettingsOpen}
        initialSettings={settings}
        githubStatus={githubStatus}
        azureStatus={azureStatus}
        isSaving={isSavingSettings}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        onClearCredentials={handleClearCredentials}
        onTestGitHub={testGitHub}
        onTestAzure={testAzure}
      />
    </div>
  );
}
