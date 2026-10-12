import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="font-titular text-8xl text-white mb-4">404</h1>
        <p className="font-cuerpo text-gray-400 text-lg mb-6">
          La página que buscás no existe.
        </p>
        <Link
          href="/"
          className="inline-block bg-white text-[#111111] px-6 py-3 rounded-md font-cuerpo font-semibold hover:bg-gray-100 transition-colors"
        >
          Volver a la portada
        </Link>
      </div>
    </div>
  )
}
