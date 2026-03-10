'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'

type Mode = 'satker-login' | 'kppn-login'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('satker-login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)

  // Satker login
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // KPPN login
  const [kppnUsername, setKppnUsername] = useState('')
  const [kppnPassword, setKppnPassword] = useState('')

  const reset = () => setError('')

  const handleSatkerLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); reset()

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.trim(), password, role: 'satker' }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Kode satker atau password salah.')
      setLoading(false); return
    }

    router.push('/dashboard/dashboard')
    router.refresh()
  }

  const handleKppnLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); reset()

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: kppnUsername, password: kppnPassword }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Username atau password salah.')
      setLoading(false); return
    }

    router.push('/dashboard/admin')
    router.refresh()
  }

  const inputCls = "w-full px-3 py-2.5 text-sm text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full opacity-40" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-100 rounded-full opacity-30" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/images/logo-kemenkeu.png" alt="Logo Kemenkeu"
            className="h-20 w-auto object-contain mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-800">Sistem Informasi Satuan Kerja</h1>
          <p className="text-sm text-blue-600 font-medium mt-1">KPPN Medan I</p>
        </div>

        {/* Tab */}
        <div className="flex bg-slate-100 rounded-xl p-1 mb-4 gap-1">
          <button onClick={() => { setMode('satker-login'); reset() }}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${mode === 'satker-login' ? 'bg-white shadow text-blue-700' : 'text-slate-400 hover:text-slate-600'}`}>
            Satker
          </button>
          <button onClick={() => { setMode('kppn-login'); reset() }}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${mode === 'kppn-login' ? 'bg-white shadow text-blue-700' : 'text-slate-400 hover:text-slate-600'}`}>
            KPPN
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-xl px-4 py-2.5 mb-4">{error}</div>
          )}

          {/* Satker Login */}
          {mode === 'satker-login' && (
            <>
              <h2 className="text-base font-semibold text-slate-800 mb-5">Masuk sebagai Satker</h2>
              <form onSubmit={handleSatkerLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Kode Satker</label>
                  <input value={username} onChange={e => setUsername(e.target.value)} required
                    placeholder="Contoh: 019364" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Password</label>
                  <div className="relative">
                    <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                      placeholder="••••••••" className={`${inputCls} pr-10`} />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-xl text-sm transition-colors">
                  {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {loading ? 'Masuk...' : 'Masuk'}
                </button>
              </form>
            </>
          )}

          {/* KPPN Login */}
          {mode === 'kppn-login' && (
            <>
              <h2 className="text-base font-semibold text-slate-800 mb-5">Masuk sebagai KPPN</h2>
              <form onSubmit={handleKppnLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Username</label>
                  <input value={kppnUsername} onChange={e => setKppnUsername(e.target.value)} required
                    placeholder="Masukkan username" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Password</label>
                  <div className="relative">
                    <input type={showPass ? 'text' : 'password'} value={kppnPassword} onChange={e => setKppnPassword(e.target.value)} required
                      placeholder="••••••••" className={`${inputCls} pr-10`} />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-xl text-sm transition-colors">
                  {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {loading ? 'Masuk...' : 'Masuk'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-xs text-slate-300 mt-6">
          Direktorat Jenderal Perbendaharaan · Kemenkeu RI
        </p>
      </div>
    </div>
  )
}