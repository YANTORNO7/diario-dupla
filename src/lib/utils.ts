import { format } from "date-fns"
import { es } from "date-fns/locale"

export function formatDate(date: Date | string): string {
  return format(new Date(date), "d 'de' MMMM, yyyy", { locale: es })
}

export function formatDateShort(date: Date | string): string {
  return format(new Date(date), "d MMM yyyy", { locale: es })
}

export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(" ")
}

// Parsea una fecha recibida del frontend (YYYY-MM-DD o ISO string).
// Las fechas "solo día" se almacenan al mediodía UTC para evitar
// desfasajes de zona horaria en Argentina (UTC-3).
export function parseDateInput(dateStr: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return new Date(`${dateStr}T12:00:00.000Z`)
  }
  return new Date(dateStr)
}
