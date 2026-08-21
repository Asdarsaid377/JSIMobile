# Build Plan

Setiap feature harus selesai dalam satu sesi kerja, bisa diverifikasi visual/fungsional, dan mengikuti prinsip "UI dengan referensi desain dulu, logic belakangan" (lihat `ui-workflow.md`).

---

## Phase 1 — Foundation

### 01 Setup Project ✅ selesai
- Init Expo project (TypeScript template, SDK 57)
- Install &amp; konfigurasi NativeWind dengan token placeholder dari `client/src/css/tailwind.config.js`
- Setup React Navigation: `RootNavigator` (stub, session di-mock `null`) → `AuthStack` / `AdminTabs` / `TimsesTabs` (semua stub)
- Setup `src/lib/api/client.ts` (axios + `EXPO_PUBLIC_API_URL`) dan `src/lib/api/token.ts` (`expo-secure-store`)
- Setup TanStack Query provider
- Seluruh dokumen claude-kit (`CLAUDE.md`, `context/*`, `.claude/commands/*`)
- Verifikasi: `npx tsc --noEmit` bersih, `npx expo start` boot Metro tanpa error, bundle iOS berhasil (1448 modules, tanpa error)

### 02 Auth — Login dengan GPS
- Screen Login: username/password
- Wiring `expo-location` — ambil GPS, tolak submit kalau belum granted/dapat lokasi (pesan sama seperti web)
- Wiring `POST /backend-api/auth/login` (lihat `api-standards.md`), simpan token, fetch profile
- `RootNavigator` baca session asli (bukan mock lagi) → switch `AdminTabs`/`TimsesTabs` berdasar role
- **Butuh referensi desain dari `context/designs/` sebelum build UI** (lihat `ui-workflow.md`)
- Verifikasi: login dengan akun asli → token tersimpan → sesi persist setelah app di-restart → role menentukan tab yang tampil

### 03 Profile
- Screen Profile: lihat &amp; edit data diri
- Logout (hapus token, kembali ke AuthStack)
- Verifikasi: submit perubahan tersimpan, logout mengembalikan ke Login

---

## Phase 2 — Modul dengan Backend Terkonfirmasi

### 04 Program Pemenangan — Door To Door
- List &amp; input kunjungan Door To Door, wiring ke `/Users/asdarsaid/JSI/api/src/dtdoor`
- Verifikasi: kunjungan baru tersimpan &amp; muncul di list

### 05 Program Pemenangan — Social Event / GOTV
- List &amp; input Social Event, wiring ke `/Users/asdarsaid/JSI/api/src/gotv`
- Verifikasi: sama seperti 04

### 06 Timses
- Lihat hierarki tim (Kabupaten → Kecamatan → Desa) &amp; status online, wiring ke `/Users/asdarsaid/JSI/api/src/timses`
- Verifikasi: hierarki tampil benar, status online update realtime

### 07 Lacak Relawan / Tracking
- Map view + list status online anggota tim (realtime via socket.io)
- Verifikasi: posisi/status update tanpa refresh manual

---

## Phase 3 — Modul dengan Backend Belum Terkonfirmasi

**Jangan mulai fase ini sebelum user memberi path repo backend untuk DPT dan/atau Hasil Rekap — lihat `CLAUDE.md` Aturan #6 dan `api-standards.md`.**

### 08 DPT
- List, filter bertingkat (Kecamatan/Kelurahan/TPS), search, tandai partisipasi program, CRUD dasar
- Verifikasi: filter &amp; search mengubah hasil, tandai partisipasi tersimpan

### 09 Hasil Rekap (2019/2024)
- Drill-down Provinsi → Kabupaten → Kecamatan → Kelurahan → TPS per jenis pemilihan
- Verifikasi: drill-down menampilkan data benar di tiap level

### 10 WhatsApp Broadcast
- Kirim pesan ke Pendukung / Relawan — cek dulu apakah backend menyediakan endpoint kirim langsung atau perlu deep link WhatsApp native (beda dari pola `whatsapp-web.js` di `/Users/asdarsaid/JSI/api`, verifikasi dulu)
- Verifikasi: pesan terkirim/deep link terbuka dengan benar

---

## Fase Berikutnya (di luar MVP saat ini)

- Survey, Tokoh, Zona, Bigdata Pendukung, Pengeluaran (sebagai screen mobile terpisah), Pertanyaan
- Push notification
- Offline cache
