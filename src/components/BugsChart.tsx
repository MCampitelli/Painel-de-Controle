import { useState } from "react"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import type { BugByModule } from "../types"

const CHART_COLORS = [
  "#2563eb",
  "#06b6d4",
  "#8b5cf6",
  "#f59e0b",
  "#10b981",
  "#ec4899",
]

interface BugsChartProps {
  data: BugByModule[]
  activeModule: string | null
  onModuleClick: (module: string | null) => void
}

interface TooltipPayload {
  name: string
  value: number
  payload: { percent: number }
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayload[]
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const { name, value, payload: inner } = payload[0]
  return (
    <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl">
      <p className="font-semibold">{name}</p>
      <p className="text-gray-300 mt-0.5">
        {value} bug{value !== 1 ? "s" : ""} · {Math.round(inner.percent * 100)}%
      </p>
    </div>
  )
}

export default function BugsChart({
  data,
  activeModule,
  onModuleClick,
}: BugsChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const total = data.reduce((s, d) => s + d.count, 0)

  function handlePieClick(_: unknown, index: number) {
    const clicked = data[index].module
    onModuleClick(activeModule === clicked ? null : clicked)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shrink-0 max-h-[50%] overflow-y-auto">
      <div
        className={`flex items-center justify-between ${
          isExpanded ? "mb-4" : ""
        }`}
      >
        <button
          type="button"
          onClick={() => setIsExpanded((expanded) => !expanded)}
          aria-expanded={isExpanded}
          aria-controls="bugs-by-module-content"
          className="flex items-center gap-2 text-left"
        >
          <svg
            className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
              isExpanded ? "rotate-90" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m9 5 7 7-7 7"
            />
          </svg>
          <svg
            className="w-4 h-4 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="12" cy="12" r="10" />
            <path strokeLinecap="round" d="M12 2a10 10 0 0 1 7.07 17.07" />
          </svg>
          <h2 className="text-sm font-semibold text-gray-800">
            Meus Bugs por Módulo
          </h2>
        </button>
        <div className="flex items-center gap-2">
          {activeModule && (
            <button
              onClick={() => onModuleClick(null)}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Limpar filtro
            </button>
          )}
          <span className="font-mono text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {total} bugs
          </span>
        </div>
      </div>
      {isExpanded && (
        <div id="bugs-by-module-content">
          <div className="flex gap-6 items-center">
            {/* Donut */}
            <div
              className="shrink-0 relative"
              style={{ width: 180, height: 180 }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="count"
                    nameKey="module"
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={80}
                    paddingAngle={2}
                    onClick={handlePieClick}
                    onMouseEnter={(_, i) => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    style={{ cursor: "pointer" }}
                  >
                    {data.map((entry, index) => {
                      const isActive = activeModule === entry.module
                      const isHovered = hoveredIndex === index
                      const isDimmed = activeModule !== null && !isActive
                      return (
                        <Cell
                          key={entry.module}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                          opacity={
                            isDimmed ? 0.3 : isHovered || isActive ? 1 : 0.85
                          }
                          stroke={isActive ? "#111827" : "transparent"}
                          strokeWidth={isActive ? 1.5 : 0}
                        />
                      )
                    })}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Center label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="font-mono text-2xl font-bold text-gray-900">
                  {total}
                </span>
                <span className="text-xs text-gray-500 mt-0.5">bugs</span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex-1 space-y-2">
              {data.map((entry, index) => {
                const pct = Math.round((entry.count / total) * 100)
                const isActive = activeModule === entry.module
                const isDimmed = activeModule !== null && !isActive
                return (
                  <button
                    key={entry.module}
                    onClick={() =>
                      onModuleClick(
                        activeModule === entry.module ? null : entry.module,
                      )
                    }
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all text-left ${
                      isActive
                        ? "bg-gray-100 ring-1 ring-gray-300"
                        : "hover:bg-gray-50"
                    } ${isDimmed ? "opacity-40" : ""}`}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-sm shrink-0"
                      style={{
                        backgroundColor:
                          CHART_COLORS[index % CHART_COLORS.length],
                      }}
                    />
                    <span className="text-xs text-gray-700 flex-1 font-medium">
                      {entry.module}
                    </span>
                    <span className="font-mono text-xs font-semibold text-gray-800">
                      {entry.count}
                    </span>
                    <span className="font-mono text-xs text-gray-400 w-8 text-right">
                      {pct}%
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {activeModule && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Exibindo demandas do módulo{" "}
                <span className="font-semibold text-gray-700">
                  {activeModule}
                </span>
                . Clique em outra fatia ou em "Limpar filtro" para ver todos.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
