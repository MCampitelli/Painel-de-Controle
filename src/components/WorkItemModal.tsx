import { useEffect, useState } from "react";
import type { WorkItem } from "../types";
import type { JiraComment } from "../types";
import { getJiraComments } from "../services/jira/jiraService";

interface WorkItemModalProps {
  item: WorkItem | null;
  onClose: () => void;
}

export default function WorkItemModal({ item, onClose }: WorkItemModalProps) {
  const [activeTab, setActiveTab] = useState<"details" | "comments">("details");
  const [comments, setComments] = useState<JiraComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState("");

  useEffect(() => {
    setActiveTab("details");
    setComments([]);
    setCommentsError("");
  }, [item?.id]);

  async function loadComments() {
    if (!item?.externalId || commentsLoading || comments.length > 0) return;
    setCommentsLoading(true);
    setCommentsError("");
    try {
      setComments(await getJiraComments(item.externalId));
    } catch (error) {
      setCommentsError(error instanceof Error ? error.message : "Não foi possível carregar os comentários do Jira.");
    } finally {
      setCommentsLoading(false);
    }
  }

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 z-10 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex-1 pr-6">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <TypeBadge type={item.type} />
              <span className="font-mono text-xs text-gray-400">#{item.id}</span>
              <StageBadge stage={item.stage} />
              {item.type === "Bug" && item.jiraStatus && <JiraStatusPill status={item.jiraStatus} />}
            </div>
            <h2 className="text-base font-semibold text-gray-900 leading-snug">{item.title}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors mt-0.5 shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {item.type === "Bug" && item.externalId && (
          <div className="flex items-center gap-1 mb-4 border-b border-gray-100">
            <button
              onClick={() => setActiveTab("details")}
              className={`px-3 py-1.5 text-xs font-medium border-b-2 ${activeTab === "details" ? "border-blue-600 text-blue-700" : "border-transparent text-gray-500"}`}
            >Detalhes</button>
            <button
              onClick={() => { setActiveTab("comments"); void loadComments(); }}
              className={`px-3 py-1.5 text-xs font-medium border-b-2 ${activeTab === "comments" ? "border-blue-600 text-blue-700" : "border-transparent text-gray-500"}`}
            >Comentários Jira</button>
          </div>
        )}

        {activeTab === "details" ? (
          <div className="space-y-2.5">
          {item.type === "Bug" && <DetailRow label="Módulo" value={item.module} />}
          {item.type === "Bug" && item.externalId && <DetailRow label="EXTERNAL ID" value={item.externalId} />}
          <DetailRow label="Stage" value={item.stage} />
          <DetailRow label="Status" value={item.status} />
          <DetailRow label="Responsável" value={item.assignedTo} />
          <DetailRow label="Criado em" value={item.createdAt ? formatDate(item.createdAt) : "-"} />
          <DetailRow label="Atualizado em" value={formatDate(item.updatedAt)} />
          </div>
        ) : <JiraComments comments={comments} loading={commentsLoading} error={commentsError} />}

        <div className="mt-5 pt-4 border-t border-gray-100">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Ver no Azure DevOps
          </a>
          <p className="text-xs text-gray-400 mt-1">
            A URL acima será atualizada quando a integração com o Azure DevOps estiver ativa.
          </p>
        </div>
      </div>
    </div>
  );
}

function JiraComments({ comments, loading, error }: { comments: JiraComment[]; loading: boolean; error: string }) {
  if (loading) return <p className="text-sm text-gray-500 py-6 text-center">Carregando comentários...</p>;
  if (error) return <p className="text-sm text-red-600 py-6 text-center">{error}</p>;
  if (comments.length === 0) return <p className="text-sm text-gray-500 py-6 text-center">Nenhum comentário encontrado.</p>;
  return <div className="space-y-3">{comments.map((comment, index) => (
    <div key={comment.id ?? `${comment.createdAt}-${index}`} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
      <div className="flex justify-between gap-3 mb-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-gray-400">#{comment.id ?? "-"}</span>
          <span className="text-xs font-semibold text-gray-700">{comment.author ?? "Autor não informado"}</span>
          {comment.isCustomer && <span className="text-[10px] rounded bg-green-100 text-green-700 px-1.5 py-0.5">Cliente</span>}
          {comment.isInternal && <span className="text-[10px] rounded bg-amber-100 text-amber-700 px-1.5 py-0.5">Interno</span>}
        </div>
        {comment.createdAt && <span className="text-[10px] text-gray-400">{formatDate(comment.createdAt)}</span>}
      </div>
      <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.body}</p>
    </div>
  ))}</div>;
}

function JiraStatusPill({ status }: { status: string }) {
  return (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-100">
      {status}
    </span>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-xs text-gray-500 w-24 pt-0.5 shrink-0">{label}</span>
      <span className="text-sm text-gray-800">{value}</span>
    </div>
  );
}

function TypeBadge({ type }: { type: "Bug" | "Story" }) {
  if (type === "Bug")
    return (
      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-100">
        🐛 Bug
      </span>
    );
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-100">
      📋 Story
    </span>
  );
}

function StageBadge({ stage }: { stage: string }) {
  const blocked = stage === "Bloqueado";
  return (
    <span
      className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
        blocked
          ? "bg-red-50 text-red-700 border-red-100"
          : "bg-gray-100 text-gray-600 border-gray-200"
      }`}
    >
      {stage}
    </span>
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
