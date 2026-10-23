import type { CSSProperties } from "react";
import type { PRStatus } from "../types";

export function prStatusLabel(status: PRStatus): string {
  const map: Record<PRStatus, string> = {
    aguardando_aprovacao: "Aguardando aprovação",
    aprovado: "Revisado",
    conflito: "Com conflitos",
    em_revisao: "Em revisão",
    draft: "Draft",
  };
  return map[status];
}

export function prStatusColor(status: PRStatus): CSSProperties {
  const map: Record<PRStatus, CSSProperties> = {
    aguardando_aprovacao: {
      backgroundColor: "#fffbeb",
      color: "#b45309",
      borderColor: "#fde68a",
    },
    aprovado: {
      backgroundColor: "#f0fdf4",
      color: "#15803d",
      borderColor: "#bbf7d0",
    },
    conflito: {
      backgroundColor: "#fef2f2",
      color: "#b91c1c",
      borderColor: "#fecaca",
    },
    em_revisao: {
      backgroundColor: "#eff6ff",
      color: "#1d4ed8",
      borderColor: "#bfdbfe",
    },
    draft: {
      backgroundColor: "#f9fafb",
      color: "#4b5563",
      borderColor: "#e5e7eb",
    },
  };
  return map[status];
}

export function prStatusDot(status: PRStatus): string {
  const map: Record<PRStatus, string> = {
    aguardando_aprovacao: "bg-amber-400",
    aprovado: "bg-emerald-500",
    conflito: "bg-red-500",
    em_revisao: "bg-blue-500",
    draft: "bg-gray-400",
  };
  return map[status];
}

export function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (hours < 1) return "agora mesmo";
  if (hours < 24) return `há ${hours}h`;
  if (days === 1) return "ontem";
  return `há ${days} dias`;
}
