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
