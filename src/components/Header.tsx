import { useEffect, useRef, useState } from "react";
import type { ConnectionStatus, ThemeMode } from "../types/settings"

export type AppView = "home" | "templates" | "status-versoes";

interface SummaryStats {
  totalPRs: number;
  pendingApproval: number;
  withConflict: number;
  totalDemands: number;
}

interface HeaderProps {
  stats: SummaryStats;
  displayName: string;
  theme: ThemeMode;
  githubStatus: ConnectionStatus;
  azureStatus: ConnectionStatus;
  lastUpdate: string;
  isRefreshing: boolean;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onRefresh: () => void;
  onOpenSettings: () => void;
  onToggleTheme: () => void;
}

function connectionLabel(status: ConnectionStatus): string {
  if (status.state === "connected") return "🟢 Conectado";
  if (status.state === "failed") return "🔴 Falha";
  return "🟡 Não testado";
}

export default function Header({
  stats,
  displayName,
  theme,
  githubStatus,
  azureStatus,
  lastUpdate,
  isRefreshing,
  currentView,
  onNavigate,
  onRefresh,
  onOpenSettings,
  onToggleTheme,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function navigate(view: AppView) {
    onNavigate(view);
    setMenuOpen(false);
  }

  return (
    <header className="bg-[var(--color-surface)] border-b border-[var(--color-border)] px-6 py-4 flex items-center justify-between gap-6">
      {/* Left: logo menu + summary */}
      <div className="flex items-center gap-8 min-w-0">
        <div className="flex items-center gap-3">
          {/* Logo with dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="text-3xl leading-none select-none hover:scale-110 transition-transform focus:outline-none"
              aria-label="Menu de navegação"
            >
              🚀
            </button>
            {menuOpen && (
              <div className="absolute left-0 top-full mt-2 w-40 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-lg z-50 overflow-hidden">
                <button
                  onClick={() => navigate("home")}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors ${
                    currentView === "home"
                      ? "text-blue-600 bg-blue-50 font-medium"
                      : "text-[var(--color-text)] hover:bg-[var(--color-bg)]"
                  }`}
                >
                  <span>🏠</span> Início
                </button>
                <button
                  onClick={() => navigate("templates")}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors ${
                    currentView === "templates"
                      ? "text-blue-600 bg-blue-50 font-medium"
                      : "text-[var(--color-text)] hover:bg-[var(--color-bg)]"
                  }`}
                >
                  <span>📋</span> Templates
                </button>
                <button
                  onClick={() => navigate("status-versoes")}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors ${
                    currentView === "status-versoes"
                      ? "text-blue-600 bg-blue-50 font-medium"
                      : "text-[var(--color-text)] hover:bg-[var(--color-bg)]"
                  }`}
                >
                  <span>📈</span> Status Versões
                </button>
              </div>
            )}
          </div>

          <div>
            <h1 className="text-lg font-semibold text-[var(--color-text)] leading-tight">Dev Dashboard</h1>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Visão geral das minhas demandas</p>
          </div>
        </div>

        {/* Summary stats */}
        <div className="flex items-center gap-2">
          <StatBadge value={stats.totalPRs} label="PRs abertos" color="blue" />
          <StatBadge value={stats.totalDemands} label="demandas" color="violet" />
        </div>
      </div>

      {/* Right: user + refresh */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs text-gray-500 hidden xl:inline-flex px-2 py-1 rounded-md bg-gray-50 border border-gray-200">
          GitHub: {connectionLabel(githubStatus)}
        </span>
        <span className="text-xs text-gray-500 hidden xl:inline-flex px-2 py-1 rounded-md bg-gray-50 border border-gray-200">
          Azure: {connectionLabel(azureStatus)}
        </span>
        <span className="text-xs text-[var(--color-text-muted)]">Atualizado às {lastUpdate}</span>

        <button
          onClick={onToggleTheme}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-soft)] hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "var(--color-bg)" }}
          role="switch"
          aria-checked={theme === "dark"}
          aria-label="Alternar modo escuro"
        >
          <span
            className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
              theme === "dark" ? "bg-[var(--color-accent)]" : "bg-[var(--color-border)]"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                theme === "dark" ? "translate-x-5" : "translate-x-1"
              }`}
            />
          </span>
          <span className="text-[11px]">{theme === "dark" ? "Escuro" : "Claro"}</span>
        </button>

        <button
          onClick={onRefresh}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-soft)] hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "var(--color-bg)" }}
        >
          <svg
            className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Atualizar
        </button>

        <button
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-soft)] hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "var(--color-bg)" }}
        >
          Configurações
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold" style={{ backgroundColor: "var(--color-accent)" }}>
            {(displayName.trim().charAt(0) || "U").toUpperCase()}
          </div>
          <span className="text-sm font-medium text-[var(--color-text)]">{displayName || "Usuário"}</span>
        </div>
      </div>
    </header>
  );
}

function StatBadge({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color: "blue" | "amber" | "red" | "violet";
}) {
  const styles = {
    blue: "bg-[var(--badge-blue-bg)] text-[var(--badge-blue-text)] border-[var(--badge-blue-border)]",
    amber: "bg-[var(--badge-amber-bg)] text-[var(--badge-amber-text)] border-[var(--badge-amber-border)]",
    red: "bg-[var(--badge-red-bg)] text-[var(--badge-red-text)] border-[var(--badge-red-border)]",
    violet: "bg-[var(--badge-violet-bg)] text-[var(--badge-violet-text)] border-[var(--badge-violet-border)]",
  };
  return (
    <div
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${styles[color]}`}
    >
      <span className="font-semibold font-mono">{value}</span>
      <span>{label}</span>
    </div>
  );
}
