import { APP_CONFIG } from "../../config/appConfig";
import type { JiraComment, WorkItem } from "../../types";

type UnknownRecord = Record<string, unknown>;

function getRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? value as UnknownRecord : {};
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function htmlToText(value: string): string {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&#x27;/gi, "'")
    .replace(/&#34;/gi, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function getItems(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  const record = getRecord(value);
  return Array.isArray(record.comments) ? record.comments : Array.isArray(record.data) ? record.data : [];
}

async function fetchJira(path: string): Promise<unknown> {
  const response = await fetch(`${APP_CONFIG.jira.apiBaseUrl}/${path.split("/").map(encodeURIComponent).join("/")}`);
  if (!response.ok) throw new Error(`Jira respondeu com HTTP ${response.status}.`);
  return response.json();
}

export async function getJiraStatus(externalId: string): Promise<string> {
  const payload = getRecord(await fetchJira(`${externalId}/status`));
  return getString(payload.name)
    ?? getString(getRecord(payload.status).name)
    ?? getString(payload.status)
    ?? getString(getRecord(payload.data).name)
    ?? "Status não informado";
}

export async function getJiraComments(externalId: string): Promise<JiraComment[]> {
  const payload = await fetchJira(`${externalId}/comments`);
  return getItems(payload)
    .map((value) => {
      const comment = getRecord(value);
      const rawBody = getString(comment.bodyHtml) ?? getString(comment.body) ?? getString(comment.text) ?? getString(comment.comment);
      const body = rawBody ? htmlToText(rawBody) : undefined;
      if (!body) return null;
      const authorValue = getRecord(comment.author);
      return {
        id: getString(comment.id),
        body,
        author: getString(comment.author) ?? getString(authorValue.displayName) ?? getString(authorValue.name),
        createdAt: getString(comment.createdAt) ?? getString(comment.created_at) ?? getString(comment.updatedAt),
        isInternal: comment.isInternal === true,
        isCustomer: comment.isCustomer === true,
      } satisfies JiraComment;
    })
    .filter((comment): comment is JiraComment => comment !== null)
    .sort((first, second) => Date.parse(second?.createdAt ?? "") - Date.parse(first?.createdAt ?? ""));
}

export async function enrichBugsWithJiraStatus(items: WorkItem[]): Promise<WorkItem[]> {
  return Promise.all(items.map(async (item) => {
    if (item.type !== "Bug" || !item.externalId) return item;
    try {
      return { ...item, jiraStatus: await getJiraStatus(item.externalId) };
    } catch {
      return item;
    }
  }));
}