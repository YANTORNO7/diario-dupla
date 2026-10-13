import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Verificar email",
}

const messages: Record<string, { title: string; text: string }> = {
  success: {
    title: "Email verificado",
    text: "Tu email fue verificado correctamente. Ya podés recibir la newsletter.",
  },
  already: {
    title: "Email ya verificado",
    text: "Tu email ya estaba verificado.",
  },
  invalid: {
    title: "Token inválido",
    text: "El link de verificación no es válido o ya expiró.",
  },
  error: {
    title: "Error",
    text: "Hubo un error al verificar tu email. Intentá de nuevo.",
  },
}

export default async function VerificarPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const info = messages[status || "error"] || messages.error

  return (
    <div className="max-w-md mx-auto px-4 py-12 text-center">
      <h1 className="font-titular text-2xl mb-3">{info.title}</h1>
      <p className="text-gray-500 font-cuerpo text-sm mb-6">{info.text}</p>
      <Link
        href="/cuenta"
        className="inline-block px-6 py-2.5 bg-[#111111] text-white font-cuerpo font-semibold text-sm rounded-md hover:bg-gray-800 transition-colors"
      >
        Ir a mi cuenta
      </Link>
    </div>
  )
}
