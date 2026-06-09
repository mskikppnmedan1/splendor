"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

type Mode = "satker-login" | "kppn-login";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("satker-login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [kppnUsername, setKppnUsername] = useState("");
  const [kppnPassword, setKppnPassword] = useState("");

  const reset = () => setError("");

  const handleSatkerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    reset();
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username.trim(), password, role: "satker" }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Kode satker atau password salah.");
      setLoading(false);
      return;
    }
    window.location.href = "/dashboard/dashboard";
  };

  const handleKppnLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    reset();
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: kppnUsername, password: kppnPassword, role: "kppn" }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Username atau password salah.");
      setLoading(false);
      return;
    }
    router.push("/dashboard/admin");
    router.refresh();
  };

  const inputCls =
    "w-full px-3.5 py-2.5 text-sm text-slate-800 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all bg-white placeholder:text-slate-400";

  return (
    <div className="min-h-screen flex flex-col md:flex-row">

      {/* ── Kiri: branding ───────────────────────────────────── */}
      <div className="bg-blue-700 md:w-5/12 flex flex-col items-center justify-center px-10 py-12 text-white">
        <div className="w-full max-w-xs">

          {/* Logo dalam lingkaran putih */}
          <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mb-8 shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo-kemenkeu.png"
              alt="Logo Kemenkeu"
              className="w-16 h-16 object-contain"
            />
          </div>

          <h1 className="text-2xl font-bold leading-snug mb-2">
            Sarana Penyelesaian Dokumen Organisasi
          </h1>
          <p className="text-blue-200 text-sm mb-10">KPPN Medan I</p>

          <div className="space-y-4">
            {[
              "Kelola data profil satuan kerja",
              "Data pejabat perbendaharaan",
              "Export & import data via Excel",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm text-blue-100">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Kanan: form ──────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-sm">

          <h2 className="text-xl font-bold text-slate-800 mb-1">Masuk ke Sistem</h2>
          <p className="text-sm text-slate-500 mb-7">Pilih tipe akun untuk melanjutkan.</p>

          {/* Tab */}
          <div className="flex gap-1 bg-slate-200 rounded-lg p-1 mb-6">
            {(["satker-login", "kppn-login"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); reset(); setShowPass(false); }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  mode === m
                    ? "bg-white shadow-sm text-blue-700"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {m === "satker-login" ? "Satker" : "KPPN"}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3.5 py-3 mb-5">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Form Satker */}
          {mode === "satker-login" && (
            <form onSubmit={handleSatkerLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Kode Satker</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Contoh: 019364"
                  className={inputCls}
                  autoComplete="username"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Masukkan password"
                    className={`${inputCls} pr-10`}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showPass ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors mt-1"
              >
                {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {loading ? "Memproses..." : "Masuk"}
              </button>
            </form>
          )}

          {/* Form KPPN */}
          {mode === "kppn-login" && (
            <form onSubmit={handleKppnLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Username</label>
                <input
                  value={kppnUsername}
                  onChange={(e) => setKppnUsername(e.target.value)}
                  required
                  placeholder="Masukkan username"
                  className={inputCls}
                  autoComplete="username"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={kppnPassword}
                    onChange={(e) => setKppnPassword(e.target.value)}
                    required
                    placeholder="Masukkan password"
                    className={`${inputCls} pr-10`}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showPass ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors mt-1"
              >
                {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {loading ? "Memproses..." : "Masuk"}
              </button>
            </form>
          )}

          <p className="text-center text-xs text-slate-400 mt-8">
            Direktorat Jenderal Perbendaharaan · Kemenkeu RI
          </p>
        </div>
      </div>

    </div>
  );
}
