import type { PullRequest } from "../types";
import { prStatusLabel, prStatusColor } from "../utils/prUtils";

interface PRModalProps {
  pr: PullRequest | null;
  onClose: () => void;
}

export default function PRModal({ pr, onClose }: PRModalProps) {
  if (!pr) return null;

  const isReviewed = pr.status === "aprovado" || (pr.approvals ?? 0) > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-gray-400">#{pr.number}</span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium border"
                style={prStatusColor(pr.status)}
              >
                {prStatusLabel(pr.status)}
              </span>
              {isReviewed && pr.status !== "aprovado" && (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium border bg-emerald-50 text-emerald-700 border-emerald-200">
                  Revisado
                </span>
              )}
            </div>
            <h2 className="text-base font-semibold text-gray-900 leading-snug pr-6">
              {pr.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors mt-0.5"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Details */}
        <div className="space-y-3">
          <DetailRow label="Repositório" value={pr.repository} mono />
          <DetailRow label="Branch origem" value={pr.sourceBranch || pr.branch} mono />
          <DetailRow label="Branch destino" value={pr.targetBranch || "-"} mono />
          <DetailRow label="Autor" value={pr.author || "-"} />
          <DetailRow label="Aprovações" value={String(pr.approvals ?? 0)} />
          <DetailRow label="Atualizado em" value={formatDate(pr.updatedAt)} />
        </div>

        {/* Checks */}
        {pr.checks && pr.checks.some((c) => c.status !== "passed") && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-600 mb-2">Checks</p>
            <div className="space-y-1.5">
              {pr.checks
                .filter((c) => c.status !== "passed")
                .map((check, i) => (
                  <div key={`${check.name}-${i}`} className="flex items-center gap-2">
                    {check.status === "failed" ? (
                      <span className="text-red-500 text-xs font-bold">✗</span>
                    ) : (
                      <span className="text-yellow-500 text-xs font-bold">↻</span>
                    )}
                    <span className={`text-xs font-mono ${check.status === "failed" ? "text-red-700" : "text-yellow-700"}`}>
                      {check.name}
                    </span>
                    <span className={`ml-auto text-xs font-medium px-1.5 py-px rounded border ${check.status === "failed" ? "bg-red-50 text-red-600 border-red-200" : "bg-yellow-50 text-yellow-600 border-yellow-200"}`}>
                      {check.status === "failed" ? "falhou" : "rodando"}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="mt-5 pt-4 border-t border-gray-100">
          <a
            href={pr.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.929.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
            </svg>
            Ver no GitHub
          </a>
          <p className="text-xs text-gray-400 mt-1">
            A URL acima será atualizada quando a integração com o GitHub estiver ativa.
          </p>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-xs text-gray-500 w-28 pt-0.5 shrink-0">{label}</span>
      <span className={`text-sm text-gray-800 ${mono ? "font-mono text-xs pt-0.5" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
