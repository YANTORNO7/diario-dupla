import { NextRequest, NextResponse } from "next/server"
import { requireAuthAPI } from "@/lib/auth-guard"
import { GoogleGenerativeAI } from "@google/generative-ai"

function buildPrompt(body: Record<string, unknown>): string {
  const type = (body.type as string) || "result"
  const context = body.context as string | undefined
  const contextBlock = context ? `\nCONTEXTO ADICIONAL DEL USUARIO:\n${context}` : ""

  const rules = `REGLAS:
- Escribí en español rioplatense (usá "vos", "che", etc. si queda natural, pero no fuerces)
- Incluí emojis relevantes (⚽🔥💪 etc.)
- La última línea SIEMPRE tiene que ser: @diariodupla
- NO uses comillas alrededor del texto
- Sé creativo y variado, no siempre uses la misma estructura`

  if (type === "preview") {
    const m = body.matchData as Record<string, unknown>
    return `Sos un community manager de un medio deportivo de fútbol argentino y brasileño llamado "Diario Dupla" (@diariodupla en Instagram).

Generá un caption para Instagram sobre la PREVIA de este partido. Tiene que ser en español rioplatense, enganchante, generando expectativa. Máximo 3-4 oraciones cortas.

DATOS DEL PARTIDO:
- Local: ${m.homeTeam}
- Visitante: ${m.awayTeam}
- Competencia: ${m.competition}
- Instancia: ${m.round}
- Fecha: ${m.matchDate}
- Horario: ${m.matchTime}
${m.stadium ? `- Estadio: ${m.stadium}` : ""}
${contextBlock}

${rules}
- Al final poné hashtags relevantes: #futbol #${String(m.homeTeam || "equipo").replace(/\s/g, "")} #${String(m.awayTeam || "equipo").replace(/\s/g, "")} y otros que apliquen`
  }

  if (type === "transfer") {
    const t = body.transferData as Record<string, unknown>
    const typeLabel = t.transferType === "COMPRA" ? "compra" : t.transferType === "PRESTAMO" ? "préstamo" : "agente libre"
    return `Sos un community manager de un medio deportivo de fútbol argentino y brasileño llamado "Diario Dupla" (@diariodupla en Instagram).

Generá un caption para Instagram sobre este FICHAJE. Tiene que ser en español rioplatense, enganchante, con emoción por el refuerzo. Máximo 3-4 oraciones cortas.

DATOS DEL FICHAJE:
- Jugador: ${t.playerName}
- Tipo: ${typeLabel}
${t.fromClub ? `- Club de origen: ${t.fromClub}` : ""}
${t.toClub ? `- Club de destino: ${t.toClub}` : ""}
${t.details ? `- Detalles: ${t.details}` : ""}
${contextBlock}

${rules}
- Al final poné hashtags relevantes: #fichaje #futbol #${String(t.toClub || "equipo").replace(/\s/g, "")} y otros que apliquen`
  }

  // Default: result
  const m = body.matchData as Record<string, unknown>
  return `Sos un community manager de un medio deportivo de fútbol argentino y brasileño llamado "Diario Dupla" (@diariodupla en Instagram).

Generá un caption para Instagram sobre este resultado de partido. Tiene que ser en español rioplatense, enganchante, con emoción futbolera. Máximo 3-4 oraciones cortas.

DATOS DEL PARTIDO:
- Local: ${m.homeTeam} (${m.homeScore} goles)
- Visitante: ${m.awayTeam} (${m.awayScore} goles)
- Competencia: ${m.competition}
- Instancia: ${m.round}
- Fecha: ${m.matchDate}
${contextBlock}

${rules}
- Al final poné hashtags relevantes: #futbol #${String(m.homeTeam || "equipo").replace(/\s/g, "")} #${String(m.awayTeam || "equipo").replace(/\s/g, "")} y otros que apliquen`
}

export async function POST(request: NextRequest) {
  const session = await requireAuthAPI()
  if (session instanceof NextResponse) return session

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: "API key de Gemini no configurada" },
      { status: 500 }
    )
  }

  const body = await request.json()
  const prompt = buildPrompt(body)

  const models = ["gemini-3.5-flash", "gemini-3.8-flash", "gemini-2.5-flash"]
  const genAI = new GoogleGenerativeAI(apiKey)

  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName })
      const result = await model.generateContent(prompt)
      const caption = result.response.text().trim()
      return NextResponse.json({ caption })
    } catch (err) {
      console.error(`[generate-caption] ${modelName} failed:`, err)
      continue
    }
  }

  return NextResponse.json(
    { error: "Error al generar el caption. Intentá de nuevo en unos segundos." },
    { status: 500 }
  )
}
