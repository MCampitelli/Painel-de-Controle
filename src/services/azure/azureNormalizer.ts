import type { AzureDevOpsWorkItemRaw } from "../../types/integrations";
import type { BugByModule, Priority, WorkItem, WorkItemStage, WorkItemType } from "../../types";
import { APP_CONFIG } from "../../config/appConfig";

const EMPTY_MODULE_LABEL = "Sem módulo informado";

function getStringField(fields: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = fields[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function normalizeType(rawType: string): WorkItemType {
  return rawType.toLowerCase().includes("bug") ? "Bug" : "Story";
}

function normalizePriority(rawPriority: unknown): Priority {
  if (typeof rawPriority === "number") {
    if (rawPriority <= 1) return "Alta";
    if (rawPriority === 2) return "Média";
    return "Baixa";
  }

  if (typeof rawPriority === "string") {
    const lower = rawPriority.toLowerCase();
    if (lower.includes("high") || lower.includes("alta")) return "Alta";
    if (lower.includes("medium") || lower.includes("média")) return "Média";
    if (lower.includes("low") || lower.includes("baixa")) return "Baixa";
  }

  return "Média";
}

function normalizeStage(fields: Record<string, unknown>): WorkItemStage {
  const stage = getStringField(
    fields,
    "System.BoardColumn",
    "System.State",
    "Microsoft.VSTS.Common.ResolvedReason",
  );

  if (!stage) return "Aguardando";

  const stageLower = stage.toLowerCase();
  if (stageLower.includes("block") || stageLower.includes("bloque")) return "Bloqueado";
  if (stageLower.includes("test")) return "Em teste";
  if (stageLower.includes("done") || stageLower.includes("closed") || stageLower.includes("conclu")) return "Concluído";
  if (stageLower.includes("develop") || stageLower.includes("desenvol")) return "Em desenvolvimento";
  if (stageLower.includes("analysis") || stageLower.includes("análi") || stageLower.includes("analise")) return "Em análise";
  if (stageLower.includes("progress") || stageLower.includes("andamento") || stageLower.includes("active")) return "Em andamento";

  return "Aguardando";
}

function extractModule(fields: Record<string, unknown>): string {
  const moduleValue = getStringField(
    fields,
    "Custom.OriginalImpactedFunctionality",
    "Custom.Modulo",
    "Custom.Module",
    "Microsoft.VSTS.Common.ValueArea",
    "System.AreaPath",
  );

  if (!moduleValue) return EMPTY_MODULE_LABEL;

  if (moduleValue.includes("\\")) {
    const parts = moduleValue.split("\\");
    return parts[parts.length - 1] || EMPTY_MODULE_LABEL;
  }

  return moduleValue;
}

function extractTags(fields: Record<string, unknown>): string[] {
  const tagsRaw = getStringField(fields, "System.Tags");
  if (!tagsRaw) return [];

  return tagsRaw
    .split(";")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

function extractAssignedTo(fields: Record<string, unknown>): string {
  const assignedTo = fields["System.AssignedTo"];

  if (typeof assignedTo === "string") {
    return assignedTo;
  }

  if (assignedTo && typeof assignedTo === "object") {
    const displayName = (assignedTo as { displayName?: unknown }).displayName;
    if (typeof displayName === "string") {
      return displayName;
    }
  }

  return "Não atribuído";
}

function normalizeDescription(description: string): string {
  if (!description) return "Sem descrição.";
  return description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function normalizeWorkItem(workItem: AzureDevOpsWorkItemRaw): WorkItem {
  const fields = workItem.fields;
  const rawType = getStringField(fields, "System.WorkItemType");

  return {
    id: String(workItem.id),
    type: normalizeType(rawType),
    title: getStringField(fields, "System.Title") || "Sem título",
    description: normalizeDescription(getStringField(fields, "System.Description")),
    module: extractModule(fields),
    stage: normalizeStage(fields),
    boardColumn: getStringField(fields, "System.BoardColumn") || undefined,
    status: getStringField(fields, "System.State") || "Sem status",
    state: getStringField(fields, "System.State") || "Sem estado",
    externalId: getStringField(fields, "Custom.ExternalId", "Custom.ExternalID", "Custom.EXTERNALID"),
    tags: extractTags(fields),
    priority: normalizePriority(fields["Microsoft.VSTS.Common.Priority"]),
    assignedTo: extractAssignedTo(fields),
    createdAt: getStringField(fields, "System.CreatedDate"),
    updatedAt: getStringField(fields, "System.ChangedDate") || new Date().toISOString(),
    url: `https://dev.azure.com/${APP_CONFIG.azureDevOps.organization}/${APP_CONFIG.azureDevOps.project}/_workitems/edit/${workItem.id}`,
  };
}

export function aggregateBugsByModule(workItems: WorkItem[]): BugByModule[] {
  const bugs = workItems.filter((item) => item.type === "Bug");
  const modulesCount = new Map<string, number>();

  for (const bug of bugs) {
    const moduleName = bug.module?.trim() || EMPTY_MODULE_LABEL;
    modulesCount.set(moduleName, (modulesCount.get(moduleName) ?? 0) + 1);
  }

  return [...modulesCount.entries()]
    .map(([module, count]) => ({ module, count }))
    .sort((a, b) => b.count - a.count);
}

export { EMPTY_MODULE_LABEL };
