'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'

type NavItem = {
  label: string
  href: string
}

type HeaderProps = {
  nama: string
  sub: string
  userLabel?: string
  userRole?: string
  onLogout?: () => void
  extraButton?: React.ReactNode
  navItems?: NavItem[]
}

export default function Header({ nama, sub, userLabel, userRole, onLogout, extraButton, navItems }: HeaderProps) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="bg-white border-b border-slate-100 shadow-sm">
      {/* Main bar */}
      <div className="px-4 md:px-6 flex items-center justify-between h-16">
        {/* Kiri: Logo + Nama */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0 min-w-0">
          <img src="/images/logo-kemenkeu.png" alt="Logo" className="h-8 md:h-10 w-auto shrink-0" />
          <div className="min-w-0">
            <p className="text-xs md:text-sm font-bold text-slate-800 leading-tight truncate">{nama}</p>
            <p className="text-xs text-blue-500 leading-tight truncate">{sub}</p>
          </div>
        </div>

        {/* Tengah: Nav Links (desktop) */}
        {navItems && navItems.length > 0 && (
          <div className="hidden md:flex items-center gap-1 h-full">
            {navItems.map(item => {
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}
                  className={`px-4 h-full flex items-center text-sm font-medium border-b-2 transition-colors ${
                    isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}>
                  {item.label}
                </Link>
              )
            })}
          </div>
        )}

        {/* Kanan */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {/* Extra button (desktop) */}
          <div className="hidden md:block">{extraButton}</div>

          {/* User info (desktop) */}
          {(userLabel || userRole) && (
            <div className="hidden md:block text-right">
              {userLabel && <p className="text-sm font-semibold text-slate-800 leading-tight">{userLabel}</p>}
              {userRole && (
                <span className="inline-block mt-0.5 px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
                  {userRole}
                </span>
              )}
            </div>
          )}

          {/* Logout (desktop) */}
          {onLogout && (
            <button onClick={onLogout}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 text-slate-500 hover:text-red-500 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors">
              <LogOut className="w-4 h-4" />
              Keluar
            </button>
          )}

          {/* Hamburger (mobile) */}
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1">
          {/* Nav links */}
          {navItems?.map(item => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                }`}>
                {item.label}
              </Link>
            )
          })}

          {/* Extra button */}
          {extraButton && <div className="pt-1">{extraButton}</div>}

          {/* User info */}
          {(userLabel || userRole) && (
            <div className="px-3 py-2 border-t border-slate-100 mt-1 pt-3">
              {userLabel && <p className="text-sm font-semibold text-slate-800">{userLabel}</p>}
              {userRole && (
                <span className="inline-block mt-0.5 px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
                  {userRole}
                </span>
              )}
            </div>
          )}

          {/* Logout */}
          {onLogout && (
            <button onClick={onLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-red-500 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors">
              <LogOut className="w-4 h-4" />
              Keluar
            </button>
          )}
        </div>
      )}
    </nav>
  )
}