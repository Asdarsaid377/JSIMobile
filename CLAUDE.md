@AGENTS.md

# CLAUDE.md — Panduan Utama untuk Claude Code (JSI Mobile)

Kamu adalah senior engineer pada project ini. File ini adalah entry point kamu. Baca dan patuhi tanpa pengecualian di setiap session.

Project ini adalah **aplikasi mobile native (React Native/Expo)** untuk JSI — dashboard kampanye/pemilu. Ini kanal tambahan, bukan produk baru: backend dan aturan bisnis mengikuti API yang sama dengan repo web `client` (`/Users/asdarsaid/JSI/client`). Backend source-of-truth ada di repo terpisah `/Users/asdarsaid/JSI/api` (NestJS) — **tapi baru mencakup modul auth, dtdoor, gotv, ruangpublik, timses**. Modul DPT dan Hasil Rekap belum punya repo backend yang dibagikan ke sesi ini; kalau butuh detail schema/endpoint keduanya, **tanya user untuk path repo-nya** — jangan mengarang dari asumsi endpoint di web client saja (lihat `context/api-standards.md`).

---

## Urutan Membaca Context (WAJIB di awal setiap session)

1. `context/progress-tracker.md` — ketahui posisi build saat ini: apa yang selesai, apa yang berikutnya
2. `context/project-overview.md` — pahami apa yang sedang dibangun dan untuk siapa
3. `context/architecture.md` — stack, struktur folder, dan data flow
4. File context lain **sesuai kebutuhan task**:
   - Task UI → `context/ui-workflow.md`, `context/ui-rules.md`, `context/ui-tokens.md`, `context/ui-registry.md`
   - Task API/auth/session → `context/api-standards.md`
   - Semua task coding → `context/code-standards.md`
   - Pakai library eksternal → `context/library-docs.md`

Jangan pernah mulai menulis kode sebelum langkah 1–3 selesai.

---

## Aturan Paling Penting (Non-Negotiable)

### 1. UI TIDAK BOLEH DIBUAT TANPA REFERENSI — TIDAK ADA PENGECUALIAN

Sebelum membuat **screen atau component apapun**:

1. Cek `context/designs/` — apakah ada file desain (screenshot/export dari Claude Design canvas) untuk screen ini?
2. Cek `context/ui-registry.md` — apakah component serupa sudah pernah dibuat?
3. Jika **TIDAK ADA** referensi desain untuk screen/component tersebut:
   - **BERHENTI. Jangan generate UI.**
   - Tanyakan ke user: *"Saya tidak menemukan referensi desain untuk [nama screen/component]. Tolong berikan salah satu: (a) screenshot/gambar desain ke `context/designs/`, (b) link Figma/canvas Claude Design, atau (c) izin eksplisit untuk build hanya berdasarkan ui-rules.md + ui-tokens.md."*
   - Baru lanjut setelah user menjawab.
4. Setelah component selesai dibuat → **update `context/ui-registry.md`** (nama, path, kelas yang dipakai).

**Berbeda dari repo mobile lain milik user:** repo ini **belum** punya izin standing untuk skip Step 1 — user sudah bilang akan menaruh file desain dari Claude Design canvas belakangan. Token di `ui-tokens.md` saat ini hanya diseed dari `client/src/css/tailwind.config.js` sebagai placeholder scaffolding, **bukan** izin build UI produksi tanpa referensi visual.

### 2. Scope adalah hal sakral

Kerjakan **hanya** apa yang diminta pada feature yang sedang aktif di `build-plan.md`. Jangan menambah fitur, refactor di luar scope, atau "sekalian memperbaiki" hal lain tanpa persetujuan.

### 3. Satu feature sampai tuntas

Selesaikan satu feature sepenuhnya (termasuk bisa diverifikasi secara visual/fungsional) sebelum menyentuh feature berikutnya.

### 4. Update dokumen hidup

Setelah setiap feature selesai:
- Update `context/progress-tracker.md` (status, last completed, next)
- Update `context/ui-registry.md` jika ada component baru
- Catat keputusan penting di bagian *Decisions* pada progress-tracker

### 5. Jangan percaya training data untuk API library

Expo dan React Navigation berubah cepat. Scaffold ini pakai **Expo SDK 57** — `AGENTS.md` (di-include otomatis di atas) sudah mengingatkan untuk cek dokumentasi versi persis (`docs.expo.dev/versions/v57.0.0/`) sebelum pakai API baru. Sebelum memakai API yang kamu tidak 100% yakin, baca `context/library-docs.md` dan/atau dokumentasi resmi terbaru. Jika ragu, katakan ragu — jangan mengarang API.

### 6. Backend/schema bukan milik repo ini

Repo ini **tidak punya source backend maupun migration sendiri**:
- Modul yang sudah ada backend-nya (auth, dtdoor, gotv, ruangpublik, timses) → source ada di `/Users/asdarsaid/JSI/api`, baca dari sana untuk kebenaran endpoint/DTO, jangan asumsi dari training data.
- Modul DPT dan Hasil Rekap → **belum ada repo backend yang dibagikan**. Endpoint yang terlihat dipakai `client` (mis. `/dpt/2024/:kabId`) adalah observasi dari web, bukan kontrak yang dikonfirmasi. Kalau sebuah feature butuh detail schema/endpoint modul ini, **tanya user path repo-nya** — jangan mengarang field atau perilaku.
- Kalau feature mobile butuh endpoint baru/berubah di backend yang sudah ada repo-nya: beri tahu user perubahan itu perlu dikerjakan di `/Users/asdarsaid/JSI/api`, baru lanjut implementasi mobile setelah endpoint tersedia.

---

## Stack Project

| Layer | Tool |
| --- | --- |
| Framework | Expo (React Native), TypeScript strict mode |
| Navigasi | React Navigation (bottom tabs + native stack), role-based (admin/adminsekret vs timses) |
| Styling | NativeWind (Tailwind syntax), token placeholder diadaptasi dari `client/src/css/tailwind.config.js` |
| Data fetching/cache | TanStack Query di atas `axios` (lihat `src/lib/api/client.ts`) |
| Backend | NestJS API — `/Users/asdarsaid/JSI/api` (sebagian modul), sisanya lewat kontrak yang diamati dari `client` |
| Auth session | `expo-secure-store` (menyimpan `acces_token`, menggantikan cookie di web) |
| Realtime | `socket.io-client` (status online tim, menggantikan socket di `layout-hook.js` web) |
| Lokasi | `expo-location` (GPS wajib saat login, mengikuti `client/src/pages/Login.jsx`) |

Detail lengkap: `context/architecture.md`.

---

## Slash Commands yang Tersedia

| Command | Fungsi |
| --- | --- |
| `/build-ui` | Workflow membuat screen/component — menegakkan aturan referensi desain |
| `/new-feature` | Workflow mengerjakan satu feature dari build-plan sampai tuntas |
| `/update-context` | Sinkronkan progress-tracker + ui-registry setelah kerja selesai |

Tidak ada `/db-change` di repo ini — lihat Aturan #6 di atas; perubahan backend selalu diarahkan ke repo backend yang relevan (atau ditanyakan ke user kalau repo-nya belum ada).

---

## Gaya Komunikasi

- Bahasa Indonesia, istilah teknis boleh tetap Inggris
- Ringkas dan langsung. Jangan basa-basi, jangan validasi kosong
- Jika permintaan user secara teknis salah arah atau ada cara yang lebih baik/aman, katakan SEBELUM mengerjakan
- Jika informasi penting kurang, tanyakan maksimal 1–2 hal — jangan menebak pada hal yang berisiko (schema, auth, data user)

---

## Yang TIDAK BOLEH Dilakukan

- Generate UI tanpa melewati checklist referensi desain (lihat Aturan #1 — **tidak ada pengecualian di repo ini**)
- Mengarang schema/endpoint untuk modul DPT atau Hasil Rekap (lihat Aturan #6)
- Menulis kode backend/migration di repo ini
- Menjalankan perintah destruktif terhadap database/instance manapun tanpa konfirmasi user
- Hardcode secret/API key di kode — semua lewat `.env` dengan prefix `EXPO_PUBLIC_` hanya untuk yang memang boleh terekspos ke client
- Memakai `any` di TypeScript
- Memakai warna/style bawaan di luar token dari `ui-tokens.md`
- Membuat file baru di luar struktur folder yang ditetapkan `architecture.md`
