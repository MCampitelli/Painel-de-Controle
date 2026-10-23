import { APP_CONFIG } from "../../config/appConfig";
import type { BugByModule, WorkItem } from "../../types";
import type { ApiUserIdentity, AzureDevOpsWorkItemRaw } from "../../types/integrations";
import { ApiServiceError, mapAzureError } from "../errors/apiErrorMapper";
import { aggregateBugsByModule, normalizeWorkItem } from "./azureNormalizer";

interface AzureConnectionDataResponse {
  authenticatedUser?: {
    uniqueName?: string;
    providerDisplayName?: string;
  };
}

interface WiqlResponse {
  workItems: Array<{ id: number }>;
}

interface QueryByIdResponse {
  _links?: {
    wiql?: {
      href?: string;
    };
  };
}

interface WorkItemsBatchResponse {
  value: AzureDevOpsWorkItemRaw[];
}

const WORK_ITEMS_BATCH_SIZE = 200;
const WORK_ITEM_FIELDS_PRIMARY = [
  "System.Id",
  "System.WorkItemType",
  "System.Title",
  "System.AssignedTo",
  "System.State",
  "System.Tags",
  "System.BoardColumn",
  "System.CreatedDate",
  "System.ChangedDate",
  "Custom.ExternalId",
  "Custom.OriginalImpactedFunctionality",
] as const;

const WORK_ITEM_FIELDS_FALLBACK = [
  "System.Id",
  "System.WorkItemType",
  "System.Title",
  "System.AssignedTo",
  "System.State",
  "System.Tags",
  "System.BoardColumn",
  "System.CreatedDate",
  "System.ChangedDate",
  "Custom.ExternalId",
] as const;

function azureAuthHeader(pat: string): string {
  return `Basic ${btoa(`:${pat}`)}`;
}

function buildAzureUrl(path: string): string {
  return `https://dev.azure.com/${APP_CONFIG.azureDevOps.organization}${path}`;
}

async function fetchAzure<T>(path: string, pat: string, init?: RequestInit): Promise<T> {
  const response = await fetch(buildAzureUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: azureAuthHeader(pat),
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw mapAzureError(response.status);
  }

  return (await response.json()) as T;
}

function getConfiguredQueryId(): string | null {
  const value = APP_CONFIG.azureDevOps.queryId?.trim();
  return value ? value : null;
}

async function getWorkItemIdsFromConfiguredQuery(pat: string): Promise<number[]> {
  const queryId = getConfiguredQueryId();
  if (!queryId) {
    throw new ApiServiceError("Nenhuma Query do Azure DevOps foi configurada.");
  }

  const queryPath = `/${APP_CONFIG.azureDevOps.project}/_apis/wit/queries/${queryId}?api-version=7.1`;
  const queryUrl = buildAzureUrl(queryPath);
  const queryResponse = await fetch(queryUrl, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: azureAuthHeader(pat),
    },
  });

  console.info("[Azure DevOps] Buscando query salva:", queryUrl);
  console.info("[Azure DevOps] Status HTTP da query salva:", queryResponse.status);

  if (!queryResponse.ok) {
    throw mapAzureError(queryResponse.status);
  }

  const queryResult = (await queryResponse.json()) as QueryByIdResponse;
  const wiqlUrl = queryResult._links?.wiql?.href?.trim();

  if (!wiqlUrl) {
    throw new ApiServiceError("A query salva nao retornou o link WIQL.");
  }

  const wiqlResponse = await fetch(wiqlUrl, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: azureAuthHeader(pat),
    },
  });

  console.info("[Azure DevOps] Executando link WIQL da query salva:", wiqlUrl);
  console.info("[Azure DevOps] Status HTTP da execucao WIQL:", wiqlResponse.status);

  if (!wiqlResponse.ok) {
    throw mapAzureError(wiqlResponse.status);
  }

  const wiqlResult = (await wiqlResponse.json()) as WiqlResponse;
  console.info("[Azure DevOps] Work Items retornados pela query:", wiqlResult.workItems.length);

  return wiqlResult.workItems.map((item) => item.id);
}

async function getWorkItemsByIds(ids: number[], pat: string): Promise<WorkItem[]> {
  if (!ids.length) return [];

  const normalized: WorkItem[] = [];
  for (let index = 0; index < ids.length; index += WORK_ITEMS_BATCH_SIZE) {
    const batchIds = ids.slice(index, index + WORK_ITEMS_BATCH_SIZE);
    const endpoint = `/${APP_CONFIG.azureDevOps.project}/_apis/wit/workitemsbatch?api-version=7.1`;

    let batchResponse = await fetch(buildAzureUrl(endpoint), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: azureAuthHeader(pat),
      },
      body: JSON.stringify({
        ids: batchIds,
        fields: WORK_ITEM_FIELDS_PRIMARY,
      }),
    });

    if (batchResponse.status === 400) {
      console.warn("[Azure DevOps] workitemsbatch retornou 400 com campos customizados. Tentando fallback de campos.");
      batchResponse = await fetch(buildAzureUrl(endpoint), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: azureAuthHeader(pat),
        },
        body: JSON.stringify({
          ids: batchIds,
          fields: WORK_ITEM_FIELDS_FALLBACK,
        }),
      });
    }

    if (!batchResponse.ok) {
      throw mapAzureError(batchResponse.status);
    }

    const response = (await batchResponse.json()) as WorkItemsBatchResponse;

    response.value.forEach((item) => normalized.push(normalizeWorkItem(item)));
  }

  return normalized;
}

export async function testAzureDevOpsConnection(
  pat: string
): Promise<ApiUserIdentity> {
  const response = await fetchAzure<AzureConnectionDataResponse>(
    `/_apis/connectionData?connectOptions=1&lastChangeId=-1&lastChangeId64=-1&api-version=7.1-preview.1`,
    pat
  );

  const login = response.authenticatedUser?.uniqueName?.trim();
  const displayName =
    response.authenticatedUser?.providerDisplayName?.trim();

  return {
    login: login || "Usuario Azure DevOps",
    displayName: displayName || login || "Usuario Azure DevOps",
  };
}

export async function getMyWorkItems(pat: string): Promise<WorkItem[]> {
  await testAzureDevOpsConnection(pat);
  const queryIds = await getWorkItemIdsFromConfiguredQuery(pat);

  const items = await getWorkItemsByIds(queryIds, pat);

  return items;
}

export async function getBugs(pat: string): Promise<WorkItem[]> {
  const items = await getMyWorkItems(pat);
  return items.filter((item) => item.type === "Bug");
}

export async function getStories(pat: string): Promise<WorkItem[]> {
  const items = await getMyWorkItems(pat);
  return items.filter((item) => item.type === "Story");
}

export async function getWorkItemDetails(id: number, pat: string): Promise<WorkItem | null> {
  const items = await getWorkItemsByIds([id], pat);
  return items[0] ?? null;
}

export async function getBugsByModule(pat: string): Promise<BugByModule[]> {
  const bugs = await getBugs(pat);
  return aggregateBugsByModule(bugs);
}
