import { prisma } from "./prisma"

// ART = UTC-3 (sin DST)
const ART_OFFSET_MS = 3 * 60 * 60 * 1000

export type ReportRow = {
  authorId: string
  authorName: string
  periodCount: number
  monthCount?: number  // solo informe semanal: acumulado del mes
  weeklyAvg?: number   // solo informe mensual: promedio semanal
  portadas: number
}

export type ReportData = {
  type: "weekly" | "monthly"
  title: string
  periodStart: Date
  periodEnd: Date
  totalNotes: number
  activeCollaborators: number
  totalPortadas: number
  rows: ReportRow[]
}

const MONTHS_ES = [
  "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
  "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
]

function pad2(n: number) { return String(n).padStart(2, "0") }

// Convierte fecha UTC a "fecha en ART" (resta 3h)
function utcToARTDate(utc: Date) {
  return new Date(utc.getTime() - ART_OFFSET_MS)
}

// Inicio de un día en ART expresado como UTC
function artDayStartUTC(year: number, month: number, day: number): Date {
  // ART 00:00 = UTC 03:00
  return new Date(Date.UTC(year, month - 1, day, 3, 0, 0, 0))
}

// Fin de un día en ART (23:59:59.999) expresado como UTC
function artDayEndUTC(year: number, month: number, day: number): Date {
  // ART 23:59:59.999 = UTC 02:59:59.999 del día siguiente
  return new Date(Date.UTC(year, month - 1, day + 1, 2, 59, 59, 999))
}

// Retorna { start, end } en UTC para la semana Mon→Sun en ART
// monday: Date del lunes deseado (cualquier hora)
export function getWeekBounds(monday: Date): { start: Date; end: Date } {
  const art = utcToARTDate(monday)
  const y = art.getUTCFullYear()
  const m = art.getUTCMonth() + 1
  const d = art.getUTCDate()
  return {
    start: artDayStartUTC(y, m, d),
    end: artDayEndUTC(y, m, d + 6),
  }
}

// Retorna { start, end } en UTC para el mes calendario en ART
export function getMonthBounds(year: number, month: number): { start: Date; end: Date } {
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate()
  return {
    start: artDayStartUTC(year, month, 1),
    end: artDayEndUTC(year, month, lastDay),
  }
}

// Lunes de la semana anterior (relativo a "now", en ART)
export function getPreviousMondayUTC(now = new Date()): Date {
  const art = utcToARTDate(now)
  const dow = art.getUTCDay() // 0=dom, 1=lun, ...
  const daysBack = dow === 0 ? 6 : dow - 1  // días hasta el lunes de esta semana
  const thisMonday = new Date(art)
  thisMonday.setUTCDate(art.getUTCDate() - daysBack)
  const lastMonday = new Date(thisMonday)
  lastMonday.setUTCDate(thisMonday.getUTCDate() - 7)
  // Devolver en UTC (volver a sumar ART offset)
  return new Date(lastMonday.getTime() + ART_OFFSET_MS)
}

// Mes anterior: retorna { year, month }
export function getPreviousMonth(now = new Date()): { year: number; month: number } {
  const art = utcToARTDate(now)
  let y = art.getUTCFullYear()
  let m = art.getUTCMonth() + 1
  m -= 1
  if (m === 0) { m = 12; y -= 1 }
  return { year: y, month: m }
}

function generateTitle(type: "weekly" | "monthly", start: Date, end: Date): string {
  if (type === "weekly") {
    const s = utcToARTDate(start)
    const e = utcToARTDate(end)
    const monthName = MONTHS_ES[e.getUTCMonth()]
    const year = e.getUTCFullYear()
    return `SEMANA DEL ${pad2(s.getUTCDate())}/${pad2(s.getUTCMonth() + 1)} AL ${pad2(e.getUTCDate())}/${pad2(e.getUTCMonth() + 1)} · ${monthName} ${year}`
  } else {
    const s = utcToARTDate(start)
    return `INFORME MENSUAL · ${MONTHS_ES[s.getUTCMonth()]} ${s.getUTCFullYear()}`
  }
}

export async function computeReportData(
  type: "weekly" | "monthly",
  periodStart: Date,
  periodEnd: Date
): Promise<ReportData> {
  const articles = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      publishedAt: { gte: periodStart, lte: periodEnd },
    },
    select: {
      authorId: true,
      featured: true,
      publishedAt: true,
      author: { select: { id: true, name: true } },
    },
  })

  // Para semanal: también necesitamos el acumulado del mes calendario
  let monthArticles: typeof articles = []
  if (type === "weekly") {
    const artEnd = utcToARTDate(periodEnd)
    const monthStart = artDayStartUTC(artEnd.getUTCFullYear(), artEnd.getUTCMonth() + 1, 1)
    monthArticles = await prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        publishedAt: { gte: monthStart, lte: periodEnd },
      },
      select: {
        authorId: true,
        featured: true,
        publishedAt: true,
        author: { select: { id: true, name: true } },
      },
    })
  }

  const authorsMap: Record<string, string> = {}
  const periodMap: Record<string, number> = {}
  const portadasMap: Record<string, number> = {}
  const monthMap: Record<string, number> = {}

  for (const a of articles) {
    authorsMap[a.authorId] = a.author.name
    periodMap[a.authorId] = (periodMap[a.authorId] || 0) + 1
    if (a.featured) portadasMap[a.authorId] = (portadasMap[a.authorId] || 0) + 1
  }

  for (const a of monthArticles) {
    authorsMap[a.authorId] = a.author.name
    monthMap[a.authorId] = (monthMap[a.authorId] || 0) + 1
  }

  const durationDays = (periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)
  const weeks = durationDays / 7

  const rows: ReportRow[] = Object.keys(periodMap)
    .filter(id => periodMap[id] > 0)
    .map(id => ({
      authorId: id,
      authorName: authorsMap[id],
      periodCount: periodMap[id] || 0,
      monthCount: type === "weekly" ? (monthMap[id] || 0) : undefined,
      weeklyAvg: type === "monthly"
        ? Math.round((periodMap[id] || 0) / weeks * 10) / 10
        : undefined,
      portadas: portadasMap[id] || 0,
    }))
    .sort((a, b) => b.periodCount - a.periodCount)

  const totalNotes = rows.reduce((s, r) => s + r.periodCount, 0)
  const activeCollaborators = rows.length
  const totalPortadas = rows.reduce((s, r) => s + r.portadas, 0)
  const title = generateTitle(type, periodStart, periodEnd)

  return {
    type, title, periodStart, periodEnd,
    totalNotes, activeCollaborators, totalPortadas, rows,
  }
}

export function generateReportHTML(data: ReportData): string {
  const { type, title, periodStart, periodEnd, totalNotes, activeCollaborators, totalPortadas, rows } = data
  const maxCount = rows[0]?.periodCount || 1

  const artStart = utcToARTDate(periodStart)
  const artEnd = utcToARTDate(periodEnd)
  const periodLabel = type === "weekly"
    ? `Lunes ${pad2(artStart.getUTCDate())}/${pad2(artStart.getUTCMonth() + 1)}/${artStart.getUTCFullYear()} — Domingo ${pad2(artEnd.getUTCDate())}/${pad2(artEnd.getUTCMonth() + 1)}/${artEnd.getUTCFullYear()}`
    : `${pad2(artStart.getUTCDate())}/${pad2(artStart.getUTCMonth() + 1)}/${artStart.getUTCFullYear()} — ${pad2(artEnd.getUTCDate())}/${pad2(artEnd.getUTCMonth() + 1)}/${artEnd.getUTCFullYear()}`

  const col2Header = type === "weekly" ? "SEMANA" : "MES"
  const col3Header = type === "weekly" ? "MES" : "PROM. SEMANAL"

  const rowsHTML = rows.map(row => {
    const pct = Math.round((row.periodCount / maxCount) * 100)
    const col3Val = type === "weekly"
      ? (row.monthCount ?? 0)
      : (row.weeklyAvg !== undefined ? row.weeklyAvg.toFixed(1) : "—")
    const badge = row.portadas > 0
      ? `<span style="display:inline-block;background:#F2B632;color:#111;font-size:10px;font-weight:700;padding:2px 7px;border-radius:3px;letter-spacing:0.5px;margin-left:8px;white-space:nowrap">${row.portadas} PORTADA${row.portadas > 1 ? "S" : ""}</span>`
      : ""
    return `
      <tr style="border-bottom:1px solid #e9ecef">
        <td style="padding:10px 14px;font-size:13px;white-space:nowrap">
          <span style="font-weight:600">${row.authorName}</span>${badge}
        </td>
        <td style="padding:10px 14px;width:200px">
          <div style="display:flex;align-items:center;gap:8px">
            <div style="flex:1;height:8px;background:#e9ecef;border-radius:4px;overflow:hidden">
              <div style="width:${pct}%;height:100%;background:#0B1631;border-radius:4px"></div>
            </div>
            <span style="font-weight:700;font-size:13px;min-width:20px;text-align:right">${row.periodCount}</span>
          </div>
        </td>
        <td style="padding:10px 14px;text-align:center;font-size:13px;font-weight:600">${col3Val}</td>
      </tr>`
  }).join("")

  const totalRow = `
    <tr style="background:#f1f3f5;font-weight:700">
      <td style="padding:10px 14px;font-size:13px;font-family:'Bebas Neue',cursive;letter-spacing:1px">TOTAL</td>
      <td style="padding:10px 14px;text-align:center;font-size:14px;font-family:'Bebas Neue',cursive">${totalNotes}</td>
      <td style="padding:10px 14px;text-align:center;font-size:13px">—</td>
    </tr>`

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Archivo:wght@400;600;700&display=swap" rel="stylesheet">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { background:#fff; width:800px; font-family:'Archivo',Arial,sans-serif; color:#1a1a1a; }
</style>
</head>
<body>
<!-- HEADER -->
<div style="background:#0B1631;padding:28px 36px 24px">
  <div style="font-family:'Bebas Neue',cursive;font-size:36px;letter-spacing:4px;color:#F2B632">
    DIARIO <span style="color:#fff">DUPLA</span>
  </div>
  <div style="font-family:'Bebas Neue',cursive;font-size:22px;letter-spacing:2px;color:#fff;margin-top:6px">${title}</div>
  <div style="font-size:12px;color:rgba(255,255,255,0.65);margin-top:4px">${periodLabel}</div>
</div>

<!-- CARDS -->
<div style="display:flex;gap:12px;padding:20px 36px;background:#f8f9fa">
  <div style="flex:1;background:#fff;border-radius:8px;padding:18px 14px;border:1px solid #e9ecef;text-align:center">
    <div style="font-family:'Bebas Neue',cursive;font-size:48px;color:#0B1631;line-height:1">${totalNotes}</div>
    <div style="font-size:10px;font-weight:700;color:#6c757d;letter-spacing:1px;text-transform:uppercase;margin-top:4px">Notas en el período</div>
  </div>
  <div style="flex:1;background:#fff;border-radius:8px;padding:18px 14px;border:1px solid #e9ecef;text-align:center">
    <div style="font-family:'Bebas Neue',cursive;font-size:48px;color:#0B1631;line-height:1">${activeCollaborators}</div>
    <div style="font-size:10px;font-weight:700;color:#6c757d;letter-spacing:1px;text-transform:uppercase;margin-top:4px">Colaboradores activos</div>
  </div>
  <div style="flex:1;background:#fff;border-radius:8px;padding:18px 14px;border:1px solid #e9ecef;text-align:center">
    <div style="font-family:'Bebas Neue',cursive;font-size:48px;color:#0B1631;line-height:1">${totalPortadas}</div>
    <div style="font-size:10px;font-weight:700;color:#6c757d;letter-spacing:1px;text-transform:uppercase;margin-top:4px">Portadas principales</div>
  </div>
</div>

<!-- TABLE -->
<div style="padding:4px 36px 28px">
  <table style="width:100%;border-collapse:collapse">
    <thead>
      <tr style="background:#0B1631;color:#fff">
        <th style="padding:10px 14px;text-align:left;font-family:'Bebas Neue',cursive;font-size:14px;letter-spacing:1px">COLABORADOR</th>
        <th style="padding:10px 14px;text-align:left;font-family:'Bebas Neue',cursive;font-size:14px;letter-spacing:1px">${col2Header}</th>
        <th style="padding:10px 14px;text-align:center;font-family:'Bebas Neue',cursive;font-size:14px;letter-spacing:1px">${col3Header}</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHTML}
      ${totalRow}
    </tbody>
  </table>
</div>

<!-- FRANJA -->
<div style="display:flex;height:10px">
  <div style="flex:1;background:#74ACDF"></div>
  <div style="flex:1;background:#FFFFFF;border-top:1px solid #e9ecef;border-bottom:1px solid #e9ecef"></div>
  <div style="flex:1;background:#009C3B"></div>
  <div style="flex:1;background:#F2B632"></div>
</div>

</body>
</html>`
}

export async function saveReport(data: ReportData): Promise<string> {
  const html = generateReportHTML(data)
  const record = await prisma.collaboratorReport.create({
    data: {
      type: data.type,
      title: data.title,
      periodStart: data.periodStart,
      periodEnd: data.periodEnd,
      htmlContent: html,
      data: data as unknown as object,
    },
  })
  return record.id
}

export async function generateAndSaveReport(
  type: "weekly" | "monthly",
  periodStart: Date,
  periodEnd: Date
): Promise<{ id: string; title: string }> {
  const data = await computeReportData(type, periodStart, periodEnd)
  const id = await saveReport(data)
  return { id, title: data.title }
}
