import { Resend } from "resend"

const _address = process.env.RESEND_FROM_EMAIL || "newsletter@diariodupla.com"
export const FROM_EMAIL = `Diario Dupla <${_address}>`

let _resend: Resend | null = null
export function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY)
  return _resend
}
