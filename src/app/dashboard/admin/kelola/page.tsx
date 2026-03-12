"use client";

import { useState, useEffect, useRef } from "react";
import Header from "@/components/header";
import * as XLSX from "xlsx";

type Satker = {
  id: string;
  nama_satker: string;
  kode_satker: string;
  status: string;
  created_at: string;
  password_updated_at: string | null;
};

type ModalType = "tambah" | "reset-password" | "hapus" | "import" | null;

type ImportRow = {
  kode_satker: string;
  nama_satker: string;
  nama_lama?: string; // nama sebelumnya jika berbeda
  kode_lama?: string; // kode sebelumnya jika kode berubah
  status: "pending" | "update" | "success" | "error" | "duplicate";
  error?: string;
  existingId?: string; // id satker yang sudah ada, untuk PATCH
  updateFields?: "nama" | "kode" | "kode_nama"; // apa yang perlu diupdate
};

const NAV_ITEMS = [
  { label: "Data Satker", href: "/dashboard/admin" },
  { label: "Kelola User", href: "/dashboard/admin/kelola" },
];

export default function KelolaUser() {
  const [satkerList, setSatkerList] = useState<Satker[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedSatker, setSelectedSatker] = useState<Satker | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [formNama, setFormNama] = useState("");
  const [formKode, setFormKode] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importDone, setImportDone] = useState(false);

  const fetchSatker = async () => {
    setLoading(true);
    const res = await fetch("/api/satker/list");
    const data = await res.json();
    setSatkerList(data.list || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchSatker();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    window.location.href = "/login";
  };

  const openModal = (type: ModalType, satker?: Satker) => {
    setModalType(type);
    setSelectedSatker(satker || null);
    setModalError("");
    setFormNama("");
    setFormKode("");
    setFormPassword("");
    setNewPassword("");
    setImportRows([]);
    setImportProgress(0);
    setImportDone(false);
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedSatker(null);
    setModalError("");
  };

  const handleTambah = async () => {
    setModalLoading(true);
    setModalError("");
    const res = await fetch("/api/satker/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nama_satker: formNama, kode_satker: formKode, password: formPassword }),
    });
    const data = await res.json();
    if (!res.ok) {
      setModalError(data.error);
      setModalLoading(false);
      return;
    }
    closeModal();
    fetchSatker();
    setModalLoading(false);
  };

  const handleResetPassword = async () => {
    setModalLoading(true);
    setModalError("");
    const res = await fetch("/api/satker/user", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selectedSatker?.id, password: newPassword }),
    });
    const data = await res.json();
    if (!res.ok) {
      setModalError(data.error);
      setModalLoading(false);
      return;
    }
    closeModal();
    setModalLoading(false);
  };

  const handleHapus = async () => {
    setModalLoading(true);
    await fetch("/api/satker/user", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selectedSatker?.id }),
    });
    closeModal();
    fetchSatker();
    setModalLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      const wb = XLSX.read(data, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
      const parsed: ImportRow[] = rows
        .slice(1)
        .filter((r) => r[0] && r[1])
        .map((r) => ({
          kode_satker: String(r[0]).trim(),
          nama_satker: String(r[1]).trim(),
          status: "pending",
        }));

      // Map kode → satker & nama → satker untuk double matching
      const existingByKode = new Map(satkerList.map((s) => [s.kode_satker, s]));
      const existingByNama = new Map(satkerList.map((s) => [s.nama_satker.toUpperCase(), s]));
      const seen = new Set<string>();

      const marked = parsed.map((row) => {
        // Duplikat dalam file Excel itu sendiri
        if (seen.has(row.kode_satker)) return { ...row, status: "duplicate" as const, error: "Duplikat dalam file" };
        seen.add(row.kode_satker);

        // 1. Match berdasarkan kode
        const byKode = existingByKode.get(row.kode_satker);
        if (byKode) {
          if (byKode.nama_satker !== row.nama_satker) {
            // Kode sama, nama beda → update nama
            return {
              ...row,
              status: "update" as const,
              nama_lama: byKode.nama_satker,
              existingId: byKode.id,
              updateFields: "nama" as const,
            };
          }
          // Kode sama, nama sama → skip
          return { ...row, status: "duplicate" as const, error: "Data sama, tidak ada perubahan" };
        }

        // 2. Kode tidak ketemu — coba match berdasarkan nama
        const byNama = existingByNama.get(row.nama_satker.toUpperCase());
        if (byNama) {
          // Nama sama tapi kode berbeda → kode yang berubah, update kode (& nama tetap sama)
          return {
            ...row,
            status: "update" as const,
            kode_lama: byNama.kode_satker,
            existingId: byNama.id,
            updateFields: "kode" as const,
          };
        }

        // 3. Tidak ketemu sama sekali → tambah baru
        return row;
      });

      setImportRows(marked);
      setImportDone(false);
      setImportProgress(0);
    };
    reader.readAsBinaryString(file);
    e.target.value = "";
  };

  const handleImport = async () => {
    const toProcess = importRows.filter((r) => r.status === "pending" || r.status === "update");
    if (toProcess.length === 0) return;
    setModalLoading(true);
    let done = 0;
    const updated = [...importRows];
    for (let i = 0; i < updated.length; i++) {
      if (updated[i].status !== "pending" && updated[i].status !== "update") continue;

      let res: Response;

      if (updated[i].status === "update") {
        // Tentukan field apa yang diupdate
        const patchBody: Record<string, string> = { id: updated[i].existingId! };
        if (updated[i].updateFields === "nama" || updated[i].updateFields === "kode_nama") {
          patchBody.nama_satker = updated[i].nama_satker;
        }
        if (updated[i].updateFields === "kode" || updated[i].updateFields === "kode_nama") {
          patchBody.kode_satker = updated[i].kode_satker;
        }
        // Default fallback — update nama
        if (!updated[i].updateFields) {
          patchBody.nama_satker = updated[i].nama_satker;
        }

        res = await fetch("/api/satker", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patchBody),
        });
      } else {
        // Tambah baru — POST, password = kode satker
        res = await fetch("/api/satker/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nama_satker: updated[i].nama_satker,
            kode_satker: updated[i].kode_satker,
            password: updated[i].kode_satker,
          }),
        });
      }

      if (res.ok) {
        updated[i] = { ...updated[i], status: "success" };
      } else {
        const data = await res.json();
        updated[i] = { ...updated[i], status: "error", error: data.error || "Gagal" };
      }
      done++;
      setImportProgress(Math.round((done / toProcess.length) * 100));
      setImportRows([...updated]);
    }
    setImportDone(true);
    setModalLoading(false);
    fetchSatker();
  };

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["Kode Satker", "Nama Satker"],
      ["693457", "CONTOH NAMA SATKER"],
    ]);
    ws["!cols"] = [{ wch: 15 }, { wch: 50 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "template-import-satker.xlsx");
  };

  const pendingCount = importRows.filter((r) => r.status === "pending").length;
  const updateCount = importRows.filter((r) => r.status === "update").length;
  const successCount = importRows.filter((r) => r.status === "success").length;
  const errorCount = importRows.filter((r) => r.status === "error").length;
  const duplicateCount = importRows.filter((r) => r.status === "duplicate").length;

  const inputCls = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all";

  return (
    <div className="min-h-screen bg-slate-50">
      <Header nama="Sistem Informasi Satuan Kerja" sub="KPPN Medan I" userLabel="Administrator" userRole="KPPN" onLogout={handleLogout} navItems={NAV_ITEMS} />

      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg md:text-xl font-bold text-slate-800">Kelola User</h1>
            <p className="text-sm text-slate-500 mt-1">Tambah, reset password, atau hapus akun satker</p>
          </div>
          {/* Dua tombol: Upload Excel + Tambah */}
          <div className="flex gap-2 shrink-0">
            <button onClick={() => openModal("import")} className="px-3 md:px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="hidden md:inline">Upload Excel</span>
              <span className="md:hidden">Excel</span>
            </button>
            <button onClick={() => openModal("tambah")} className="px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
              + Tambah
            </button>
          </div>
        </div>

        {/* Table — desktop */}
        <div className="mt-4 md:mt-6 bg-white rounded-xl border border-slate-200 overflow-hidden hidden md:block">
          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">Memuat data...</div>
          ) : satkerList.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">Belum ada satker</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Kode Satker</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Nama Satker</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Update Password</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {satkerList.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">{s.kode_satker || "-"}</td>
                    <td className="px-4 py-3 text-slate-800 font-medium">{s.nama_satker || "-"}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {s.password_updated_at ? (
                        new Date(s.password_updated_at).toLocaleString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      ) : (
                        <span className="text-slate-300 italic">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="inline-flex rounded-lg border border-slate-200 overflow-hidden">
                        <button onClick={() => openModal("reset-password", s)} className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 transition-colors border-r border-slate-200">
                          Reset Password
                        </button>
                        <button onClick={() => openModal("hapus", s)} className="px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 transition-colors">
                          Hapus
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
        <div className="mt-4 space-y-2 md:hidden">
          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">Memuat data...</div>
          ) : satkerList.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">Belum ada satker</div>
          ) : (
            satkerList.map((s) => (
              <div key={s.id} className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-800 break-words">{s.nama_satker || "-"}</p>
                <p className="text-xs text-slate-500 mt-1">Kode: {s.kode_satker || "-"}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {new Date(s.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <div className="mt-3 inline-flex w-full rounded-lg border border-slate-200 overflow-hidden">
                  <button onClick={() => openModal("reset-password", s)} className="flex-1 py-1.5 text-xs text-slate-600 hover:bg-slate-50 transition-colors border-r border-slate-200">
                    Reset Password
                  </button>
                  <button onClick={() => openModal("hapus", s)} className="flex-1 py-1.5 text-xs text-red-500 hover:bg-red-50 transition-colors">
                    Hapus
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {modalType && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className={`bg-white rounded-t-2xl md:rounded-2xl shadow-xl w-full ${modalType === "import" ? "md:max-w-2xl" : "md:max-w-md"} max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h2 className="text-sm font-bold text-slate-800">
                {modalType === "tambah" && "Tambah Satker Baru"}
                {modalType === "reset-password" && "Reset Password"}
                {modalType === "hapus" && "Hapus Satker"}
                {modalType === "import" && "Import Satker dari Excel"}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 text-xl leading-none">
                &times;
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {modalError && <div className="px-4 py-3 bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-lg">{modalError}</div>}

              {/* Modal Tambah */}
              {modalType === "tambah" && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Nama Satker</label>
                    <input value={formNama} onChange={(e) => setFormNama(e.target.value)} placeholder="Nama instansi/satker" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      Kode Satker <span className="text-slate-400">(digunakan sebagai username)</span>
                    </label>
                    <input value={formKode} onChange={(e) => setFormKode(e.target.value)} placeholder="Contoh: 019364" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Password</label>
                    <input type="password" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} placeholder="Minimal 6 karakter" className={inputCls} />
                  </div>
                  <button onClick={handleTambah} disabled={modalLoading} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
                    {modalLoading ? "Menyimpan..." : "Tambah Satker"}
                  </button>
                </>
              )}

              {/* Modal Reset Password */}
              {modalType === "reset-password" && (
                <>
                  <p className="text-xs text-slate-500">
                    Password baru untuk <strong className="text-slate-700">{selectedSatker?.nama_satker}</strong> ({selectedSatker?.kode_satker}).
                  </p>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Password Baru</label>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimal 6 karakter" className={inputCls} />
                  </div>
                  <button onClick={handleResetPassword} disabled={modalLoading} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
                    {modalLoading ? "Menyimpan..." : "Reset Password"}
                  </button>
                </>
              )}

              {/* Modal Hapus */}
              {modalType === "hapus" && (
                <>
                  <p className="text-sm text-slate-600">
                    Yakin ingin menghapus <strong>{selectedSatker?.nama_satker}</strong> ({selectedSatker?.kode_satker})? Semua data akan terhapus.
                  </p>
                  <div className="flex gap-3 pb-2">
                    <button onClick={closeModal} className="flex-1 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                      Batal
                    </button>
                    <button onClick={handleHapus} disabled={modalLoading} className="flex-1 py-2 text-sm bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50">
                      {modalLoading ? "Menghapus..." : "Hapus"}
                    </button>
                  </div>
                </>
              )}

              {/* Modal Import Excel */}
              {modalType === "import" && (
                <>
                  {/* Info password */}
                  <div className="flex items-start gap-2.5 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                    <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs text-emerald-700">
                      Password setiap akun akan otomatis diset sama dengan <strong>kode satker</strong>-nya masing-masing.
                    </p>
                  </div>

                  {/* Upload area */}
                  <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-5 text-center">
                    <p className="text-sm font-medium text-slate-600 mb-1">Upload file Excel</p>
                    <div className="flex items-center justify-center gap-2">
                      <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="hidden" />
                      <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-white border border-slate-200 hover:border-blue-300 text-slate-600 hover:text-blue-600 text-sm rounded-lg transition-colors">
                        Pilih File Excel
                      </button>
                    </div>
                  </div>

                  {importRows.length > 0 && (
                    <>
                      {/* Summary stats */}
                      <div className="grid grid-cols-5 gap-2">
                        <div className="bg-blue-50 rounded-lg p-3 text-center">
                          <p className="text-lg font-bold text-blue-600">{pendingCount}</p>
                          <p className="text-xs text-blue-400">Baru</p>
                        </div>
                        <div className="bg-violet-50 rounded-lg p-3 text-center">
                          <p className="text-lg font-bold text-violet-600">{updateCount}</p>
                          <p className="text-xs text-violet-400">Update</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3 text-center">
                          <p className="text-lg font-bold text-green-600">{successCount}</p>
                          <p className="text-xs text-green-400">Berhasil</p>
                        </div>
                        <div className="bg-amber-50 rounded-lg p-3 text-center">
                          <p className="text-lg font-bold text-amber-600">{duplicateCount}</p>
                          <p className="text-xs text-amber-400">Dilewati</p>
                        </div>
                        <div className="bg-rose-50 rounded-lg p-3 text-center">
                          <p className="text-lg font-bold text-rose-600">{errorCount}</p>
                          <p className="text-xs text-rose-400">Error</p>
                        </div>
                      </div>

                      {/* Progress bar */}
                      {modalLoading && (
                        <div>
                          <div className="flex justify-between text-xs text-slate-500 mb-1">
                            <span>Mengimport...</span>
                            <span>{importProgress}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2">
                            <div className="bg-emerald-500 h-2 rounded-full transition-all duration-300" style={{ width: `${importProgress}%` }} />
                          </div>
                        </div>
                      )}

                      {/* Preview table */}
                      <div className="border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                        <table className="w-full text-xs">
                          <thead className="bg-slate-50 border-b border-slate-100 sticky top-0">
                            <tr>
                              <th className="text-left px-3 py-2 text-slate-500 font-medium">Kode</th>
                              <th className="text-left px-3 py-2 text-slate-500 font-medium">Nama Satker</th>
                              <th className="text-left px-3 py-2 text-slate-500 font-medium">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {importRows.map((row, i) => (
                              <tr key={i} className="hover:bg-slate-50">
                                <td className="px-3 py-2 text-slate-600 font-mono">{row.kode_satker}</td>
                                <td className="px-3 py-2 text-slate-700">{row.nama_satker}</td>
                                <td className="px-3 py-2">
                                  {row.status === "pending" && <span className="text-slate-400">Tambah baru</span>}
                                  {row.status === "update" && (
                                    <span className="text-violet-600 font-medium">
                                      {row.updateFields === "kode" ? "✎ Ganti kode" : "✎ Ganti nama"}
                                      {row.updateFields === "kode" && row.kode_lama && <span className="block text-violet-400 font-normal">dari: {row.kode_lama}</span>}
                                      {row.updateFields === "nama" && row.nama_lama && (
                                        <span className="block text-violet-400 font-normal truncate max-w-[140px]" title={row.nama_lama}>
                                          dari: {row.nama_lama}
                                        </span>
                                      )}
                                    </span>
                                  )}
                                  {row.status === "success" && <span className="text-green-600 font-medium">✓ Berhasil</span>}
                                  {row.status === "duplicate" && <span className="text-amber-500">— {row.error}</span>}
                                  {row.status === "error" && <span className="text-rose-500">✗ {row.error}</span>}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {!importDone ? (
                        <button
                          onClick={handleImport}
                          disabled={modalLoading || pendingCount + updateCount === 0}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                          {modalLoading ? `Mengimport... ${importProgress}%` : `Proses ${pendingCount + updateCount} Data${updateCount > 0 ? ` (${pendingCount} baru · ${updateCount} update nama)` : ""}`}
                        </button>
                      ) : (
                        <div className="text-center">
                          <p className="text-sm text-green-600 font-medium mb-3">
                            ✓ Selesai! {successCount} data diproses ({pendingCount > 0 ? `${pendingCount} baru` : ""}
                            {pendingCount > 0 && updateCount > 0 ? ", " : ""}
                            {updateCount > 0 ? `${updateCount} nama diperbarui` : ""}).
                          </p>
                          <button onClick={closeModal} className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm rounded-lg transition-colors">
                            Tutup
                          </button>
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
