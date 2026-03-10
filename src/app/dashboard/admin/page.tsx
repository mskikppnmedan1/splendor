"use client";

import { useState, useEffect } from "react";
import Header from "@/components/header";
import { Search } from "lucide-react";

type Satker = {
  id: string;
  nama_satker: string;
  kode_satker: string;
  status: string;
  created_at: string;
};

type ProfilSatker = {
  alamat: string;
  no_telp: string;
  email: string;
  nama_kpa: string;
  nip_kpa: string;
  nama_ppk1: string;
  nip_ppk1: string;
  nama_ppk2: string;
  nip_ppk2: string;
  nama_ppk3: string;
  nip_ppk3: string;
  nama_ppk4: string;
  nip_ppk4: string;
  nama_ppspm: string;
  nip_ppspm: string;
  nama_bendahara_pengeluaran: string;
  nip_bendahara_pengeluaran: string;
  nama_bendahara_penerimaan: string;
  nip_bendahara_penerimaan: string;
  nama_bendahara_pembantu: string;
  nip_bendahara_pembantu: string;
  nama_pic1: string;
  hp_pic1: string;
  nama_pic2: string;
  hp_pic2: string;
  nama_pic3: string;
  hp_pic3: string;
  nama_pic4: string;
  hp_pic4: string;
};

const NAV_ITEMS = [
  { label: "Data Satker", href: "/dashboard/admin" },
  { label: "Kelola User", href: "/dashboard/admin/kelola" },
];

export default function DashboardAdmin() {
  const [satkerList, setSatkerList] = useState<Satker[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const [selectedSatker, setSelectedSatker] = useState<Satker | null>(null);
  const [selectedProfil, setSelectedProfil] = useState<ProfilSatker | null>(null);
  const [profilLoading, setProfilLoading] = useState(false);

  const fetchSatker = async () => {
    setLoading(true);
    const res = await fetch("/api/satker/list");
    const data = await res.json();
    setSatkerList((data.list || []).filter((s: Satker) => s.status === "aktif"));
    setLoading(false);
  };

  useEffect(() => { fetchSatker(); }, []);

  const handleLogout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    window.location.href = "/login";
  };

  const openDetail = async (satker: Satker) => {
    setSelectedSatker(satker);
    setSelectedProfil(null);
    setShowDetail(true);
    setProfilLoading(true);
    const res = await fetch(`/api/satker/profil?id=${satker.id}`);
    if (res.ok) {
      const data = await res.json();
      setSelectedProfil(data.profil);
    }
    setProfilLoading(false);
  };

  const filtered = satkerList.filter((s) =>
    s.nama_satker?.toLowerCase().includes(search.toLowerCase()) ||
    s.kode_satker?.toLowerCase().includes(search.toLowerCase())
  );

  const Field = ({ label, value }: { label: string; value?: string }) => (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm text-slate-700 font-medium mt-0.5 break-words">
        {value || <span className="text-slate-300 font-normal italic">Belum diisi</span>}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Header nama="Sistem Informasi Satuan Kerja" sub="KPPN Medan I" userLabel="Administrator" userRole="KPPN" onLogout={handleLogout} navItems={NAV_ITEMS} />

      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        <h1 className="text-lg md:text-xl font-bold text-slate-800">Data Satker</h1>
        <p className="text-sm text-slate-500 mt-1">Daftar data profil satuan kerja</p>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 gap-3 md:gap-4 mt-4 md:mt-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
            <p className="text-xs text-slate-500">Total Satker</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{satkerList.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-green-200 p-4 md:p-5">
            <p className="text-xs text-green-600">Satker Aktif</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{satkerList.length}</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4 md:mt-6 flex flex-wrap items-center gap-2 md:gap-3">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau kode satker..."
              className="w-full pl-9 pr-4 py-2 text-sm text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all bg-white"
            />
          </div>
          {search && (
            <button onClick={() => setSearch("")} className="text-xs text-slate-400 hover:text-slate-600 shrink-0">Reset</button>
          )}
          <p className="text-xs text-slate-400 shrink-0">{filtered.length} ditemukan</p>
        </div>

        {/* Table — desktop */}
        <div className="mt-3 bg-white rounded-xl border border-slate-200 overflow-hidden hidden md:block">
          {loading ? (
            <div className="p-8 text-center text-sm text-slate-400">Memuat data...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">
              {search ? `Tidak ada satker dengan kata kunci "${search}"` : "Belum ada satker aktif"}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Nama Satker</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Kode Satker</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Tanggal Daftar</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-800 font-medium">{s.nama_satker || "-"}</td>
                    <td className="px-4 py-3 text-slate-600">{s.kode_satker || "-"}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {new Date(s.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => openDetail(s)} className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs rounded-lg border border-blue-200 transition-colors">
                        Lihat Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Card list — mobile */}
        <div className="mt-3 space-y-2 md:hidden">
          {loading ? (
            <div className="p-8 text-center text-sm text-slate-400">Memuat data...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">
              {search ? `Tidak ada satker dengan kata kunci "${search}"` : "Belum ada satker aktif"}
            </div>
          ) : filtered.map((s) => (
            <div key={s.id} className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-800 break-words">{s.nama_satker || "-"}</p>
              <p className="text-xs text-slate-500 mt-1">Kode Satker: {s.kode_satker || "-"}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {new Date(s.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </p>
              <button onClick={() => openDetail(s)} className="mt-3 w-full py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs rounded-lg border border-blue-200 transition-colors">
                Lihat Detail
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Detail */}
      {showDetail && selectedSatker && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-white rounded-t-2xl md:rounded-2xl shadow-xl w-full md:max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
              <div className="min-w-0 pr-4">
                <h2 className="text-sm font-bold text-slate-800 break-words">{selectedSatker.nama_satker}</h2>
                <p className="text-xs text-slate-400 mt-0.5">Kode Satker: {selectedSatker.kode_satker}</p>
              </div>
              <button onClick={() => setShowDetail(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none shrink-0">&times;</button>
            </div>
            <div className="px-4 md:px-6 py-5 space-y-5">
              {profilLoading ? (
                <div className="py-12 text-center text-sm text-slate-400">Memuat profil...</div>
              ) : !selectedProfil ? (
                <div className="py-12 text-center text-sm text-slate-400">Satker belum mengisi data profil.</div>
              ) : (
                <>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100">Profil Kantor</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Alamat Kantor" value={selectedProfil.alamat} />
                      <Field label="No. Telp Kantor" value={selectedProfil.no_telp} />
                      <Field label="Email Kantor" value={selectedProfil.email} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100">Pejabat Perbendaharaan</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="KPA" value={selectedProfil.nama_kpa ? `${selectedProfil.nama_kpa} / ${selectedProfil.nip_kpa}` : ""} />
                      <Field label="PPK 1" value={selectedProfil.nama_ppk1 ? `${selectedProfil.nama_ppk1} / ${selectedProfil.nip_ppk1}` : ""} />
                      <Field label="PPK 2" value={selectedProfil.nama_ppk2 ? `${selectedProfil.nama_ppk2} / ${selectedProfil.nip_ppk2}` : ""} />
                      <Field label="PPK 3" value={selectedProfil.nama_ppk3 ? `${selectedProfil.nama_ppk3} / ${selectedProfil.nip_ppk3}` : ""} />
                      <Field label="PPK 4" value={selectedProfil.nama_ppk4 ? `${selectedProfil.nama_ppk4} / ${selectedProfil.nip_ppk4}` : ""} />
                      <Field label="PPSPM" value={selectedProfil.nama_ppspm ? `${selectedProfil.nama_ppspm} / ${selectedProfil.nip_ppspm}` : ""} />
                      <Field label="Bendahara Pengeluaran" value={selectedProfil.nama_bendahara_pengeluaran ? `${selectedProfil.nama_bendahara_pengeluaran} / ${selectedProfil.nip_bendahara_pengeluaran}` : ""} />
                      <Field label="Bendahara Penerimaan" value={selectedProfil.nama_bendahara_penerimaan ? `${selectedProfil.nama_bendahara_penerimaan} / ${selectedProfil.nip_bendahara_penerimaan}` : ""} />
                      <Field label="Bendahara Pembantu" value={selectedProfil.nama_bendahara_pembantu ? `${selectedProfil.nama_bendahara_pembantu} / ${selectedProfil.nip_bendahara_pembantu}` : ""} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100">PIC / Operator</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="PIC/Operator 1" value={selectedProfil.nama_pic1 ? `${selectedProfil.nama_pic1} / ${selectedProfil.hp_pic1}` : ""} />
                      <Field label="PIC/Operator 2" value={selectedProfil.nama_pic2 ? `${selectedProfil.nama_pic2} / ${selectedProfil.hp_pic2}` : ""} />
                      <Field label="PIC/Operator 3" value={selectedProfil.nama_pic3 ? `${selectedProfil.nama_pic3} / ${selectedProfil.hp_pic3}` : ""} />
                      <Field label="PIC/Operator 4" value={selectedProfil.nama_pic4 ? `${selectedProfil.nama_pic4} / ${selectedProfil.hp_pic4}` : ""} />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}