"use client"

import type { ResultData } from "@/app/admin/placas/page"

type Props = {
  data: ResultData
  league: string
}

function formatDate(dateStr: string) {
  if (!dateStr) return ""
  const d = new Date(dateStr + "T12:00:00")
  return d.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function autoFontSize(text: string, maxWidth: number): number {
  const baseSize = 52
  const charWidth = baseSize * 0.55
  const totalWidth = text.length * charWidth
  if (totalWidth <= maxWidth) return baseSize
  return Math.max(28, Math.floor((maxWidth / totalWidth) * baseSize))
}

function TeamRow({
  club,
  score,
  isWinner,
  isDraw,
  scorers,
}: {
  club: { initials: string; shortName: string; primaryColor: string; crestUrl: string | null }
  score: number
  isWinner: boolean
  isDraw: boolean
  scorers: string
}) {
  const bgName = isWinner ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)"
  const scoreBg = isWinner ? "#FFDF00" : isDraw ? "#444" : "#333"
  const scoreColor = isWinner ? "#111" : "#999"
  const nameColor = isWinner ? "#FFF" : "#777"
  const fontSize = autoFontSize(club.shortName, 500)

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 20, height: 100 }}>
        {/* Color circle with initials or crest */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            backgroundColor: club.primaryColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {club.crestUrl ? (
            <img
              src={club.crestUrl}
              alt=""
              style={{ width: 52, height: 52, objectFit: "contain" }}
            />
          ) : (
            <span
              style={{
                fontFamily: "var(--font-anton), Anton, sans-serif",
                fontSize: 24,
                color: "#FFF",
                letterSpacing: 1,
              }}
            >
              {club.initials}
            </span>
          )}
        </div>

        {/* Team name */}
        <div
          style={{
            flex: 1,
            padding: "0 20px",
            borderRadius: 12,
            backgroundColor: bgName,
            height: 80,
            display: "flex",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-anton), Anton, sans-serif",
              fontSize,
              color: nameColor,
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {club.shortName}
          </span>
        </div>

        {/* Score box */}
        <div
          style={{
            width: 100,
            height: 80,
            borderRadius: 12,
            backgroundColor: scoreBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-anton), Anton, sans-serif",
              fontSize: 56,
              color: scoreColor,
              lineHeight: 1,
            }}
          >
            {score}
          </span>
        </div>
      </div>

      {/* Scorers */}
      {scorers && (
        <div style={{ paddingLeft: 92, marginTop: 8 }}>
          {scorers.split("\n").map((line, i) => (
            <p
              key={i}
              style={{
                fontFamily: "var(--font-archivo), Archivo, sans-serif",
                fontSize: 22,
                color: "#888",
                lineHeight: 1.5,
              }}
            >
              {line}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ResultCard({ data, league }: Props) {
  const accentColor = league === "BRASIL" ? "#009C3B" : "#75AADB"
  const isDraw = data.homeScore === data.awayScore
  const homeWins = data.homeScore > data.awayScore
  const awayWins = data.awayScore > data.homeScore

  const homePlaceholder = {
    initials: "LOC",
    shortName: "LOCAL",
    primaryColor: "#555",
    crestUrl: null,
  }
  const awayPlaceholder = {
    initials: "VIS",
    shortName: "VISITANTE",
    primaryColor: "#555",
    crestUrl: null,
  }

  const home = data.homeClub || homePlaceholder
  const away = data.awayClub || awayPlaceholder

  return (
    <div
      style={{
        width: 1080,
        height: 1350,
        backgroundColor: "#111111",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          padding: "50px 60px 0",
        }}
      >
        {/* DUPLA logo inverted */}
        <div
          style={{
            backgroundColor: "#FFF",
            padding: "8px 16px",
            borderRadius: 6,
            transform: "skewX(-6deg)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-anton), Anton, sans-serif",
              fontSize: 32,
              color: "#111",
              letterSpacing: 2,
            }}
          >
            DUPLA
          </span>
        </div>

        {/* Competition & date */}
        <div style={{ textAlign: "right" }}>
          <p
            style={{
              fontFamily: "var(--font-archivo), Archivo, sans-serif",
              fontSize: 22,
              color: "#888",
              textTransform: "uppercase",
              letterSpacing: 2,
            }}
          >
            {data.competition}
          </p>
          <p
            style={{
              fontFamily: "var(--font-archivo), Archivo, sans-serif",
              fontSize: 20,
              color: "#666",
            }}
          >
            {formatDate(data.matchDate)}
          </p>
        </div>
      </div>

      {/* FINAL label */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          paddingTop: 80,
          paddingBottom: 50,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-anton), Anton, sans-serif",
            fontSize: 72,
            color: "#FFDF00",
            letterSpacing: 8,
            textTransform: "uppercase",
          }}
        >
          FINAL
        </span>
      </div>

      {/* Scoreboard */}
      <div style={{ padding: "0 60px", flex: 1 }}>
        <TeamRow
          club={home}
          score={data.homeScore}
          isWinner={homeWins}
          isDraw={isDraw}
          scorers={data.homeScorers}
        />

        <div style={{ height: 30 }} />

        <TeamRow
          club={away}
          score={data.awayScore}
          isWinner={awayWins}
          isDraw={isDraw}
          scorers={data.awayScorers}
        />
      </div>

      {/* Footer */}
      <div style={{ padding: "0 60px 50px" }}>
        <p
          style={{
            fontFamily: "var(--font-archivo), Archivo, sans-serif",
            fontSize: 24,
            color: "#666",
            textAlign: "center",
            marginBottom: 20,
          }}
        >
          @diariodupla.ar
        </p>
        {/* Color stripe */}
        <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden" }}>
          {league === "ARGENTINA" ? (
            <>
              <div style={{ flex: 1, backgroundColor: "#75AADB" }} />
              <div style={{ flex: 1, backgroundColor: "#FFFFFF" }} />
              <div style={{ flex: 1, backgroundColor: "#75AADB" }} />
            </>
          ) : (
            <>
              <div style={{ flex: 1, backgroundColor: "#009C3B" }} />
              <div style={{ flex: 1, backgroundColor: "#FFDF00" }} />
              <div style={{ flex: 1, backgroundColor: "#009C3B" }} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
