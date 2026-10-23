import type { Repository, WorkItem } from "../types";

// ---------------------------------------------------------------------------
// GitHub – Pull Requests
// Replace with: githubService.getMyPullRequests()
// ---------------------------------------------------------------------------
export const mockRepositories: Repository[] = [
  {
    id: "repo-1",
    name: "emr-tasy-plsql",
    url: "https://github.com/philips-internal/emr-tasy-plsql",
    pullRequests: [
      {
        id: "pr-101",
        number: 1523,
        title: "Correção de validação de indicadores financeiros",
        repository: "emr-tasy-plsql",
        branch: "feature/correcao-indicadores",
        status: "aguardando_aprovacao",
        updatedAt: "2026-08-04T08:15:00Z",
        url: "https://github.com/philips-internal/emr-tasy-plsql/pull/1523",
        checks: [
          { name: "CI / Build", status: "passed" },
          { name: "CI / Unit Tests", status: "failed" },
          { name: "SonarCloud Code Analysis", status: "running" },
        ],
      },
      {
        id: "pr-102",
        number: 1518,
        title: "Ajuste no processamento do fechamento financeiro",
        repository: "emr-tasy-plsql",
        branch: "bug/processamento-financeiro",
        status: "aprovado",
        updatedAt: "2026-08-03T17:42:00Z",
        url: "https://github.com/philips-internal/emr-tasy-plsql/pull/1518",
        checks: [
          { name: "CI / Build", status: "passed" },
          { name: "CI / Unit Tests", status: "passed" },
          { name: "SonarCloud Code Analysis", status: "passed" },
        ],
      },
      {
        id: "pr-103",
        number: 1501,
        title: "Atualização de dependências do módulo de relatórios",
        repository: "emr-tasy-plsql",
        branch: "feature/update-dependencies",
        status: "conflito",
        updatedAt: "2026-08-02T14:30:00Z",
        url: "https://github.com/philips-internal/emr-tasy-plsql/pull/1501",
        checks: [
          { name: "CI / Build", status: "failed" },
          { name: "CI / Unit Tests", status: "failed" },
          { name: "Security Scan", status: "running" },
        ],
      },
    ],
  },
  {
    id: "repo-2",
    name: "emr-tasy-frontend",
    url: "https://github.com/philips-internal/emr-tasy-frontend",
    pullRequests: [
      {
        id: "pr-201",
        number: 892,
        title: "Refatoração do painel de contas a pagar",
        repository: "emr-tasy-frontend",
        branch: "feature/refactor-contas-pagar",
        status: "em_revisao",
        updatedAt: "2026-08-04T09:05:00Z",
        url: "https://github.com/philips-internal/emr-tasy-frontend/pull/892",
        checks: [
          { name: "CI / Build", status: "passed" },
          { name: "CI / Lint", status: "running" },
          { name: "CI / E2E Tests", status: "running" },
        ],
      },
      {
        id: "pr-202",
        number: 887,
        title: "Melhoria na exportação de relatórios em PDF",
        repository: "emr-tasy-frontend",
        branch: "feature/pdf-export",
        status: "aguardando_aprovacao",
        updatedAt: "2026-08-03T11:20:00Z",
        url: "https://github.com/philips-internal/emr-tasy-frontend/pull/887",
        checks: [
          { name: "CI / Build", status: "failed" },
          { name: "CI / Lint", status: "passed" },
        ],
      },
    ],
  },
  {
    id: "repo-3",
    name: "emr-tasy-backend",
    url: "https://github.com/philips-internal/emr-tasy-backend",
    pullRequests: [
      {
        id: "pr-301",
        number: 214,
        title: "Novo componente DateRangePicker com timezone",
        repository: "emr-tasy-backend",
        branch: "feature/date-range-picker",
        status: "draft",
        updatedAt: "2026-08-04T07:00:00Z",
        url: "https://github.com/philips-internal/emr-tasy-backend/pull/214",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Azure DevOps – Work Items
// Replace with: azureDevOpsService.getMyWorkItems()
// ---------------------------------------------------------------------------
export const mockWorkItems: WorkItem[] = [
  {
    id: "73435",
    type: "Bug",
    title: "Erro ao salvar indicador financeiro no fechamento mensal",
    description:
      "Ao tentar salvar um indicador financeiro durante o processo de fechamento mensal, o sistema retorna erro 500 sem mensagem descritiva. O problema ocorre especificamente quando o campo 'competência' está preenchido com data retroativa.",
    module: "Contabilidade",
    stage: "Em andamento",
    status: "Ativo",
    priority: "Alta",
    assignedTo: "Marcelo",
    sprint: "Sprint 42",
    updatedAt: "2026-08-04T08:30:00Z",
    url: "https://dev.azure.com/org/project/_workitems/edit/73435",
  },
  {
    id: "73436",
    type: "Bug",
    title: "Falha na validação de lançamento contábil duplicado",
    description:
      "O sistema não está impedindo a criação de lançamentos contábeis duplicados quando o usuário clica rapidamente no botão 'Salvar'. Isso causa inconsistência no saldo das contas.",
    module: "Contabilidade",
    stage: "Em análise",
    status: "Ativo",
    priority: "Média",
    assignedTo: "Marcelo",
    sprint: "Sprint 42",
    updatedAt: "2026-08-03T14:20:00Z",
    url: "https://dev.azure.com/org/project/_workitems/edit/73436",
  },
  {
    id: "73440",
    type: "Bug",
    title: "Relatório de balancete não respeita filtro de centro de custo",
    description:
      "Ao gerar o relatório de balancete com filtro por centro de custo, o sistema ignora o filtro e exibe todos os lançamentos. O problema foi introduzido na última atualização do módulo.",
    module: "Contabilidade",
    stage: "Bloqueado",
    status: "Bloqueado",
    priority: "Alta",
    assignedTo: "Marcelo",
    sprint: "Sprint 41",
    updatedAt: "2026-08-01T11:00:00Z",
    url: "https://dev.azure.com/org/project/_workitems/edit/73440",
  },
  {
    id: "73441",
    type: "Bug",
    title: "Cálculo incorreto de juros no vencimento estendido",
    description:
      "Quando uma fatura tem seu vencimento estendido manualmente, o cálculo de juros não está sendo reprocessado. O valor cobrado permanece com base na data original.",
    module: "Contabilidade",
    stage: "Em andamento",
    status: "Ativo",
    priority: "Alta",
    assignedTo: "Marcelo",
    sprint: "Sprint 42",
    updatedAt: "2026-08-04T07:45:00Z",
    url: "https://dev.azure.com/org/project/_workitems/edit/73441",
  },
  {
    id: "73437",
    type: "Bug",
    title: "Aprovação de pagamento falha para fornecedores inativos",
    description:
      "O fluxo de aprovação de pagamento está bloqueando faturas de fornecedores que foram inativados após o lançamento. O sistema deveria permitir o pagamento mesmo com o fornecedor inativo.",
    module: "Contas a Pagar",
    stage: "Em análise",
    status: "Ativo",
    priority: "Média",
    assignedTo: "Marcelo",
    sprint: "Sprint 42",
    updatedAt: "2026-08-03T10:15:00Z",
    url: "https://dev.azure.com/org/project/_workitems/edit/73437",
  },
  {
    id: "73442",
    type: "Bug",
    title: "Conciliação bancária exibe saldo divergente no extrato",
    description:
      "A tela de conciliação bancária apresenta saldo divergente em relação ao extrato importado do banco. A diferença ocorre quando há lançamentos de tarifas no mesmo dia.",
    module: "Contas a Pagar",
    stage: "Aguardando",
    status: "Aguardando",
    priority: "Alta",
    assignedTo: "Marcelo",
    sprint: "Sprint 43",
    updatedAt: "2026-08-02T16:30:00Z",
    url: "https://dev.azure.com/org/project/_workitems/edit/73442",
  },
  {
    id: "73443",
    type: "Bug",
    title: "Importação de NF-e falha para notas com múltiplos destinatários",
    description:
      "O processo de importação de NF-e retorna erro de parsing quando a nota fiscal possui mais de um destinatário no XML. A validação do schema não está contemplando este cenário.",
    module: "Contas a Pagar",
    stage: "Em desenvolvimento",
    status: "Ativo",
    priority: "Média",
    assignedTo: "Marcelo",
    sprint: "Sprint 42",
    updatedAt: "2026-08-04T09:00:00Z",
    url: "https://dev.azure.com/org/project/_workitems/edit/73443",
  },
  {
    id: "73444",
    type: "Bug",
    title: "Renegociação de parcelas não atualiza prazo no contrato",
    description:
      "Após renegociar parcelas de um contrato, o prazo final exibido no cabeçalho do contrato não é atualizado automaticamente. É necessário reabrir o contrato para ver a informação correta.",
    module: "Contas a Pagar",
    stage: "Em teste",
    status: "Em teste",
    priority: "Baixa",
    assignedTo: "Marcelo",
    sprint: "Sprint 41",
    updatedAt: "2026-07-31T15:20:00Z",
    url: "https://dev.azure.com/org/project/_workitems/edit/73444",
  },
  {
    id: "73438",
    type: "Bug",
    title: "Gráfico de evolução de indicadores exibe dados invertidos",
    description:
      "No painel de indicadores, o gráfico de evolução mensal está exibindo os valores em ordem inversa — os meses mais recentes aparecem à esquerda e os mais antigos à direita.",
    module: "Indicadores",
    stage: "Em andamento",
    status: "Ativo",
    priority: "Média",
    assignedTo: "Marcelo",
    sprint: "Sprint 42",
    updatedAt: "2026-08-04T08:00:00Z",
    url: "https://dev.azure.com/org/project/_workitems/edit/73438",
  },
  {
    id: "73445",
    type: "Bug",
    title: "Exportação de indicadores para Excel perde formatação",
    description:
      "Ao exportar o relatório de indicadores para Excel, as células de percentual perdem a formatação e são exibidas como valores decimais sem símbolo de porcentagem.",
    module: "Indicadores",
    stage: "Em análise",
    status: "Ativo",
    priority: "Baixa",
    assignedTo: "Marcelo",
    sprint: "Sprint 43",
    updatedAt: "2026-08-01T13:00:00Z",
    url: "https://dev.azure.com/org/project/_workitems/edit/73445",
  },
  {
    id: "73446",
    type: "Bug",
    title: "Meta de indicador não aplica variação sazonal configurada",
    description:
      "O cálculo automático de metas com variação sazonal não está sendo aplicado. As metas são calculadas com valor fixo mesmo quando a variação sazonal está habilitada nas configurações.",
    module: "Indicadores",
    stage: "Aguardando",
    status: "Aguardando",
    priority: "Alta",
    assignedTo: "Marcelo",
    sprint: "Sprint 43",
    updatedAt: "2026-08-03T09:30:00Z",
    url: "https://dev.azure.com/org/project/_workitems/edit/73446",
  },
  {
    id: "73447",
    type: "Bug",
    title: "Baixa de recebimento não gera histórico de movimentação",
    description:
      "Ao realizar a baixa de um título a receber, o histórico de movimentações financeiras não registra a operação. A auditoria fica sem o registro da transação.",
    module: "Contas a Receber",
    stage: "Bloqueado",
    status: "Bloqueado",
    priority: "Alta",
    assignedTo: "Marcelo",
    sprint: "Sprint 41",
    updatedAt: "2026-07-30T10:45:00Z",
    url: "https://dev.azure.com/org/project/_workitems/edit/73447",
  },
  {
    id: "73448",
    type: "Bug",
    title: "Filtro de cliente por CNPJ retorna resultados incorretos",
    description:
      "A busca de clientes utilizando o filtro por CNPJ está retornando registros de outros clientes que não possuem o CNPJ informado. O problema parece ser na query SQL gerada.",
    module: "Contas a Receber",
    stage: "Em desenvolvimento",
    status: "Ativo",
    priority: "Média",
    assignedTo: "Marcelo",
    sprint: "Sprint 42",
    updatedAt: "2026-08-04T06:30:00Z",
    url: "https://dev.azure.com/org/project/_workitems/edit/73448",
  },
  {
    id: "73449",
    type: "Bug",
    title: "Projeção de fluxo de caixa não considera lançamentos futuros",
    description:
      "A projeção do fluxo de caixa está desconsiderando lançamentos programados para datas futuras. Apenas os lançamentos do mês corrente são incluídos no cálculo da projeção.",
    module: "Fluxo de Caixa",
    stage: "Em andamento",
    status: "Ativo",
    priority: "Alta",
    assignedTo: "Marcelo",
    sprint: "Sprint 42",
    updatedAt: "2026-08-04T09:15:00Z",
    url: "https://dev.azure.com/org/project/_workitems/edit/73439",
  },
  {
    id: "73450",
    type: "Bug",
    title: "Gráfico de fluxo acumulado apresenta valor negativo incorreto",
    description:
      "O gráfico de fluxo de caixa acumulado está mostrando valores negativos em períodos onde o saldo é positivo. O erro ocorre após importar extratos bancários com lançamentos retroativos.",
    module: "Fluxo de Caixa",
    stage: "Em análise",
    status: "Ativo",
    priority: "Média",
    assignedTo: "Marcelo",
    sprint: "Sprint 42",
    updatedAt: "2026-08-03T15:00:00Z",
    url: "https://dev.azure.com/org/project/_workitems/edit/73449",
  },
  {
    id: "73451",
    type: "Story",
    title: "Implementar nova validação de consistência de indicadores",
    description:
      "Criar rotina de validação automática que verifica a consistência dos indicadores ao final de cada período. A validação deve comparar os valores calculados com os lançamentos contábeis e emitir alertas em caso de divergência.",
    module: "Indicadores",
    stage: "Em desenvolvimento",
    status: "Ativo",
    priority: "Média",
    assignedTo: "Marcelo",
    sprint: "Sprint 42",
    updatedAt: "2026-08-04T08:45:00Z",
    url: "https://dev.azure.com/org/project/_workitems/edit/73438",
  },
  {
    id: "73452",
    type: "Story",
    title: "Dashboard executivo com KPIs financeiros em tempo real",
    description:
      "Desenvolver painel executivo que consolide os principais KPIs financeiros da empresa com atualização em tempo real via WebSocket. Incluir gráficos de evolução mensal, comparativo com metas e alertas de desvio.",
    module: "Indicadores",
    stage: "Aguardando",
    status: "Aguardando",
    priority: "Alta",
    assignedTo: "Marcelo",
    sprint: "Sprint 43",
    updatedAt: "2026-08-02T12:00:00Z",
    url: "https://dev.azure.com/org/project/_workitems/edit/73450",
  },
  {
    id: "73453",
    type: "Story",
    title: "Módulo de conciliação bancária automática via OFX/CNAB",
    description:
      "Implementar importação e conciliação automática de extratos bancários nos formatos OFX e CNAB240. O sistema deve sugerir automaticamente os lançamentos correspondentes com base em regras configuráveis.",
    module: "Contas a Pagar",
    stage: "Em desenvolvimento",
    status: "Ativo",
    priority: "Alta",
    assignedTo: "Marcelo",
    sprint: "Sprint 42",
    updatedAt: "2026-08-04T10:00:00Z",
    url: "https://dev.azure.com/org/project/_workitems/edit/73451",
  },
  {
    id: "73454",
    type: "Story",
    title: "API REST para integração com sistema de notas fiscais",
    description:
      "Criar endpoints REST para integração bidirecional com o sistema de emissão de notas fiscais. A integração deve permitir a criação automática de lançamentos financeiros a partir das NF-e emitidas.",
    module: "Contabilidade",
    stage: "Em andamento",
    status: "Ativo",
    priority: "Média",
    assignedTo: "Marcelo",
    sprint: "Sprint 42",
    updatedAt: "2026-08-03T13:30:00Z",
    url: "https://dev.azure.com/org/project/_workitems/edit/73452",
  },
  {
    id: "73455",
    type: "Story",
    title: "Relatório de aging de contas a receber com exportação",
    description:
      "Desenvolver relatório de aging (carteira em atraso) com segmentação por faixa de vencimento, cliente e categoria. O relatório deve suportar exportação para Excel e PDF com layout formatado.",
    module: "Contas a Receber",
    stage: "Em análise",
    status: "Ativo",
    priority: "Baixa",
    assignedTo: "Marcelo",
    sprint: "Sprint 43",
    updatedAt: "2026-08-01T09:00:00Z",
    url: "https://dev.azure.com/org/project/_workitems/edit/73453",
  },
];

// ---------------------------------------------------------------------------
// Derived – bugs by module (computed from mockWorkItems)
// Replace with: azureDevOpsService.getBugsByModule()
// ---------------------------------------------------------------------------
export function computeBugsByModule(items: WorkItem[]) {
  const map: Record<string, number> = {};
  items
    .filter((i) => i.type === "Bug")
    .forEach((i) => {
      map[i.module] = (map[i.module] ?? 0) + 1;
    });
  return Object.entries(map)
    .map(([module, count]) => ({ module, count }))
    .sort((a, b) => b.count - a.count);
}
