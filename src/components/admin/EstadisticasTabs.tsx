"use client"

import { useState } from "react"
import CollaboratorStats from "./CollaboratorStats"
import ReportsTab from "./ReportsTab"

export default function EstadisticasTabs() {
  const [tab, setTab] = useState<"stats" | "reports">("stats")

  return (
    <div>
      <div className="flex gap-1 mb-6 border-b font-cuerpo">
        <button
          onClick={() => setTab("stats")}
          className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 transition-colors ${
            tab === "stats"
              ? "border-[#0B1631] text-[#0B1631]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Estadísticas
        </button>
        <button
          onClick={() => setTab("reports")}
          className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 transition-colors ${
            tab === "reports"
              ? "border-[#0B1631] text-[#0B1631]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Informes
        </button>
      </div>

      {tab === "stats" && <CollaboratorStats />}
      {tab === "reports" && <ReportsTab />}
    </div>
  )
}
