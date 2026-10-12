"use client"

import { type PreviewData, COMPETITIONS, ROUNDS } from "@/app/admin/placas/page"

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

  const stripeColor = league === "BRASIL"
    ? { a: "#009C3B", b: "#FFDF00" }
    : { a: "#75AADB", b: "#FFFFFF" }

  const hasPhoto = !!data.photoUrl

  const competitionLabel = COMPETITIONS.find((c) => c.id === data.competition)?.label || data.competition
  const roundLabel = data.round === "fecha"
    ? `Fecha ${data.matchday}`
    : ROUNDS.find((r) => r.id === data.round)?.label || data.round

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
      {/* Top section: Photo + DUPLA logo overlay */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: hasPhoto ? 480 : 120,
          flexShrink: 0,
        }}
      >
        {/* Photo background */}
        {hasPhoto && (
          <>
            <img
              src={data.photoUrl}
              alt=""
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 30%, transparent 50%, #111111 100%)",
              }}
            />
          </>
        )}

        {/* DUPLA logo - always on top */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 60,
            zIndex: 2,
          }}
        >
          <div
            style={{
              backgroundColor: "#FFF",
              padding: "8px 16px",
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
          {/* Rajitas */}
          <div
            style={{
              display: "flex",
              gap: 3,
              marginTop: 4,
              transform: "skewX(-6deg)",
            }}
          >
            <div style={{ display: "flex", flex: 1, gap: 1 }}>
              <div style={{ flex: 1, height: 5, backgroundColor: stripeColor.a }} />
              <div style={{ flex: 0.5, height: 5, backgroundColor: stripeColor.b }} />
              <div style={{ flex: 1, height: 5, backgroundColor: stripeColor.a }} />
            </div>
          </div>
        </div>
      </div>

      {/* Competition, round & PREVIA label */}
      <div
        style={{
          textAlign: "center",
          paddingTop: hasPhoto ? 20 : 40,
          paddingBottom: 10,
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-archivo), Archivo, sans-serif",
            fontSize: 24,
            color: "#DDD",
            textTransform: "uppercase",
            letterSpacing: 3,
            fontWeight: 700,
          }}
        >
          {competitionLabel}
        </p>
        <p
          style={{
            fontFamily: "var(--font-archivo), Archivo, sans-serif",
            fontSize: 20,
            color: "#AAA",
            marginTop: 6,
          }}
        >
          {roundLabel}
        </p>
      </div>

      {/* PREVIA label */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          paddingTop: 10,
          paddingBottom: 20,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-anton), Anton, sans-serif",
            fontSize: 64,
            color: "#FFDF00",
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
          gap: 30,
          padding: "0 60px",
        }}
      >
        {/* Home team */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              backgroundColor: home.primaryColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            {home.crestUrl ? (
              <img
                src={home.crestUrl}
                alt=""
                style={{ width: 86, height: 86, objectFit: "contain" }}
              />
            ) : (
              <span
                style={{
                  fontFamily: "var(--font-anton), Anton, sans-serif",
                  fontSize: 40,
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
            fontSize: 72,
            color: accentColor,
          }}
        >
          VS
        </span>

        {/* Away team */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              backgroundColor: away.primaryColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            {away.crestUrl ? (
              <img
                src={away.crestUrl}
                alt=""
                style={{ width: 86, height: 86, objectFit: "contain" }}
              />
            ) : (
              <span
                style={{
                  fontFamily: "var(--font-anton), Anton, sans-serif",
                  fontSize: 40,
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
      <div style={{ padding: "0 60px 45px" }}>
        <p
          style={{
            fontFamily: "var(--font-archivo), Archivo, sans-serif",
            fontSize: 24,
            color: "#999",
            textAlign: "center",
            marginBottom: 20,
          }}
        >
          @diariodupla.ar
        </p>
        {/* Color stripe */}
        <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden" }}>
          <div style={{ flex: 1, backgroundColor: stripeColor.a }} />
          <div style={{ flex: 1, backgroundColor: stripeColor.b }} />
          <div style={{ flex: 1, backgroundColor: stripeColor.a }} />
        </div>
      </div>
    </div>
  )
}
