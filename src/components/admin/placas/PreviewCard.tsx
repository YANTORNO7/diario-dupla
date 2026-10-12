"use client"

import type { PreviewData } from "@/app/admin/placas/page"

type Props = {
  data: PreviewData
  league: string
}

function formatDate(dateStr: string) {
  if (!dateStr) return ""
  const d = new Date(dateStr + "T12:00:00")
  return d.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
}

function autoFontSize(text: string, maxWidth: number): number {
  const baseSize = 56
  const charWidth = baseSize * 0.55
  const totalWidth = text.length * charWidth
  if (totalWidth <= maxWidth) return baseSize
  return Math.max(30, Math.floor((maxWidth / totalWidth) * baseSize))
}

export default function PreviewCard({ data, league }: Props) {
  const accentColor = league === "BRASIL" ? "#009C3B" : "#75AADB"

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
        </div>
      </div>

      {/* PREVIA label */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          paddingTop: 60,
          paddingBottom: 20,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-anton), Anton, sans-serif",
            fontSize: 48,
            color: accentColor,
            letterSpacing: 8,
            textTransform: "uppercase",
          }}
        >
          PREVIA
        </span>
      </div>

      {/* Teams */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 40,
          padding: "0 60px",
        }}
      >
        {/* Home team */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: "50%",
              backgroundColor: home.primaryColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            {home.crestUrl ? (
              <img
                src={home.crestUrl}
                alt=""
                style={{ width: 100, height: 100, objectFit: "contain" }}
              />
            ) : (
              <span
                style={{
                  fontFamily: "var(--font-anton), Anton, sans-serif",
                  fontSize: 48,
                  color: "#FFF",
                }}
              >
                {home.initials}
              </span>
            )}
          </div>
          <span
            style={{
              fontFamily: "var(--font-anton), Anton, sans-serif",
              fontSize: autoFontSize(home.shortName, 800),
              color: "#FFF",
              textTransform: "uppercase",
            }}
          >
            {home.shortName}
          </span>
        </div>

        {/* VS */}
        <span
          style={{
            fontFamily: "var(--font-anton), Anton, sans-serif",
            fontSize: 80,
            color: accentColor,
          }}
        >
          VS
        </span>

        {/* Away team */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: "50%",
              backgroundColor: away.primaryColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            {away.crestUrl ? (
              <img
                src={away.crestUrl}
                alt=""
                style={{ width: 100, height: 100, objectFit: "contain" }}
              />
            ) : (
              <span
                style={{
                  fontFamily: "var(--font-anton), Anton, sans-serif",
                  fontSize: 48,
                  color: "#FFF",
                }}
              >
                {away.initials}
              </span>
            )}
          </div>
          <span
            style={{
              fontFamily: "var(--font-anton), Anton, sans-serif",
              fontSize: autoFontSize(away.shortName, 800),
              color: "#FFF",
              textTransform: "uppercase",
            }}
          >
            {away.shortName}
          </span>
        </div>
      </div>

      {/* Match info */}
      <div style={{ textAlign: "center", padding: "0 60px 20px" }}>
        <p
          style={{
            fontFamily: "var(--font-archivo), Archivo, sans-serif",
            fontSize: 28,
            color: "#CCC",
            textTransform: "capitalize",
          }}
        >
          {formatDate(data.matchDate)}
        </p>
        <p
          style={{
            fontFamily: "var(--font-anton), Anton, sans-serif",
            fontSize: 64,
            color: "#FFF",
            marginTop: 4,
          }}
        >
          {data.matchTime} HS
        </p>
        {data.stadium && (
          <p
            style={{
              fontFamily: "var(--font-archivo), Archivo, sans-serif",
              fontSize: 24,
              color: "#888",
              marginTop: 4,
            }}
          >
            {data.stadium}
          </p>
        )}
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
