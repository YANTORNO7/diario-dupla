import { prisma } from "./prisma"
import fs from "fs"
import path from "path"

async function getFontCSS(): Promise<string> {
  try {
    const res = await fetch("https://diariodupla.com/api/font-embed")
    if (!res.ok) return ""
    return await res.text()
  } catch {
    return ""
  }
}

function getPublicImageBase64(filename: string): string {
  try {
    const buf = fs.readFileSync(path.join(process.cwd(), "public", filename))
    return `data:image/png;base64,${buf.toString("base64")}`
  } catch {
    return ""
  }
}

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
  adminCount: number
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

// Retorna { start, end } en UTC para el ciclo mensual (día 10 → día 9 del mes siguiente) en ART
export function getMonthBounds(year: number, month: number): { start: Date; end: Date } {
  return {
    start: artDayStartUTC(year, month, 10),
    end: artDayEndUTC(year, month + 1, 9),
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

// Número de semana dentro del ciclo mensual (el ciclo empieza el día 10 de cada mes).
// Semana 1 = primer lunes desde el día 10; semana 2 = siguiente lunes, etc.
function getWeekNumberInCycle(artMonday: Date): number {
  const day = artMonday.getUTCDate()
  let month = artMonday.getUTCMonth() + 1
  let year = artMonday.getUTCFullYear()

  // Determinar qué ciclo contiene este lunes
  if (day < 10) {
    month -= 1
    if (month === 0) { month = 12; year -= 1 }
  }

  // Inicio del ciclo: día 10 del mes del ciclo
  const cycleStart = new Date(Date.UTC(year, month - 1, 10))

  // Primer lunes en o después del inicio del ciclo
  const dow = cycleStart.getUTCDay() // 0=dom … 6=sáb
  const daysToMonday = dow === 1 ? 0 : dow === 0 ? 1 : 8 - dow
  const firstMonday = new Date(cycleStart.getTime() + daysToMonday * 24 * 60 * 60 * 1000)

  const diff = artMonday.getTime() - firstMonday.getTime()
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1
}

function generateTitle(type: "weekly" | "monthly", start: Date, end: Date): string {
  if (type === "weekly") {
    const s = utcToARTDate(start)
    const e = utcToARTDate(end)
    const weekNum = getWeekNumberInCycle(s)
    // Mes del ciclo: si el lunes está antes del 10, pertenece al ciclo del mes anterior
    const cycleMonthIdx = s.getUTCDate() < 10 ? (s.getUTCMonth() === 0 ? 11 : s.getUTCMonth() - 1) : s.getUTCMonth()
    const cycleYear = s.getUTCDate() < 10 && s.getUTCMonth() === 0 ? s.getUTCFullYear() - 1 : s.getUTCFullYear()
    const monthName = MONTHS_ES[cycleMonthIdx]
    // El período va de lunes a lunes: mostrar el lunes siguiente al domingo de cierre
    const nextMonday = new Date(Date.UTC(e.getUTCFullYear(), e.getUTCMonth(), e.getUTCDate() + 1))
    return `SEMANA ${weekNum} · DEL ${pad2(s.getUTCDate())}/${pad2(s.getUTCMonth() + 1)} AL ${pad2(nextMonday.getUTCDate())}/${pad2(nextMonday.getUTCMonth() + 1)} · ${monthName} ${cycleYear}`
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
      createdAt: { gte: periodStart, lte: periodEnd },
      author: { role: "EDITOR" },
    },
    select: {
      authorId: true,
      featured: true,
      createdAt: true,
      author: { select: { id: true, name: true } },
    },
  })

  // Para semanal: acumulado del ciclo mensual (desde el día 10 del ciclo hasta fin del período)
  let monthArticles: typeof articles = []
  if (type === "weekly") {
    const artStart = utcToARTDate(periodStart)
    const artDay = artStart.getUTCDate()
    let cycleMonth = artStart.getUTCMonth() + 1
    let cycleYear = artStart.getUTCFullYear()
    if (artDay < 10) {
      cycleMonth -= 1
      if (cycleMonth === 0) { cycleMonth = 12; cycleYear -= 1 }
    }
    const cycleStart = artDayStartUTC(cycleYear, cycleMonth, 10)
    monthArticles = await prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        createdAt: { gte: cycleStart, lte: periodEnd },
        author: { role: "EDITOR" },
      },
      select: {
        authorId: true,
        featured: true,
        createdAt: true,
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

  // Notas del staff (ADMIN) en el período
  const adminCount = await prisma.article.count({
    where: {
      status: "PUBLISHED",
      createdAt: { gte: periodStart, lte: periodEnd },
      author: { role: "ADMIN" },
    },
  })

  return {
    type, title, periodStart, periodEnd,
    totalNotes, activeCollaborators, totalPortadas, adminCount, rows,
  }
}

export function generateReportHTML(
  data: ReportData,
  fontCSS = "",
  logoSrc = "https://diariodupla.com/icon.png",
  firmaSrc = "https://diariodupla.com/firma-bart-yantorno.png"
): string {
  const { type, title, periodStart, periodEnd, totalNotes, activeCollaborators, totalPortadas, adminCount, rows } = data
  const maxCount = rows[0]?.periodCount || 1

  const artStart = utcToARTDate(periodStart)
  const artEnd = utcToARTDate(periodEnd)
  const nextMondayART = new Date(Date.UTC(artEnd.getUTCFullYear(), artEnd.getUTCMonth(), artEnd.getUTCDate() + 1))
  const periodLabel = type === "weekly"
    ? `Lunes ${pad2(artStart.getUTCDate())}/${pad2(artStart.getUTCMonth() + 1)}/${artStart.getUTCFullYear()} — Lunes ${pad2(nextMondayART.getUTCDate())}/${pad2(nextMondayART.getUTCMonth() + 1)}/${nextMondayART.getUTCFullYear()}`
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
      <td style="padding:10px 14px;width:200px">
        <div style="display:flex;align-items:center;gap:8px">
          <div style="flex:1"></div>
          <span style="font-weight:700;font-size:14px;font-family:'Bebas Neue',cursive;min-width:20px;text-align:right">${totalNotes}</span>
        </div>
      </td>
      <td style="padding:10px 14px;text-align:center;font-size:13px">—</td>
    </tr>`

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
${fontCSS}
* { margin:0; padding:0; box-sizing:border-box; }
body { background:#fff; width:800px; font-family:'Archivo',Arial,sans-serif; color:#1a1a1a; }
</style>
</head>
<body>
<!-- HEADER -->
<div style="background:${type === 'monthly' ? '#0D3321' : '#0B1631'};padding:24px 36px 22px;display:flex;align-items:center;justify-content:space-between">
  <div>
    <div style="font-family:'Bebas Neue',cursive;font-size:36px;letter-spacing:4px;color:#F2B632">
      DIARIO <span style="color:#fff">DUPLA</span>
    </div>
    <div style="font-family:'Bebas Neue',cursive;font-size:22px;letter-spacing:2px;color:#fff;margin-top:6px">${title}</div>
    <div style="font-size:12px;color:rgba(255,255,255,0.65);margin-top:4px">${periodLabel}</div>
  </div>
  <img src="${logoSrc}" alt="Dupla" style="width:72px;height:72px;object-fit:contain;border-radius:8px;flex-shrink:0" />
</div>

<!-- CARDS -->
<div style="display:flex;gap:12px;padding:20px 36px;background:#f8f9fa">
  <div style="flex:1;background:#fff;border-radius:8px;padding:18px 14px;border:1px solid #e9ecef;text-align:center">
    <div style="font-family:'Bebas Neue',cursive;font-size:48px;color:#0B1631;line-height:1">${totalNotes}</div>
    <div style="font-size:10px;font-weight:700;color:#6c757d;letter-spacing:1px;text-transform:uppercase;margin-top:4px">Total colaboradores</div>
  </div>
  <div style="flex:1;background:#fff;border-radius:8px;padding:18px 14px;border:1px solid #e9ecef;text-align:center">
    <div style="font-family:'Bebas Neue',cursive;font-size:48px;color:#0B1631;line-height:1">${activeCollaborators}</div>
    <div style="font-size:10px;font-weight:700;color:#6c757d;letter-spacing:1px;text-transform:uppercase;margin-top:4px">Colaboradores activos</div>
  </div>
</div>

${adminCount > 0 ? `<!-- NOTA ADMIN -->
<div style="margin:0 36px 4px;padding:8px 14px;background:#f8f9fa;border:1px solid #e9ecef;border-radius:6px;display:flex;align-items:center;gap:10px">
  <span style="font-family:'Bebas Neue',cursive;font-size:13px;letter-spacing:1px;color:#6c757d">ADMIN</span>
  <span style="font-family:'Bebas Neue',cursive;font-size:20px;color:#0B1631">${adminCount}</span>
  <span style="font-size:11px;color:#9ca3af;margin-left:4px">notas en el período</span>
</div>` : ''}

<!-- TABLE -->
<div style="padding:4px 36px 20px">
  <table style="width:100%;border-collapse:collapse">
    <thead>
      <tr style="background:${type === 'monthly' ? '#0D3321' : '#0B1631'};color:#fff">
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

<!-- FIRMA -->
<div style="padding:16px 36px 20px;display:flex;justify-content:flex-end">
  <img src="${firmaSrc}" alt="Bart Yantorno" style="height:32px;object-fit:contain" />
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
  const [fontCSS, logoSrc, firmaSrc] = await Promise.all([
    getFontCSS(),
    Promise.resolve(getPublicImageBase64("icon.png")),
    Promise.resolve(getPublicImageBase64("firma-bart-yantorno.png")),
  ])
  const html = generateReportHTML(data, fontCSS, logoSrc, firmaSrc)
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
