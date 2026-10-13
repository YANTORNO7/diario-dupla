import Link from "next/link"
import LoginForm from "@/components/public/LoginForm"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Ingresar",
}

export default function IngresarPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="font-titular text-2xl mb-2">Ingresar</h1>
      <p className="text-gray-500 font-cuerpo text-sm mb-6">
        Ingresá a tu cuenta de lector.
      </p>
      <LoginForm />
      <p className="mt-6 text-center text-sm font-cuerpo text-gray-500">
        ¿No tenés cuenta?{" "}
        <Link href="/registro" className="text-gray-900 font-semibold hover:underline">
          Registrate
        </Link>
      </p>
    </div>
  )
}
