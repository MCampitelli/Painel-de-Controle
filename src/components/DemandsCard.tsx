import { useState, useMemo } from "react";
import type { WorkItem, WorkItemType, Priority } from "../types";

interface DemandsCardProps {
  items: WorkItem[];
  activeModule: string | null;
  onSelectItem: (item: WorkItem) => void;
}

type TabFilter = "Todos" | WorkItemType;

const PRIORITIES: Priority[] = ["Alta", "Média", "Baixa"];
const BOARD_COLUMN_ORDER = [
  "Funnel",
  "Triage",
  "Triage Done",
  "Investigation",
  "Ready",
  "Develop",
  "Documentation",
  "Test",
  "Completed",
  "Accepted",
];

export default function DemandsCard({ items, activeModule, onSelectItem }: DemandsCardProps) {
  const [tab, setTab] = useState<TabFilter>("Todos");
  const [filterModule, setFilterModule] = useState<string>("");
  const [filterPriority, setFilterPriority] = useState<string>("");

  const modules = useMemo(() => {
    const values = items
      .map((item) => item.module?.trim())
      .filter((value): value is string => Boolean(value));
    return [...new Set(values)].sort((a, b) => a.localeCompare(b));
  }, [items]);

  const filtered = useMemo(() => {
    return items
      .filter((item) => {
        const normalizedState = (item.state ?? item.status).trim().toLowerCase();
        if (item.type === "Bug" && normalizedState === "closed") return false;
        if (item.type === "Story" && normalizedState === "accepted") return false;
        if (tab !== "Todos" && item.type !== tab) return false;
        if (activeModule && item.module !== activeModule) return false;
        if (filterModule && item.module !== filterModule) return false;
        if (filterPriority && item.priority !== filterPriority) return false;
        return true;
      })
      .sort((first, second) => Date.parse(second.updatedAt) - Date.parse(first.updatedAt));
  }, [items, tab, activeModule, filterModule, filterPriority]);

  const groups = useMemo(() => {
    const byColumn = new Map<string, WorkItem[]>();
    for (const item of filtered) {
      const column = item.boardColumn?.trim() || "Sem coluna informada";
      const group = byColumn.get(column);
      if (group) group.push(item);
      else byColumn.set(column, [item]);
    }
    return [...byColumn.entries()].sort(([first], [second]) => {
      const firstIndex = BOARD_COLUMN_ORDER.findIndex(
        (column) => column.toLowerCase() === first.toLowerCase(),
      );
      const secondIndex = BOARD_COLUMN_ORDER.findIndex(
        (column) => column.toLowerCase() === second.toLowerCase(),
      );
      return (firstIndex < 0 ? BOARD_COLUMN_ORDER.length : firstIndex)
        - (secondIndex < 0 ? BOARD_COLUMN_ORDER.length : secondIndex);
    });
  }, [filtered]);

  const bugCount = items.filter((i) => i.type === "Bug").length;
  const storyCount = items.filter((i) => i.type === "Story").length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h2 className="text-sm font-semibold text-gray-800">Minhas Demandas</h2>
          </div>
          <span className="font-mono text-xs text-gray-400">
            {filtered.length} de {items.length}
          </span>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1">
          {(["Todos", "Bug", "Story"] as TabFilter[]).map((t) => {
            const count = t === "Todos" ? items.length : t === "Bug" ? bugCount : storyCount;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  tab === t
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {t === "Bug" && "🐛 "}
                {t === "Story" && "📋 "}
                {t}
                <span
                  className={`font-mono text-xs px-1.5 py-px rounded-full ${
                    tab === t ? "bg-blue-500 text-blue-100" : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}

          <div className="flex-1" />

          {/* Filters */}
          <select
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors"
          >
            <option value="">Módulo</option>
            {modules.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors"
          >
            <option value="">Prioridade</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          {(filterModule || filterPriority) && (
            <button
              onClick={() => { setFilterModule(""); setFilterPriority(""); }}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors px-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="overflow-y-auto flex-1 min-h-0">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <svg className="w-8 h-8 mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs">Nenhuma demanda encontrada</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {groups.map(([column, groupItems]) => (
              <section key={column} aria-label={column}>
                <div className="flex items-center justify-between gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100">
                  <h3 className="text-xs font-semibold text-gray-600">{column}</h3>
                  <span className="font-mono text-xs text-gray-500 bg-gray-200 px-1.5 py-px rounded-full">
                    {groupItems.length}
                  </span>
                </div>
                <div className="divide-y divide-gray-100">
                  {groupItems.map((item) => (
                    <WorkItemRow key={item.id} item={item} onClick={() => onSelectItem(item)} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function WorkItemRow({ item, onClick }: { item: WorkItem; onClick: () => void }) {
  const isBug = item.type === "Bug";
  const isBlocked = item.stage === "Bloqueado";
  const tags = item.tags ?? [];

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 hover:bg-gray-50/80 transition-colors group ${
        isBlocked ? "border-l-2 border-l-red-400" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Type icon */}
        <div className="shrink-0 mt-0.5">
          <span className="text-base">{isBug ? "🐛" : "📋"}</span>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className={`text-xs font-semibold px-1.5 py-px rounded border ${
                isBug
                  ? "bg-red-50 text-red-700 border-red-100"
                  : "bg-violet-50 text-violet-700 border-violet-100"
              }`}
            >
              {item.type.toUpperCase()}
            </span>
            <span className="font-mono text-xs text-gray-400">#{item.id}</span>
            {item.jiraStatus && <JiraStatusPill status={item.jiraStatus} />}
          </div>
          <p className="text-xs font-medium text-gray-800 leading-snug group-hover:text-blue-700 transition-colors truncate pr-2">
            {item.title}
          </p>
          <div className="flex items-center gap-3 mt-1.5">
            {item.type === "Bug" && <span className="text-xs text-gray-500">{item.module}</span>}
            {tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {tags.map((tag) => (
                  <span
                    key={`${item.id}-${tag}`}
                    className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-px rounded border bg-gray-100 text-gray-600 border-gray-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Last updated */}
        <div className="shrink-0 flex items-center">
          <span className="text-xs text-gray-400">{formatCompactDate(item.updatedAt)}</span>
        </div>
      </div>
    </button>
  );
}

function JiraStatusPill({ status }: { status: string }) {
  return (
    <span className="text-xs px-2 py-px rounded-full border bg-blue-50 text-blue-700 border-blue-100 font-medium">
      {status}
    </span>
  );
}

function formatCompactDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
