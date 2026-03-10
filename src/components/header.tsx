'use client'

type HeaderProps = {
  nama: string
  sub: string
  onLogout?: () => void
  extraButton?: React.ReactNode
}

export default function Header({ nama, sub, onLogout, extraButton }: HeaderProps) {
  return (
    <nav className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <img src="/images/logo-kemenkeu.png" alt="Logo" className="h-10 w-auto" />
        <div>
          <p className="text-sm font-bold text-slate-800">{nama}</p>
          <p className="text-xs text-blue-500">{sub}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {extraButton}
        {onLogout && (
          <button onClick={onLogout}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
            Keluar
          </button>
        )}
      </div>
    </nav>
  )
}