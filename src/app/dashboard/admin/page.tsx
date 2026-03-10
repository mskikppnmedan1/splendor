'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/header'


type Satker = {
  id: string
  nama_satker: string
  kode_satker: string
  status: string
  created_at: string
}

type ModalType = 'tambah' | 'reset-password' | 'hapus' | null

export default function DashboardAdmin() {
  const [satkerList, setSatkerList] = useState<Satker[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'pending' | 'aktif' | 'rejected' | 'kelola'>('pending')

  // Modal state
  const [modalType, setModalType] = useState<ModalType>(null)
  const [selectedSatker, setSelectedSatker] = useState<Satker | null>(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState('')

  // Form tambah
  const [formNama, setFormNama] = useState('')
  const [formKode, setFormKode] = useState('')
  const [formPassword, setFormPassword] = useState('')

  // Form reset password
  const [newPassword, setNewPassword] = useState('')

  const fetchSatker = async () => {
    setLoading(true)
    const res = await fetch('/api/satker/list')
    const data = await res.json()
    setSatkerList(data.list || [])
    setLoading(false)
  }

  useEffect(() => { fetchSatker() }, [])

  const handleApprove = async (id: string) => {
    await fetch('/api/satker', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'aktif' }),
    })
    fetchSatker()
  }

  const handleReject = async (id: string) => {
    await fetch('/api/satker', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'rejected' }),
    })
    fetchSatker()
  }

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' })
    window.location.href = '/login'
  }

  const openModal = (type: ModalType, satker?: Satker) => {
    setModalType(type)
    setSelectedSatker(satker || null)
    setModalError('')
    setFormNama(''); setFormKode(''); setFormPassword(''); setNewPassword('')
  }

  const closeModal = () => {
    setModalType(null)
    setSelectedSatker(null)
    setModalError('')
  }

  const handleTambah = async () => {
    setModalLoading(true); setModalError('')
    const res = await fetch('/api/satker/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nama_satker: formNama, kode_satker: formKode, password: formPassword }),
    })
    const data = await res.json()
    if (!res.ok) { setModalError(data.error); setModalLoading(false); return }
    closeModal()
    fetchSatker()
    setModalLoading(false)
  }

  const handleResetPassword = async () => {
    setModalLoading(true); setModalError('')
    const res = await fetch('/api/satker/user', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selectedSatker?.id, password: newPassword }),
    })
    const data = await res.json()
    if (!res.ok) { setModalError(data.error); setModalLoading(false); return }
    closeModal()
    setModalLoading(false)
  }

  const handleHapus = async () => {
    setModalLoading(true)
    await fetch('/api/satker/user', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selectedSatker?.id }),
    })
    closeModal()
    fetchSatker()
    setModalLoading(false)
  }

  const filtered = satkerList.filter(s => tab !== 'kelola' ? s.status === tab : true)
  const totalPending = satkerList.filter(s => s.status === 'pending').length
  const totalAktif = satkerList.filter(s => s.status === 'aktif').length
  const totalDitolak = satkerList.filter(s => s.status === 'rejected').length

  const inputCls = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"

  return (
    <div className="min-h-screen bg-slate-50">
      <Header nama="Sistem Informasi Satuan Kerja" sub="KPPN Medan I — Administrator" onLogout={handleLogout} />

      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-xl font-bold text-slate-800">Dashboard KPPN</h1>
        <p className="text-sm text-slate-500 mt-1">Kelola Satuan Kerja</p>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-xs text-slate-500">Total Satker</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{satkerList.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-amber-200 p-5">
            <p className="text-xs text-amber-600">Menunggu Approval</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{totalPending}</p>
          </div>
          <div className="bg-white rounded-xl border border-green-200 p-5">
            <p className="text-xs text-green-600">Satker Aktif</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{totalAktif}</p>
          </div>
        </div>

        {/* Tab */}
        <div className="flex items-center justify-between mt-8 border-b border-slate-200">
          <div className="flex gap-2">
            {([
              { key: 'pending', label: `Menunggu (${totalPending})` },
              { key: 'aktif', label: `Aktif (${totalAktif})` },
              { key: 'rejected', label: `Ditolak (${totalDitolak})` },
              { key: 'kelola', label: 'Kelola User' },
            ] as const).map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                {t.label}
              </button>
            ))}
          </div>
          {tab === 'kelola' && (
            <button onClick={() => openModal('tambah')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors mb-1">
              + Tambah Satker
            </button>
          )}
        </div>

        {/* Table */}
        <div className="mt-4 bg-white rounded-xl border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-sm text-slate-400">Memuat data...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">Tidak ada data</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Nama Satker</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Kode Satker</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Tanggal Daftar</th>
                  {tab === 'pending' && <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Aksi</th>}
                  {tab === 'kelola' && <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-800 font-medium">{s.nama_satker || '-'}</td>
                    <td className="px-4 py-3 text-slate-600">{s.kode_satker || '-'}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {new Date(s.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </td>
                    {tab === 'pending' && (
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => handleApprove(s.id)}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors">
                            Setujui
                          </button>
                          <button onClick={() => handleReject(s.id)}
                            className="px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white text-xs rounded-lg transition-colors">
                            Tolak
                          </button>
                        </div>
                      </td>
                    )}
                    {tab === 'kelola' && (
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => openModal('reset-password', s)}
                            className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs rounded-lg border border-blue-200 transition-colors">
                            Reset Password
                          </button>
                          <button onClick={() => openModal('hapus', s)}
                            className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs rounded-lg border border-rose-200 transition-colors">
                            Hapus
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalType && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-800">
                {modalType === 'tambah' && 'Tambah Satker Baru'}
                {modalType === 'reset-password' && `Reset Password — ${selectedSatker?.nama_satker}`}
                {modalType === 'hapus' && 'Hapus Satker'}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {modalError && (
                <div className="px-4 py-3 bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-lg">
                  {modalError}
                </div>
              )}

              {/* Form Tambah */}
              {modalType === 'tambah' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Nama Satker</label>
                    <input value={formNama} onChange={e => setFormNama(e.target.value)}
                      placeholder="Nama instansi/satker" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Kode Satker <span className="text-slate-400">(digunakan sebagai username)</span></label>
                    <input value={formKode} onChange={e => setFormKode(e.target.value)}
                      placeholder="Contoh: 019364" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Password</label>
                    <input type="password" value={formPassword} onChange={e => setFormPassword(e.target.value)}
                      placeholder="Minimal 6 karakter" className={inputCls} />
                  </div>
                  <button onClick={handleTambah} disabled={modalLoading}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
                    {modalLoading ? 'Menyimpan...' : 'Tambah Satker'}
                  </button>
                </>
              )}

              {/* Form Reset Password */}
              {modalType === 'reset-password' && (
                <>
                  <p className="text-xs text-slate-400">Masukkan password baru untuk <strong>{selectedSatker?.nama_satker}</strong> ({selectedSatker?.kode_satker}).</p>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Password Baru</label>
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                      placeholder="Minimal 6 karakter" className={inputCls} />
                  </div>
                  <button onClick={handleResetPassword} disabled={modalLoading}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
                    {modalLoading ? 'Menyimpan...' : 'Reset Password'}
                  </button>
                </>
              )}

              {/* Konfirmasi Hapus */}
              {modalType === 'hapus' && (
                <>
                  <p className="text-sm text-slate-600">
                    Yakin ingin menghapus satker <strong>{selectedSatker?.nama_satker}</strong> ({selectedSatker?.kode_satker})?
                    Semua data profil satker ini akan ikut terhapus.
                  </p>
                  <div className="flex gap-3">
                    <button onClick={closeModal}
                      className="flex-1 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                      Batal
                    </button>
                    <button onClick={handleHapus} disabled={modalLoading}
                      className="flex-1 py-2 text-sm bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50">
                      {modalLoading ? 'Menghapus...' : 'Hapus'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}