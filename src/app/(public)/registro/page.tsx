import Link from "next/link"
import RegistroForm from "@/components/public/RegistroForm"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Crear cuenta",
}

export default function RegistroPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <Link href="/" className="inline-block mb-6 text-sm font-cuerpo text-gray-500 hover:text-gray-900 transition-colors">
        &larr; Volver al inicio
      </Link>
      <h1 className="font-titular text-2xl mb-2">Crear cuenta</h1>
      <p className="text-gray-500 font-cuerpo text-sm mb-6">
        Registrate para recibir las últimas noticias del fútbol argentino y brasileño.
      </p>
      <RegistroForm />
      <p className="mt-6 text-center text-sm font-cuerpo text-gray-500">
        ¿Ya tenés cuenta?{" "}
        <Link href="/ingresar" className="text-gray-900 font-semibold hover:underline">
          Ingresá
        </Link>
      </p>
    </div>
  )
}
