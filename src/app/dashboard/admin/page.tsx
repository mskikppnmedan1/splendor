"use client";

import { useState, useEffect, useRef } from "react";
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
  alamat: string; no_telp: string; email: string;
  nama_kpa: string; nip_kpa: string; hp_kpa: string;
  nama_ppk1: string; nip_ppk1: string; hp_ppk1: string;
  nama_ppk2: string; nip_ppk2: string; hp_ppk2: string;
  nama_ppk3: string; nip_ppk3: string; hp_ppk3: string;
  nama_ppk4: string; nip_ppk4: string; hp_ppk4: string;
  nama_ppspm: string; nip_ppspm: string; hp_ppspm: string;
  nama_bendahara: string; nip_bendahara: string; hp_bendahara: string;
  nama_bendahara_pengeluaran: string; nip_bendahara_pengeluaran: string; hp_bendahara_pengeluaran: string;
  nama_bendahara_penerimaan: string; nip_bendahara_penerimaan: string; hp_bendahara_penerimaan: string;
  nama_bendahara_pembantu: string; nip_bendahara_pembantu: string; hp_bendahara_pembantu: string;
  nama_pic1: string; hp_pic1: string;
  nama_pic2: string; hp_pic2: string;
  nama_pic3: string; hp_pic3: string;
  nama_pic4: string; hp_pic4: string;
};

type ImportProfilRow = {
  id: string;
  kode_satker: string;
  nama_satker: string;
  profil: Partial<ProfilSatker>;
  status: "pending" | "success" | "error" | "skip";
  error?: string;
};

// Kategori utama
type ImportKategori = "kantor" | "pejabat" | "pic";
// Sub-kategori pejabat
type ImportSubPejabat = "semua" | "kpa" | "ppk" | "ppspm" | "bendahara";

const emptyProfil: ProfilSatker = {
  alamat: "", no_telp: "", email: "",
  nama_kpa: "", nip_kpa: "", hp_kpa: "",
  nama_ppk1: "", nip_ppk1: "", hp_ppk1: "",
  nama_ppk2: "", nip_ppk2: "", hp_ppk2: "",
  nama_ppk3: "", nip_ppk3: "", hp_ppk3: "",
  nama_ppk4: "", nip_ppk4: "", hp_ppk4: "",
  nama_ppspm: "", nip_ppspm: "", hp_ppspm: "",
  nama_bendahara: "", nip_bendahara: "", hp_bendahara: "",
  nama_bendahara_pengeluaran: "", nip_bendahara_pengeluaran: "", hp_bendahara_pengeluaran: "",
  nama_bendahara_penerimaan: "", nip_bendahara_penerimaan: "", hp_bendahara_penerimaan: "",
  nama_bendahara_pembantu: "", nip_bendahara_pembantu: "", hp_bendahara_pembantu: "",
  nama_pic1: "", hp_pic1: "", nama_pic2: "", hp_pic2: "",
  nama_pic3: "", hp_pic3: "", nama_pic4: "", hp_pic4: "",
};

const HEADER_MAP_KANTOR: Record<string, keyof ProfilSatker> = {
  "ALAMAT LENGKAP KANTOR": "alamat",
  "NOMOR TELP KANTOR ": "no_telp",
  "NOMOR TELP KANTOR": "no_telp",
  "EMAIL KANTOR (RESMI MENGGUNAKAN .GO.ID)": "email",
  "EMAIL KANTOR": "email",
  "Alamat": "alamat",
  "No. Telp": "no_telp",
  "Email": "email",
};

const HEADER_MAP_KPA: Record<string, keyof ProfilSatker> = {
  "NAMA KPA": "nama_kpa", "NIP KPA": "nip_kpa", "HP KPA": "hp_kpa",
  "NIP/NRP": "nip_kpa",
  "Nama KPA": "nama_kpa", "NIP KPA (export)": "nip_kpa",
};

const HEADER_MAP_PPK: Record<string, keyof ProfilSatker> = {
  "NAMA PPK1": "nama_ppk1", "NIP PPK 1": "nip_ppk1", "HP PPK 1": "hp_ppk1",
  "NAMA PPK2": "nama_ppk2", "NIP PPK 2": "nip_ppk2", "HP PPK 2": "hp_ppk2",
  "NAMA PPK3": "nama_ppk3", "NIP PPK 3": "nip_ppk3", "HP PPK 3": "hp_ppk3",
  "NAMA PPK4": "nama_ppk4", "NIP PPK 4": "nip_ppk4", "HP PPK 4": "hp_ppk4",
  "Nama PPK 1": "nama_ppk1", "NIP PPK 1 ": "nip_ppk1", "HP PPK 1 ": "hp_ppk1",
  "Nama PPK 2": "nama_ppk2", "NIP PPK 2 ": "nip_ppk2", "HP PPK 2 ": "hp_ppk2",
  "Nama PPK 3": "nama_ppk3", "NIP PPK 3 ": "nip_ppk3", "HP PPK 3 ": "hp_ppk3",
  "Nama PPK 4": "nama_ppk4", "NIP PPK 4 ": "nip_ppk4", "HP PPK 4 ": "hp_ppk4",
};

const HEADER_MAP_PPSPM: Record<string, keyof ProfilSatker> = {
  "NAMA PPSPM": "nama_ppspm", "NIP/NRP5": "nip_ppspm", "HP PPSPM": "hp_ppspm",
  "Nama PPSPM": "nama_ppspm", "NIP PPSPM": "nip_ppspm",
};

const HEADER_MAP_BENDAHARA: Record<string, keyof ProfilSatker> = {
  "NAMA BENDAHARA PENGELUARAN": "nama_bendahara_pengeluaran",
  "NIP/NRP6": "nip_bendahara_pengeluaran",
  "HP Bendahara Pengeluaran": "hp_bendahara_pengeluaran",
  "Nama Bendahara Pengeluaran": "nama_bendahara_pengeluaran",
  "NIP Bendahara Pengeluaran": "nip_bendahara_pengeluaran",
  "NAMA BENDAHARA PENERIMAAN": "nama_bendahara_penerimaan",
  "NIP/NRP7": "nip_bendahara_penerimaan",
  "HP Bendahara Penerimaan": "hp_bendahara_penerimaan",
  "Nama Bendahara Penerimaan": "nama_bendahara_penerimaan",
  "NIP Bendahara Penerimaan": "nip_bendahara_penerimaan",
  "NAMA BENDAHARA PENGELUARAN PEMBANTU": "nama_bendahara_pembantu",
  "NIP/NRP8": "nip_bendahara_pembantu",
  "HP Bendahara Pembantu": "hp_bendahara_pembantu",
  "Nama Bendahara Pembantu": "nama_bendahara_pembantu",
  "NIP Bendahara Pembantu": "nip_bendahara_pembantu",
};

const HEADER_MAP_PIC: Record<string, keyof ProfilSatker> = {
  "NAMA PIC/OPERATOR 1": "nama_pic1", "NOMOR HP": "hp_pic1",
  "NAMA PIC/OPERATOR 2": "nama_pic2", "NOMOR HP9": "hp_pic2",
  "NAMA PIC/OPERATOR 3": "nama_pic3", "NOMOR HP10": "hp_pic3",
  "NAMA PIC/OPERATOR 4": "nama_pic4", "NOMOR HP11": "hp_pic4",
  "Nama PIC 1": "nama_pic1", "HP PIC 1": "hp_pic1",
  "Nama PIC 2": "nama_pic2", "HP PIC 2": "hp_pic2",
  "Nama PIC 3": "nama_pic3", "HP PIC 3": "hp_pic3",
  "Nama PIC 4": "nama_pic4", "HP PIC 4": "hp_pic4",
};

const COL_KODE_OPTIONS = ["KODE S", "Kode Satker"];
const COL_NAMA_OPTIONS = [
  "KER - NAMA SATKER (SUDAH DIURUTKAN BERDASARKAN KODE SATKER)",
  "Nama Satker",
];

// Config kategori utama
const IMPORT_KATEGORI_CONFIG = {
  kantor: {
    label: "Profil Kantor",
    desc: "Alamat, nomor telepon, dan email kantor",
    headerMap: HEADER_MAP_KANTOR,
    color: "blue",
    exportCols: ["Nama Satker", "Kode Satker", "Alamat", "No. Telp", "Email"],
    hasSub: false,
  },
  pejabat: {
    label: "Pejabat Perbendaharaan",
    desc: "KPA, PPK, PPSPM, Bendahara",
    headerMap: {} as Record<string, keyof ProfilSatker>, // ditentukan oleh sub
    color: "violet",
    exportCols: [] as string[],
    hasSub: true,
  },
  pic: {
    label: "PIC / Operator",
    desc: "Nama dan nomor HP PIC/Operator 1–4",
    headerMap: HEADER_MAP_PIC,
    color: "emerald",
    exportCols: ["Nama Satker", "Kode Satker",
      "Nama PIC 1", "HP PIC 1",
      "Nama PIC 2", "HP PIC 2",
      "Nama PIC 3", "HP PIC 3",
      "Nama PIC 4", "HP PIC 4",
    ],
    hasSub: false,
  },
} as const;

// Config sub-kategori pejabat
const SUB_PEJABAT_CONFIG: Record<ImportSubPejabat, {
  label: string;
  desc: string;
  headerMap: Record<string, keyof ProfilSatker>;
  exportCols: string[];
  icon: string;
}> = {
  semua: {
    label: "Semua Pejabat",
    desc: "KPA, PPK, PPSPM, dan semua Bendahara",
    headerMap: { ...HEADER_MAP_KPA, ...HEADER_MAP_PPK, ...HEADER_MAP_PPSPM, ...HEADER_MAP_BENDAHARA },
    exportCols: ["Nama Satker", "Kode Satker",
      "Nama KPA", "NIP KPA", "HP KPA",
      "Nama PPK 1", "NIP PPK 1", "HP PPK 1",
      "Nama PPK 2", "NIP PPK 2", "HP PPK 2",
      "Nama PPK 3", "NIP PPK 3", "HP PPK 3",
      "Nama PPK 4", "NIP PPK 4", "HP PPK 4",
      "Nama PPSPM", "NIP PPSPM", "HP PPSPM",
      "Nama Bendahara Pengeluaran", "NIP Bendahara Pengeluaran", "HP Bendahara Pengeluaran",
      "Nama Bendahara Penerimaan", "NIP Bendahara Penerimaan", "HP Bendahara Penerimaan",
      "Nama Bendahara Pembantu", "NIP Bendahara Pembantu", "HP Bendahara Pembantu",
    ],
    icon: "📂",
  },
  kpa: {
    label: "KPA",
    desc: "Kuasa Pengguna Anggaran",
    headerMap: HEADER_MAP_KPA,
    exportCols: ["Nama Satker", "Kode Satker", "Nama KPA", "NIP KPA", "HP KPA"],
    icon: "🏛️",
  },
  ppk: {
    label: "PPK",
    desc: "Pejabat Pembuat Komitmen (1–4)",
    headerMap: HEADER_MAP_PPK,
    exportCols: ["Nama Satker", "Kode Satker",
      "Nama PPK 1", "NIP PPK 1", "HP PPK 1",
      "Nama PPK 2", "NIP PPK 2", "HP PPK 2",
      "Nama PPK 3", "NIP PPK 3", "HP PPK 3",
      "Nama PPK 4", "NIP PPK 4", "HP PPK 4",
    ],
    icon: "📋",
  },
  ppspm: {
    label: "PPSPM",
    desc: "Pejabat Penanda Tangan SPM",
    headerMap: HEADER_MAP_PPSPM,
    exportCols: ["Nama Satker", "Kode Satker", "Nama PPSPM", "NIP PPSPM", "HP PPSPM"],
    icon: "✍️",
  },
  bendahara: {
    label: "Bendahara",
    desc: "Bendahara Pengeluaran, Penerimaan, dan Pembantu",
    headerMap: HEADER_MAP_BENDAHARA,
    exportCols: ["Nama Satker", "Kode Satker",
      "Nama Bendahara Pengeluaran", "NIP Bendahara Pengeluaran", "HP Bendahara Pengeluaran",
      "Nama Bendahara Penerimaan", "NIP Bendahara Penerimaan", "HP Bendahara Penerimaan",
      "Nama Bendahara Pembantu", "NIP Bendahara Pembantu", "HP Bendahara Pembantu",
    ],
    icon: "💰",
  },
};

const NAV_ITEMS = [
  { label: "Data Satker", href: "/dashboard/admin" },
  { label: "Kelola User", href: "/dashboard/admin/kelola" },
];

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
        {nip && <div className="flex items-center gap-1.5"><span className="text-xs text-slate-400">NIP</span><span className="text-xs text-slate-700">{nip}</span></div>}
        {hp && <div className="flex items-center gap-1.5"><span className="text-xs text-slate-400">HP</span><span className="text-xs text-slate-700">{hp}</span></div>}
      </div>
    ) : <p className="text-xs text-slate-300 italic">Belum diisi</p>}
  </div>
);

const FormField = ({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <div>
    <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
    <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || `Isi ${label.toLowerCase()}...`}
      className="w-full px-3 py-2 text-sm text-slate-800 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white transition-all" />
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

export default function DashboardAdmin() {
  const [satkerList, setSatkerList] = useState<Satker[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [exporting, setExporting] = useState(false);

  const [showDetail, setShowDetail] = useState(false);
  const [selectedSatker, setSelectedSatker] = useState<Satker | null>(null);
  const [selectedProfil, setSelectedProfil] = useState<ProfilSatker | null>(null);
  const [profilLoading, setProfilLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"kantor" | "pejabat" | "pic">("kantor");

  const [showEdit, setShowEdit] = useState(false);
  const [editSatker, setEditSatker] = useState<Satker | null>(null);
  const [editForm, setEditForm] = useState<ProfilSatker>(emptyProfil);
  const [editLoading, setEditLoading] = useState(false);
  const [editTab, setEditTab] = useState<"kantor" | "pejabat" | "pic">("kantor");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const [showImport, setShowImport] = useState(false);
  const [importKategori, setImportKategori] = useState<ImportKategori | null>(null);
  const [importSubPejabat, setImportSubPejabat] = useState<ImportSubPejabat | null>(null);
  const [importRows, setImportRows] = useState<ImportProfilRow[]>([]);
  const [importLoading, setImportLoading] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importDone, setImportDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setSelectedSatker(satker); setSelectedProfil(null); setShowDetail(true); setActiveTab("kantor"); setProfilLoading(true);
    const res = await fetch(`/api/satker/profil?id=${satker.id}`);
    if (res.ok) { const data = await res.json(); setSelectedProfil(data.profil); }
    setProfilLoading(false);
  };

  const openEdit = async (satker: Satker) => {
    setEditSatker(satker); setEditForm(emptyProfil); setShowEdit(true); setEditTab("kantor"); setSaveMsg(""); setEditLoading(true);
    const res = await fetch(`/api/satker/profil?id=${satker.id}`);
    if (res.ok) { const data = await res.json(); setEditForm({ ...emptyProfil, ...(data.profil || {}) }); }
    setEditLoading(false);
  };

  const handleSave = async () => {
    if (!editSatker) return;
    setSaving(true); setSaveMsg("");
    const res = await fetch("/api/satker", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editSatker.id, profil: editForm }),
    });
    if (res.ok) {
      setSaveMsg("✓ Data berhasil disimpan");
      if (selectedSatker?.id === editSatker.id) setSelectedProfil({ ...editForm });
      setTimeout(() => { setSaveMsg(""); setShowEdit(false); }, 1500);
    } else { setSaveMsg("✗ Gagal menyimpan. Coba lagi."); }
    setSaving(false);
  };

  // Export template kosong — hanya header + nama/kode satker, kolom data dikosongkan
  const handleExportTemplate = (colsFilter: string[]) => {
    const rows = satkerList.map((s) => {
      const row: Record<string, any> = {};
      colsFilter.forEach(k => {
        if (k === "Nama Satker") row[k] = s.nama_satker;
        else if (k === "Kode Satker") row[k] = s.kode_satker;
        else row[k] = "";
      });
      return row;
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Satker");
    const suffix = `_template_${importSubPejabat || importKategori || "all"}`;
    XLSX.writeFile(wb, `Data_Satker_KPPN_Medan_I${suffix}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleExport = async (colsFilter?: string[]) => {
    setExporting(true);
    const rows = await Promise.all(satkerList.map(async (s) => {
      const res = await fetch(`/api/satker/profil?id=${s.id}`);
      const data = res.ok ? await res.json() : {};
      const p: ProfilSatker = { ...emptyProfil, ...(data.profil || {}) };
      const full: Record<string, any> = {
        "Nama Satker": s.nama_satker, "Kode Satker": s.kode_satker,
        "Tanggal Daftar": new Date(s.created_at).toLocaleDateString("id-ID"),
        "Alamat": p.alamat, "No. Telp": p.no_telp, "Email": p.email,
        "Nama KPA": p.nama_kpa, "NIP KPA": p.nip_kpa, "HP KPA": p.hp_kpa,
        "Nama PPK 1": p.nama_ppk1, "NIP PPK 1": p.nip_ppk1, "HP PPK 1": p.hp_ppk1,
        "Nama PPK 2": p.nama_ppk2, "NIP PPK 2": p.nip_ppk2, "HP PPK 2": p.hp_ppk2,
        "Nama PPK 3": p.nama_ppk3, "NIP PPK 3": p.nip_ppk3, "HP PPK 3": p.hp_ppk3,
        "Nama PPK 4": p.nama_ppk4, "NIP PPK 4": p.nip_ppk4, "HP PPK 4": p.hp_ppk4,
        "Nama PPSPM": p.nama_ppspm, "NIP PPSPM": p.nip_ppspm, "HP PPSPM": p.hp_ppspm,
        "Nama Bendahara": p.nama_bendahara, "NIP Bendahara": p.nip_bendahara, "HP Bendahara": p.hp_bendahara,
        "Nama Bendahara Pengeluaran": p.nama_bendahara_pengeluaran, "NIP Bendahara Pengeluaran": p.nip_bendahara_pengeluaran, "HP Bendahara Pengeluaran": p.hp_bendahara_pengeluaran,
        "Nama Bendahara Penerimaan": p.nama_bendahara_penerimaan, "NIP Bendahara Penerimaan": p.nip_bendahara_penerimaan, "HP Bendahara Penerimaan": p.hp_bendahara_penerimaan,
        "Nama Bendahara Pembantu": p.nama_bendahara_pembantu, "NIP Bendahara Pembantu": p.nip_bendahara_pembantu, "HP Bendahara Pembantu": p.hp_bendahara_pembantu,
        "Nama PIC 1": p.nama_pic1, "HP PIC 1": p.hp_pic1,
        "Nama PIC 2": p.nama_pic2, "HP PIC 2": p.hp_pic2,
        "Nama PIC 3": p.nama_pic3, "HP PIC 3": p.hp_pic3,
        "Nama PIC 4": p.nama_pic4, "HP PIC 4": p.hp_pic4,
      };
      if (colsFilter) {
        const filtered: Record<string, any> = {};
        colsFilter.forEach(k => { filtered[k] = full[k] ?? ""; });
        return filtered;
      }
      return full;
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Satker");
    const suffix = colsFilter ? `_${importSubPejabat || importKategori || "all"}` : "";
    XLSX.writeFile(wb, `Data_Satker_KPPN_Medan_I${suffix}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    setExporting(false);
  };

  const openImport = () => {
    setImportKategori(null);
    setImportSubPejabat(null);
    setImportRows([]);
    setImportProgress(0);
    setImportDone(false);
    setShowImport(true);
  };

  // Ambil headerMap dan exportCols aktif berdasarkan state
  const getActiveConfig = (): { headerMap: Record<string, keyof ProfilSatker>; exportCols: string[]; label: string } | null => {
    if (!importKategori) return null;
    if (importKategori === "pejabat") {
      if (!importSubPejabat) return null;
      const sub = SUB_PEJABAT_CONFIG[importSubPejabat];
      return { headerMap: sub.headerMap, exportCols: sub.exportCols, label: sub.label };
    }
    const cfg = IMPORT_KATEGORI_CONFIG[importKategori];
    return { headerMap: cfg.headerMap as Record<string, keyof ProfilSatker>, exportCols: [...cfg.exportCols], label: cfg.label };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const activeConfig = getActiveConfig();
    if (!activeConfig) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      const wb = XLSX.read(data, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(ws, { defval: "" });
      const satkerByKode = new Map(satkerList.map((s) => [String(s.kode_satker).trim(), s]));
      const { headerMap } = activeConfig;

      const toStr = (val: any): string => {
        if (!val && val !== 0) return "";
        const s = String(val).trim();
        if (!s || s === "-") return "";
        if (s.includes("e") || s.includes("E")) {
          const num = Number(s);
          if (!isFinite(num) || isNaN(num)) return s;
          return Math.round(num).toString();
        }
        return s;
      };

      const parsed: ImportProfilRow[] = rawRows.map((row) => {
        const kode = COL_KODE_OPTIONS.map(k => toStr(row[k])).find(v => v) || "";
        const nama = COL_NAMA_OPTIONS.map(k => toStr(row[k])).find(v => v) || "";

        if (!kode) return { id: "", kode_satker: kode, nama_satker: nama, profil: {}, status: "skip" as const, error: "Kode kosong" };
        const satker = satkerByKode.get(kode);
        if (!satker) return { id: "", kode_satker: kode, nama_satker: nama, profil: {}, status: "skip" as const, error: "Kode tidak terdaftar" };

        const profil: Partial<ProfilSatker> = {};
        for (const [header, field] of Object.entries(headerMap)) {
          const val = toStr(row[header]);
          if (val) (profil as any)[field] = val;
        }
        if (Object.keys(profil).length === 0) {
          return { id: satker.id, kode_satker: kode, nama_satker: satker.nama_satker, profil, status: "skip" as const, error: "Tidak ada data" };
        }
        return { id: satker.id, kode_satker: kode, nama_satker: satker.nama_satker, profil, status: "pending" as const };
      });

      setImportRows(parsed); setImportProgress(0); setImportDone(false);
    };
    reader.readAsBinaryString(file);
    e.target.value = "";
  };

  const handleImport = async () => {
    const toProcess = importRows.filter((r) => r.status === "pending");
    if (toProcess.length === 0) return;
    setImportLoading(true);
    let done = 0;
    const updated = [...importRows];
    for (let i = 0; i < updated.length; i++) {
      if (updated[i].status !== "pending") continue;
      const res = await fetch("/api/satker", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: updated[i].id, profil: updated[i].profil }),
      });
      if (res.ok) { updated[i] = { ...updated[i], status: "success" }; }
      else { const data = await res.json(); updated[i] = { ...updated[i], status: "error", error: data.error || "Gagal" }; }
      done++;
      setImportProgress(Math.round((done / toProcess.length) * 100));
      setImportRows([...updated]);
    }
    setImportDone(true); setImportLoading(false); fetchSatker();
  };

  const pendingCount = importRows.filter((r) => r.status === "pending").length;
  const successCount = importRows.filter((r) => r.status === "success").length;
  const skipCount = importRows.filter((r) => r.status === "skip").length;
  const errorCount = importRows.filter((r) => r.status === "error").length;

  const filtered = satkerList.filter(
    (s) => s.nama_satker?.toLowerCase().includes(search.toLowerCase()) || s.kode_satker?.toLowerCase().includes(search.toLowerCase())
  );

  const TABS = [
    { key: "kantor", label: "Profil Kantor" },
    { key: "pejabat", label: "Pejabat" },
    { key: "pic", label: "PIC / Operator" },
  ] as const;

  const activeConfig = getActiveConfig();

  // Tentukan "breadcrumb" judul modal import
  const getImportTitle = () => {
    if (!importKategori) return null;
    if (importKategori === "pejabat" && importSubPejabat) {
      return `Pejabat › ${SUB_PEJABAT_CONFIG[importSubPejabat].label}`;
    }
    if (importKategori === "pejabat") return "Pejabat Perbendaharaan";
    return IMPORT_KATEGORI_CONFIG[importKategori].label;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header nama="Sarana Penyelesaian Dokumen Organisasi" sub="KPPN Medan I" userLabel="Administrator" userRole="KPPN" onLogout={handleLogout} navItems={NAV_ITEMS} />

      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        <h1 className="text-lg md:text-xl font-bold text-slate-800">Data Satker</h1>
        <p className="text-sm text-slate-500 mt-1">Daftar data profil satuan kerja</p>

        <div className="mt-4 md:mt-6 flex flex-wrap items-center gap-2 md:gap-3">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama atau kode satker..."
              className="w-full pl-9 pr-4 py-2 text-sm text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all bg-white" />
          </div>
          {search && <button onClick={() => setSearch("")} className="text-xs text-slate-500 hover:text-slate-700 shrink-0">Reset</button>}
          <p className="text-xs text-slate-500 shrink-0">{filtered.length} ditemukan</p>
          <button onClick={openImport}
            className="shrink-0 px-3 py-2 bg-white border border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 text-slate-600 text-xs rounded-lg transition-colors flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Import Excel
          </button>
          <button onClick={() => handleExport()} disabled={exporting || loading}
            className="shrink-0 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs rounded-lg transition-colors disabled:opacity-50">
            {exporting ? "Mengekspor..." : "↓ Export Excel"}
          </button>
        </div>

        {/* Table desktop */}
        <div className="mt-3 bg-white rounded-xl border border-slate-200 overflow-hidden hidden md:block">
          {loading ? <div className="p-8 text-center text-sm text-slate-500">Memuat data...</div>
            : filtered.length === 0 ? <div className="p-8 text-center text-sm text-slate-500">{search ? `Tidak ada satker dengan kata kunci "${search}"` : "Belum ada satker aktif"}</div>
            : (
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
                      <td className="px-4 py-3 text-slate-500 text-xs" suppressHydrationWarning>
                        {s.updated_at ? new Date(s.updated_at).toLocaleString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : <span className="text-slate-300 italic">Belum diisi</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="inline-flex rounded-lg border border-slate-200 overflow-hidden">
                          <button onClick={() => openDetail(s)} className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 transition-colors border-r border-slate-200">Detail</button>
                          <button onClick={() => openEdit(s)} className="px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50 transition-colors">Edit</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </div>

        {/* Card mobile */}
        <div className="mt-3 space-y-2 md:hidden">
          {loading ? <div className="p-8 text-center text-sm text-slate-500">Memuat data...</div>
            : filtered.length === 0 ? <div className="p-8 text-center text-sm text-slate-500">{search ? `Tidak ada satker` : "Belum ada satker aktif"}</div>
            : filtered.map((s) => (
              <div key={s.id} className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-800 break-words">{s.nama_satker || "-"}</p>
                <p className="text-xs text-slate-500 mt-1">Kode Satker: {s.kode_satker || "-"}</p>
                <p className="text-xs text-slate-400 mt-0.5" suppressHydrationWarning>{new Date(s.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
                <div className="mt-3 inline-flex w-full rounded-lg border border-slate-200 overflow-hidden">
                  <button onClick={() => openDetail(s)} className="flex-1 py-1.5 text-xs text-slate-600 hover:bg-slate-50 transition-colors border-r border-slate-200">Detail</button>
                  <button onClick={() => openEdit(s)} className="flex-1 py-1.5 text-xs text-blue-600 hover:bg-blue-50 transition-colors">Edit</button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Modal Detail */}
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
                  <button onClick={() => { setShowDetail(false); openEdit(selectedSatker); }} className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-xs rounded-lg border border-emerald-200 transition-colors">Edit</button>
                  <button onClick={() => setShowDetail(false)} className="text-slate-300 hover:text-slate-600 text-xl leading-none transition-colors">&times;</button>
                </div>
              </div>
              {selectedProfil && (
                <div className="flex gap-1 mt-3">
                  {TABS.map((tab) => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                      className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${activeTab === tab.key ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="overflow-y-auto px-5 py-4 flex-1">
              {profilLoading ? <div className="py-16 text-center text-sm text-slate-500">Memuat profil...</div>
                : !selectedProfil ? <div className="py-16 text-center text-sm text-slate-500">Satker belum mengisi data profil.</div>
                : (
                  <>
                    {activeTab === "kantor" && <div><InfoRow label="Alamat" value={selectedProfil.alamat} /><InfoRow label="No. Telepon" value={selectedProfil.no_telp} /><InfoRow label="Email" value={selectedProfil.email} /></div>}
                    {activeTab === "pejabat" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <PejabatCard jabatan="KPA" nama={selectedProfil.nama_kpa} nip={selectedProfil.nip_kpa} hp={selectedProfil.hp_kpa} />
                        <PejabatCard jabatan="PPK 1" nama={selectedProfil.nama_ppk1} nip={selectedProfil.nip_ppk1} hp={selectedProfil.hp_ppk1} />
                        <PejabatCard jabatan="PPK 2" nama={selectedProfil.nama_ppk2} nip={selectedProfil.nip_ppk2} hp={selectedProfil.hp_ppk2} />
                        <PejabatCard jabatan="PPK 3" nama={selectedProfil.nama_ppk3} nip={selectedProfil.nip_ppk3} hp={selectedProfil.hp_ppk3} />
                        <PejabatCard jabatan="PPK 4" nama={selectedProfil.nama_ppk4} nip={selectedProfil.nip_ppk4} hp={selectedProfil.hp_ppk4} />
                        <PejabatCard jabatan="PPSPM" nama={selectedProfil.nama_ppspm} nip={selectedProfil.nip_ppspm} hp={selectedProfil.hp_ppspm} />
                        <PejabatCard jabatan="Bendahara" nama={selectedProfil.nama_bendahara} nip={selectedProfil.nip_bendahara} hp={selectedProfil.hp_bendahara} />
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
              <button onClick={() => setShowDetail(false)} className="w-full py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit */}
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
                <button onClick={() => setShowEdit(false)} className="shrink-0 text-slate-300 hover:text-slate-600 text-xl leading-none transition-colors">&times;</button>
              </div>
              <div className="flex gap-1 mt-3">
                {TABS.map((tab) => (
                  <button key={tab.key} onClick={() => setEditTab(tab.key)}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${editTab === tab.key ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-y-auto px-5 py-4 flex-1">
              {editLoading ? <div className="py-16 text-center text-sm text-slate-500">Memuat data...</div> : (
                <>
                  {editTab === "kantor" && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Alamat Kantor</label>
                        <textarea value={editForm.alamat} onChange={(e) => setEditForm({ ...editForm, alamat: e.target.value })} rows={3}
                          className="w-full px-3 py-2 text-sm text-slate-800 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white transition-all resize-none" />
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
                      <PejabatFormGroup jabatan="Bendahara" prefix="bendahara" form={editForm} setForm={setEditForm} />
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
                <button onClick={() => setShowEdit(false)} disabled={saving} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg transition-colors disabled:opacity-50">Batal</button>
                <button onClick={handleSave} disabled={saving || editLoading} className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50">
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Import Excel */}
      {showImport && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-white rounded-t-2xl md:rounded-2xl shadow-xl w-full md:max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h2 className="text-sm font-bold text-slate-800">Import Data Profil dari Excel</h2>
              <button onClick={() => setShowImport(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
            </div>

            <div className="px-6 py-5 space-y-4">

              {/* STEP 1 — Pilih kategori utama */}
              {!importKategori && (
                <>
                  <p className="text-xs text-slate-500">Pilih kategori data yang ingin diimport:</p>
                  <div className="grid grid-cols-1 gap-3">
                    {/* Profil Kantor */}
                    <button onClick={() => { setImportKategori("kantor"); setImportSubPejabat(null); setImportRows([]); setImportDone(false); }}
                      className="flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left group">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-blue-100">
                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">Profil Kantor</p>
                        <p className="text-xs text-slate-500 mt-0.5">Alamat, nomor telepon, dan email kantor</p>
                      </div>
                      <svg className="w-4 h-4 text-slate-300 group-hover:text-blue-400 ml-auto shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    {/* Pejabat Perbendaharaan — tidak langsung upload, masuk ke sub */}
                    <button onClick={() => { setImportKategori("pejabat"); setImportSubPejabat(null); setImportRows([]); setImportDone(false); }}
                      className="flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 hover:border-violet-300 hover:bg-violet-50 transition-all text-left group">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-violet-100">
                        <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">Pejabat Perbendaharaan</p>
                        <p className="text-xs text-slate-500 mt-0.5">KPA, PPK, PPSPM, Bendahara</p>
                      </div>
                      <div className="ml-auto flex items-center gap-1.5 shrink-0">
                        <span className="text-xs text-violet-400 font-medium hidden sm:block">Pilih jabatan</span>
                        <svg className="w-4 h-4 text-slate-300 group-hover:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>

                    {/* PIC / Operator */}
                    <button onClick={() => { setImportKategori("pic"); setImportSubPejabat(null); setImportRows([]); setImportDone(false); }}
                      className="flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all text-left group">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-emerald-100">
                        <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">PIC / Operator</p>
                        <p className="text-xs text-slate-500 mt-0.5">Nama dan nomor HP PIC/Operator 1–4</p>
                      </div>
                      <svg className="w-4 h-4 text-slate-300 group-hover:text-emerald-400 ml-auto shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </>
              )}

              {/* STEP 2 — Pilih sub-kategori pejabat */}
              {importKategori === "pejabat" && !importSubPejabat && (
                <>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setImportKategori(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <p className="text-sm font-semibold text-slate-700">Pilih Jabatan</p>
                  </div>

                  <p className="text-xs text-slate-500">Pilih jabatan yang ingin diimport datanya:</p>

                  <div className="grid grid-cols-1 gap-2.5">
                    {(Object.entries(SUB_PEJABAT_CONFIG) as [ImportSubPejabat, typeof SUB_PEJABAT_CONFIG[ImportSubPejabat]][]).map(([key, cfg]) => (
                      <button key={key} onClick={() => { setImportSubPejabat(key); setImportRows([]); setImportDone(false); }}
                        className="flex items-center gap-3 p-3.5 rounded-xl border-2 border-slate-200 hover:border-violet-300 hover:bg-violet-50 transition-all text-left group">
                        <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center shrink-0 text-base">
                          {cfg.icon}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{cfg.label}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{cfg.desc}</p>
                        </div>
                        <svg className="w-4 h-4 text-slate-300 group-hover:text-violet-400 ml-auto shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* STEP 3 — Upload file (untuk kantor, pic, dan pejabat+sub) */}
              {activeConfig && (
                <>
                  {/* Breadcrumb + back button */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (importKategori === "pejabat" && importSubPejabat) {
                          setImportSubPejabat(null); setImportRows([]); setImportDone(false);
                        } else {
                          setImportKategori(null); setImportSubPejabat(null); setImportRows([]); setImportDone(false);
                        }
                      }}
                      className="text-slate-400 hover:text-slate-600 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      {importKategori === "pejabat" && importSubPejabat ? (
                        <>
                          <span>Pejabat Perbendaharaan</span>
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                          <span className="font-semibold text-slate-700">{SUB_PEJABAT_CONFIG[importSubPejabat].label}</span>
                        </>
                      ) : (
                        <span className="font-semibold text-slate-700">{activeConfig.label}</span>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                    <svg className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs text-blue-700">
                      Data dicocokkan berdasarkan <strong>Kode Satker</strong>. Gunakan tombol <strong>Export Template</strong> untuk download file contoh dengan kolom yang sesuai.
                    </p>
                  </div>

                  {/* Upload area */}
                  <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-5 text-center">
                    <p className="text-sm font-medium text-slate-600 mb-1">Upload file Excel</p>
                    <p className="text-xs text-slate-400 mb-3">Kolom: Kode Satker + data <strong>{activeConfig.label}</strong></p>
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="hidden" />
                      <button onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-white border border-slate-200 hover:border-blue-300 text-slate-600 hover:text-blue-600 text-sm rounded-lg transition-colors">
                        Pilih File Excel
                      </button>
                      <button onClick={() => handleExportTemplate(activeConfig.exportCols)} disabled={exporting}
                        className="px-4 py-2 bg-white border border-slate-200 hover:border-emerald-300 text-slate-500 hover:text-emerald-600 text-sm rounded-lg transition-colors flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export Template
                      </button>
                    </div>
                  </div>

                  {importRows.length > 0 && (
                    <>
                      <div className="grid grid-cols-4 gap-2">
                        <div className="bg-blue-50 rounded-lg p-3 text-center"><p className="text-lg font-bold text-blue-600">{pendingCount}</p><p className="text-xs text-blue-400">Akan diupdate</p></div>
                        <div className="bg-green-50 rounded-lg p-3 text-center"><p className="text-lg font-bold text-green-600">{successCount}</p><p className="text-xs text-green-400">Berhasil</p></div>
                        <div className="bg-amber-50 rounded-lg p-3 text-center"><p className="text-lg font-bold text-amber-600">{skipCount}</p><p className="text-xs text-amber-400">Dilewati</p></div>
                        <div className="bg-rose-50 rounded-lg p-3 text-center"><p className="text-lg font-bold text-rose-600">{errorCount}</p><p className="text-xs text-rose-400">Error</p></div>
                      </div>

                      {importLoading && (
                        <div>
                          <div className="flex justify-between text-xs text-slate-500 mb-1"><span>Mengimport...</span><span>{importProgress}%</span></div>
                          <div className="w-full bg-slate-100 rounded-full h-2">
                            <div className="bg-emerald-500 h-2 rounded-full transition-all duration-300" style={{ width: `${importProgress}%` }} />
                          </div>
                        </div>
                      )}

                      <div className="border border-slate-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                        <table className="w-full text-xs">
                          <thead className="bg-slate-50 border-b border-slate-100 sticky top-0">
                            <tr>
                              <th className="text-left px-3 py-2 text-slate-500 font-medium">Kode</th>
                              <th className="text-left px-3 py-2 text-slate-500 font-medium">Nama Satker</th>
                              <th className="text-left px-3 py-2 text-slate-500 font-medium">Field Terisi</th>
                              <th className="text-left px-3 py-2 text-slate-500 font-medium">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {importRows.map((row, i) => (
                              <tr key={i} className="hover:bg-slate-50">
                                <td className="px-3 py-2 text-slate-600 font-mono">{row.kode_satker || "-"}</td>
                                <td className="px-3 py-2 text-slate-700 max-w-[180px] truncate" title={row.nama_satker}>{row.nama_satker || "-"}</td>
                                <td className="px-3 py-2 text-slate-500">{Object.keys(row.profil).length} kolom</td>
                                <td className="px-3 py-2">
                                  {row.status === "pending" && <span className="text-slate-400">Menunggu</span>}
                                  {row.status === "success" && <span className="text-green-600 font-medium">✓ Berhasil</span>}
                                  {row.status === "skip" && <span className="text-amber-500">— {row.error}</span>}
                                  {row.status === "error" && <span className="text-rose-500">✗ {row.error}</span>}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {!importDone ? (
                        <button onClick={handleImport} disabled={importLoading || pendingCount === 0}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
                          {importLoading ? `Mengimport... ${importProgress}%` : `Update ${pendingCount} Data Satker`}
                        </button>
                      ) : (
                        <div className="text-center">
                          <p className="text-sm text-green-600 font-medium mb-3">✓ Import selesai! {successCount} data berhasil diperbarui.</p>
                          <button onClick={() => setShowImport(false)} className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm rounded-lg transition-colors">Tutup</button>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}