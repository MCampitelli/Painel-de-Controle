import { useState } from "react";

type InsertionType = "organico" | "versionado" | "";
type VersionadoSubtype = "demanda_legal" | "customizacao" | "bug" | "";
type Natureza =
  | "funcionalidade"
  | "interface"
  | "desempenho"
  | "seguranca"
  | "compatibilidade"
  | "validacao"
  | "integracao"
  | "usabilidade"
  | "infraestrutura"
  | "";

interface FormState {
  insertionType: InsertionType;
  versionadoSubtype: VersionadoSubtype;
  versionadoObs: string;
  onde: string;
  razao: string;
  causa: string;
  causaPR: string;
  correcao: string;
  correcaoPR: string;
  versaoGerada: string;
  medidaPreventiva: string;
  natureza: Natureza;
  versoesAplicadas: string;
}

const EMPTY_FORM: FormState = {
  insertionType: "",
  versionadoSubtype: "",
  versionadoObs: "",
  onde: "",
  razao: "",
  causa: "",
  causaPR: "",
  correcao: "",
  correcaoPR: "",
  versaoGerada: "",
  medidaPreventiva: "",
  natureza: "",
  versoesAplicadas: "",
};

const NATUREZA_LABELS: Record<string, string> = {
  funcionalidade: "Funcionalidade – comportamento incorreto em relação à especificação.",
  interface: "Interface / UI / UX – problemas visuais, layout ou navegação.",
  desempenho: "Desempenho – lentidão, travamento, consumo excessivo.",
  seguranca: "Segurança – vulnerabilidades, falhas de autenticação, exposição de dados.",
  compatibilidade: "Compatibilidade – problemas em navegadores, dispositivos ou versões diferentes.",
  validacao: "Validação / Dados – erros de cálculo, arredondamento, ou inconsistências de banco.",
  integracao: "Integração – falhas em comunicação entre sistemas.",
  usabilidade: "Usabilidade – confusão de uso, mensagens pouco claras.",
  infraestrutura: "Infraestrutura / Configuração – ambiente, deploy, permissão, servidor, gestão da versão, bloqueios.",
};

function generateText(f: FormState): string {
  const insertionLine = f.insertionType === "organico"
    ? "[x] Orgânico\n[ ] Versionado"
    : f.insertionType === "versionado"
      ? "[ ] Orgânico\n[x] Versionado\n" +
        `    (${f.versionadoSubtype === "demanda_legal" ? "x" : " "}) demanda legal\n` +
        `    (${f.versionadoSubtype === "customizacao" ? "x" : " "}) customização\n` +
        `    (${f.versionadoSubtype === "bug" ? "x" : " "}) bug\n` +
        `    Obs: ${f.versionadoObs || "—"}`
      : "[ ] Orgânico\n[ ] Versionado";

  const naturezaLine = f.natureza
    ? Object.entries(NATUREZA_LABELS)
        .map(([k, v]) => `(${k === f.natureza ? "x" : " "}) ${v}`)
        .join("\n")
    : Object.values(NATUREZA_LABELS).map((v) => `( ) ${v}`).join("\n");

  return `1 - Como o defeito foi inserido?
${insertionLine}

2 - Onde:
R: ${f.onde || "—"}

3 - Razão:
R: ${f.razao || "—"}

4 - Causa:
R: ${f.causa || "—"}
Pull Request: ${f.causaPR || "—"}

5 - Correção:
R: ${f.correcao || "—"}
Pull Request: ${f.correcaoPR || "—"}

6 - Em qual versão o defeito foi gerado/introduzido?
R: ${f.versaoGerada || "—"}

7 - Medida preventiva:
R: ${f.medidaPreventiva || "—"}

8 - Natureza do problema:
${naturezaLine}

9 - Em quais versões as alterações foram aplicadas?
R: ${f.versoesAplicadas || "—"}`;
}

export default function BugAnalysisForm() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [copied, setCopied] = useState(false);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleCopy() {
    navigator.clipboard.writeText(generateText(form)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleReset() {
    setForm(EMPTY_FORM);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
      {/* Q1 */}
      <Section number={1} title="Como o defeito foi inserido?">
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="insertionType"
              checked={form.insertionType === "organico"}
              onChange={() => set("insertionType", "organico")}
              className="accent-blue-600"
            />
            <span className="text-sm text-[var(--color-text)]">
              Orgânico <span className="text-[var(--color-text-muted)]">(Entrou quando a versão foi criada a partir da dev)</span>
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="insertionType"
              checked={form.insertionType === "versionado"}
              onChange={() => set("insertionType", "versionado")}
              className="accent-blue-600"
            />
            <span className="text-sm text-[var(--color-text)]">
              Versionado <span className="text-[var(--color-text-muted)]">(Entrou forçado em versão já liberada no mercado)</span>
            </span>
          </label>

          {form.insertionType === "versionado" && (
            <div className="ml-6 mt-2 space-y-2 border-l-2 border-blue-200 pl-4">
              {(["demanda_legal", "customizacao", "bug"] as VersionadoSubtype[]).map((sub) => (
                <label key={sub} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="versionadoSubtype"
                    checked={form.versionadoSubtype === sub}
                    onChange={() => set("versionadoSubtype", sub)}
                    className="accent-blue-600"
                  />
                  <span className="text-sm text-[var(--color-text)]">
                    {sub === "demanda_legal" ? "demanda legal" : sub === "customizacao" ? "customização" : "bug"}
                  </span>
                </label>
              ))}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-[var(--color-text-muted)] shrink-0">Obs:</span>
                <input
                  type="text"
                  value={form.versionadoObs}
                  onChange={(e) => set("versionadoObs", e.target.value)}
                  className="flex-1 text-sm border border-[var(--color-border)] rounded-md px-2 py-1 bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Observação..."
                />
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* Q2 */}
      <Section number={2} title="Onde" subtitle="Identificação da funcionalidade ou rotina onde o defeito ocorre (ex: gerar mensalidade, liberação da prescrição)">
        <TextArea value={form.onde} onChange={(v) => set("onde", v)} />
      </Section>

      {/* Q3 */}
      <Section number={3} title="Razão" subtitle="Por que o defeito ocorre?">
        <TextArea value={form.razao} onChange={(v) => set("razao", v)} />
      </Section>

      {/* Q4 */}
      <Section number={4} title="Causa" subtitle="Existe alguma alteração no código fonte que causou o problema?">
        <TextArea value={form.causa} onChange={(v) => set("causa", v)} />
        <PRField value={form.causaPR} onChange={(v) => set("causaPR", v)} />
      </Section>

      {/* Q5 */}
      <Section number={5} title="Correção" subtitle="Descreva como foi corrigido o defeito e quais alterações foram necessárias">
        <TextArea value={form.correcao} onChange={(v) => set("correcao", v)} />
        <PRField value={form.correcaoPR} onChange={(v) => set("correcaoPR", v)} />
      </Section>

      {/* Q6 */}
      <Section number={6} title="Em qual versão o defeito foi gerado/introduzido?" subtitle="Se foi antes da última versão disponibilizada, por que não havia sido identificado?">
        <TextArea value={form.versaoGerada} onChange={(v) => set("versaoGerada", v)} />
      </Section>

      {/* Q7 */}
      <Section number={7} title="Medida preventiva" subtitle="O que poderia ter sido feito para prevenir o problema?">
        <TextArea value={form.medidaPreventiva} onChange={(v) => set("medidaPreventiva", v)} />
      </Section>

      {/* Q8 */}
      <Section number={8} title="Natureza do problema">
        <div className="space-y-1.5">
          {(Object.entries(NATUREZA_LABELS) as [Natureza, string][]).map(([key, label]) => (
            <label key={key} className="flex items-start gap-2 cursor-pointer">
              <input
                type="radio"
                name="natureza"
                checked={form.natureza === key}
                onChange={() => set("natureza", key)}
                className="accent-blue-600 mt-0.5 shrink-0"
              />
              <span className="text-sm text-[var(--color-text)]">{label}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* Q9 */}
      <Section number={9} title="Em quais versões as alterações foram aplicadas?">
        <TextArea value={form.versoesAplicadas} onChange={(v) => set("versoesAplicadas", v)} />
      </Section>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
        >
          {copied ? (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Copiado!
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copiar preenchimento
            </>
          )}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors"
        >
          Limpar
        </button>
      </div>
    </div>
  );
}

function Section({ number, title, subtitle, children }: {
  number: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">
            {number}
          </span>
          <span className="text-sm font-semibold text-[var(--color-text)]">{title}</span>
        </div>
        {subtitle && <p className="text-xs text-[var(--color-text-muted)] ml-8">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function TextArea({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
      placeholder="R:"
      className="w-full text-sm border border-[var(--color-border)] rounded-lg px-3 py-2 bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
    />
  );
}

function PRField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2 mt-2">
      <span className="text-xs font-medium text-[var(--color-text-muted)] shrink-0">Pull Request:</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="URL ou número do PR"
        className="flex-1 text-sm border border-[var(--color-border)] rounded-md px-2 py-1 bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    </div>
  );
}
