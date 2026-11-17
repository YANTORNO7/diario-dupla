import { Resend } from "resend"

export const resend = new Resend(process.env.RESEND_API_KEY)

const _address = process.env.RESEND_FROM_EMAIL || "newsletter@diariodupla.com"
export const FROM_EMAIL = `Diario Dupla <${_address}>`
