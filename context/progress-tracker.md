# Progress Tracker

Update file ini setiap selesai satu feature. Claude Code yang membaca file ini harus langsung tahu: apa yang sudah selesai, apa yang sedang dikerjakan, apa yang berikutnya.

---

## Status Saat Ini

**Phase:** 1 — Foundation
**Terakhir selesai:** 01 Setup Project + referensi desain masuk ke `context/designs/`
**Berikutnya:** 02 Auth — Login dengan GPS (referensi desain **sudah ada**: `context/designs/login.png` — lanjut ke `/build-ui` tanpa perlu tanya user lagi)

---

## Progress

### Phase 1 — Foundation
- [x] 01 Setup Project
- [ ] 02 Auth — Login dengan GPS
- [ ] 03 Profile

### Phase 2 — Modul dengan Backend Terkonfirmasi
- [ ] 04 Program Pemenangan — Door To Door
- [ ] 05 Program Pemenangan — Social Event / GOTV
- [ ] 06 Timses
- [ ] 07 Lacak Relawan / Tracking

### Phase 3 — Modul dengan Backend Belum Terkonfirmasi
- [ ] 08 DPT (blocked — belum ada repo backend)
- [ ] 09 Hasil Rekap 2019/2024 (blocked — belum ada repo backend)

---

## Keputusan Selama Build (Decisions)

_Catat keputusan penting di sini saat dibuat. Format: tanggal — keputusan — alasan._

- 2026-08-21 — Repo `jsi-mobile` dibuat sebagai kanal mobile tambahan untuk dashboard kampanye JSI, meniru struktur claude-kit (`CLAUDE.md` + `context/` + `.claude/commands/`) dari repo lain milik user (`temutani-mobile`) — permintaan eksplisit user.
- 2026-08-21 — Backend: NestJS API di `/Users/asdarsaid/JSI/api` sudah punya modul auth/dtdoor/gotv/ruangpublik/timses. Modul DPT dan Hasil Rekap **belum** punya repo yang dibagikan user — jangan implementasi mendalam untuk keduanya sebelum path repo-nya diberikan (lihat `CLAUDE.md` Aturan #6, `api-standards.md`).
- 2026-08-21 — Referensi desain: **tidak ada** izin standing untuk build UI tanpa referensi visual di repo ini (beda dari `temutani-mobile` yang punya izin ini) — user akan menaruh file desain dari Claude Design canvas ke `context/designs/` secara bertahap. `ui-tokens.md` saat ini cuma placeholder dari `client/src/css/tailwind.config.js` untuk keperluan scaffolding, bukan token final.
- 2026-08-21 — Scope sesi scaffold ini dibatasi ke: Expo project jalan (navigasi kosong, axios client, token storage) + seluruh dokumen claude-kit. Login dan screen lain sengaja **tidak** dibangun sesi ini (keputusan eksplisit user) — dikerjakan sesi berikutnya via `/new-feature`.
- 2026-08-21 — `babel-preset-expo` harus di-install manual (tidak otomatis ikut template `blank-typescript` SDK 57) — tanpa ini Metro gagal transform. Lihat `library-docs.md`.
- 2026-08-21 — Ditambahkan `declare module "*.css";` di `nativewind-env.d.ts` untuk mengatasi TS2882 pada `import "./global.css"` di `App.tsx` (versi NativeWind terpasang tidak mendeklarasikan ambient module ini). Lihat `library-docs.md`.
- 2026-08-21 — 8 dari 9 screen MVP sudah punya referensi desain nyata (export manual dari Claude Design canvas "JSI Mobile Dashboard.dc.html" milik user) di `context/designs/`: `login.png`, `home-dashboard.png`, `dpt.png`, `hasil-rekap.png`, `timses.png`, `program-pemenangan.png`, `lacak-relawan.png`, `profile.png`. Sekilas dari `login.png`: header gelap yang dipakai desain nyata dekat dengan token placeholder `primary`/`background` yang sudah ada — tetap **audit penuh terhadap `ui-tokens.md` wajib dilakukan** saat `/build-ui` jalan pertama kali (Step 3 di `ui-workflow.md`), jangan asumsikan token placeholder sudah 100% cocok.
- 2026-08-21 — **WhatsApp Broadcast dikeluarkan dari scope MVP** (bukan "menunggu desain") karena tidak ada file desain untuk screen ini — dipindah ke luar MVP di `project-overview.md`/`build-plan.md`. Item `10 WhatsApp Broadcast` dihapus dari checklist Phase 3 di atas.

---

## Catatan (Notes)

_Workaround, pola yang menyimpang dari context files, hal yang perlu diingat session berikutnya._

- Verifikasi scaffold Phase 1: `npx tsc --noEmit` bersih, `npx expo start` (mode `CI=1`) boot Metro tanpa error, request manual ke `/index.bundle?platform=ios&dev=true` berhasil (`iOS Bundled 4642ms index.ts (1448 modules)`, HTTP 200). Tidak ada simulator/device fisik di environment ini — user perlu jalankan `npm run ios`/`npm run android` sendiri untuk verifikasi visual.
- `RootNavigator.tsx` saat ini pakai `useState<Session>(null)` yang di-hardcode — ini SENGAJA untuk membuktikan wiring navigasi jalan, bukan bug. Feature 02 (Auth) yang akan menggantinya dengan session asli dari `expo-secure-store` + fetch profile.
