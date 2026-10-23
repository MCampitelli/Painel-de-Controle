import { useState } from "react";
import BugAnalysisForm from "./BugAnalysisForm";

interface Template {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const TEMPLATES: Template[] = [
  {
    id: "bug-analysis",
    title: "Root Cause",
    description: "Documenta a origem, causa, correção e natureza de um defeito reportado.",
    icon: "🐛",
  },
];

export default function TemplatesPage() {
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);

  const selected = TEMPLATES.find((t) => t.id === activeTemplate);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Sub-header */}
      <div className="px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface)] flex items-center gap-3">
        {activeTemplate && (
          <button
            onClick={() => setActiveTemplate(null)}
            className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Templates
          </button>
        )}
        {activeTemplate && <span className="text-[var(--color-text-muted)] text-sm">/</span>}
        <h2 className="text-sm font-semibold text-[var(--color-text)]">
          {selected ? selected.title : "Templates"}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {!activeTemplate ? (
          <div>
            <p className="text-sm text-[var(--color-text-muted)] mb-5">
              Selecione um template para preencher e copiar.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTemplate(t.id)}
                  className="text-left p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-blue-400 hover:shadow-sm transition-all group"
                >
                  <span className="text-3xl block mb-3">{t.icon}</span>
                  <p className="text-sm font-semibold text-[var(--color-text)] group-hover:text-blue-600 transition-colors">
                    {t.title}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1 leading-relaxed">
                    {t.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <BugAnalysisForm />
        )}
      </div>
    </div>
  );
}
