"use client";

import { useState, useEffect } from "react";
import Header from "@/components/header";
import { Search } from "lucide-react";
import * as XLSX from "xlsx";

type Satker = {
  id: string;
  nama_satker: string;
  kode_satker: string;
  status: string;
  created_at: string;
  updated_at: string | null;
};

type ProfilSatker = {
  alamat: string;
  no_telp: string;
  email: string;
  nama_kpa: string;
  nip_kpa: string;
  hp_kpa: string;
  nama_ppk1: string;
  nip_ppk1: string;
  hp_ppk1: string;
  nama_ppk2: string;
  nip_ppk2: string;
  hp_ppk2: string;
  nama_ppk3: string;
  nip_ppk3: string;
  hp_ppk3: string;
  nama_ppk4: string;
  nip_ppk4: string;
  hp_ppk4: string;
  nama_ppspm: string;
  nip_ppspm: string;
  hp_ppspm: string;
  nama_bendahara_pengeluaran: string;
  nip_bendahara_pengeluaran: string;
  hp_bendahara_pengeluaran: string;
  nama_bendahara_penerimaan: string;
  nip_bendahara_penerimaan: string;
  hp_bendahara_penerimaan: string;
  nama_bendahara_pembantu: string;
  nip_bendahara_pembantu: string;
  hp_bendahara_pembantu: string;
  nama_pic1: string;
  hp_pic1: string;
  nama_pic2: string;
  hp_pic2: string;
  nama_pic3: string;
  hp_pic3: string;
  nama_pic4: string;
  hp_pic4: string;
};

const emptyProfil: ProfilSatker = {
  alamat: "",
  no_telp: "",
  email: "",
  nama_kpa: "",
  nip_kpa: "",
  hp_kpa: "",
  nama_ppk1: "",
  nip_ppk1: "",
  hp_ppk1: "",
  nama_ppk2: "",
  nip_ppk2: "",
  hp_ppk2: "",
  nama_ppk3: "",
  nip_ppk3: "",
  hp_ppk3: "",
  nama_ppk4: "",
  nip_ppk4: "",
  hp_ppk4: "",
  nama_ppspm: "",
  nip_ppspm: "",
  hp_ppspm: "",
  nama_bendahara_pengeluaran: "",
  nip_bendahara_pengeluaran: "",
  hp_bendahara_pengeluaran: "",
  nama_bendahara_penerimaan: "",
  nip_bendahara_penerimaan: "",
  hp_bendahara_penerimaan: "",
  nama_bendahara_pembantu: "",
  nip_bendahara_pembantu: "",
  hp_bendahara_pembantu: "",
  nama_pic1: "",
  hp_pic1: "",
  nama_pic2: "",
  hp_pic2: "",
  nama_pic3: "",
  hp_pic3: "",
  nama_pic4: "",
  hp_pic4: "",
};

const NAV_ITEMS = [
  { label: "Data Satker", href: "/dashboard/admin" },
  { label: "Kelola User", href: "/dashboard/admin/kelola" },
];

// ─── Komponen di luar ───────────────────────────────────────────────────────

const InfoRow = ({ label, value }: { label: string; value?: string }) => (
  <div className="flex items-start justify-between gap-4 py-2.5 border-b border-slate-100 last:border-0">
    <p className="text-xs text-slate-500 shrink-0 w-32">{label}</p>
    <p className="text-xs text-slate-800 text-right break-words">{value || <span className="text-slate-300 italic">Belum diisi</span>}</p>
  </div>
);

const PejabatCard = ({ jabatan, nama, nip, hp }: { jabatan: string; nama?: string; nip?: string; hp?: string }) => (
  <div className="p-3 rounded-lg border border-slate-100 bg-slate-50">
    <p className="text-xs font-semibold text-slate-500 mb-2">{jabatan}</p>
    {nama ? (
      <div className="space-y-1">
        <p className="text-sm font-medium text-slate-800">{nama}</p>
        {nip && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400">NIP</span>
            <span className="text-xs text-slate-700">{nip}</span>
          </div>
        )}
        {hp && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400">HP</span>
            <span className="text-xs text-slate-700">{hp}</span>
          </div>
        )}
      </div>
    ) : (
      <p className="text-xs text-slate-300 italic">Belum diisi</p>
    )}
  </div>
);

const FormField = ({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <div>
    <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || `Isi ${label.toLowerCase()}...`}
      className="w-full px-3 py-2 text-sm text-slate-800 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white transition-all"
    />
  </div>
);

const PejabatFormGroup = ({ jabatan, prefix, form, setForm, withNip = true }: { jabatan: string; prefix: string; form: ProfilSatker; setForm: (f: ProfilSatker) => void; withNip?: boolean }) => (
  <div className="p-3 rounded-lg border border-slate-100 bg-slate-50 space-y-2">
    <p className="text-xs font-semibold text-slate-600">{jabatan}</p>
    <FormField label="Nama" value={(form as any)[`nama_${prefix}`] || ""} onChange={(v) => setForm({ ...form, [`nama_${prefix}`]: v })} />
    {withNip && <FormField label="NIP" value={(form as any)[`nip_${prefix}`] || ""} onChange={(v) => setForm({ ...form, [`nip_${prefix}`]: v })} />}
    <FormField label="HP" value={(form as any)[`hp_${prefix}`] || ""} onChange={(v) => setForm({ ...form, [`hp_${prefix}`]: v })} />
  </div>
);

// ────────────────────────────────────────────────────────────────────────────

export default function DashboardAdmin() {
  const [satkerList, setSatkerList] = useState<Satker[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [exporting, setExporting] = useState(false);

  // Detail modal
  const [showDetail, setShowDetail] = useState(false);
  const [selectedSatker, setSelectedSatker] = useState<Satker | null>(null);
  const [selectedProfil, setSelectedProfil] = useState<ProfilSatker | null>(null);
  const [profilLoading, setProfilLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"kantor" | "pejabat" | "pic">("kantor");

  // Edit modal
  const [showEdit, setShowEdit] = useState(false);
  const [editSatker, setEditSatker] = useState<Satker | null>(null);
  const [editForm, setEditForm] = useState<ProfilSatker>(emptyProfil);
  const [editLoading, setEditLoading] = useState(false);
  const [editTab, setEditTab] = useState<"kantor" | "pejabat" | "pic">("kantor");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const fetchSatker = async () => {
    setLoading(true);
    const res = await fetch("/api/satker/list");
    const data = await res.json();
    setSatkerList((data.list || []).filter((s: Satker) => s.status === "aktif"));
    setLoading(false);
  };

  useEffect(() => {
    fetchSatker();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    window.location.href = "/login";
  };

  const openDetail = async (satker: Satker) => {
    setSelectedSatker(satker);
    setSelectedProfil(null);
    setShowDetail(true);
    setActiveTab("kantor");
    setProfilLoading(true);
    const res = await fetch(`/api/satker/profil?id=${satker.id}`);
    if (res.ok) {
      const data = await res.json();
      setSelectedProfil(data.profil);
    }
    setProfilLoading(false);
  };

  const openEdit = async (satker: Satker) => {
    setEditSatker(satker);
    setEditForm(emptyProfil);
    setShowEdit(true);
    setEditTab("kantor");
    setSaveMsg("");
    setEditLoading(true);
    const res = await fetch(`/api/satker/profil?id=${satker.id}`);
    if (res.ok) {
      const data = await res.json();
      setEditForm({ ...emptyProfil, ...(data.profil || {}) });
    }
    setEditLoading(false);
  };

  const handleSave = async () => {
    if (!editSatker) return;
    setSaving(true);
    setSaveMsg("");
    const res = await fetch("/api/satker", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editSatker.id, profil: editForm }),
    });
    if (res.ok) {
      setSaveMsg("✓ Data berhasil disimpan");
      if (selectedSatker?.id === editSatker.id) {
        setSelectedProfil({ ...editForm });
      }
      setTimeout(() => {
        setSaveMsg("");
        setShowEdit(false);
      }, 1500);
    } else {
      setSaveMsg("✗ Gagal menyimpan. Coba lagi.");
    }
    setSaving(false);
  };

  const handleExport = async () => {
    setExporting(true);
    const rows = await Promise.all(
      satkerList.map(async (s) => {
        const res = await fetch(`/api/satker/profil?id=${s.id}`);
        const data = res.ok ? await res.json() : {};
        const p: ProfilSatker = { ...emptyProfil, ...(data.profil || {}) };
        return {
          "Nama Satker": s.nama_satker,
          "Kode Satker": s.kode_satker,
          "Tanggal Daftar": new Date(s.created_at).toLocaleDateString("id-ID"),
          Alamat: p.alamat,
          "No. Telp": p.no_telp,
          Email: p.email,
          "Nama KPA": p.nama_kpa,
          "NIP KPA": p.nip_kpa,
          "HP KPA": p.hp_kpa,
          "Nama PPK 1": p.nama_ppk1,
          "NIP PPK 1": p.nip_ppk1,
          "HP PPK 1": p.hp_ppk1,
          "Nama PPK 2": p.nama_ppk2,
          "NIP PPK 2": p.nip_ppk2,
          "HP PPK 2": p.hp_ppk2,
          "Nama PPK 3": p.nama_ppk3,
          "NIP PPK 3": p.nip_ppk3,
          "HP PPK 3": p.hp_ppk3,
          "Nama PPK 4": p.nama_ppk4,
          "NIP PPK 4": p.nip_ppk4,
          "HP PPK 4": p.hp_ppk4,
          "Nama PPSPM": p.nama_ppspm,
          "NIP PPSPM": p.nip_ppspm,
          "HP PPSPM": p.hp_ppspm,
          "Nama Bendahara Pengeluaran": p.nama_bendahara_pengeluaran,
          "NIP Bendahara Pengeluaran": p.nip_bendahara_pengeluaran,
          "HP Bendahara Pengeluaran": p.hp_bendahara_pengeluaran,
          "Nama Bendahara Penerimaan": p.nama_bendahara_penerimaan,
          "NIP Bendahara Penerimaan": p.nip_bendahara_penerimaan,
          "HP Bendahara Penerimaan": p.hp_bendahara_penerimaan,
          "Nama Bendahara Pembantu": p.nama_bendahara_pembantu,
          "NIP Bendahara Pembantu": p.nip_bendahara_pembantu,
          "HP Bendahara Pembantu": p.hp_bendahara_pembantu,
          "Nama PIC 1": p.nama_pic1,
          "HP PIC 1": p.hp_pic1,
          "Nama PIC 2": p.nama_pic2,
          "HP PIC 2": p.hp_pic2,
          "Nama PIC 3": p.nama_pic3,
          "HP PIC 3": p.hp_pic3,
          "Nama PIC 4": p.nama_pic4,
          "HP PIC 4": p.hp_pic4,
        };
      }),
    );

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Satker");
    XLSX.writeFile(wb, `Data_Satker_KPPN_Medan_I_${new Date().toISOString().slice(0, 10)}.xlsx`);
    setExporting(false);
  };

  const filtered = satkerList.filter((s) => s.nama_satker?.toLowerCase().includes(search.toLowerCase()) || s.kode_satker?.toLowerCase().includes(search.toLowerCase()));

  const TABS = [
    { key: "kantor", label: "Profil Kantor" },
    { key: "pejabat", label: "Pejabat" },
    { key: "pic", label: "PIC / Operator" },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header nama="Sistem Informasi Satuan Kerja" sub="KPPN Medan I" userLabel="Administrator" userRole="KPPN" onLogout={handleLogout} navItems={NAV_ITEMS} />

      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        <h1 className="text-lg md:text-xl font-bold text-slate-800">Data Satker</h1>
        <p className="text-sm text-slate-500 mt-1">Daftar data profil satuan kerja</p>

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
            <button onClick={() => setSearch("")} className="text-xs text-slate-500 hover:text-slate-700 shrink-0">
              Reset
            </button>
          )}
          <p className="text-xs text-slate-500 shrink-0">{filtered.length} ditemukan</p>
          <button onClick={handleExport} disabled={exporting || loading} className="shrink-0 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs rounded-lg transition-colors disabled:opacity-50">
            {exporting ? "Mengekspor..." : "↓ Export Excel"}
          </button>
        </div>

        {/* Table — desktop */}
        <div className="mt-3 bg-white rounded-xl border border-slate-200 overflow-hidden hidden md:block">
          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">Memuat data...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">{search ? `Tidak ada satker dengan kata kunci "${search}"` : "Belum ada satker aktif"}</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Kode Satker</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Nama Satker</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Update Terakhir</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-600">{s.kode_satker || "-"}</td>
                    <td className="px-4 py-3 text-slate-800 font-medium">{s.nama_satker || "-"}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {s.updated_at ? (
                        new Date(s.updated_at).toLocaleString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      ) : (
                        <span className="text-slate-300 italic">Belum diisi</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="inline-flex rounded-lg border border-slate-200 overflow-hidden">
                        <button onClick={() => openDetail(s)} className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 transition-colors border-r border-slate-200">
                          Detail
                        </button>
                        <button onClick={() => openEdit(s)} className="px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50 transition-colors">
                          Edit
                        </button>
                      </div>
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
            <div className="p-8 text-center text-sm text-slate-500">Memuat data...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">{search ? `Tidak ada satker dengan kata kunci "${search}"` : "Belum ada satker aktif"}</div>
          ) : (
            filtered.map((s) => (
              <div key={s.id} className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-800 break-words">{s.nama_satker || "-"}</p>
                <p className="text-xs text-slate-500 mt-1">Kode Satker: {s.kode_satker || "-"}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {new Date(s.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <div className="mt-3 inline-flex w-full rounded-lg border border-slate-200 overflow-hidden">
                  <button onClick={() => openDetail(s)} className="flex-1 py-1.5 text-xs text-slate-600 hover:bg-slate-50 transition-colors border-r border-slate-200">
                    Detail
                  </button>
                  <button onClick={() => openEdit(s)} className="flex-1 py-1.5 text-xs text-blue-600 hover:bg-blue-50 transition-colors">
                    Edit
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Modal Detail ─────────────────────────────────────────────────── */}
      {showDetail && selectedSatker && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-white rounded-t-2xl md:rounded-xl shadow-lg w-full md:max-w-2xl max-h-[92vh] flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-400">{selectedSatker.kode_satker}</p>
                  <h2 className="text-sm font-semibold text-slate-800 mt-0.5 leading-snug break-words">{selectedSatker.nama_satker}</h2>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setShowDetail(false);
                      openEdit(selectedSatker);
                    }}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-xs rounded-lg border border-emerald-200 transition-colors"
                  >
                    Edit
                  </button>
                  <button onClick={() => setShowDetail(false)} className="text-slate-300 hover:text-slate-600 text-xl leading-none transition-colors">
                    &times;
                  </button>
                </div>
              </div>
              {selectedProfil && (
                <div className="flex gap-1 mt-3">
                  {TABS.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${activeTab === tab.key ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="overflow-y-auto px-5 py-4 flex-1">
              {profilLoading ? (
                <div className="py-16 text-center text-sm text-slate-500">Memuat profil...</div>
              ) : !selectedProfil ? (
                <div className="py-16 text-center text-sm text-slate-500">Satker belum mengisi data profil.</div>
              ) : (
                <>
                  {activeTab === "kantor" && (
                    <div>
                      <InfoRow label="Alamat" value={selectedProfil.alamat} />
                      <InfoRow label="No. Telepon" value={selectedProfil.no_telp} />
                      <InfoRow label="Email" value={selectedProfil.email} />
                    </div>
                  )}
                  {activeTab === "pejabat" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <PejabatCard jabatan="KPA" nama={selectedProfil.nama_kpa} nip={selectedProfil.nip_kpa} hp={selectedProfil.hp_kpa} />
                      <PejabatCard jabatan="PPK 1" nama={selectedProfil.nama_ppk1} nip={selectedProfil.nip_ppk1} hp={selectedProfil.hp_ppk1} />
                      <PejabatCard jabatan="PPK 2" nama={selectedProfil.nama_ppk2} nip={selectedProfil.nip_ppk2} hp={selectedProfil.hp_ppk2} />
                      <PejabatCard jabatan="PPK 3" nama={selectedProfil.nama_ppk3} nip={selectedProfil.nip_ppk3} hp={selectedProfil.hp_ppk3} />
                      <PejabatCard jabatan="PPK 4" nama={selectedProfil.nama_ppk4} nip={selectedProfil.nip_ppk4} hp={selectedProfil.hp_ppk4} />
                      <PejabatCard jabatan="PPSPM" nama={selectedProfil.nama_ppspm} nip={selectedProfil.nip_ppspm} hp={selectedProfil.hp_ppspm} />
                      <PejabatCard jabatan="Bendahara Pengeluaran" nama={selectedProfil.nama_bendahara_pengeluaran} nip={selectedProfil.nip_bendahara_pengeluaran} hp={selectedProfil.hp_bendahara_pengeluaran} />
                      <PejabatCard jabatan="Bendahara Penerimaan" nama={selectedProfil.nama_bendahara_penerimaan} nip={selectedProfil.nip_bendahara_penerimaan} hp={selectedProfil.hp_bendahara_penerimaan} />
                      <PejabatCard jabatan="Bendahara Pembantu" nama={selectedProfil.nama_bendahara_pembantu} nip={selectedProfil.nip_bendahara_pembantu} hp={selectedProfil.hp_bendahara_pembantu} />
                    </div>
                  )}
                  {activeTab === "pic" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <PejabatCard jabatan="PIC/Operator 1" nama={selectedProfil.nama_pic1} hp={selectedProfil.hp_pic1} />
                      <PejabatCard jabatan="PIC/Operator 2" nama={selectedProfil.nama_pic2} hp={selectedProfil.hp_pic2} />
                      <PejabatCard jabatan="PIC/Operator 3" nama={selectedProfil.nama_pic3} hp={selectedProfil.hp_pic3} />
                      <PejabatCard jabatan="PIC/Operator 4" nama={selectedProfil.nama_pic4} hp={selectedProfil.hp_pic4} />
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="px-5 py-3 border-t border-slate-100">
              <button onClick={() => setShowDetail(false)} className="w-full py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Edit ───────────────────────────────────────────────────── */}
      {showEdit && editSatker && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-white rounded-t-2xl md:rounded-xl shadow-lg w-full md:max-w-2xl max-h-[92vh] flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-400">{editSatker.kode_satker}</p>
                  <h2 className="text-sm font-semibold text-slate-800 mt-0.5 leading-snug break-words">{editSatker.nama_satker}</h2>
                  <p className="text-xs text-emerald-600 mt-0.5 font-medium">Mode Edit</p>
                </div>
                <button onClick={() => setShowEdit(false)} className="shrink-0 text-slate-300 hover:text-slate-600 text-xl leading-none transition-colors">
                  &times;
                </button>
              </div>
              <div className="flex gap-1 mt-3">
                {TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setEditTab(tab.key)}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${editTab === tab.key ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-y-auto px-5 py-4 flex-1">
              {editLoading ? (
                <div className="py-16 text-center text-sm text-slate-500">Memuat data...</div>
              ) : (
                <>
                  {editTab === "kantor" && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Alamat Kantor</label>
                        <textarea
                          value={editForm.alamat}
                          onChange={(e) => setEditForm({ ...editForm, alamat: e.target.value })}
                          rows={3}
                          placeholder="Isi alamat kantor..."
                          className="w-full px-3 py-2 text-sm text-slate-800 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white transition-all resize-none"
                        />
                      </div>
                      <FormField label="No. Telepon Kantor" value={editForm.no_telp} onChange={(v) => setEditForm({ ...editForm, no_telp: v })} />
                      <FormField label="Email Kantor" value={editForm.email} onChange={(v) => setEditForm({ ...editForm, email: v })} />
                    </div>
                  )}
                  {editTab === "pejabat" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <PejabatFormGroup jabatan="KPA" prefix="kpa" form={editForm} setForm={setEditForm} />
                      <PejabatFormGroup jabatan="PPK 1" prefix="ppk1" form={editForm} setForm={setEditForm} />
                      <PejabatFormGroup jabatan="PPK 2" prefix="ppk2" form={editForm} setForm={setEditForm} />
                      <PejabatFormGroup jabatan="PPK 3" prefix="ppk3" form={editForm} setForm={setEditForm} />
                      <PejabatFormGroup jabatan="PPK 4" prefix="ppk4" form={editForm} setForm={setEditForm} />
                      <PejabatFormGroup jabatan="PPSPM" prefix="ppspm" form={editForm} setForm={setEditForm} />
                      <PejabatFormGroup jabatan="Bendahara Pengeluaran" prefix="bendahara_pengeluaran" form={editForm} setForm={setEditForm} />
                      <PejabatFormGroup jabatan="Bendahara Penerimaan" prefix="bendahara_penerimaan" form={editForm} setForm={setEditForm} />
                      <PejabatFormGroup jabatan="Bendahara Pembantu" prefix="bendahara_pembantu" form={editForm} setForm={setEditForm} />
                    </div>
                  )}
                  {editTab === "pic" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {([1, 2, 3, 4] as const).map((n) => (
                        <div key={n} className="p-3 rounded-lg border border-slate-100 bg-slate-50 space-y-2">
                          <p className="text-xs font-semibold text-slate-600">PIC/Operator {n}</p>
                          <FormField label="Nama" value={(editForm as any)[`nama_pic${n}`] || ""} onChange={(v) => setEditForm({ ...editForm, [`nama_pic${n}`]: v })} />
                          <FormField label="HP" value={(editForm as any)[`hp_pic${n}`] || ""} onChange={(v) => setEditForm({ ...editForm, [`hp_pic${n}`]: v })} />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="px-5 py-3 border-t border-slate-100 flex items-center gap-3">
              {saveMsg && <p className={`text-xs flex-1 ${saveMsg.startsWith("✓") ? "text-emerald-600" : "text-red-500"}`}>{saveMsg}</p>}
              <div className="flex gap-2 ml-auto">
                <button onClick={() => setShowEdit(false)} disabled={saving} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg transition-colors disabled:opacity-50">
                  Batal
                </button>
                <button onClick={handleSave} disabled={saving || editLoading} className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50">
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
