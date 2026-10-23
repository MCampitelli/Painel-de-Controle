import { useEffect, useState } from "react"
import type { PRStatus, PullRequest, Repository } from "../types"
import {
  prStatusLabel,
  prStatusColor,
  prStatusDot,
  formatRelativeDate,
} from "../utils/prUtils"

interface PRAccordionProps {
  repositories: Repository[]
  onSelectPR: (pr: PullRequest) => void
}

export default function PRAccordion({
  repositories,
  onSelectPR,
}: PRAccordionProps) {
  const [openRepos, setOpenRepos] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (repositories.length === 0) return
    setOpenRepos(
      new Set(
        repositories
          .filter((repo) => repo.pullRequests.length > 0)
          .map((repo) => repo.id),
      ),
    )
  }, [repositories])

  const normalizedSearchTerm = searchTerm.trim().toLocaleLowerCase()
  const filteredRepositories = repositories
    .map((repo) => ({
      ...repo,
      pullRequests: normalizedSearchTerm
        ? repo.pullRequests.filter((pr) =>
            pr.title.toLocaleLowerCase().includes(normalizedSearchTerm),
          )
        : repo.pullRequests,
    }))
    .filter((repo) => !normalizedSearchTerm || repo.pullRequests.length > 0)

  useEffect(() => {
    if (!normalizedSearchTerm) return
    setOpenRepos((prev) => {
      const next = new Set(prev)
      filteredRepositories.forEach((repo) => next.add(repo.id))
      return next
    })
  }, [normalizedSearchTerm, repositories])

  function toggleRepo(id: string) {
    setOpenRepos((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const totalPRs = repositories.reduce((s, r) => s + r.pullRequests.length, 0)
  const filteredPRCount = filteredRepositories.reduce(
    (s, repo) => s + repo.pullRequests.length,
    0,
  )

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden grid grid-rows-[auto_minmax(0,1fr)] flex-1 min-h-0">
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-gray-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M18 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-8a5 5 0 1 1 0 10A5 5 0 0 1 18 13zM6 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm0-2a5 5 0 1 1 0 10A5 5 0 0 1 6 1zm2 15h4a2 2 0 0 1 2 2v1H4v-1a2 2 0 0 1 2-2h2zm-2 2v-1H6v1h2z" />
            </svg>
            <h2 className="text-sm font-semibold text-gray-800">
              Meus Pull Requests
            </h2>
          </div>
          <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {normalizedSearchTerm
              ? `${filteredPRCount} de ${totalPRs}`
              : `${totalPRs} abertos`}
          </span>
        </div>
        <div className="relative mt-3">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path strokeLinecap="round" d="m16 16 4 4" />
          </svg>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar pelo título do PR..."
            aria-label="Buscar pull requests pelo título"
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-xs text-gray-800 placeholder:text-gray-400 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      <div className="overflow-y-auto overscroll-y-contain min-h-0">
        {filteredRepositories.length === 0 && normalizedSearchTerm ? (
          <p className="px-4 py-6 text-center text-xs text-gray-400">
            Nenhum pull request encontrado com esse título.
          </p>
        ) : (
          filteredRepositories.map((repo) => {
            const isOpen = openRepos.has(repo.id)
            const hasPRs = repo.pullRequests.length > 0
            const statusesInRepo = new Set<PRStatus>(
              repo.pullRequests.map((pr) => pr.status),
            )

            return (
              <div
                key={repo.id}
                className="border-b border-gray-100 last:border-0"
              >
                <button
                  onClick={() => toggleRepo(repo.id)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors group"
                >
                  <svg
                    className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? "rotate-90" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>

                  <span className="font-mono text-xs text-gray-700 font-medium flex-1 truncate">
                    {repo.name}
                  </span>

                  <div className="flex items-center gap-1">
                    {([
                      "aguardando_aprovacao",
                      "em_revisao",
                      "aprovado",
                      "conflito",
                      "draft",
                    ] as PRStatus[])
                      .filter((status) => statusesInRepo.has(status))
                      .map((status) => (
                        <span
                          key={status}
                          title={prStatusLabel(status)}
                          className={`w-2 h-2 rounded-full ${prStatusDot(status)}`}
                        />
                      ))}
                  </div>

                  {hasPRs ? (
                    <span className="ml-auto shrink-0 font-mono text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                      {repo.pullRequests.length}
                    </span>
                  ) : (
                    <span className="ml-auto shrink-0 font-mono text-xs text-gray-400">
                      0
                    </span>
                  )}
                </button>

                {isOpen && (
                  <div className="pb-1">
                    {repo.pullRequests.length === 0 ? (
                      <p className="text-xs text-gray-400 px-10 py-2 italic">
                        Nenhum PR aberto
                      </p>
                    ) : (
                      repo.pullRequests.map((pr) => (
                        <PRItem
                          key={pr.id}
                          pr={pr}
                          onClick={() => onSelectPR(pr)}
                        />
                      ))
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

function PRItem({ pr, onClick }: { pr: PullRequest; onClick: () => void }) {
  const failedChecks = pr.checks?.filter((c) => c.status === "failed") ?? []
  const runningChecks =
    pr.checks?.filter((c) => c.status === "running").length ?? 0
  const isReviewed = pr.status === "aprovado" || (pr.approvals ?? 0) > 0

  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-2.5 ml-5 mr-2 hover:bg-blue-50/60 rounded-lg transition-colors group"
      style={{ width: "calc(100% - 2rem)" }}
    >
      <div className="flex items-start gap-2.5">
        <div
          className={`w-2 h-2 rounded-full mt-1 shrink-0 ${prStatusDot(pr.status)}`}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-mono text-xs text-gray-400">
              #{pr.number}
            </span>
            <span
              className="text-xs px-1.5 py-px rounded font-medium border"
              style={prStatusColor(pr.status)}
            >
              {prStatusLabel(pr.status)}
            </span>
            {isReviewed && pr.status !== "aprovado" && (
              <span className="text-xs px-1.5 py-px rounded font-medium border bg-emerald-50 text-emerald-700 border-emerald-200">
                Revisado
              </span>
            )}
            {failedChecks.length > 0 && (
              <span
                className="font-mono text-xs px-1.5 py-px rounded font-semibold bg-red-50 text-red-600 border border-red-200"
                title={`${failedChecks.length} check(s) com falha`}
              >
                ✗ {failedChecks.length}
              </span>
            )}
            {runningChecks > 0 && (
              <span
                className="font-mono text-xs px-1.5 py-px rounded font-semibold bg-yellow-50 text-yellow-600 border border-yellow-200"
                title={`${runningChecks} check(s) em execução`}
              >
                ↻ {runningChecks}
              </span>
            )}
          </div>
          <p className="text-xs font-medium text-gray-800 leading-snug truncate pr-2">
            {pr.title}
          </p>
          <p className="font-mono text-xs text-gray-400 mt-0.5 truncate">
            {pr.branch}
          </p>
        </div>
        <span className="text-xs text-gray-400 shrink-0 mt-0.5">
          {formatRelativeDate(pr.updatedAt)}
        </span>
      </div>
    </button>
  )
}
