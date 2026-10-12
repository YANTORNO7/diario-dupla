"use client"

import type { TransferData } from "@/app/admin/placas/page"

type Props = {
  data: TransferData
  league: string
}

function autoFontSize(text: string, maxWidth: number, base: number = 64): number {
  const charWidth = base * 0.55
  const totalWidth = text.length * charWidth
  if (totalWidth <= maxWidth) return base
  return Math.max(28, Math.floor((maxWidth / totalWidth) * base))
}

export default function TransferCard({ data, league }: Props) {
  const accentColor = league === "BRASIL" ? "#009C3B" : "#75AADB"

  const transferLabel =
    data.transferType === "COMPRA"
      ? "NUEVO REFUERZO"
      : data.transferType === "PRESTAMO"
        ? "PRÉSTAMO"
        : "AGENTE LIBRE"

  const fromClub = data.fromClub
  const toClub = data.toClub

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
            MERCADO DE PASES
          </p>
        </div>
      </div>

      {/* Transfer type label */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          paddingTop: 80,
          paddingBottom: 30,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-anton), Anton, sans-serif",
            fontSize: 52,
            color: accentColor,
            letterSpacing: 6,
            textTransform: "uppercase",
          }}
        >
          {transferLabel}
        </span>
      </div>

      {/* Player name */}
      <div style={{ textAlign: "center", padding: "0 60px 40px" }}>
        <span
          style={{
            fontFamily: "var(--font-anton), Anton, sans-serif",
            fontSize: autoFontSize(data.playerName || "JUGADOR", 900, 88),
            color: "#FFF",
            textTransform: "uppercase",
            lineHeight: 1.1,
          }}
        >
          {data.playerName || "JUGADOR"}
        </span>
      </div>

      {/* Clubs flow */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 60,
          padding: "0 60px",
        }}
      >
        {/* From club */}
        {fromClub ? (
          <div style={{ textAlign: "center", opacity: 0.5 }}>
            <div
              style={{
                width: 140,
                height: 140,
                borderRadius: "50%",
                backgroundColor: fromClub.primaryColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              {fromClub.crestUrl ? (
                <img
                  src={fromClub.crestUrl}
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
                  {fromClub.initials}
                </span>
              )}
            </div>
            <span
              style={{
                fontFamily: "var(--font-anton), Anton, sans-serif",
                fontSize: autoFontSize(fromClub.shortName, 280, 28),
                color: "#888",
                textTransform: "uppercase",
              }}
            >
              {fromClub.shortName}
            </span>
          </div>
        ) : (
          <div style={{ width: 140 }} />
        )}

        {/* Arrow */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <svg
            width="100"
            height="60"
            viewBox="0 0 100 60"
            fill="none"
          >
            <path
              d="M0 30 H80 M60 10 L80 30 L60 50"
              stroke={accentColor}
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* To club */}
        {toClub ? (
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 180,
                height: 180,
                borderRadius: "50%",
                backgroundColor: toClub.primaryColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                border: `4px solid ${accentColor}`,
              }}
            >
              {toClub.crestUrl ? (
                <img
                  src={toClub.crestUrl}
                  alt=""
                  style={{ width: 130, height: 130, objectFit: "contain" }}
                />
              ) : (
                <span
                  style={{
                    fontFamily: "var(--font-anton), Anton, sans-serif",
                    fontSize: 60,
                    color: "#FFF",
                  }}
                >
                  {toClub.initials}
                </span>
              )}
            </div>
            <span
              style={{
                fontFamily: "var(--font-anton), Anton, sans-serif",
                fontSize: autoFontSize(toClub.shortName, 320, 36),
                color: "#FFF",
                textTransform: "uppercase",
              }}
            >
              {toClub.shortName}
            </span>
          </div>
        ) : (
          <div
            style={{
              width: 180,
              height: 180,
              borderRadius: "50%",
              backgroundColor: "#333",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `4px solid ${accentColor}`,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-anton), Anton, sans-serif",
                fontSize: 28,
                color: "#666",
              }}
            >
              ?
            </span>
          </div>
        )}
      </div>

      {/* Details */}
      {data.details && (
        <div style={{ textAlign: "center", padding: "0 60px 30px" }}>
          <p
            style={{
              fontFamily: "var(--font-archivo), Archivo, sans-serif",
              fontSize: 26,
              color: "#AAA",
            }}
          >
            {data.details}
          </p>
        </div>
      )}

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
