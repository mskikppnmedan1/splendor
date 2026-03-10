"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Header from "@/components/header";
import ModalAkun from "@/components/modal-akun";


type ProfilSatker = {
  alamat: string;
  no_telp: string;
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

const empty: ProfilSatker = {
  alamat: "",
  no_telp: "",
  nama_kpa: "",
  nip_kpa: "",
  nama_ppk1: "",
  nip_ppk1: "",
  nama_ppk2: "",
  nip_ppk2: "",
  nama_ppk3: "",
  nip_ppk3: "",
  nama_ppk4: "",
  nip_ppk4: "",
  nama_ppspm: "",
  nip_ppspm: "",
  nama_bendahara_pengeluaran: "",
  nip_bendahara_pengeluaran: "",
  nama_bendahara_penerimaan: "",
  nip_bendahara_penerimaan: "",
  nama_bendahara_pembantu: "",
  nip_bendahara_pembantu: "",
  nama_pic1: "",
  hp_pic1: "",
  nama_pic2: "",
  hp_pic2: "",
  nama_pic3: "",
  hp_pic3: "",
  nama_pic4: "",
  hp_pic4: "",
};

export default function DashboardSatker() {
  const supabase = createClient();

  const [sessionUser, setSessionUser] = useState<{ id: string; username: string; nama: string } | null>(null)
  const [satker, setSatker] = useState<{ nama_satker: string; kode_satker: string; status: string } | null>(null);
  const [email, setEmail] = useState("");
  const [namaSatker, setNamaSatker] = useState("");
  const [profil, setProfil] = useState<ProfilSatker>(empty);
  const [showForm, setShowForm] = useState(false);
  const [showModalAkun, setShowModalAkun] = useState(false);
  const [form, setForm] = useState<ProfilSatker>(empty);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      // Ambil session dari cookie via API
      const res = await fetch("/api/satker/user");
      if (!res.ok) {
        window.location.href = "/login";
        return;
      }
      const session = await res.json();
      setSessionUser(session);

      const { data: s } = await supabase.from("profiles_satker").select("nama_satker, kode_satker, status").eq("id", session.id).single();
      setSatker(s);
      setNamaSatker(s?.nama_satker || "");

      const { data: p } = await supabase.from("profil_satker").select("*").eq("id", session.id).single();
      if (p) {
        setProfil(p);
        setForm(p);
      }
      setLoading(false);
    };
    fetchData();
  }, []);
  const handleSave = async () => {
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("profil_satker").upsert({ id: user.id, ...form, updated_at: new Date().toISOString() });
    await supabase.from("profiles_satker").update({ nama_satker: namaSatker }).eq("id", user.id);

    if (!error) {
      setProfil(form);
      setSatker((s) => (s ? { ...s, nama_satker: namaSatker } : s));
      setShowForm(false);
      setSaveMsg("Data berhasil disimpan!");
      setTimeout(() => setSaveMsg(""), 3000);
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const isProfilLengkap = profil.nama_kpa && profil.nama_ppk1 && profil.nama_ppspm && profil.nama_bendahara_pengeluaran && profil.nama_pic1 && profil.nama_pic2;

  const Field = ({ label, value }: { label: string; value: string }) => (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm text-slate-700 font-medium mt-0.5">{value || <span className="text-slate-300 font-normal">Belum diisi</span>}</p>
    </div>
  );

  const Input = ({ label, field, required }: { label: string; field: keyof ProfilSatker; required?: boolean }) => (
    <div>
      <label className="text-xs font-medium text-slate-600">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        value={form[field]}
        onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
        className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center text-sm text-slate-400">Memuat...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        nama="Sistem Informasi Satuan Kerja"
        sub={`KPPN Medan I — ${satker?.nama_satker || sessionUser?.username || "Satker"}`}
        onLogout={handleLogout}
        extraButton={
          <button onClick={() => setShowModalAkun(true)} className="px-4 py-2 border border-slate-200 hover:border-blue-300 hover:text-blue-600 text-slate-600 text-sm font-medium rounded-lg transition-colors">
            Pengaturan Akun
          </button>
        }
      />

      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Dashboard Satker</h1>
            <p className="text-sm text-slate-500 mt-1">Kelola data profil satuan kerja Anda</p>
          </div>
          <button
            onClick={() => {
              setForm(profil);
              setNamaSatker(satker?.nama_satker || "");
              setShowForm(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
          >
            {isProfilLengkap ? "Edit Profil" : "Lengkapi Profil"}
          </button>
        </div>

        {saveMsg && <div className="mt-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">{saveMsg}</div>}

        {/* Status Card */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-xs text-slate-400">Status Akun</p>
            <span className={`mt-2 inline-block px-2 py-1 rounded-full text-xs font-medium ${satker?.status === "aktif" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
              {satker?.status === "aktif" ? "Aktif" : "Menunggu Approval"}
            </span>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-xs text-slate-400">Kelengkapan Profil</p>
            <p className={`text-sm font-semibold mt-2 ${isProfilLengkap ? "text-green-600" : "text-amber-600"}`}>{isProfilLengkap ? "Lengkap" : "Belum Lengkap"}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-xs text-slate-400">Satuan Kerja</p>
            <p className="text-sm font-bold text-slate-800 mt-1">{satker?.nama_satker}</p>
            <p className="text-xs text-slate-400 mt-1">{satker?.kode_satker}</p>
          </div>
        </div>

        {/* Data Summary */}
        {!showForm && (
          <div className="mt-6 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="text-sm font-semibold text-slate-700 mb-4">Profil Kantor</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Alamat Kantor" value={profil.alamat} />
                <Field label="Email Login" value={email} />
                <Field label="No. Telp Kantor" value={profil.no_telp} />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="text-sm font-semibold text-slate-700 mb-4">Pejabat Perbendaharaan</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="KPA" value={profil.nama_kpa ? `${profil.nama_kpa} / ${profil.nip_kpa}` : ""} />
                <Field label="PPK 1" value={profil.nama_ppk1 ? `${profil.nama_ppk1} / ${profil.nip_ppk1}` : ""} />
                <Field label="PPK 2" value={profil.nama_ppk2 ? `${profil.nama_ppk2} / ${profil.nip_ppk2}` : ""} />
                <Field label="PPK 3" value={profil.nama_ppk3 ? `${profil.nama_ppk3} / ${profil.nip_ppk3}` : ""} />
                <Field label="PPK 4" value={profil.nama_ppk4 ? `${profil.nama_ppk4} / ${profil.nip_ppk4}` : ""} />
                <Field label="PPSPM" value={profil.nama_ppspm ? `${profil.nama_ppspm} / ${profil.nip_ppspm}` : ""} />
                <Field label="Bendahara Pengeluaran" value={profil.nama_bendahara_pengeluaran ? `${profil.nama_bendahara_pengeluaran} / ${profil.nip_bendahara_pengeluaran}` : ""} />
                <Field label="Bendahara Penerimaan" value={profil.nama_bendahara_penerimaan ? `${profil.nama_bendahara_penerimaan} / ${profil.nip_bendahara_penerimaan}` : ""} />
                <Field label="Bendahara Pembantu" value={profil.nama_bendahara_pembantu ? `${profil.nama_bendahara_pembantu} / ${profil.nip_bendahara_pembantu}` : ""} />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="text-sm font-semibold text-slate-700 mb-4">PIC / Operator</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="PIC/Operator 1" value={profil.nama_pic1 ? `${profil.nama_pic1} / ${profil.hp_pic1}` : ""} />
                <Field label="PIC/Operator 2" value={profil.nama_pic2 ? `${profil.nama_pic2} / ${profil.hp_pic2}` : ""} />
                <Field label="PIC/Operator 3" value={profil.nama_pic3 ? `${profil.nama_pic3} / ${profil.hp_pic3}` : ""} />
                <Field label="PIC/Operator 4" value={profil.nama_pic4 ? `${profil.nama_pic4} / ${profil.hp_pic4}` : ""} />
              </div>
            </div>
          </div>
        )}

        {/* Form Edit */}
        {showForm && (
          <div className="mt-6 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="text-sm font-semibold text-slate-700 mb-4">Profil Kantor</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-slate-600">Nama Satker</label>
                  <input value={namaSatker} onChange={(e) => setNamaSatker(e.target.value)} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <Input label="Alamat Lengkap Kantor" field="alamat" />
                <Input label="Nomor Telp Kantor" field="no_telp" />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="text-sm font-semibold text-slate-700 mb-4">Pejabat Perbendaharaan</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Nama KPA" field="nama_kpa" />
                <Input label="NIP/NRP KPA" field="nip_kpa" />
                <Input label="Nama PPK 1" field="nama_ppk1" required />
                <Input label="NIP PPK 1" field="nip_ppk1" required />
                <Input label="Nama PPK 2" field="nama_ppk2" />
                <Input label="NIP PPK 2" field="nip_ppk2" />
                <Input label="Nama PPK 3" field="nama_ppk3" />
                <Input label="NIP PPK 3" field="nip_ppk3" />
                <Input label="Nama PPK 4" field="nama_ppk4" />
                <Input label="NIP PPK 4" field="nip_ppk4" />
                <Input label="Nama PPSPM" field="nama_ppspm" required />
                <Input label="NIP/NRP PPSPM" field="nip_ppspm" required />
                <Input label="Nama Bendahara Pengeluaran" field="nama_bendahara_pengeluaran" required />
                <Input label="NIP/NRP Bendahara Pengeluaran" field="nip_bendahara_pengeluaran" required />
                <Input label="Nama Bendahara Penerimaan" field="nama_bendahara_penerimaan" />
                <Input label="NIP/NRP Bendahara Penerimaan" field="nip_bendahara_penerimaan" />
                <Input label="Nama Bendahara Pembantu" field="nama_bendahara_pembantu" />
                <Input label="NIP/NRP Bendahara Pembantu" field="nip_bendahara_pembantu" />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="text-sm font-semibold text-slate-700 mb-4">PIC / Operator</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Nama PIC/Operator 1" field="nama_pic1" required />
                <Input label="No. HP PIC/Operator 1" field="hp_pic1" required />
                <Input label="Nama PIC/Operator 2" field="nama_pic2" required />
                <Input label="No. HP PIC/Operator 2" field="hp_pic2" required />
                <Input label="Nama PIC/Operator 3" field="nama_pic3" />
                <Input label="No. HP PIC/Operator 3" field="hp_pic3" />
                <Input label="Nama PIC/Operator 4" field="nama_pic4" />
                <Input label="No. HP PIC/Operator 4" field="hp_pic4" />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                Batal
              </button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50">
                {saving ? "Menyimpan..." : "Simpan Data"}
              </button>
            </div>
          </div>
        )}
      </div>

      {showModalAkun && <ModalAkun onClose={() => setShowModalAkun(false)} />}
    </div>
  );
}
