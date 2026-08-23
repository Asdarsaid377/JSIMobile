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
- Referensi desain: `context/designs/login.png` (sudah ada — ikuti `ui-workflow.md` Step 1-2 seperti biasa, tidak perlu tanya user lagi untuk screen ini)
- Verifikasi: login dengan akun asli → token tersimpan → sesi persist setelah app di-restart → role menentukan tab yang tampil

### 03 Profile
- Screen Profile: lihat &amp; edit data diri
- Logout (hapus token, kembali ke AuthStack)
- Referensi desain: `context/designs/profile.png`
- Verifikasi: submit perubahan tersimpan, logout mengembalikan ke Login

---

## Phase 2 — Modul dengan Backend Terkonfirmasi

### 04 Program Pemenangan — Door To Door
- List &amp; input kunjungan Door To Door, wiring ke `/Users/asdarsaid/JSI/api/src/dtdoor`
- Referensi desain: `context/designs/program-pemenangan.png`
- Verifikasi: kunjungan baru tersimpan &amp; muncul di list

### 05 Program Pemenangan — Social Event / GOTV
- List &amp; input Social Event, wiring ke `/Users/asdarsaid/JSI/api/src/gotv`
- Referensi desain: `context/designs/program-pemenangan.png` (satu file mencakup kedua sub-program — cek apakah ada section terpisah di dalamnya)
- Verifikasi: sama seperti 04

### 06 Timses
- Lihat hierarki tim (Kabupaten → Kecamatan → Desa) &amp; status online, wiring ke `/Users/asdarsaid/JSI/api/src/timses`
- Referensi desain: `context/designs/timses.png`
- Verifikasi: hierarki tampil benar, status online update realtime

### 07 Lacak Relawan / Tracking
- Map view + list status online anggota tim (realtime via socket.io)
- Referensi desain: `context/designs/lacak-relawan.png`
- Verifikasi: posisi/status update tanpa refresh manual

### 10 Kekuatan Wilayah (dipindah dari "Fase Berikutnya" — dikerjakan 2026-08-22)
- Zona kekuatan (Kuat/Sedang/Lemah) per kelurahan, dihitung dari skor kunjungan Door To Door (`kategoriId`) — skor & threshold di `src/lib/dtdoorScore.ts`, **bukan field asli dari backend** (tidak ada di entity `Dtdoor` manapun, lihat `api-standards.md` § dtdoor). Di-push dari Program → tab Door To Door.
- Referensi desain: `context/designs/kekuatanwilayah.png`
- Verifikasi: toggle Peta/List, grid warna & badge tier sesuai skor rata-rata tiap kelurahan, scoping wilayah (admin lihat semua, role lain cuma kecamatan sendiri)

### 11 Kekuatan Pemilih (dipindah dari "Fase Berikutnya" — dikerjakan 2026-08-22)
- Skor PER-PEMILIH (bukan agregat per-kelurahan seperti item 10) — distribusi Kuat/Sedang/Lemah, ranking kelurahan, top 10 pemilih skor tertinggi, filter wilayah eksplisit (admin bebas pilih kecamatan, role lain terkunci). Reuse penuh model skor `src/lib/dtdoorScore.ts`. Di-push dari Program → tab Door To Door (tombol "Lihat Skor Pemilih").
- Referensi desain: `context/designs/kekuatanpemilih.png`
- Verifikasi: dikonfirmasi user bekerja 2026-08-22 — lihat `progress-tracker.md` Decisions.

---

## Phase 3 — Modul dengan Backend Belum Terkonfirmasi

**Jangan mulai fase ini sebelum user memberi path repo backend untuk DPT dan/atau Hasil Rekap — lihat `CLAUDE.md` Aturan #6 dan `api-standards.md`.**

### 08 DPT
- List, filter bertingkat (Kecamatan/Kelurahan/TPS), search ✅, CRUD dasar (Tambah/Edit/Hapus) ✅ (2026-08-22, mock data — `src/services/dpt.ts`, `DptRecordFormScreen`, `DptVoterActionSheet`, belum dikonfirmasi user bekerja di device), tandai partisipasi program **belum dikerjakan**
- Verifikasi: filter &amp; search mengubah hasil (✅), CRUD dasar tersimpan di mock (lihat `progress-tracker.md` Catatan untuk langkah tes), tandai partisipasi tersimpan (belum)

### 09 Hasil Rekap (2019/2024)
- Drill-down Provinsi → Kabupaten → Kecamatan → Kelurahan → TPS per jenis pemilihan
- Referensi desain: `context/designs/hasil-rekap.png`
- Verifikasi: drill-down menampilkan data benar di tiap level

---

## Fase Berikutnya (di luar MVP saat ini)

- **WhatsApp Broadcast** — dikeluarkan dari MVP karena belum ada desainnya (lihat `project-overview.md`). Begitu desain dibuat, tambahkan lagi sebagai item Phase 3 — cek juga apakah backend menyediakan endpoint kirim langsung atau perlu deep link WhatsApp native (beda dari pola `whatsapp-web.js` di `/Users/asdarsaid/JSI/api`, verifikasi dulu)
- Survey, Zona, Bigdata Pendukung, Pengeluaran (sebagai screen mobile terpisah), Pertanyaan
- ✅ **Verifikasi Kunjungan / Anti-Fraud (2026-08-22) — SELESAI, di luar build-plan awal, permintaan user langsung via DesignSync.** Screen `AntiFraudScreen` (ref artboard "14 · VERIFIKASI KUNJUNGAN / ANTI-FRAUD"): tab "Anomali" (jenis anomali terdeteksi + daftar kasus "Perlu Ditinjau" dengan bottom sheet bukti kunjungan) + tab "Skor Relawan" (kredibilitas relawan berbasis skor). **SENGAJA read-only** — permintaan eksplisit user "generate UI-nya saja dulu, nanti saya buatkan API-nya": `services/antifraud.ts` cuma 1 fungsi fetch, tombol "Setujui"/"Tolak Data" cuma tutup sheet (belum ada mutation approve/reject). Entry point shortcut "Anti-Fraud" di Akses Cepat Home. Detail lengkap di `progress-tracker.md` Decisions.
- ✅ **Quick Count (2026-08-22) — SELESAI, di luar build-plan awal, permintaan user langsung via DesignSync.** Screen `QuickCountScreen` (ref artboard "12 · SAKSI & QUICK COUNT" — cuma bagian Quick Count yang dibangun sesuai instruksi eksplisit "tiru khusus quick count saja"; manajemen Saksi di artboard yang sama diabaikan, sudah ada `SaksiTpsScreen` sendiri): tab "Hasil Live" (kartu ringkasan suara masuk/TPS terlapor LIVE, perolehan suara per kandidat, status verifikasi C1) + tab "Status TPS" (list TPS dengan status/saksi + search) + sheet input hasil C1 per TPS. Mock service standar `services/quickcount.ts` — 5 kandidat + 5 TPS. Beda penting dari mockup: semua angka utama BENERAN di-derive dari data (bukan statis kayak mockup aslinya) — field `hasilC1` ditambah sendiri supaya fitur ini nyata "live". Entry point shortcut "Quick Count" di Akses Cepat Home. Detail lengkap di `progress-tracker.md` Decisions.
- ✅ **Tokoh Masyarakat (2026-08-22) — SELESAI penuh, di luar build-plan awal.** Screen `TokohMasyarakatScreen` (ref `tokoh1.png` + `tokohlist.png`, 1 screen yang sama, di-export 2 file) — summary (kartu ringkasan Mendukung/Netral/Lawan, distribusi kategori, sebaran kelurahan) + "Daftar Tokoh" (search fungsional, `TokohCard`) — disambung ke shortcut "Tokoh" di Akses Cepat Home. BUKAN modul `/tokoh` yang ada di web (`client/src/pages/tokoh/`) — entitas web itu survei standalone tanpa DPT/kategori, tidak dipakai sebagai referensi. Mock service standar `services/tokoh.ts` (pola sama Rival Caleg/Saksi/Real Count), 5 kategori diambil dari mockup: **Tokoh Agama, Tokoh Pemuda, Tokoh Adat, Tokoh Pendidikan, Tokoh Perempuan** (beda dari 4 kategori yang sempat disebut user secara verbal sebelum desain ditemukan). Alur **"Identifikasi Tokoh Baru"**: form baru `TokohFormScreen` (tidak ada mockup untuk form-nya sendiri, field diturunkan dari model data) — bisa diakses standalone (tombol footer) ATAU dari **icon bintang di `DptCard`** (permintaan eksplisit user "pake icon bintang saja di card list dpt") yang prefill Nama/Alamat/Kecamatan/Kelurahan dari record DPT terpilih. Detail lengkap di `progress-tracker.md` Decisions.
- Push notification
- Offline cache
- ~~Skoring Kekuatan Pemilih~~ — **selesai**, lihat "11 Kekuatan Pemilih" di Phase 2 di atas.
- **Customer Service** (`src/screens/home/CustomerServiceScreen.tsx`, dikerjakan 2026-08-22, di luar build-plan awal) — FAQ statis seputar app JSI + input pesan non-fungsional, di-push dari icon "headset" di header Home (dulu hamburger menu). Referensi `context/designs/customer-service.png` ternyata screenshot app lain (tiket.com), cuma pola layout yang dipakai — lihat `progress-tracker.md` Decisions untuk detail adaptasinya.
- **Target Suara** (`src/screens/targetsuara/`, dikerjakan 2026-08-22, di luar build-plan awal) — drill-down Kabupaten→Kecamatan→Kelurahan→TPS, input+lihat target suara per level (reuse hierarki DPT), plus laporan/analitik agregat lintas-wilayah. Penyimpanan **local-only di device** (`SecureStore`) — belum ada endpoint backend untuk konsep ini. Di-push dari icon "flag" di header `DptListScreen`. Detail di `progress-tracker.md` Decisions.
- **Saksi TPS** (`src/screens/saksi/`, dikerjakan 2026-08-22, di luar build-plan awal) — kelola saksi per TPS (tambah + ubah status), nested di `TargetSuaraTpsScreen`. Mock service standar (`services/saksi.ts`, pola sama `dtdoor.ts`) — permintaan user "UI dulu, API dikembangkan belakangan".
- **Real Count C1** (`src/screens/realcount/`, dikerjakan 2026-08-22, di luar build-plan awal) — drill-down wilayah SENDIRI (Kabupaten→Kecamatan→Kelurahan→TPS, terpisah dari Target Suara atas permintaan eksplisit user) + form input hasil hitung suara per TPS dengan cross-check otomatis. Mock service standar (`services/realcount.ts`), belum ada endpoint backend. Di-push dari icon "calculator" di header `DptListScreen`.
- **3 saran fitur konsultan politik (2026-08-22, prioritas sesuai urutan user) — item 1 & 2 SELESAI & dikonfirmasi bekerja di device, item 3 belum dikerjakan:**
  1. ✅ **Rival Internal Separtai** (`src/screens/rivalcaleg/`, `src/services/rivalcaleg.ts`) — tracking caleg lain dari partai yang sama di dapil yang sama (khas pileg Indonesia sistem proporsional terbuka). CRM: List → tambah rival (nama/no. urut/catatan) → Detail → assessment kekuatan per kecamatan/desa (free text) + level ancaman. Mock service standar, entry point shortcut "Rival Caleg" di Akses Cepat Home. Detail lengkap di `progress-tracker.md` Decisions.
  2. ✅ **Prioritas Follow-up Pemilih Swing** (`src/screens/program/SwingVoterFollowUpScreen.tsx`) — list pemilih kategori "Belum Menentukan" dari data Dtdoor yang sudah ada (murni derive, tidak ada schema baru), diurutkan dari paling lama belum di-follow-up + badge urgensi + tombol "Hubungi" yang beneran fungsional (`Linking` tel:). Entry point: grid icon Door To Door.
  3. ✅ **Pengeluaran/Anggaran Kampanye (Budgeting Kampanye)** (`src/screens/budgeting/`, `src/services/budgeting.ts`) — dikerjakan & dikonfirmasi bekerja di device 2026-08-22. Referensi desain: artboard "Budgeting Kampanye" di project Claude Design yang sama, ditarik via `DesignSync` (`context/designs/budgeting-kampanye.dc.html`). Kategori pos anggaran ikut **5 pos operasional di mockup** (Atribut & Alat Peraga/Operasional Timses/Door To Door/Social Event/Digital & Broadcast) — BUKAN kategori resmi LPSDK/LPPDK seperti sempat diputuskan sebelumnya (superseded); penyimpanan mock service standar (pola sama Rival Caleg/Saksi/Real Count); entry point shortcut "Budgeting" di grid Akses Cepat Home. **"Biaya per suara" (tujuan akhir item ini) BELUM dikerjakan** — butuh data Target Suara/Real Count lengkap dulu, di luar scope sesi ini.
- **"Ringkasan Data"** (`src/screens/program/DtdoorAnalyticsScreen.tsx`, dikerjakan 2026-08-22, di luar rencana 3-saran di atas — permintaan user langsung) — analisa deskriptif Dtdoor: distribusi kategori (proxy terdekat untuk "pilihan pileg", Dtdoor tidak punya field preferensi kandidat), distribusi gender, program bantuan terpopuler. Murni derive client-side, dikonfirmasi bekerja di device.
