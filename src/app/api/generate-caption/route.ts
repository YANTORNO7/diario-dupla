import { NextRequest, NextResponse } from "next/server"
import { requireAuthAPI } from "@/lib/auth-guard"
import { GoogleGenerativeAI } from "@google/generative-ai"

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

  const { matchData, context } = await request.json()

  const prompt = `Sos un community manager de un medio deportivo de fútbol argentino y brasileño llamado "Diario Dupla" (@diariodupla.ar en Instagram).

Generá un caption para Instagram sobre este resultado de partido. Tiene que ser en español rioplatense, enganchante, con emoción futbolera. Máximo 3-4 oraciones cortas.

DATOS DEL PARTIDO:
- Local: ${matchData.homeTeam} (${matchData.homeScore} goles)
- Visitante: ${matchData.awayTeam} (${matchData.awayScore} goles)
- Competencia: ${matchData.competition}
- Instancia: ${matchData.round}
- Fecha: ${matchData.matchDate}
${context ? `\nCONTEXTO ADICIONAL DEL USUARIO:\n${context}` : ""}

REGLAS:
- Escribí en español rioplatense (usá "vos", "che", etc. si queda natural, pero no fuerces)
- Incluí emojis relevantes (⚽🔥💪 etc.)
- Al final poné hashtags relevantes: #futbol #${matchData.homeTeam?.replace(/\s/g, "") || "equipo"} #${matchData.awayTeam?.replace(/\s/g, "") || "equipo"} y otros que apliquen
- La última línea SIEMPRE tiene que ser: @diariodupla.ar
- NO uses comillas alrededor del texto
- Sé creativo y variado, no siempre uses la misma estructura`

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-3.8-flash" })

    const result = await model.generateContent(prompt)
    const caption = result.response.text().trim()

    return NextResponse.json({ caption })
  } catch (err) {
    console.error("[generate-caption] Error:", err)
    return NextResponse.json(
      { error: "Error al generar el caption" },
      { status: 500 }
    )
  }
}
