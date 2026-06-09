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
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleLogoutClick = () => setShowLogoutConfirm(true)
  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false)
    onLogout?.()
  }

  return (
    <>
      <nav className="bg-white border-b border-slate-100 shadow-sm">
        {/* Main bar */}
        <div className="px-4 md:px-6 flex items-center justify-between h-16">
          {/* Kiri: Logo + Nama */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo-kemenkeu.png" alt="Logo Kemenkeu" className="h-8 md:h-10 w-auto shrink-0" />
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
            <div className="hidden md:block">{extraButton}</div>

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

            {onLogout && (
              <button
                onClick={handleLogoutClick}
                className="hidden md:flex items-center gap-1.5 px-3 py-2 text-slate-500 hover:text-red-500 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors">
                <LogOut className="w-4 h-4" />
                Keluar
              </button>
            )}

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
              className="md:hidden p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1">
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

            {extraButton && <div className="pt-1">{extraButton}</div>}

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

            {onLogout && (
              <button
                onClick={handleLogoutClick}
                className="w-full flex items-center gap-2 px-3 py-2 text-red-500 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors">
                <LogOut className="w-4 h-4" />
                Keluar
              </button>
            )}
          </div>
        )}
      </nav>

      {/* Logout confirmation dialog */}
      {showLogoutConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-title"
          className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xs p-6">
            <h3 id="logout-title" className="text-sm font-bold text-slate-800 mb-2">Konfirmasi Keluar</h3>
            <p className="text-sm text-slate-500 mb-5">Yakin ingin keluar dari aplikasi?</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2 text-sm border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
                Batal
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="flex-1 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
