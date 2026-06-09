"use client";

/**
 * AutoLogout — komponen ini sengaja dikosongkan.
 *
 * Alasan:
 * - Beacon logout via pagehide tidak bisa membedakan antara
 *   "tab ditutup" vs "navigasi ke halaman lain" secara reliable
 *   di semua browser. Akibatnya beacon terkirim saat redirect
 *   setelah login dan menghapus cookie yang baru saja dibuat.
 *
 * - Sesi sudah aman karena:
 *   1. Cookie httpOnly dengan maxAge 8 jam — otomatis kadaluarsa.
 *   2. Tombol "Keluar" tersedia di semua halaman untuk logout manual.
 *   3. Middleware redirect ke /login kalau cookie tidak ada/expired.
 */
export default function AutoLogout() {
  return null;
}
