'use client'

import { useState } from 'react'

type Props = {
  onClose: () => void
}

export default function ModalAkun({ onClose }: Props) {
  const [oldPass, setOldPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleGantiPassword = async () => {
    setMsg(null)
    if (newPass !== confirmPass) {
      setMsg({ type: 'error', text: 'Password baru tidak cocok.' }); return
    }
    if (newPass.length < 6) {
      setMsg({ type: 'error', text: 'Password minimal 6 karakter.' }); return
    }
    setLoading(true)

    const res = await fetch('/api/satker/user', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPassword: oldPass, newPassword: newPass }),
    })

    const data = await res.json()
    if (!res.ok) {
      setMsg({ type: 'error', text: data.error || 'Gagal mengubah password.' })
    } else {
      setMsg({ type: 'success', text: 'Password berhasil diubah!' })
      setOldPass(''); setNewPass(''); setConfirmPass('')
    }
    setLoading(false)
  }

  const inputCls = "mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-800">Pengaturan Akun</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {msg && (
            <div className={`px-4 py-3 rounded-lg text-sm ${
              msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {msg.text}
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-slate-600">Password Lama</label>
            <input type="password" value={oldPass} onChange={e => setOldPass(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Password Baru</label>
            <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Konfirmasi Password Baru</label>
            <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} className={inputCls} />
          </div>

          <button onClick={handleGantiPassword} disabled={loading}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
            {loading ? 'Menyimpan...' : 'Ubah Password'}
          </button>
        </div>
      </div>
    </div>
  )
}