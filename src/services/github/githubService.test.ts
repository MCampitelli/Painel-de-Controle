import assert from "node:assert/strict";
import { test } from "node:test";
import type { GitHubCheckRunRaw, GitHubStatusRaw } from "../../types/integrations";
import { getCheckRuns } from "./githubService";

const failedCheck: GitHubCheckRunRaw = {
  name: "PR Pipeline / code-quality / code-quality",
  status: "completed",
  conclusion: "failure",
};

test("combines failed check runs and commit statuses for the same PR", async (t) => {
  const statuses: GitHubStatusRaw[] = [
    { context: "Validate Commit", state: "failure" },
    { context: "VERSION COMMIT ALLOWED", state: "failure" },
    { context: "VNV VERSION APPROVE", state: "failure" },
    { context: "CIBUILD", state: "success" },
    { context: "Pending validation", state: "pending" },
    { context: "CIBUILD", state: "failure" },
  ];
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = new URL(String(input));
    return Response.json(url.pathname.endsWith("/check-runs")
      ? { check_runs: [failedCheck] }
      : statuses);
  });

  const result = await getCheckRuns("emr-tasy-frontend", "head-sha", "test-token");
  assert.deepEqual(result.filter((check) => check.conclusion === "failure").map((check) => check.name), [
    failedCheck.name,
    "Validate Commit",
    "VERSION COMMIT ALLOWED",
    "VNV VERSION APPROVE",
  ]);
  assert.equal(result.filter((check) => check.name === "CIBUILD").length, 1);
  assert.equal(result.find((check) => check.name === "CIBUILD")?.conclusion, "success");
  assert.equal(result.find((check) => check.name === "Pending validation")?.status, "in_progress");
});

test("loads every page from both APIs and keeps the newest commit status across pages", async (t) => {
  const requests: string[] = [];
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = new URL(String(input));
    const page = url.searchParams.get("page");
    assert.equal(url.searchParams.get("per_page"), "100");
    requests.push(`${url.pathname.split("/").pop()}:${page}`);
    if (url.pathname.endsWith("/check-runs")) {
      assert.equal(url.searchParams.get("filter"), "latest");
      return Response.json({
        check_runs: page === "1"
          ? Array.from({ length: 100 }, (_, i) => ({ ...failedCheck, name: `check-${i}` }))
          : [failedCheck],
      });
    }
    return Response.json(page === "1"
      ? Array.from({ length: 100 }, (_, i) => ({ context: `status-${i}`, state: "success" }))
      : [
        { context: "status-0", state: "failure" },
        { context: "Last-page failure", state: "failure" },
      ]);
  });

  const result = await getCheckRuns("repo", "sha", "test-token");
  assert.deepEqual(requests, ["check-runs:1", "check-runs:2", "statuses:1", "statuses:2"]);
  assert.equal(result.length, 202);
  assert.equal(result.find((check) => check.name === "Last-page failure")?.conclusion, "failure");
  assert.equal(result.find((check) => check.name === "status-0")?.conclusion, "success");
});

test("still loads commit statuses when the check-runs API is forbidden, with a warning", async (t) => {
  const warning = t.mock.method(console, "warn", () => {});
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) =>
    String(input).includes("/check-runs")
      ? new Response(null, { status: 403 })
      : Response.json([{ context: "Legacy failure", state: "error" }]));

  const result = await getCheckRuns("repo", "sha", "test-token");
  assert.deepEqual(result, [{ name: "Legacy failure", status: "completed", conclusion: "failure" }]);
  assert.equal(warning.mock.callCount(), 1);
});

test("does not silently return an incomplete list when the statuses API fails", async (t) => {
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) =>
    String(input).includes("/check-runs")
      ? Response.json({ check_runs: [failedCheck] })
      : new Response(null, { status: 500 }));

  await assert.rejects(getCheckRuns("repo", "sha", "test-token"), /Serviço do GitHub indisponível/);
});

test("propagates authentication and network failures instead of returning no checks", async (t) => {
  const fetchMock = t.mock.method(globalThis, "fetch", async () => new Response(null, { status: 401 }));
  await assert.rejects(getCheckRuns("repo", "sha", "test-token"), /Personal Access Token/);
  fetchMock.mock.mockImplementation(async () => { throw new TypeError("Failed to fetch"); });
  await assert.rejects(getCheckRuns("repo", "sha", "test-token"), /Failed to fetch/);
});
