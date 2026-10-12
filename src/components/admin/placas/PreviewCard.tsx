"use client"

import { type PreviewData, COMPETITIONS, ROUNDS } from "@/app/admin/placas/page"

type Props = {
  data: PreviewData
  league: string
  leagues: { home: string; away: string }
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

function autoFontSize(text: string, maxWidth: number, base: number = 48): number {
  const charWidth = base * 0.55
  const totalWidth = text.length * charWidth
  if (totalWidth <= maxWidth) return base
  return Math.max(26, Math.floor((maxWidth / totalWidth) * base))
}

export default function PreviewCard({ data, league, leagues }: Props) {
  const isMixed = leagues.home !== leagues.away
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
          height: hasPhoto ? 520 : 100,
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
                background: "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, transparent 25%, transparent 55%, #111111 100%)",
              }}
            />
          </>
        )}

        {/* DUPLA logo - always on top */}
        <div
          style={{
            position: "absolute",
            top: 36,
            left: 50,
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
                fontSize: 30,
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
            {isMixed ? (
              <div style={{ display: "flex", flex: 1, gap: 1 }}>
                <div style={{ flex: 1, height: 5, backgroundColor: "#75AADB" }} />
                <div style={{ flex: 1, height: 5, backgroundColor: "#FFFFFF" }} />
                <div style={{ flex: 1, height: 5, backgroundColor: "#009C3B" }} />
                <div style={{ flex: 1, height: 5, backgroundColor: "#FFDF00" }} />
              </div>
            ) : (
              <div style={{ display: "flex", flex: 1, gap: 1 }}>
                <div style={{ flex: 1, height: 5, backgroundColor: stripeColor.a }} />
                <div style={{ flex: 0.5, height: 5, backgroundColor: stripeColor.b }} />
                <div style={{ flex: 1, height: 5, backgroundColor: stripeColor.a }} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Competition + round + PREVIA — all tight together */}
      <div
        style={{
          textAlign: "center",
          paddingTop: hasPhoto ? 12 : 30,
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-archivo), Archivo, sans-serif",
            fontSize: 26,
            color: "#FFF",
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
            fontSize: 22,
            color: "#CCC",
            marginTop: 4,
          }}
        >
          {roundLabel}
        </p>
        <p
          style={{
            fontFamily: "var(--font-anton), Anton, sans-serif",
            fontSize: 60,
            color: "#FFDF00",
            letterSpacing: 8,
            marginTop: 8,
          }}
        >
          PREVIA
        </p>
      </div>

      {/* Teams — horizontal, bigger crests */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 50,
          padding: "0 50px",
        }}
      >
        {/* Home team */}
        <div style={{ textAlign: "center", flex: 1 }}>
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: "50%",
              backgroundColor: home.primaryColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
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
                  fontSize: 46,
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
              fontSize: autoFontSize(home.shortName, 400, 44),
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
            fontSize: 76,
            color: accentColor,
            flexShrink: 0,
          }}
        >
          VS
        </span>

        {/* Away team */}
        <div style={{ textAlign: "center", flex: 1 }}>
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: "50%",
              backgroundColor: away.primaryColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
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
                  fontSize: 46,
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
              fontSize: autoFontSize(away.shortName, 400, 44),
              color: "#FFF",
              textTransform: "uppercase",
            }}
          >
            {away.shortName}
          </span>
        </div>
      </div>

      {/* Match info — date, time, stadium */}
      <div style={{ textAlign: "center", padding: "0 60px 12px" }}>
        <p
          style={{
            fontFamily: "var(--font-archivo), Archivo, sans-serif",
            fontSize: 26,
            color: "#FFF",
            textTransform: "capitalize",
          }}
        >
          {formatDate(data.matchDate)}
        </p>
        <p
          style={{
            fontFamily: "var(--font-anton), Anton, sans-serif",
            fontSize: 60,
            color: "#FFDF00",
            marginTop: 2,
          }}
        >
          {data.matchTime} HS
        </p>
        {data.stadium && (
          <p
            style={{
              fontFamily: "var(--font-archivo), Archivo, sans-serif",
              fontSize: 28,
              color: "#FFF",
              marginTop: 6,
              fontWeight: 600,
            }}
          >
            {data.stadium}
          </p>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: "0 60px 40px" }}>
        <p
          style={{
            fontFamily: "var(--font-archivo), Archivo, sans-serif",
            fontSize: 22,
            color: "#999",
            textAlign: "center",
            marginBottom: 14,
          }}
        >
          @diariodupla.ar
        </p>
        {/* Color stripe */}
        <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden" }}>
          {isMixed ? (
            <>
              <div style={{ flex: 1, backgroundColor: "#75AADB" }} />
              <div style={{ flex: 1, backgroundColor: "#FFFFFF" }} />
              <div style={{ flex: 1, backgroundColor: "#009C3B" }} />
              <div style={{ flex: 1, backgroundColor: "#FFDF00" }} />
            </>
          ) : (
            <>
              <div style={{ flex: 1, backgroundColor: stripeColor.a }} />
              <div style={{ flex: 1, backgroundColor: stripeColor.b }} />
              <div style={{ flex: 1, backgroundColor: stripeColor.a }} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
