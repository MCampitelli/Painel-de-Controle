import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import DemandsCard from "./DemandsCard";
import { normalizeWorkItem } from "../services/azure/azureNormalizer";
import type { WorkItem } from "../types";

function item(id: number, column?: string, updatedAt = "2026-10-16T12:00:00Z"): WorkItem {
  return normalizeWorkItem({
    id,
    url: "",
    fields: {
      "System.Title": `Demand ${id}`,
      "System.WorkItemType": "Bug",
      "System.State": "Active",
      "System.BoardColumn": column,
      "System.ChangedDate": updatedAt,
    },
  });
}

test("preserves the original Azure board column independently of the normalized stage", () => {
  const demand = item(1, "  Ready for validation  ");
  assert.equal(demand.boardColumn, "Ready for validation");
  assert.equal(demand.stage, "Aguardando");
  assert.equal(item(2).boardColumn, undefined);
  assert.equal(item(3, "  ").boardColumn, undefined);
});

test("groups demands by board column with counts, preserving update order and excluding closed items", () => {
  const closed = { ...item(5, "Closed column"), state: "Closed" };
  const html = renderToStaticMarkup(
    <DemandsCard
      items={[
        item(1, "Development", "2026-10-15T12:00:00Z"),
        item(2, "Validation"),
        item(3, "Development"),
        item(4),
        closed,
      ]}
      activeModule={null}
      onSelectItem={() => {}}
    />,
  );
  assert.equal((html.match(/aria-label="Development"/g) ?? []).length, 1);
  assert.match(html, /aria-label="Validation"/);
  assert.match(html, /aria-label="Sem coluna informada"/);
  assert.doesNotMatch(html, /Closed column|Demand 5/);
  assert.doesNotMatch(html, /Stage|Aguardando/);
  assert.doesNotMatch(html, /max-height:420/);
  const development = html.slice(html.indexOf('aria-label="Development"')).split("</section>")[0];
  assert.match(development, />2<\/span>/);
  assert.ok(development.indexOf("Demand 3") < development.indexOf("Demand 1"));
  assert.doesNotMatch(development, /Demand 2/);
});

test("orders populated groups by the standard board workflow", () => {
  const html = renderToStaticMarkup(
    <DemandsCard
      items={[
        item(1, "Accepted"),
        item(2, "Test"),
        item(3, "Ready"),
        item(4, "Funnel"),
      ]}
      activeModule={null}
      onSelectItem={() => {}}
    />,
  );
  const funnelIndex = html.indexOf('aria-label="Funnel"');
  const readyIndex = html.indexOf('aria-label="Ready"');
  const testIndex = html.indexOf('aria-label="Test"');
  const acceptedIndex = html.indexOf('aria-label="Accepted"');

  assert.ok(funnelIndex < readyIndex);
  assert.ok(readyIndex < testIndex);
  assert.ok(testIndex < acceptedIndex);
  assert.doesNotMatch(html, /aria-label="Triage"|aria-label="Develop"/);
});

test("applies the active module filter before creating groups and preserves the empty state", () => {
  const items = [
    { ...item(1, "Development"), module: "Finance" },
    { ...item(2, "Validation"), module: "Clinical" },
  ];
  const render = (activeModule: string) => renderToStaticMarkup(
    <DemandsCard items={items} activeModule={activeModule} onSelectItem={() => {}} />,
  );
  const filtered = render("Finance");
  assert.match(filtered, /aria-label="Development"/);
  assert.doesNotMatch(filtered, /aria-label="Validation"/);
  assert.match(render("Missing"), /Nenhuma demanda encontrada/);
});
