import Logo from "./Logo"

export default function Footer() {
  return (
    <footer className="bg-[#111111] text-white mt-12">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <Logo size="small" />
            <p className="text-gray-400 text-sm font-cuerpo mt-2 hidden md:block">El diario del fútbol argentino y brasileño, y de los deportes que nos unen</p>
            <p className="text-gray-400 text-sm font-cuerpo mt-2 md:hidden">Fútbol y deportes que nos unen</p>
          </div>
          <nav className="flex gap-6">
            <a href="/argentina" className="text-sm text-gray-400 hover:text-[#75AADB] font-cuerpo transition-colors">Argentina</a>
            <a href="/brasil" className="text-sm text-gray-400 hover:text-[#009C3B] font-cuerpo transition-colors">Brasil</a>

          </nav>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-800 text-center">
          <p className="text-gray-500 text-xs font-cuerpo">
            &copy; {new Date().getFullYear()} Diario Dupla. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
