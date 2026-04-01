"use client";

import { useState, useEffect } from "react";
import Header from "@/components/header";
import ModalAkun from "@/components/modal-akun";

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
  nama_bendahara: string;
  nip_bendahara: string;
  hp_bendahara: string;
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

const empty: ProfilSatker = {
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
  nama_bendahara: "",
  nip_bendahara: "",
  hp_bendahara: "",
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

const inputCls =
  "mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500";

const Field = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs text-slate-700">{label}</p>
    <p className="text-sm text-slate-800 font-semibold mt-0.5 break-words">
      {value || <span className="text-slate-700 font-normal">Belum diisi</span>}
    </p>
  </div>
);

const Input = ({
  label,
  field,
  required,
  type,
  form,
  setForm,
}: {
  label: string;
  field: keyof ProfilSatker;
  required?: boolean;
  type?: string;
  form: ProfilSatker;
  setForm: React.Dispatch<React.SetStateAction<ProfilSatker>>;
}) => (
  <div>
    <label className="text-xs font-medium text-slate-600">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    <input
      type={type || "text"}
      value={form[field]}
      onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
      className={inputCls}
    />
  </div>
);

const PejabatGroup = ({
  label,
  namaField,
  nipField,
  hpField,
  required,
  form,
  setForm,
}: {
  label: string;
  namaField: keyof ProfilSatker;
  nipField: keyof ProfilSatker;
  hpField: keyof ProfilSatker;
  required?: boolean;
  form: ProfilSatker;
  setForm: React.Dispatch<React.SetStateAction<ProfilSatker>>;
}) => (
  <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3 py-4 border-b border-slate-100 last:border-0 last:pb-0 first:pt-0">
    <div className="sm:col-span-3">
      <p className="text-xs font-semibold text-slate-700">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </p>
    </div>
    <Input label="Nama" field={namaField} required={required} form={form} setForm={setForm} />
    <Input label="NIP/NRP" field={nipField} form={form} setForm={setForm} />
    <Input label="No. HP" field={hpField} type="tel" form={form} setForm={setForm} />
  </div>
);

export default function DashboardSatker() {
  const [sessionUser, setSessionUser] = useState<{ id: string; username: string; nama: string } | null>(null);
  const [satker, setSatker] = useState<{ nama_satker: string; kode_satker: string; status: string } | null>(null);
  const [namaSatker, setNamaSatker] = useState("");
  const [profil, setProfil] = useState<ProfilSatker>(empty);
  const [showForm, setShowForm] = useState(false);
  const [showModalAkun, setShowModalAkun] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [form, setForm] = useState<ProfilSatker>(empty);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/satker/user");
      if (!res.ok) {
        window.location.href = "/login";
        return;
      }
      const session = await res.json();
      setSessionUser(session);

      const res2 = await fetch("/api/satker/profil");
      if (res2.ok) {
        const data = await res2.json();
        setSatker(data.profiles);
        setNamaSatker(data.profiles?.nama_satker || "");
        if (data.profil) {
          const clean = {
            ...empty,
            ...Object.fromEntries(Object.entries(data.profil).map(([k, v]) => [k, v ?? ""])),
          } as ProfilSatker;
          setProfil(clean);
          setForm(clean);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch("/api/satker/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profil: form, namaSatker }),
    });
    if (res.ok) {
      setProfil(form);
      setSatker((s) => (s ? { ...s, nama_satker: namaSatker } : s));
      setShowForm(false);
      setSaveMsg("Data berhasil disimpan!");
      setTimeout(() => setSaveMsg(""), 3000);
    } else {
      setSaveMsg("Gagal menyimpan data.");
    }
    setSaving(false);
  };

  const handleClearData = async () => {
    setClearing(true);
    const res = await fetch("/api/satker/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profil: empty, namaSatker: satker?.nama_satker }),
    });
    if (res.ok) {
      setProfil(empty);
      setForm(empty);
      setShowConfirmClear(false);
      setSaveMsg("Data profil berhasil dihapus.");
      setTimeout(() => setSaveMsg(""), 3000);
    } else {
      setSaveMsg("Gagal menghapus data.");
    }
    setClearing(false);
  };

  const handleLogout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    window.location.href = "/login";
  };

  const isProfilLengkap =
    profil.nama_kpa &&
    profil.nama_ppk1 &&
    profil.nama_ppspm &&
    profil.nama_bendahara_pengeluaran &&
    profil.nama_pic1 &&
    profil.nama_pic2;

  const PejabatSummary = ({
    label,
    nama,
    nip,
    hp,
  }: {
    label: string;
    nama?: string;
    nip?: string;
    hp?: string;
  }) => (
    <div>
      <p className="text-xs text-slate-700">{label}</p>
      {nama ? (
        <div className="mt-0.5">
          <p className="text-sm text-slate-800 font-semibold">{nama}</p>
          {nip && (
            <p className="text-xs text-slate-700 mt-0.5">
              <span className="text-slate-700">NIP</span> {nip}
            </p>
          )}
          {hp && (
            <p className="text-xs text-slate-700 mt-0.5">
              <span className="text-slate-700">No. HP</span> {hp}
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-slate-700 font-normal mt-0.5">Belum diisi</p>
      )}
    </div>
  );

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-slate-700">
        Memuat...
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        nama="Sarana Penyelesaian Dokumen Organisasi"
        sub={satker?.nama_satker || sessionUser?.username || "Satker"}
        onLogout={handleLogout}
        extraButton={
          <button
            onClick={() => setShowModalAkun(true)}
            className="w-full md:w-auto px-4 py-2 border border-slate-200 hover:border-blue-300 hover:text-blue-600 text-slate-600 text-sm font-medium rounded-lg transition-colors"
          >
            Pengaturan Akun
          </button>
        }
      />

      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg md:text-xl font-bold text-slate-800">Dashboard Satker</h1>
            <p className="text-sm text-slate-700 mt-1">Kelola data profil satuan kerja Anda</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowConfirmClear(true)}
              className="px-3 md:px-4 py-2 border border-red-200 hover:bg-red-50 text-red-500 text-sm rounded-lg transition-colors"
            >
              Clear Data
            </button>
            <button
              onClick={() => {
                setForm(profil);
                setNamaSatker(satker?.nama_satker || "");
                setShowForm(true);
              }}
              className="px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
            >
              {isProfilLengkap ? "Edit Profil" : "Lengkapi Profil"}
            </button>
          </div>
        </div>

        {saveMsg && (
          <div className="mt-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">
            {saveMsg}
          </div>
        )}

        {/* Status Cards */}
        <div className="mt-4 md:mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
            <p className="text-xs text-slate-700">Satuan Kerja</p>
            <p className="text-sm font-bold text-slate-800 mt-1 break-words">{satker?.nama_satker}</p>
            <p className="text-xs text-slate-700 mt-1">{satker?.kode_satker}</p>
          </div>
        </div>

        {/* Data Summary */}
        {!showForm && (
          <div className="mt-4 md:mt-6 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
              <h2 className="text-sm text-slate-700 mb-4">Profil Kantor</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Field label="Alamat Kantor" value={profil.alamat} />
                <Field label="No. Telp Kantor" value={profil.no_telp} />
                <Field label="Email Kantor" value={profil.email} />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
              <h2 className="text-sm font-semibold text-slate-700 mb-4">Pejabat Perbendaharaan</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <PejabatSummary label="KPA" nama={profil.nama_kpa} nip={profil.nip_kpa} hp={profil.hp_kpa} />
                <PejabatSummary label="PPK 1" nama={profil.nama_ppk1} nip={profil.nip_ppk1} hp={profil.hp_ppk1} />
                <PejabatSummary label="PPK 2" nama={profil.nama_ppk2} nip={profil.nip_ppk2} hp={profil.hp_ppk2} />
                <PejabatSummary label="PPK 3" nama={profil.nama_ppk3} nip={profil.nip_ppk3} hp={profil.hp_ppk3} />
                <PejabatSummary label="PPK 4" nama={profil.nama_ppk4} nip={profil.nip_ppk4} hp={profil.hp_ppk4} />
                <PejabatSummary label="PPSPM" nama={profil.nama_ppspm} nip={profil.nip_ppspm} hp={profil.hp_ppspm} />
                <PejabatSummary label="Bendahara" nama={profil.nama_bendahara} nip={profil.nip_bendahara} hp={profil.hp_bendahara} />
                <PejabatSummary label="Bendahara Pengeluaran" nama={profil.nama_bendahara_pengeluaran} nip={profil.nip_bendahara_pengeluaran} hp={profil.hp_bendahara_pengeluaran} />
                <PejabatSummary label="Bendahara Penerimaan" nama={profil.nama_bendahara_penerimaan} nip={profil.nip_bendahara_penerimaan} hp={profil.hp_bendahara_penerimaan} />
                <PejabatSummary label="Bendahara Pembantu" nama={profil.nama_bendahara_pembantu} nip={profil.nip_bendahara_pembantu} hp={profil.hp_bendahara_pembantu} />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
              <h2 className="text-sm font-semibold text-slate-700 mb-4">PIC / Operator</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <PejabatSummary label="PIC/Operator 1" nama={profil.nama_pic1} hp={profil.hp_pic1} />
                <PejabatSummary label="PIC/Operator 2" nama={profil.nama_pic2} hp={profil.hp_pic2} />
                <PejabatSummary label="PIC/Operator 3" nama={profil.nama_pic3} hp={profil.hp_pic3} />
                <PejabatSummary label="PIC/Operator 4" nama={profil.nama_pic4} hp={profil.hp_pic4} />
              </div>
            </div>
          </div>
        )}

        {/* Form Edit */}
        {showForm && (
          <div className="mt-4 md:mt-6 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
              <h2 className="text-sm font-semibold text-slate-700 mb-4">Profil Kantor</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-slate-600">Nama Satker</label>
                  <input
                    value={namaSatker}
                    onChange={(e) => setNamaSatker(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <Input label="Alamat Lengkap Kantor" field="alamat" form={form} setForm={setForm} />
                <Input label="Nomor Telp Kantor" field="no_telp" form={form} setForm={setForm} />
                <Input label="Email Kantor" field="email" type="email" form={form} setForm={setForm} />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
              <h2 className="text-sm font-semibold text-slate-700 mb-2">Pejabat Perbendaharaan</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                <PejabatGroup label="KPA" namaField="nama_kpa" nipField="nip_kpa" hpField="hp_kpa" form={form} setForm={setForm} />
                <PejabatGroup label="PPK 1" namaField="nama_ppk1" nipField="nip_ppk1" hpField="hp_ppk1" required form={form} setForm={setForm} />
                <PejabatGroup label="PPK 2" namaField="nama_ppk2" nipField="nip_ppk2" hpField="hp_ppk2" form={form} setForm={setForm} />
                <PejabatGroup label="PPK 3" namaField="nama_ppk3" nipField="nip_ppk3" hpField="hp_ppk3" form={form} setForm={setForm} />
                <PejabatGroup label="PPK 4" namaField="nama_ppk4" nipField="nip_ppk4" hpField="hp_ppk4" form={form} setForm={setForm} />
                <PejabatGroup label="PPSPM" namaField="nama_ppspm" nipField="nip_ppspm" hpField="hp_ppspm" required form={form} setForm={setForm} />
                <PejabatGroup label="Bendahara" namaField="nama_bendahara" nipField="nip_bendahara" hpField="hp_bendahara" form={form} setForm={setForm} />
                <PejabatGroup label="Bendahara Pengeluaran" namaField="nama_bendahara_pengeluaran" nipField="nip_bendahara_pengeluaran" hpField="hp_bendahara_pengeluaran" required form={form} setForm={setForm} />
                <PejabatGroup label="Bendahara Penerimaan" namaField="nama_bendahara_penerimaan" nipField="nip_bendahara_penerimaan" hpField="hp_bendahara_penerimaan" form={form} setForm={setForm} />
                <PejabatGroup label="Bendahara Pembantu" namaField="nama_bendahara_pembantu" nipField="nip_bendahara_pembantu" hpField="hp_bendahara_pembantu" form={form} setForm={setForm} />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
              <h2 className="text-sm font-semibold text-slate-700 mb-4">PIC / Operator</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Nama PIC/Operator 1" field="nama_pic1" required form={form} setForm={setForm} />
                <Input label="No. HP PIC/Operator 1" field="hp_pic1" required type="tel" form={form} setForm={setForm} />
                <Input label="Nama PIC/Operator 2" field="nama_pic2" required form={form} setForm={setForm} />
                <Input label="No. HP PIC/Operator 2" field="hp_pic2" required type="tel" form={form} setForm={setForm} />
                <Input label="Nama PIC/Operator 3" field="nama_pic3" form={form} setForm={setForm} />
                <Input label="No. HP PIC/Operator 3" field="hp_pic3" type="tel" form={form} setForm={setForm} />
                <Input label="Nama PIC/Operator 4" field="nama_pic4" form={form} setForm={setForm} />
                <Input label="No. HP PIC/Operator 4" field="hp_pic4" type="tel" form={form} setForm={setForm} />
              </div>
            </div>

            <div className="flex gap-3 justify-end pb-6">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? "Menyimpan..." : "Simpan Data"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Konfirmasi Clear Data */}
      {showConfirmClear && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6">
            <h3 className="text-sm font-semibold text-slate-800 mb-2">Hapus Semua Data Profil?</h3>
            <p className="text-sm text-slate-700 mb-6">
              Semua data profil kantor, pejabat, dan PIC akan dihapus. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmClear(false)}
                disabled={clearing}
                className="flex-1 py-2 text-sm border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleClearData}
                disabled={clearing}
                className="flex-1 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {clearing ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showModalAkun && <ModalAkun onClose={() => setShowModalAkun(false)} />}
    </div>
  );
}