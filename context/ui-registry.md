# UI Registry

Dokumen hidup. Di-update setiap kali sebuah component selesai dibuat. **Baca file ini sebelum membangun component baru** — cocokkan dengan pola yang sudah ada sebelum menciptakan pola baru.

---

## Cara Pakai

Sebelum membangun component apapun:
1. Cek apakah component serupa sudah ada di daftar bawah
2. Jika ada — pakai component yang sama atau extend props-nya. Cocokkan kelasnya persis
3. Jika belum ada — build mengikuti `ui-workflow.md`, `ui-rules.md`, dan `ui-tokens.md`, lalu tambahkan ke sini

Setelah membangun component apapun — update file ini dengan format entry di bawah.

---

## Format Entry

```markdown
### NamaComponent
- **Path:** src/components/<folder>/NamaComponent.tsx
- **Dipakai di:** screen mana yang memakai
- **Referensi desain:** context/designs/<file>.png (atau "tanpa referensi — keputusan tercatat di progress-tracker")
- **Pola kelas kunci:** bg-surface border border-border rounded-lg p-md
- **Catatan:** varian, props penting, batasan
```

---

## Components

### Button
- **Path:** src/components/ui/Button.tsx
- **Dipakai di:** LoginScreen (varian `brand`)
- **Referensi desain:** context/designs/login.png
- **Pola kelas kunci:** `min-h-[44px] items-center justify-center rounded-lg px-lg py-sm active:opacity-80` + varian bg (`bg-accent`/`bg-surface border border-border`/`bg-primary`)
- **Catatan:** 3 varian — `primary` (accent biru, aksi in-context), `secondary` (outline), `brand` (dark navy, CTA full-width auth/hero — lihat catatan audit di `ui-rules.md`). Prop `loading` render `ActivityIndicator` menggantikan label.

### Input
- **Path:** src/components/ui/Input.tsx
- **Dipakai di:** LoginScreen (Username, Password), ProfileScreen (Nama Lengkap, No. HP, Email, Wilayah Tugas)
- **Referensi desain:** context/designs/login.png, context/designs/profile.png
- **Pola kelas kunci:** `rounded-md border border-border px-md py-sm` + `bg-surface`/`text-text-primary` saat `editable` (default), `bg-surface-secondary`/`text-text-muted` saat `editable={false}`
- **Catatan:** Prop `rightElement` untuk slot di kanan input (dipakai LoginScreen untuk toggle "Lihat"/"Sembunyikan" password). `placeholderTextColor` di-hardcode hex karena NativeWind tidak bisa styling prop native itu — dikomentari di kode. Varian `editable={false}` ditambahkan saat Feature 03 (Profile) — dipixel-sample dari field "Wilayah Tugas" di `profile.png` (bg `surface-secondary`, bukan `surface`), dipakai juga untuk field "Email" (lihat catatan `ProfileScreen` di bawah kenapa field itu non-fungsional).
- **Bug Android — teks TextInput tidak center vertikal (2026-08-22, laporan user + screenshot device):** 3 iterasi sampai fix beneran kelihatan di device (lihat `progress-tracker.md` Decisions untuk kronologi lengkap). Fix final: `textAlignVertical="center"` (prop, Android-only) + `style={{ includeFontPadding: false, paddingVertical: 0, lineHeight: 20 }}`. Kuncinya `lineHeight: 20` — override eksplisit lineHeight lebih ketat dari `text-body-md` (24px), karena font kustom Inter di Android tidak mendistribusikan slack `lineHeight` dengan simetris di dalam line-box meski `includeFontPadding`/`paddingVertical` sudah 0. Pola ini WAJIB dipakai di setiap `TextInput` baru yang pakai `text-body-md` (search bar, form field custom di luar `Input.tsx`) — lihat `DptProvinsiScreen`/`DptKabupatenScreen`/`DptListScreen`/`CustomerServiceScreen` untuk contoh pemakaian di luar komponen ini.

### Badge
- **Path:** src/components/ui/Badge.tsx
- **Dipakai di:** ProfileScreen (role badge di bawah nama), LacakRelawanScreen (pill status, prop `dot`)
- **Referensi desain:** context/designs/profile.png, context/designs/lacak-relawan.png
- **Pola kelas kunci:** `flex-row items-center gap-xs self-start rounded-full px-md py-xs` + `bg-{variant}-soft`/`text-{variant}`, dot opsional `h-1.5 w-1.5 rounded-full bg-{variant}`
- **Catatan:** 4 varian (`accent`/`success`/`warning`/`danger`) mengikuti 4 role warna status yang sudah didefinisikan di `ui-rules.md`. Pixel-sample badge di `profile.png` sebenarnya sedikit lebih terang (`#eff6ff`-ish) dari token `accent-soft` (`#dbeafe`) yang ada — dianggap deviasi kecil (bukan token baru), lihat Decisions di `progress-tracker.md`. Prop `dot?: boolean` ditambah di Feature 07 untuk pill "Real-time" bertitik di `lacak-relawan.png` — extend, bukan component baru.

### Switch
- **Path:** src/components/ui/Switch.tsx
- **Dipakai di:** ProfileScreen (Notifikasi, Lokasi GPS Aktif)
- **Referensi desain:** context/designs/profile.png
- **Pola kelas kunci:** wrapper `opacity-60` saat `disabled` (RN `Switch` sendiri tidak bisa di-`className`-kan, sama alasan dengan `Input` placeholder)
- **Catatan:** Track color di-hardcode hex `#3b82f6` (on, cocok `accent`) dan `#94a3b8` (off, cocok persis `text-inverse-muted` meski dipakai di konteks berbeda — nilai hex sama, dikomentari di kode) karena prop native `trackColor`/`thumbColor` tidak bisa lewat NativeWind.

### ProfileAvatar
- **Path:** src/components/profile/ProfileAvatar.tsx
- **Dipakai di:** ProfileScreen
- **Referensi desain:** context/designs/profile.png
- **Pola kelas kunci:** `h-20 w-20 items-center justify-center rounded-full bg-primary`, inisial `text-headline-md text-text-inverse`
- **Catatan:** Inisial diambil dari 2 kata pertama `namaLengkap`. Pixel-sample bg avatar cocok persis token `primary` (#1e293b), bukan `surface-inverse` meski sama-sama gelap.

### AccessScopeNotice
- **Path:** src/components/profile/AccessScopeNotice.tsx
- **Dipakai di:** ProfileScreen
- **Referensi desain:** context/designs/profile.png
- **Pola kelas kunci:** `rounded-lg border border-border bg-surface p-md`
- **Catatan:** Teks role-aware — admin/adminsekret dapat kalimat "mencakup seluruh kabupaten", role lain dapat kalimat dibatasi ke `wilayahLabel` (format `Kec. {kecamatan}`). Nama role tebal via nested `Text`.

### ProfileScreen
- **Path:** src/screens/profile/ProfileScreen.tsx
- **Dipakai di:** AdminTabs & TimsesTabs (route "Profil")
- **Referensi desain:** context/designs/profile.png
- **Pola kelas kunci:** `bg-background` root, section `gap-md px-margin-mobile pt-sm` (dikurangi dari `pt-lg` — user feedback: heading harus pas di safe area atas, tidak perlu jarak besar)
- **Catatan:** Beberapa deviasi dari desain, semua by-design lewat konfirmasi user (lihat Decisions `progress-tracker.md`):
  - **Field "Email" non-fungsional** (`editable={false}`, placeholder "Belum didukung backend") — entity `timses` di `/Users/asdarsaid/JSI/api/src/timses/entities/timse.entity.ts` **tidak punya kolom email**, dan payload login (`api-standards.md` Auth Flow poin 6) juga tidak membawa email. Bukan bug — keputusan eksplisit user saat field ini tidak punya dukungan backend.
  - **Tombol "Simpan Perubahan"** ditambahkan (tidak ada di desain, kemungkinan terpotong di export) — submit `nama_lengkap`+`no_telpon` lewat `PATCH /timses/:id`.
  - **Tombol "Keluar" (Logout)** ditambahkan di akhir scroll, sebelum tab bar (tidak ada di desain, kemungkinan terpotong di export juga) — pakai `Alert.alert` konfirmasi sebelum `useAuth().logout()`.
  - **Toggle "Notifikasi"** murni local state (`useState`, tidak dikirim ke backend) — tidak ada kolom di entity `timses`, dan fitur push notification eksplisit di luar scope MVP (`build-plan.md` § Fase Berikutnya).
  - **Toggle "Lokasi GPS Aktif"** selalu `disabled`, nilainya cermin status real dari `useLocationPermission()` (bukan preference yang bisa diubah dari screen ini) — konsisten dengan pola GPS gate client-side dari Feature 02.
  - Data No. HP / Wilayah Tugas (kecamatan) **tidak ada** di payload login — di-fetch terpisah lewat `GET /timses/:id` (`useProfile`/`services/profile.ts`), bukan dari `useAuth().session` saja.

### Select
- **Path:** src/components/ui/Select.tsx
- **Dipakai di:** DtdoorFormScreen (Jenis Kelamin, Kategori, Program Bantuan 1/2/3)
- **Referensi desain:** tidak ada referensi visual — hand-rolled, tidak ada dropdown/picker di desain manapun yang diberikan. Distyling konsisten dengan `Input.tsx` (bordered box, label di atas) + `Ionicons chevron-down`.
- **Pola kelas kunci:** field tertutup sama seperti `Input` (`rounded-md border border-border px-md py-sm`, `bg-surface`/`bg-surface-secondary` saat disabled); modal bottom-sheet `rounded-t-xl bg-surface p-md`, row option `min-h-[44px] active:opacity-80`
- **Catatan:** Generic `Select<T extends string | number>` — dipakai untuk value string (Program Bantuan) maupun number (Kategori id). Tidak ada dependency baru (`@react-native-picker/picker` dsb sengaja tidak dipakai) — pakai RN `Modal` bawaan. Scrim modal hardcode `rgba(15,23,42,0.6)` (tidak ada token scrim di project, dikomentari di kode, sama alasan dengan `Input`/`Switch`).

### DtdoorSegmentedControl
- **Path:** src/components/dtdoor/DtdoorSegmentedControl.tsx
- **Dipakai di:** ProgramPemenanganScreen (toggle Door To Door / Social Event)
- **Referensi desain:** context/designs/program-pemenangan.png
- **Pola kelas kunci:** track `flex-row gap-xs rounded-lg bg-surface-secondary p-xs`, pill aktif `bg-primary text-text-inverse`, pill tidak aktif `bg-transparent text-text-muted`
- **Catatan:** Warna pill aktif (`primary`, bukan `accent`) dan track (`surface-secondary`) dipixel-sample langsung dari `program-pemenangan.png` (exact match).

### DtdoorSummaryCard
- **Path:** src/components/dtdoor/DtdoorSummaryCard.tsx
- **Dipakai di:** ProgramPemenanganScreen (tab Door To Door)
- **Referensi desain:** context/designs/program-pemenangan.png (deviasi disengaja — lihat Catatan)
- **Pola kelas kunci:** `rounded-lg border border-border bg-surface p-md`
- **Catatan:** Desain menampilkan progress bar persentase ("45%") tapi itu untuk tab Social Event — tidak ada sumber data target/kuota untuk dtdoor. Diganti hitungan sederhana "{count} kunjungan tercatat" dari `GET /dtdoor/count`, keputusan eksplisit user (lihat progress-tracker.md Decisions).

### DtdoorCard
- **Path:** src/components/dtdoor/DtdoorCard.tsx
- **Dipakai di:** ProgramPemenanganScreen (list Door To Door)
- **Referensi desain:** context/designs/program-pemenangan.png (adaptasi dari pola card Social Event — tab Door To Door tidak aktif di screenshot, tidak ada referensi visual langsung untuk field-nya, lihat progress-tracker.md Decisions)
- **Pola kelas kunci:** `gap-xs rounded-lg border border-border bg-surface p-md`, badge kategori pakai `Badge variant="accent"`
- **Catatan:** Semua 7 nilai kategori diflatten ke 1 warna badge (`accent`) — kategori bukan status alur kerja seperti "Selesai"/"Terjadwal" di desain asli, jadi tidak ada pemetaan warna 7-arah tanpa mengarang token baru.

### DtdoorCardSkeleton
- **Path:** src/components/dtdoor/DtdoorCardSkeleton.tsx
- **Dipakai di:** ProgramPemenanganScreen (initial load ×3 dan `ListFooterComponent` saat fetch halaman berikutnya)
- **Referensi desain:** tidak ada — pola skeleton generik mengikuti `ui-rules.md` § Loading & Error States
- **Pola kelas kunci:** static bars `bg-surface-secondary rounded-sm` mengikuti box model `DtdoorCard`

### DtdoorEmptyState
- **Path:** src/components/dtdoor/DtdoorEmptyState.tsx
- **Dipakai di:** ProgramPemenanganScreen (list Door To Door kosong)
- **Referensi desain:** tidak ada — mengikuti pola `ui-rules.md` § Empty States (teks + icon + CTA)
- **Pola kelas kunci:** `items-center gap-md px-margin-mobile py-xl`

### DtdoorCategoryRow
- **Path:** src/components/dtdoor/DtdoorCategoryRow.tsx
- **Dipakai di:** DtdoorAnalyticsScreen ("Distribusi Kategori")
- **Referensi desain:** tidak ada — izin build dari ui-rules.md/ui-tokens.md
- **Pola kelas kunci:** label bebas + `"N (P%)"` di kanan berwarna tier, bar tipis `h-2` di bawah — struktur mirip `KekuatanDistribusiRow` tapi label FREE TEXT (bukan derived dari `STRENGTH_THRESHOLDS`), karena dipakai untuk 7 kategori bukan cuma 3 tier tetap
- **Catatan:** Warna bar REUSE tier kekuatan (`getStrengthTier` dari skor kategori, `lib/dtdoorScore.ts`) — 1 kategori (Relawan/Saksi/dst.) sudah punya "tier"-nya sendiri lewat skor, jadi konsisten dengan Kekuatan Wilayah/Pemilih alih-alih mengarang 7 warna kategorikal baru.

### DtdoorMagnitudeRow
- **Path:** src/components/dtdoor/DtdoorMagnitudeRow.tsx
- **Dipakai di:** DtdoorAnalyticsScreen ("Distribusi Gender", "Program Bantuan Terpopuler")
- **Referensi desain:** tidak ada — izin build dari ui-rules.md/ui-tokens.md
- **Pola kelas kunci:** sama layout row+bar dengan `DtdoorCategoryRow`, TAPI warna netral tunggal `text-accent`/`bg-accent` (bukan tier)
- **Catatan:** Gender & program bantuan tidak punya makna status baik/buruk seperti kategori dukungan — dataviz skill: magnitude tanpa polaritas pakai 1 hue sequential, bukan warna status yang dipaksakan.

### ProgramPemenanganScreen
- **Path:** src/screens/program/ProgramPemenanganScreen.tsx
- **Dipakai di:** AdminTabs & TimsesTabs (route "Program", icon `megaphone`)
- **Referensi desain:** context/designs/program-pemenangan.png
- **Pola kelas kunci:** `bg-background` root, heading + `DtdoorSegmentedControl` di `px-margin-mobile pt-sm` (dikurangi dari `pt-lg` — user feedback: heading harus pas di safe area atas)
- **Catatan:** Kedua tab (Door To Door — Feature 04, Social Event — Feature 05) sudah fully implemented, masing-masing `FlatList` terpisah dengan `useDtdoorList`/`useGotvList` (`useInfiniteQuery`) + pagination `onEndReached` + pull-to-refresh, bukan `.map()` di `ScrollView`. **2026-08-22, tab "Door To Door" — evolusi tombol aksi (2 iterasi):**
  1. Feature 10-11 nambah 3 tombol `Button variant="secondary"` full-width bertumpuk (Kekuatan Wilayah, Skor Pemilih, Follow-up Swing) di bawah "+ Input Kunjungan Baru" — user lapor "kurang enak dilihat" (mirip daftar menu).
  2. **DIGANTI grid icon 4 kolom** (`flex-row flex-wrap rounded-lg border border-border bg-surface p-sm` berisi 4× `HomeQuickAccessItem` `widthClass="w-1/4"`: Kekuatan Wilayah/Skor Pemilih/Follow-up Swing/Ringkasan Data) — reuse component Home, bukan bikin baru. "+ Input Kunjungan Baru" TETAP `Button` primary full-width sendiri (aksi utama, beda kelas dari 4 item "lihat analitik").

### DtdoorFormScreen
- **Path:** src/screens/program/DtdoorFormScreen.tsx
- **Dipakai di:** ProgramStack (route "DtdoorForm", push dari tombol "+ Input Kunjungan Baru", params `undefined` — entri standalone) **DAN** DptStack (route "DtdoorForm" juga, push dari `DptVoterActionSheet` → "Tandai ikut Door To Door", params `{ dptRecord, kabWilId, kabNama }`) — component YANG SAMA di-reuse di 2 stack berbeda, bukan duplikat. Param list-nya sengaja lokal ke file ini (`DtdoorFormParams`/`DtdoorFormRouteParamList`, diekspor), tidak diketik terhadap `ProgramStackParamList` lagi, supaya tidak terikat ke satu stack.
- **Referensi desain:** tidak ada referensi visual untuk field form — field diturunkan dari entity backend `Dtdoor` (lihat api-standards.md § dtdoor), bukan dari screenshot
- **Catatan:** Hanya `Nama Lengkap` & `Jumlah Wajib Pilih` yang required (2 kolom `NOT NULL` di entity), sisanya optional. `Nama Relawan` di-prefill dari `useAuth().session.user.namaLengkap` (masih bisa diedit). Field `status` (StatusDtDoor) sengaja **tidak** ada di form — field "Kategori" yang ada TETAP dikirim ke `kategori` (bukan `status`), keputusan eksplisit user 2026-08-22 supaya konsisten dengan behavior yang sudah dikonfirmasi jalan di device (lihat progress-tracker.md Decisions untuk temuan lengkap soal kemungkinan field ini tertukar dengan web).
  - **2026-08-22 — "Form Door To Door terintegrasi DPT" (permintaan eksplisit user):** saat dibuka dari DptStack dengan `dptRecord`, field `Nama Lengkap`/`NIK`/`Jenis Kelamin`/`TPS`/`RT`/`RW`/`Desa`/`Kecamatan`/`Kabupaten` di-prefill dari record DPT itu (tetap bisa diedit, pola sama web `FormDataKunjungan.jsx`) — TAPI linkage ke Dtdoor pakai **`dptRecord.idDpt`** (sequence kecil 1/2/3…, field BARU di `DptRecord`), **BUKAN `dptRecord.id`** (primary key besar 191483 dst.) — persis pola web (`dpt.idDpt`, lihat `client/src/pages/dtdoor/dtdoor-modal.jsx` + `FormDataKunjungan.jsx`). Submit sukses → `useMarkDptDtdoor(kabWilId)` dipanggil supaya badge "Door To Door" di `DptCard` langsung berubah (murni flip client-side, tidak ada relasi baca-balik sungguhan di mock — lihat `services/dpt.ts` § `markDptDtdoor`). Entri standalone (tanpa `dptRecord`) TIDAK berubah perilakunya — `idDpt` tetap synthetic (`generateSyntheticIdDpt()`).

### SwingVoterCard
- **Path:** src/components/dtdoor/SwingVoterCard.tsx
- **Dipakai di:** SwingVoterFollowUpScreen
- **Referensi desain:** tidak ada — izin build dari ui-rules.md/ui-tokens.md (saran konsultan politik, lihat progress-tracker.md Decisions)
- **Pola kelas kunci:** `gap-xs rounded-lg border border-border bg-surface p-md`, badge urgensi reuse `Badge` (`danger`/`warning`/`muted`), tombol "Hubungi" `bg-accent-soft` + `Ionicons "call-outline"`
- **Catatan:** Tombol "Hubungi" **BENERAN fungsional** — `Linking.openURL("tel:...")` (first use `Linking` di codebase ini), bukan `Alert` placeholder. Urgensi dihitung client-side dari `createdAt` (≥7 hari = Urgent/danger, 3-6 hari = Perlu Follow-up/warning, <3 hari = Baru Dikunjungi/muted).

### SwingVoterFollowUpScreen
- **Path:** src/screens/program/SwingVoterFollowUpScreen.tsx
- **Dipakai di:** ProgramStack (route "SwingVoterFollowUp"), di-push dari grid icon tab Door To Door `ProgramPemenanganScreen`
- **Referensi desain:** tidak ada
- **Pola kelas kunci:** `FlatList` + `SafeAreaView edges={[]}`, pola sama `KekuatanWilayahScreen` (scoping wilayah admin/kecamatan identik, skeleton/error/empty state reuse `KekuatanWilayahCardSkeleton`/`KekuatanEmptyState`)
- **Catatan:** Dikerjakan & dikonfirmasi bekerja di device 2026-08-22. **Murni derive dari data Dtdoor yang sudah ada** (`useDtdoorAll()`, sama hook dengan Kekuatan Wilayah/Pemilih) — TIDAK ADA schema/service baru, beda dari Rival Caleg/Target Suara. Filter `kategoriId === 7` ("Belum Menentukan") saja — sengaja TIDAK termasuk "Pemilih Kompetitor" (sudah condong lawan, follow-up ROI rendah). Urutan `createdAt` ascending (paling lama belum di-follow-up duluan).

### GotvSummaryCard
- **Path:** src/components/gotv/GotvSummaryCard.tsx
- **Dipakai di:** ProgramPemenanganScreen (tab Social Event)
- **Referensi desain:** context/designs/program-pemenangan.png (deviasi disengaja, sama seperti DtdoorSummaryCard — lihat Catatan)
- **Pola kelas kunci:** `rounded-lg border border-border bg-surface p-md`
- **Catatan:** Duplikat struktur dari `DtdoorSummaryCard` dengan copy berbeda ("{count} kegiatan tercatat") — sengaja tidak diabstraksi jadi 1 component generic karena cuma 2 pemakaian & folder-per-fitur (`architecture.md`). Progress bar persentase di desain diganti hitungan sederhana dari `GET /gotv/count`, sama alasan dengan tab Door To Door (tidak ada sumber data target/kuota di backend gotv).

### GotvCard
- **Path:** src/components/gotv/GotvCard.tsx
- **Dipakai di:** ProgramPemenanganScreen (list Social Event)
- **Referensi desain:** context/designs/program-pemenangan.png — **ini satu-satunya card di seluruh app yang punya referensi visual langsung 1:1** (tab Social Event aktif di screenshot desain, beda dari DtdoorCard yang cuma adaptasi)
- **Pola kelas kunci:** `gap-xs rounded-lg border border-border bg-surface p-md`
- **Catatan:** **Badge status ("Selesai"/"Terjadwal") sengaja TIDAK ditampilkan** meski ada di desain — relasi `status` di entity `Gotv` backend di-comment-out (bukan kolom aktif, lihat `api-standards.md` § gotv), tidak ada data untuk itu. Baris "lokasi · N peserta" pakai `desa` + `jumlahWajibPilih` (satu-satunya field angka orang di entity — bukan field "peserta" terpisah, field ini dipakai ulang sebagai proxy jumlah peserta).

### GotvCardSkeleton
- **Path:** src/components/gotv/GotvCardSkeleton.tsx
- **Dipakai di:** ProgramPemenanganScreen (initial load ×3, `ListFooterComponent` saat pagination)
- **Referensi desain:** tidak ada — duplikat struktur `DtdoorCardSkeleton`

### GotvEmptyState
- **Path:** src/components/gotv/GotvEmptyState.tsx
- **Dipakai di:** ProgramPemenanganScreen (list Social Event kosong)
- **Referensi desain:** tidak ada — mengikuti pola `ui-rules.md` § Empty States, duplikat struktur `DtdoorEmptyState`

### GotvFormScreen
- **Path:** src/screens/program/GotvFormScreen.tsx
- **Dipakai di:** ProgramStack (route "GotvForm", push dari tombol "+ Input Kegiatan Baru", params `undefined` — entri standalone) **DAN** DptStack (route "GotvForm" juga, push dari `DptVoterActionSheet` → "Tandai ikut Social Event", params `{ dptRecord, kabWilId, kabNama }`, 2026-08-24) — component YANG SAMA di-reuse di 2 stack, pola identik `DtdoorFormScreen`. Param list-nya lokal ke file ini (`GotvFormParams`/`GotvFormRouteParamList`, diekspor), tidak diketik terhadap `ProgramStackParamList`.
- **Referensi desain:** tidak ada referensi visual untuk field form — field diturunkan dari entity backend `Gotv` (lihat api-standards.md § gotv)
- **Catatan:** 7 field required (`Nama Kegiatan`, `Jumlah Peserta`, `TPS`, `Desa`, `Kecamatan`, `Kabupaten`, `PIC/Nama Lengkap`) sesuai kolom `NOT NULL` di entity — jauh lebih banyak field wajib dibanding `DtdoorFormScreen` (yang cuma 2). Tidak ada `Select` sama sekali (entity gotv tidak punya field kategori/relasi apapun yang aktif) — form ini murni `Input` text. **2026-08-24 — dibuka dari DptStack (`dptRecord` terisi):** Nama Lengkap/NIK/TPS/Desa/Kecamatan/Kabupaten di-prefill dari record DPT (tetap editable, pola sama `DtdoorFormScreen`), submit kirim `idDpt`/`kabId` asli record itu (bukan `generateSyntheticIdDpt()`+`kabId: null`) supaya join balik `dpt.gotv` di backend match — sukses → `useMarkDptGotv(kabWilId)` (no-op di real mode, cuma invalidate query supaya list refetch & badge "Social Event ✓" di `DptCard` ikut update). Dibuka dari ProgramStack (params `undefined`) → perilaku LAMA tidak berubah (form kosong, idDpt sintetis, tidak ada linkage).

### GpsStatusBanner
- **Path:** src/components/auth/GpsStatusBanner.tsx
- **Dipakai di:** LoginScreen
- **Referensi desain:** context/designs/login.png (3 pill status di desain diinterpretasikan sebagai legend 3 state dari 1 banner yang sama, bukan 3 element terpisah yang tampil bersamaan — lihat Decisions di `progress-tracker.md`)
- **Pola kelas kunci:** `flex-row gap-sm rounded-lg p-md` + `bg-warning-soft`/`bg-success-soft`/`bg-danger-soft` sesuai status
- **Catatan:** Props `status: "requesting" | "granted" | "denied"` dari `useLocationPermission`. Teks & warna per state didefinisikan sebagai lookup object literal (bukan template literal per-token) supaya class name statis terdeteksi NativeWind/Tailwind JIT scanner.

### TimsesBreadcrumb
- **Path:** src/components/timses/TimsesBreadcrumb.tsx
- **Dipakai di:** TimsesScreen
- **Referensi desain:** context/designs/timses.png (level Kabupaten sengaja dihapus — lihat Catatan `TimsesScreen` di bawah)
- **Pola kelas kunci:** `flex-row flex-wrap items-center gap-xs`, segmen tappable `text-label-md font-medium` (`text-accent` kalau tappable/admin, `text-text-primary` kalau tidak), separator `Ionicons chevron-forward`
- **Catatan:** 2 segmen (Kecamatan, Desa) menggantikan 3 segmen desain asli (Kabupaten/Kecamatan/Desa). Segmen Kecamatan mengambil alih styling accent-tappable yang di desain aslinya dipakai segmen Kabupaten.

### TimsesRegionPickerModal
- **Path:** src/components/timses/TimsesRegionPickerModal.tsx
- **Dipakai di:** TimsesScreen (picker Kecamatan & Desa, dibuka dari tap `TimsesBreadcrumb`)
- **Referensi desain:** tidak ada referensi visual eksplisit untuk modal-nya (desain cuma tampilkan 1 state breadcrumb) — pola bottom-sheet mengikuti `Select.tsx` (`rounded-t-xl bg-surface p-md`, row `min-h-[44px] active:opacity-80`, checkmark accent)
- **Catatan:** Bukan reuse `Select` — trigger-nya teks breadcrumb (bukan field bordered) dan butuh opsi "Semua" bernilai `null` yang tidak didukung generic `Select<T extends string | number>`. Prop `allLabel` opsional render row "Semua ..." di atas list.

### TimsesSummaryCards
- **Path:** src/components/timses/TimsesSummaryCards.tsx
- **Dipakai di:** TimsesScreen
- **Referensi desain:** context/designs/timses.png
- **Pola kelas kunci:** `flex-row gap-sm`, kartu 1 `flex-1 rounded-lg bg-primary p-md` (pixel-sample exact match `primary` #1e293b), kartu 2 `flex-1 rounded-lg border border-border bg-surface p-md` + `text-success` (exact match #16a34a)
- **Catatan:** Angka scoped ke kecamatan+desa yang sedang dipilih di breadcrumb (bukan total global seluruh app) — konsisten dengan konteks breadcrumb yang tampil di atasnya.

### TimsesMemberCard
- **Path:** src/components/timses/TimsesMemberCard.tsx
- **Dipakai di:** TimsesScreen
- **Referensi desain:** context/designs/timses.png
- **Pola kelas kunci:** `flex-row items-center gap-sm rounded-lg border border-border bg-surface p-md`, avatar `h-12 w-12 rounded-lg bg-accent-soft` (kotak rounded, BUKAN lingkaran seperti `ProfileAvatar`)
- **Catatan:** Avatar bg pixel-sample `#eff6ff` (deviasi kecil dari token `accent-soft` #dbeafe — pola sama dengan deviasi Badge di `profile.png`, tetap pakai `bg-accent-soft`, bukan token baru). Dot offline pixel-sample `#94a3b8` (deviasi kecil dari `text-muted` #64748b, tetap pakai `text-muted`/`bg-text-muted`, alasan sama). Role label map (`ROLE_LABEL` lokal di file ini) beda copy dari `ROLE_LABEL` di `ProfileScreen.tsx` — konteks beda (badge profil vs baris list hierarki), sengaja tidak digabung.

### TimsesMemberCardSkeleton
- **Path:** src/components/timses/TimsesMemberCardSkeleton.tsx
- **Dipakai di:** TimsesScreen (initial load ×3)
- **Referensi desain:** tidak ada — duplikat struktur `DtdoorCardSkeleton`/`GotvCardSkeleton`, disesuaikan layout avatar+2-baris teks

### TimsesEmptyState
- **Path:** src/components/timses/TimsesEmptyState.tsx
- **Dipakai di:** TimsesScreen (hasil kosong: wilayah kosong ATAU pencarian tidak match)
- **Referensi desain:** tidak ada — mengikuti pola `ui-rules.md` § Empty States. Tanpa tombol CTA (beda dari `DtdoorEmptyState`/`GotvEmptyState`) karena Feature 06 scope-nya "Lihat" saja, tidak ada aksi tambah yang aktif.

### TimsesScreen
- **Path:** src/screens/timses/TimsesScreen.tsx
- **Dipakai di:** HomeStack (route "Timses", di-push dari "Akses Cepat" di HomeScreen — **BUKAN tab lagi**, dipindah di Feature 08, lihat progress-tracker.md Decisions)
- **Referensi desain:** context/designs/timses.png
- **Pola kelas kunci:** `bg-background` root, `SafeAreaView edges={["bottom"]}` (top ditangani native stack header sekarang) + `px-margin-mobile pt-sm`
- **Catatan:** Header berubah dari custom in-content heading (waktu masih tab root) jadi **native stack header** (title "Timses" dari `HomeStack.tsx`, back chevron otomatis) — tombol "+" dipindah jadi `headerRight` via `navigation.setOptions()` di `useLayoutEffect`, tetap non-fungsional (`Alert` "Segera hadir"). 3 gap lain dikonfirmasi ke user via pertanyaan eksplisit sebelum build (lihat progress-tracker.md Decisions):
  1. **Status online = snapshot, BUKAN realtime.** Backend `@WebSocketGateway` di `AuthService` (`/Users/asdarsaid/JSI/api/src/auth/auth.service.ts`) tidak punya `@SubscribeMessage`/`server.emit` apapun — gateway kosong. Kolom `status_online` cuma di-set `'online'` sekali saat login, tidak pernah direset `'offline'` di manapun di backend (tidak ada logout hook/disconnect handler/timeout). Tidak connect `socket.io-client` sama sekali untuk fitur ini — list di-refresh via `useFocusEffect` (refetch tiap screen focus, pola sama dengan `useLocationPermission`) + `RefreshControl` pull-to-refresh.
  2. **Tidak ada level "Kabupaten".** Entity `Timse` cuma punya `kecamatan`/`desa`/`dusun`, tidak ada kolom kabupaten. Breadcrumb desain (Kab › Kec › Desa) diimplementasikan cuma 2 level (Kec › Desa) — lihat `TimsesBreadcrumb`.
  3. **Tidak ada endpoint filter hierarkis by nilai wilayah** — endpoint `timseskabupaten`/`timseskecamatan`/`timsesdesa` di controller ternyata filter by ROLE (`relawankabupaten` dst.), bukan by nilai kecamatan/desa tertentu. Hierarki Kecamatan→Desa dikelompokkan di client dari `GET /timses` (full list, `useTimsesList`/`services/timses.ts`).
  - Role admin/adminsekret bisa browsing bebas semua kecamatan (tap breadcrumb Kecamatan buka `TimsesRegionPickerModal`); role lain (`timses`/`relawan*`) DIBATASI ke kecamatan sendiri saja (dari `useProfile()`, breadcrumb Kecamatan non-tappable) — client-side only, konsisten dengan pola `AccessScopeNotice` di `ProfileScreen`.
  - Tombol "+" (ada di desain) sengaja **non-fungsional** (`Alert.alert` "Segera hadir") — build-plan Feature 06 cuma scope "Lihat hierarki & status online", tidak ada "tambah anggota". Sama pola dengan "Lupa password?" di `LoginScreen`.
  - Search bar filter client-side (nama/nik/desa/dusun/no.telpon) di dalam scope kecamatan+desa yang sedang aktif, tidak query ulang ke server (dataset kecil, sama seperti pendekatan grouping).

### TrackingMapView
- **Path:** src/components/tracking/TrackingMapView.tsx
- **Dipakai di:** LacakRelawanScreen
- **Referensi desain:** context/designs/lacak-relawan.png (area "Map View — peta lokasi tim" diganti map Leaflet sungguhan, bukan placeholder canvas)
- **Pola kelas kunci:** `WebView` full-bleed `style={{ flex: 1 }}`, HTML internal (bukan NativeWind — di luar tree RN)
- **Catatan:** WebView (`react-native-webview`, bukan `react-native-maps`) render Leaflet 1.9.4 + tile OpenStreetMap via CDN unpkg, persis library yang dipakai web (`client/src/pages/tracking/Tracking.jsx` via `react-leaflet`) — keputusan eksplisit user karena project belum punya `expo-dev-client`/native config untuk map native (lihat progress-tracker.md Decisions). Marker `L.circleMarker` diwarnai `#16a34a` (online, token `success`) / `#64748b` (offline, token `text-muted`) — cuma anggota dengan `lat`/`long` non-null yang dapat marker (mayoritas mock belum ada data, lihat `services/timses.ts`). Popup dibangun via DOM API (`createElement`/`textContent`), bukan interpolasi string HTML, untuk hindari injection dari `namaLengkap`.

### TrackingMemberRow
- **Path:** src/components/tracking/TrackingMemberRow.tsx
- **Dipakai di:** LacakRelawanScreen
- **Referensi desain:** context/designs/lacak-relawan.png
- **Pola kelas kunci:** `flex-row items-center justify-between gap-sm py-xs` (row flat di dalam bottom sheet, BUKAN card berborder seperti `TimsesMemberCard`)
- **Catatan:** Dot status + nama di kiri, wilayah (`Kec. X`/`Ds. Y`) di kanan — logic `KECAMATAN_LEVEL_ROLES` diduplikasi kecil dari `TimsesMemberCard.tsx` (2 pemakaian, pola sama dengan `GotvSummaryCard`/`DtdoorSummaryCard`, sengaja tidak diabstraksi).

### TrackingMemberRowSkeleton
- **Path:** src/components/tracking/TrackingMemberRowSkeleton.tsx
- **Dipakai di:** LacakRelawanScreen (initial load)
- **Referensi desain:** tidak ada — pola skeleton generik disesuaikan layout `TrackingMemberRow`

### TrackingEmptyState
- **Path:** src/components/tracking/TrackingEmptyState.tsx
- **Dipakai di:** LacakRelawanScreen (list anggota kosong)
- **Referensi desain:** tidak ada — mengikuti pola `ui-rules.md` § Empty States, duplikat struktur `TimsesEmptyState` (tanpa varian `hasSearch`, tidak ada search bar di desain ini)

### LacakRelawanScreen
- **Path:** src/screens/tracking/LacakRelawanScreen.tsx
- **Dipakai di:** HomeStack SAJA, di-push dari shortcut "Tracking" di HomeScreen — shortcut itu cuma dirender untuk role admin/adminsekret (`HomeScreen.tsx`), TIDAK ada sama sekali untuk role lain (Feature 08 update: dipindah dari tab tersendiri, tetap admin-only — lihat progress-tracker.md Decisions)
- **Referensi desain:** context/designs/lacak-relawan.png
- **Pola kelas kunci:** `bg-background` root, `SafeAreaView edges={["bottom"]}` (top ditangani native stack header sekarang); body `flex-1 relative` — `TrackingMapView` full-bleed + bottom sheet `absolute inset-x-0 bottom-0 h-[45%] rounded-t-xl border-t border-border bg-surface`
- **Catatan:** Header berubah dari custom in-content heading jadi **native stack header** (title "Lacak Relawan" dari `HomeStack.tsx`, back chevron otomatis) — `Badge dot` "Update berkala" dipindah ke baris kecil di body (`items-end px-margin-mobile pt-sm pb-sm`), bukan lagi sejajar heading (headingnya sudah dari native header). 4 keputusan lain dikonfirmasi ke user via pertanyaan eksplisit sebelum build (lihat progress-tracker.md Decisions untuk detail penuh):
  1. **Field `lat`/`long` di entity `Timse` tidak pernah ditulis siapapun** (backend maupun web `client`) sebelum feature ini — user pilih pendekatan **mobile kirim GPS device sendiri** ke `PATCH /timses/:id`, bukan cuma baca data yang (sebelumnya) selalu kosong. Lihat `useLocationBeacon.ts` — dipasang di `RootNavigator.tsx` untuk SEMUA role (bukan cuma admin), interval 30 detik, cuma jalan saat `AppState === "active"`, silent-fail (tidak mengganggu UI manapun).
  2. **Map pakai WebView + Leaflet/OSM, bukan `react-native-maps`** — project belum punya `expo-dev-client`, native map butuh EAS Build + API key Google Maps, di luar scope satu feature. Lihat `TrackingMapView.tsx`.
  3. **Akses admin-only** (awalnya diimplementasi sebagai tab admin-only, sejak Feature 08 jadi shortcut admin-only di `HomeScreen.tsx`) — mirror perilaku web `Tracking.jsx` yang hard-redirect role selain admin/adminsekret. Role timses/relawan* tetap mengirim lokasi (beacon global), cuma tidak bisa membuka screen ini.
  4. **Realtime socket.io TIDAK dipakai** — sama root cause dengan Feature 06 (gateway `AuthService` kosong, tidak pernah emit), jadi tidak ditanyakan ulang. Snapshot via `useFocusEffect` refetch + pull-to-refresh, pill "Real-time" di desain di-relabel jujur jadi "Update berkala" (visual pill dipertahankan, prop `dot` baru di `Badge`).
  - Bottom sheet layout statis (bukan draggable) — tidak ada library bottom-sheet ditambahkan, cukup `View absolute h-[45%]` menutupi bagian bawah map, sesuai proporsi kasar di desain.
  - Mock data: cuma 3 dari 8 `MOCK_TIMSES` yang punya `lat`/`long` (Dedi & Yayat online, Neng Sari offline) — mendemonstrasikan kondisi nyata data lokasi yang mayoritas kosong. Catatan: id mock timses (101-108) TIDAK terhubung ke id akun demo login (`admin.jsi`=1, `yayat.hidayat`=2 di `MOCK_PROFILES`/`MOCK_ACCOUNTS`) — kuirk pre-existing dari Feature 06, beacon akun demo tidak akan terlihat memperbarui roster mock ini, di luar scope untuk diperbaiki di sini.

### DptSummaryCards
- **Path:** src/components/dpt/DptSummaryCards.tsx
- **Dipakai di:** DptListScreen
- **Referensi desain:** context/designs/dpt.png
- **Pola kelas kunci:** kartu pertama `flex-1 rounded-lg bg-primary` (gelap), sisanya `flex-1 rounded-lg border border-border bg-surface` — sama pola dengan `TimsesSummaryCards`. Padding & ukuran teks value ADAPTIF: `p-md`/`text-headline-md` untuk 1-2 kartu, `p-sm`/`text-body-lg` untuk 3 kartu
- **Catatan:** Diperluas dari 2 kartu tetap (`TimsesSummaryCards`) jadi N kartu dinamis (1-3: Kecamatan/Kelurahan/TPS, sesuai kedalaman filter yang aktif di `DptListScreen`) — sengaja component baru, bukan reuse langsung `TimsesSummaryCards` yang hardcode 2 kartu. **2026-08-22 fix (laporan user, "terlalu mepet" di 3 kartu):** angka/label DPT asli jauh lebih panjang dari contoh di `dpt.png` ("151.952" vs "18.150", "Kec. BISSAPPU" vs "Kec. Cileunyi"), gampang wrap/penuh di kolom 1/3 lebar. Fix: padding & font value mengecil otomatis begitu `items.length >= 3`, value pakai `numberOfLines={1}` + `adjustsFontSizeToFit`, label pakai `numberOfLines={1}` + `ellipsizeMode="tail"` — tidak pernah wrap ke 2 baris lagi.

### DptCard
- **Path:** src/components/dpt/DptCard.tsx
- **Dipakai di:** DptListScreen
- **Referensi desain:** context/designs/dpt.png
- **Pola kelas kunci:** `gap-xs rounded-lg border border-border bg-surface p-md`, badge status pakai `Badge` varian `success`/`accent` (aktif) atau `muted` (belum)
- **Catatan:** 2 badge ("Door To Door"/"Social Event") dari flag `sudahDtdoor`/`sudahGotv` (field `dtdoor`/`gotv` di response API cuma pernah `null` di contoh yang ada, diperlakukan sebagai ada/tidak, bukan object). **2026-08-22 — tombol "..." SEKARANG fungsional** (dulu `Alert` generik "Segera hadir"): buka `DptVoterActionSheet` lewat prop `onMorePress` baru (bukan hardcode `handleMoreActions` lagi) — lihat entry `DptVoterActionSheet`/`DptRecordFormScreen` di bawah untuk CRUD dasar (mock data, permintaan eksplisit user "tidak perlu endpoint asli"). **2026-08-22 — icon BINTANG ditambah** (prop `onStarPress` baru, di sebelah kiri tombol "...") — permintaan eksplisit user "alur identifikasi tokoh di DPT pakai icon bintang saja di card list dpt", fitur "Identifikasi Tokoh Baru dari DPT" (lihat `TokohFormScreen` di bawah & progress-tracker.md Decisions). Bintang `star`/warna `warning` (#b45309, reuse token) kalau `item.sudahTokoh`, `star-outline`/`text-muted` kalau belum — tetap tappable di kedua state.

### DptCardSkeleton
- **Path:** src/components/dpt/DptCardSkeleton.tsx
- **Dipakai di:** DptListScreen (initial load)
- **Referensi desain:** tidak ada — pola skeleton generik disesuaikan layout `DptCard`

### DptEmptyState
- **Path:** src/components/dpt/DptEmptyState.tsx
- **Dipakai di:** DptListScreen (hasil filter/search kosong)
- **Referensi desain:** tidak ada — mengikuti pola `ui-rules.md` § Empty States, duplikat struktur `TimsesEmptyState`/`DtdoorEmptyState`

### DptRegionCard
- **Path:** src/components/dpt/DptRegionCard.tsx
- **Dipakai di:** DptProvinsiScreen, DptKabupatenScreen
- **Referensi desain:** context/designs/dptlistdaerah.png ("DPT — Pilih Provinsi")
- **Pola kelas kunci:** `flex-row items-center justify-between gap-sm rounded-lg border border-border bg-surface p-md`, chevron-forward kanan
- **Catatan:** Row nama + sublabel (mis. "2.180.450 pemilih · 27 kabupaten/kota") + chevron, seluruh row pressable.

### DptRegionCardSkeleton
- **Path:** src/components/dpt/DptRegionCardSkeleton.tsx
- **Dipakai di:** DptProvinsiScreen, DptKabupatenScreen (initial load)
- **Referensi desain:** tidak ada — pola skeleton generik disesuaikan layout `DptRegionCard`

### DptProvinsiScreen
- **Path:** src/screens/dpt/DptProvinsiScreen.tsx
- **Dipakai di:** DptStack (route "DptProvinsi", root — tab "DPT")
- **Referensi desain:** context/designs/dptlistdaerah.png
- **Pola kelas kunci:** `bg-background` root, heading in-content "DPT — Pilih Provinsi" + search di `px-margin-mobile pt-sm` (tab root, `headerShown:false`, sama pola dengan Home/Program lama)
- **Catatan:** Tahap 1 dari 3 (Feature 08). Tap card → push `DptKabupaten` dengan `{ provinsiWilId, provinsiNama }`.

### DptKabupatenScreen
- **Path:** src/screens/dpt/DptKabupatenScreen.tsx
- **Dipakai di:** DptStack (route "DptKabupaten", di-push dari DptProvinsiScreen)
- **Referensi desain:** tidak ada file khusus — pola visual diturunkan langsung dari `dptlistdaerah.png` (tahap 1) karena struktur data identik (nama wilayah + total pemilih + jumlah sub-wilayah), didokumentasikan sebagai inferensi bukan observasi langsung
- **Pola kelas kunci:** `bg-background` root, `SafeAreaView edges={[]}` (EKSPLISIT array kosong, bukan prop dihilangkan — lihat Catatan) + subtitle "Provinsi {nama}" + search di `gap-md px-margin-mobile pt-sm`
- **Catatan:** Tahap 2 dari 3. Tap card → push `DptList` dengan `{ kabWilId }`. **Root cause gap kosong berlebih (laporan user 2026-08-22, 3 iterasi):** BUKAN soal nilai `pt-*`, tapi `SafeAreaView` dari `react-native-safe-area-context` yang default ke **semua edge `'additive'`** kalau prop `edges` tidak diisi SAMA SEKALI (`undefined`/dihilangkan) — beda dari asumsi umum "tidak diisi = tidak ada edge". Screen ini sempat dihilangkan prop `edges`-nya (bukan diisi array kosong) sehingga balik dapat inset top+bottom+left+right otomatis, menambah gap besar di atas native header yang sudah handle top sendiri. Fix final: `edges={[]}` eksplisit (array kosong = benar-benar tanpa inset), `pt-sm` di dalam body sekarang jadi jarak yang wajar (bukan numpuk dengan inset yang salah lagi).

### DptListScreen
- **Path:** src/screens/dpt/DptListScreen.tsx
- **Dipakai di:** DptStack (route "DptList", di-push dari DptKabupatenScreen)
- **Referensi desain:** context/designs/dpt.png
- **Pola kelas kunci:** `bg-background` root, `SafeAreaView edges={[]}` (EKSPLISIT array kosong — lihat `DptKabupatenScreen` § Catatan untuk root cause lengkap) — native header title "DPT" + back chevron dari `DptStack.tsx`, 4 ikon `headerRight`: Target Suara (`flag-outline`) / Real Count C1 (`calculator-outline`, awalnya `clipboard-outline` — diganti karena bentrok makna dengan icon "Survey" di `HomeScreen`) / Tambah / download; search bar `rounded-md border border-border bg-surface` di dalam `px-margin-mobile pt-sm`; TIDAK ada footer lagi; card "Filter Wilayah Aktif" `flex-row items-center gap-sm rounded-lg border border-border bg-surface p-md` (icon chip `bg-accent-soft` + breadcrumb 1 baris + "Ubah")
- **Catatan:** Tahap 3 dari 3 — arsitektur sementara yang dicatat sebelumnya SUDAH DISELESAIKAN (2026-08-22): setelah user memberi `dptlistdaerah.png`, tahap 1 & 2 dipecah jadi `DptProvinsiScreen`/`DptKabupatenScreen` asli, screen ini terima `kabWilId` dari route params. Kecamatan/Kelurahan/TPS TETAP modal `TimsesRegionPickerModal` reuse ("modal interim") — itu filter dalam 1 kabupaten, bukan tahap navigasi, dan belum ada desain khusus untuk itu. Data filtering/pagination masih client-side (lihat api-standards.md § DPT) — perlu diganti server-side begitu endpoint asli dikonfirmasi.
  - **2026-08-22 revisi user:** tombol "+ Tambah Data DPT" (tadinya besar di footer bawah, ref `dpt.png`) dipindah jadi icon kecil (`Ionicons "add"`, warna `accent`) di `headerRight`. Tombol download di footer bawah **DIHAPUS** (duplikat dengan yang di header) — footer bawah sekarang tidak ada sama sekali.
  - **2026-08-22 fix layout:** `FlatList` ditambah `className="flex-1"` — sebelumnya tidak stretch mengisi sisa layar, menyisakan gap `bg-background` kosong di bawah list pendek.
  - **2026-08-22 evolusi UI filter Kecamatan/Kelurahan/TPS (3 iterasi sampai final, semua permintaan eksplisit user hari yang sama):**
    1. Deretan chip per-level (`DptFilterChip` variant `filter` untuk yang aktif + `DptAddFilterChip` untuk yang belum, keduanya SEKARANG DIHAPUS dari codebase) — masalahnya "kurang enak dilihat", scan-nya berat.
    2. Disederhanakan jadi 1 card icon-only kecil (`h-9 w-9`) — user kasih mockup screenshot yang ternyata beda dari yang saya bangun.
    3. **VERSI FINAL** (sesuai mockup user): 1 card putih **full-width** "Filter Wilayah Aktif" — icon chip kiri (`bg-accent-soft`, `Ionicons "filter"`), tengah label "Filter Wilayah Aktif" (`text-caption text-muted`) + breadcrumb `Kabupaten/Kota › Kecamatan › Kelurahan › TPS` (gabungan level yang aktif, `numberOfLines={1}` + `ellipsizeMode="tail"`, dibangun dari `wilayahBreadcrumb` — join non-null pakai " › "), kanan teks "Ubah" (`text-accent`). Tap di manapun pada card → buka modal Kecamatan, cascade otomatis ke Kelurahan→TPS begitu user pilih nilai spesifik (bukan "Semua ..."). **Chip Provinsi/Kabupaten individual (yang dulu bisa di-tap balik navigasi) IKUT DIHAPUS** — breadcrumb sekarang cuma informasi, ganti wilayah Provinsi/Kabupaten lewat tombol back native header (sudah cukup, tidak kehilangan fungsi).
    4. **2026-08-22 revisi lanjutan (2x):** nama provinsi dihapus dari breadcrumb, lalu nama Kabupaten/Kota ikut dihapus juga — card ini sekarang MURNI soal filter Kecamatan/Kelurahan/TPS (`wilayahBreadcrumb` cuma gabung 3 level itu). Kalau belum ada filter aktif sama sekali (breadcrumb kosong), tampilkan teks fallback **"Tidak ada filter"** (bukan string kosong).
  - `DptFilterChip.tsx`, `DptAddFilterChip.tsx` — **kedua file DIHAPUS dari codebase** (orphaned setelah revisi di atas, tidak dipakai screen manapun lagi).
  - **2026-08-22 fix strip abu-abu di atas tab bar:** `SafeAreaView edges={["bottom"]}` DIHAPUS (jadi tanpa `edges` sama sekali) — screen ini di-push di dalam tab "DPT", tab bar-nya sendiri sudah mengurus ruang aman bawah (home indicator). `useSafeAreaInsets` ngukur dari tepi fisik device, tidak tahu ada tab bar di bawahnya, jadi `edges={["bottom"]}` di sini dulu nambah padding dobel. **Sama fix diterapkan ke `DptKabupatenScreen`** (screen sibling, arsitektur identik). ⚠️ **Screen pushed lain yang juga nested di dalam tab (`TimsesScreen`, `LacakRelawanScreen` di HomeStack; `DtdoorFormScreen`, `GotvFormScreen` di ProgramStack) kemungkinan besar punya bug laten yang sama** (masih pakai `edges={["bottom"]}`) — TIDAK diperbaiki sesi ini (di luar laporan user, sudah "selesai" di feature sebelumnya), tapi dicatat di sini supaya diaudit kalau ada laporan serupa.
  - **2026-08-22 — CRUD dasar ditambahkan (permintaan eksplisit user, mock data saja, TIDAK menunggu contoh request write/endpoint asli — override catatan sebelumnya).** Icon "+" di `headerRight` sekarang push `DptRecordForm` (mode create, bukan `Alert` lagi). Tombol "..." di `DptCard` buka `DptVoterActionSheet` (state `actionRecord`) → "Edit data pemilih" push `DptRecordForm` mode edit (`record` di route params), "Hapus data pemilih" → `Alert` konfirmasi (pola sama tombol Keluar `ProfileScreen`) → `useDeleteDptRecord`. Lihat entry `DptVoterActionSheet`/`DptRecordFormScreen` di bawah. **"Tandai partisipasi program" TIDAK dikerjakan** (di luar scope sesi ini, field `sudahDtdoor`/`sudahGotv` cuma bisa `false` untuk record baru, tidak ada UI untuk mengubahnya).

### DptVoterActionSheet
- **Path:** src/components/dpt/DptVoterActionSheet.tsx
- **Dipakai di:** DptListScreen
- **Referensi desain:** bagian `dptSheetVoter` di project Claude Design user ("Desain Mobile JSI Dashboard", artboard 3 · DPT — file `.dc.html` yang sama dibaca via `DesignSync` untuk Budgeting Kampanye sesi sebelumnya, mencakup semua screen termasuk DPT)
- **Pola kelas kunci:** `Modal` bottom sheet (pola sama `Select.tsx` — scrim rgba hardcode, `rounded-t-xl bg-surface`), 4 row icon-circle + label (`walk-outline`/`megaphone-outline`/`create-outline`/`trash-outline`), row "Hapus" pakai `bg-danger-soft`/`text-danger`
- **Catatan:** Canvas asli punya 4 baris (+ "Tandai ikut Door To Door"/"Tandai ikut Social Event") — sebelumnya **kedua baris itu di-skip** ("tandai partisipasi program" di luar scope sesi CRUD saat itu). **2026-08-22 — "Tandai ikut Door To Door" DIKEMBALIKAN** (permintaan eksplisit user, fitur "Form Door To Door terintegrasi DPT" — lihat progress-tracker.md Decisions & entri `DtdoorFormScreen` di bawah). Icon box `bg-accent-soft` diambil dari markup canvas (`background:#EFF6FF`, row ini re-fetch langsung via `DesignSync` — markup cuma kotak warna polos, tidak ada glyph, jadi ikon `walk-outline` dipilih sendiri sama seperti `create-outline`/`trash-outline` sebelumnya). **2026-08-24 — "Tandai ikut Social Event" JUGA DIKEMBALIKAN** (permintaan eksplisit user, item "Berikutnya" di progress-tracker.md, pola identik D2D — lihat entri `GotvFormScreen` di atas). Icon box `bg-success-soft`/ikon `megaphone-outline` (`#16a34a`) dipilih sendiri, situasi markup sama persis (kotak warna polos tanpa glyph).

### DptRecordFormScreen
- **Path:** src/screens/dpt/DptRecordFormScreen.tsx
- **Dipakai di:** DptStack (route "DptRecordForm" — dipakai untuk create DAN edit, pola sama `RivalAssessmentFormScreen`: route params bawa `record` opsional → mode edit pre-filled)
- **Referensi desain:** tidak ada mockup form spesifik di canvas (cuma bottom sheet menu aksi + list card yang ada) — form generik `Input`/`Select`/`Button`, pola sama persis `RivalCalegFormScreen`/`GotvFormScreen`
- **Pola kelas kunci:** `ScrollView` + `Input` (Nama/Usia/Alamat/RT/RW/No. TPS) + `Select` (Jenis Kelamin L/P; Kecamatan & Kelurahan/Desa — **BUKAN free-text**, reuse `useDptKecamatanList(kabWilId)`/`useDptKelurahanList(idKec)` yang sama dengan filter `DptListScreen`, supaya record baru konsisten kefilter benar oleh `idKec`/`idKel`, bukan nama). `namaKec`/`namaKel` diturunkan dari lookup opsi terpilih saat submit (bukan field form terpisah); `namaTps` = `String(noTps)` (konsisten dengan semua data mock lain yang ada).
- **Catatan:** Dikerjakan 2026-08-22 (CRUD dasar 08 DPT, mock data — lihat `services/dpt.ts`). Kelurahan/Desa `disabled` sampai Kecamatan dipilih (cascade sama seperti filter picker DptListScreen). Field `sudahDtdoor`/`sudahGotv` TIDAK ada di form — selalu `false` untuk record baru (di luar scope "tandai partisipasi").

### TargetSuaraHeaderCard
- **Path:** src/components/targetsuara/TargetSuaraHeaderCard.tsx
- **Dipakai di:** 4 screen `TargetSuara{Kabupaten,Kecamatan,Kelurahan,Tps}Screen`
- **Referensi desain:** tidak ada — izin eksplisit user untuk build dari `ui-rules.md`/`ui-tokens.md` (Aturan #1 opsi c), pola sama `HomeActivityRow`/Kekuatan Pemilih
- **Pola kelas kunci:** `gap-sm rounded-lg border border-border bg-surface p-md`, reuse `Input` (`keyboardType="numeric"`) + `Button` primitive apa adanya — tidak ada primitive baru
- **Catatan:** Satu-satunya bagian yang identik persis di 4 level (nama wilayah + total DPT + input target + % + simpan) — list anak wilayah di bawahnya di-render masing-masing screen sendiri (tipe child beda-beda tiap level, reuse `DptRegionCard`). Draft input di-reset via `useEffect` tiap `currentTarget` berubah (misal setelah `useTargetSuaraMap()` refetch pasca save).

### TargetSuaraKabupatenScreen / TargetSuaraKecamatanScreen / TargetSuaraKelurahanScreen / TargetSuaraTpsScreen
- **Path:** src/screens/targetsuara/TargetSuara{Kabupaten,Kecamatan,Kelurahan,Tps}Screen.tsx
- **Dipakai di:** DptStack (route `TargetSuara{Kabupaten,Kecamatan,Kelurahan,Tps}` — ATTACH ke stack yang sama dengan `DptProvinsi`/`DptKabupaten`/`DptList`, BUKAN stack terpisah), di-push dari icon "flag" di `headerRight` `DptListScreen`
- **Referensi desain:** tidak ada — sama seperti `TargetSuaraHeaderCard`
- **Pola kelas kunci:** identik pola `DptKabupatenScreen`/`DptListScreen` (`FlatList` + `SafeAreaView edges={[]}` + `ListHeaderComponent` berisi `TargetSuaraHeaderCard` + judul "Pilih X" + error/loading state, `renderItem` reuse `DptRegionCard`, `ItemSeparatorComponent h-xs`). `TargetSuaraTpsScreen` beda — leaf, cuma `ScrollView` + 1 `TargetSuaraHeaderCard`, tanpa `FlatList`/drill-down lagi.
- **Catatan:** Dikerjakan & dikonfirmasi bekerja di device 2026-08-22 (fitur di luar build-plan awal, permintaan user langsung). Detail lengkap 2 keputusan (penyimpanan local-only `SecureStore`, hierarki wilayah reuse DPT bukan Timses/Dtdoor) ada di `progress-tracker.md` Decisions. `TargetSuaraKelurahanScreen` derive daftar TPS dari record `useDptList(kabWilId)` (filter `idKel`, group by `noTps`) — sama pola `DptListScreen.tpsOptions`, BUKAN endpoint TPS tersendiri. Key penyimpanan per level: `kab:{wilId}` / `kec:{wilId}` / `kel:{wilId}` / `tps:{kelWilId}:{noTps}` (TPS butuh key komposit karena `noTps` cuma unik dalam 1 kelurahan) — lihat `buildTargetSuaraKey` di `lib/targetSuara.ts`. **`TargetSuaraTpsScreen` dapat tombol "Lihat Laporan Target Suara"** (di `TargetSuaraKabupatenScreen`, → `TargetSuaraReportScreen`) dan tombol **"Kelola Saksi TPS"** (di `TargetSuaraTpsScreen`, → `SaksiTpsScreen`) — tombol "Input Real Count C1" yang SEMPAT ada di `TargetSuaraTpsScreen` **SUDAH DIHAPUS** 2026-08-22 (Real Count dipisah jadi fitur tersendiri, lihat entry `RealCountKabupatenScreen` di bawah).

### TargetSuaraCompletionRow
- **Path:** src/components/targetsuara/TargetSuaraCompletionRow.tsx
- **Dipakai di:** TargetSuaraReportScreen (4x — Kabupaten/Kecamatan/Kelurahan/TPS)
- **Referensi desain:** tidak ada — izin build dari ui-rules.md/ui-tokens.md, pola sama `TargetSuaraHeaderCard`
- **Pola kelas kunci:** label + `"filled/total · P%"` di kanan (`text-accent`), progress bar tipis `h-2 rounded-full bg-surface-secondary` + fill `bg-accent` — bahasa visual sama dengan `KekuatanDistribusiRow`

### TargetSuaraReportScreen
- **Path:** src/screens/targetsuara/TargetSuaraReportScreen.tsx
- **Dipakai di:** DptStack (route "TargetSuaraReport"), di-push dari tombol "Lihat Laporan Target Suara" di `TargetSuaraKabupatenScreen`
- **Referensi desain:** tidak ada
- **Pola kelas kunci:** `FlatList` + `SafeAreaView edges={[]}`, `ListHeaderComponent` berisi card "Target Terisi per Level" (4x `TargetSuaraCompletionRow`) + judul "Daftar Target Terisi", `renderItem` reuse `DptRegionCard` (tap → drill balik ke screen input level yang sesuai, discriminated union `TargetSuaraReportEntry` nentuin param navigasi per level)
- **Catatan:** Dikerjakan & dikonfirmasi bekerja di device 2026-08-22. Agregasi (`useTargetSuaraReport`) scan SEMUA Kecamatan→Kelurahan (fetch paralel) + TPS dari record DPT, digabung target lokal. **SENGAJA TIDAK ada 1 angka "grand total suara"** — kab/kec/kel/tps diisi independen (bukan hierarkis auto-sum), dijumlahkan akan double-count. Detail lengkap di `progress-tracker.md` Decisions.

### SaksiCard
- **Path:** src/components/saksi/SaksiCard.tsx
- **Dipakai di:** SaksiTpsScreen
- **Referensi desain:** tidak ada — izin build dari ui-rules.md/ui-tokens.md (fitur "cukup UI dulu", lihat progress-tracker.md Decisions)
- **Pola kelas kunci:** `gap-sm rounded-lg border border-border bg-surface p-md`, badge status reuse `Badge` (`warning`/`accent`/`success` sesuai status), ubah status reuse `Select` apa adanya (bukan primitive baru)

### SaksiTpsScreen / SaksiFormScreen
- **Path:** src/screens/saksi/{SaksiTpsScreen,SaksiFormScreen}.tsx
- **Dipakai di:** DptStack (route "SaksiTps"/"SaksiForm"), di-push dari tombol "Kelola Saksi TPS" di `TargetSuaraTpsScreen` (TETAP nested di Target Suara — user cuma minta Real Count yang dipisah, bukan Saksi)
- **Referensi desain:** tidak ada
- **Pola kelas kunci:** `SaksiTpsScreen` — `FlatList` + `SafeAreaView edges={[]}`, `renderItem` `SaksiCard`; `SaksiFormScreen` — form `ScrollView` pola sama `GotvFormScreen`/`DtdoorFormScreen` (zod schema + `Input` + `Button`)
- **Catatan:** Dikerjakan & dikonfirmasi bekerja di device 2026-08-22 (fitur di luar build-plan awal). Data lewat `services/saksi.ts` — pola **mock service STANDAR** (array in-memory + `isMockApiEnabled()`, sama seperti `dtdoor.ts`/`gotv.ts`), BUKAN local-storage seperti Target Suara — permintaan eksplisit user "cukup UI dulu, API dikembangkan belakangan", cabang non-mock sengaja `throw` ("endpoint belum ada").

### RealCountKabupatenScreen / RealCountKecamatanScreen / RealCountKelurahanScreen
- **Path:** src/screens/realcount/RealCount{Kabupaten,Kecamatan,Kelurahan}Screen.tsx
- **Dipakai di:** DptStack (route "RealCount{Kabupaten,Kecamatan,Kelurahan}"), di-push dari icon "calculator" di `headerRight` `DptListScreen`
- **Referensi desain:** tidak ada
- **Pola kelas kunci:** identik pola `TargetSuaraKabupatenScreen`/`Kecamatan`/`Kelurahan` (`FlatList` + `SafeAreaView edges={[]}` + `renderItem` reuse `DptRegionCard`) TAPI **TANPA header card "level saat ini"** — C1 murni konsep TPS, tidak ada nilai untuk ditampilkan/diisi di level Kabupaten/Kecamatan/Kelurahan. `RealCountKelurahanScreen` derive TPS dari record DPT (sama pola `TargetSuaraKelurahanScreen`) DAN kasih tanda "✓ Sudah ada C1 · N suara" per baris (`useRealCountByKelurahan`, 1 query per kelurahan bukan N query per TPS).
- **Catatan:** Dikerjakan 2026-08-22, **iterasi ke-2** dari fitur Real Count C1 — awalnya nested di `TargetSuaraTpsScreen` (lihat entry `RealCountC1Screen` untuk detail asal), dipisah jadi alur drill-down wilayah sendiri atas permintaan eksplisit user ("jangan ikut di dalam Target Suara"). Reuse hierarki DPT yang sama dengan Target Suara (konsekuensi sama: cuma Kabupaten Bantaeng yang datanya lengkap).

### RealCountC1Screen
- **Path:** src/screens/realcount/RealCountC1Screen.tsx
- **Dipakai di:** DptStack (route "RealCountC1"), di-push dari `RealCountKelurahanScreen` (leaf alur Real Count)
- **Referensi desain:** tidak ada — izin build dari ui-rules.md/ui-tokens.md
- **Pola kelas kunci:** form `ScrollView` reuse `Input`/`Button` (suara calon/suara partai-calon lain/suara tidak sah/total suara sah/catatan), tombol "Upload Foto Formulir C1" non-fungsional (`Alert` "Segera hadir")
- **Catatan:** Dikerjakan & dikonfirmasi bekerja di device 2026-08-22 (fitur di luar build-plan awal, permintaan user "cukup UI dulu, API dikembangkan belakangan" — sama pola mock service dengan Saksi TPS, lihat `services/realcount.ts`). **Cross-check otomatis**: bandingkan `suaraCalon + suaraPartaiLain` vs `suaraSahTotal` yang diinput manual (ditranskrip dari formulir fisik) — tampilkan warning kalau tidak cocok, bantu saksi menangkap salah transkrip. 1 TPS = 1 hasil C1 (upsert via `submitRealCount`, submit ulang dianggap koreksi input bukan riwayat versi). Screen ini SENDIRI tidak berubah sama sekali waktu Real Count dipisah dari Target Suara — cuma cara mencapainya (route params sumber) yang berubah.

### HomeQuickAccessItem
- **Path:** src/components/home/HomeQuickAccessItem.tsx
- **Dipakai di:** HomeScreen (grid "Akses Cepat")
- **Referensi desain:** context/designs/home-dashboard.png (deviasi disengaja — lihat Catatan)
- **Pola kelas kunci:** `w-1/4 items-center gap-xs px-xs py-xs`, kotak ikon `h-14 w-14 rounded-lg border border-border bg-surface`, `Ionicons` warna `accent` (#3b82f6) di dalamnya
- **Catatan:** Desain asli pakai singkatan teks literal ("DPT"/"RK"/"TM" dst.) — diganti icon Ionicons atas permintaan eksplisit user (2026-08-22), lebih konsisten dengan pola icon berwarna kontekstual (`ui-rules.md`) yang dipakai tab bar & tombol lain di seluruh app. Prop `icon` diketik `ComponentProps<typeof Ionicons>["name"]`, bukan `string` bebas. Pemetaan 9 shortcut (Rival Caleg ditambah belakangan): DPT→`document-text`, Rekap→`bar-chart`, Timses→`people`, Program→`megaphone`, Rival Caleg→`eye-outline`, Tracking→`locate`, Broadcast→`paper-plane`, Survey→`clipboard`, Tokoh→`star`. `py-sm`→`py-xs` (2026-08-22, permintaan user "rapatkan space Akses Cepat"). Prop `widthClass?: string` (default `"w-1/4"`) ditambah 2026-08-22 supaya component ini reusable di grid kolom lain — dipakai `w-1/4` di `ProgramPemenanganScreen` juga (lihat entry component itu).

### HomeActivityRow
- **Path:** src/components/home/HomeActivityRow.tsx
- **Dipakai di:** HomeScreen (section "Aktivitas Terbaru")
- **Referensi desain:** tidak ada — izin eksplisit user untuk build dari `ui-rules.md`/`ui-tokens.md` (Aturan #1 opsi c), lihat progress-tracker.md Decisions
- **Pola kelas kunci:** `flex-row items-center gap-sm rounded-lg border border-border bg-surface p-md`, badge kiri `h-8 w-8 rounded-md bg-accent-soft` teks "DD"/"SE" — REUSE PERSIS visual kartu statistik "Program Pemenangan" di `HomeScreen.tsx`, bukan bahasa visual baru
- **Catatan:** `formatTanggal` lokal (day+month, tanpa tahun) — duplikat kecil ala `DtdoorCard`/`GotvCard`, sengaja tidak diabstraksi (preseden folder-per-fitur).

### HomeScreen
- **Path:** src/screens/home/HomeScreen.tsx
- **Dipakai di:** HomeStack (route "Home", root tab "Home")
- **Referensi desain:** context/designs/home-dashboard.png (beberapa elemen sudah di luar file ini — lihat Catatan)
- **Pola kelas kunci:** root `LinearGradient` (bukan `View`/`SafeAreaView` biasa — lihat Catatan), header custom (icon headset + bell) `px-margin-mobile pt-sm pb-sm` (tulisan "JSI" DIHAPUS 2026-08-22, permintaan user); welcome card `gap-xs rounded-lg bg-primary p-md`; card "Persentase Data DPT" & "Akses Cepat" `rounded-lg border border-border bg-surface`; grid Akses Cepat `flex-row flex-wrap`
- **Catatan:** Scope awal SENGAJA minimal (keputusan eksplisit user, lihat progress-tracker.md Decisions Feature 08) — welcome banner + 2 kartu statistik Program Pemenangan (reuse `useDtdoorCount`/`useGotvCount`) + grid shortcut Akses Cepat. **2026-08-22, permintaan user "hidupkan tampilan Home" (3 penambahan, detail lengkap di progress-tracker.md Decisions):**
  1. Progress bar "Persentase Data DPT" dikembalikan — data **demo eksplisit** (`DPT_DEMO_KAB_WIL_ID = 7303`, satu-satunya kabupaten dengan mock DPT lengkap), caption jujur "Contoh data (demo)", BUKAN klaim wilayah user asli (tidak ada konsep kabupaten-milik-user di data profil).
  2. Section "Aktivitas Terbaru" baru — reuse `useDtdoorList`/`useGotvList` (cache sama dengan `ProgramPemenanganScreen`), digabung+sort ulang client-side by `createdAt`, top 5. Lihat `HomeActivityRow`.
  3. Card putih dibungkus di "Persentase Data DPT" & "Akses Cepat" saja — section lain (Program Pemenangan, Aktivitas Terbaru) TIDAK dibungkus lagi karena sudah ada card individual di dalamnya (hindari nesting >2 level radius, `ui-rules.md`).
  Icon hamburger (desain asli) DIGANTI `headset-outline` → push ke `CustomerServiceScreen` (permintaan user). Shortcut "Rival Caleg" (`eye-outline`) ditambah ke grid Akses Cepat → push `RivalCalegListScreen` (lihat entry itu). Notifikasi masih `Alert` "Segera hadir". Shortcut "Tracking" tetap admin/adminsekret-only (tidak berubah dari Feature 08).
  **Background root diganti `LinearGradient`** (`expo-linear-gradient`, dependency baru — SDK 54 compatible via `npx expo install`) — permintaan eksplisit user "gradient biru halus", pengecualian dari `ui-rules.md` § Larangan ("jangan tambah gradient kecuali diminta eksplisit"). 2 iterasi warna: mulai `#eff6ff→#f8fafc` (locations 0/0.35), dinaikkan ke `#dbeafe→#f8fafc` (locations 0/0.4) atas permintaan "lebih keras 15% lagi" — `#dbeafe` = token `accent-soft` yang sudah ada, bukan hex baru. `SafeAreaView` di dalam `LinearGradient` sekarang transparan (`bg-background` dihapus dari classNamenya, gradient jadi background sebenarnya).
  **2026-08-22 — gap antar-section `ScrollView` dikecilkan `gap:24`→`gap:12`** (permintaan user "gap antara section dibuat lebih rapat") — sekarang konsisten dengan `contentContainerStyle` gap 12 yang sudah dipakai screen komposisi lain (`TokohMasyarakatScreen`/`KekuatanPemilihScreen`/`BudgetingKampanyeScreen`), sebelumnya HomeScreen unik pakai 24.

### RivalCalegCard / RivalAssessmentCard
- **Path:** src/components/rivalcaleg/{RivalCalegCard,RivalAssessmentCard}.tsx
- **Dipakai di:** RivalCalegListScreen / RivalCalegDetailScreen
- **Referensi desain:** tidak ada — izin build dari ui-rules.md/ui-tokens.md (saran konsultan politik, lihat progress-tracker.md Decisions)
- **Pola kelas kunci:** `RivalCalegCard` — pola sama `DptRegionCard` (nama+sublabel+chevron, tap → detail). `RivalAssessmentCard` — `gap-xs rounded-lg border border-border bg-surface p-md`, badge level ancaman reuse `Badge` (`success`=rendah/`warning`=sedang/`danger`=tinggi), tap → buka form edit pre-filled
- **Catatan:** Level ancaman "rendah" dipetakan ke `success` (bukan makna "rendah=buruk") — intuisi campaign: ancaman rendah = kabar baik buat kita, jadi warna hijau.

### RivalCalegListScreen / RivalCalegFormScreen / RivalCalegDetailScreen / RivalAssessmentFormScreen
- **Path:** src/screens/rivalcaleg/{RivalCalegListScreen,RivalCalegFormScreen,RivalCalegDetailScreen,RivalAssessmentFormScreen}.tsx
- **Dipakai di:** HomeStack (route "RivalCalegList"/"RivalCalegForm"/"RivalCalegDetail"/"RivalAssessmentForm"), di-push dari shortcut "Rival Caleg" di grid Akses Cepat `HomeScreen`
- **Referensi desain:** tidak ada
- **Pola kelas kunci:** `RivalCalegListScreen`/`RivalCalegDetailScreen` — `FlatList` + `SafeAreaView edges={[]}`, pola sama `SaksiTpsScreen`. Form screens — `ScrollView` zod schema + `Input`/`Select`/`Button`, pola sama `SaksiFormScreen`/`GotvFormScreen`.
- **Catatan:** Dikerjakan & dikonfirmasi bekerja di device 2026-08-22 (fitur di luar build-plan awal — saran konsultan politik "Rival Internal Separtai": caleg lain dari partai yang SAMA di dapil yang sama, khas pileg Indonesia sistem proporsional terbuka). 2 keputusan dikonfirmasi via pertanyaan eksplisit sebelum build: (1) wilayah assessment pakai hierarki Kecamatan→Desa (pola Kekuatan Wilayah/Pemilih, Timses/Dtdoor) BUKAN hierarki DPT — assessment strategis, tidak perlu granular TPS; kecamatan/desa sengaja FREE TEXT (bukan picker dari data Dtdoor kita sendiri) karena mencatat wilayah KUAT LAWAN yang mungkin belum pernah kita kunjungi; (2) penyimpanan mock service standar (`services/rivalcaleg.ts`, pola sama Saksi TPS/Real Count — array in-memory), BUKAN local-storage seperti Target Suara. `RivalAssessmentFormScreen` dipakai untuk create DAN edit (upsert by rivalCalegId+kecamatan+desa) — kalau route params bawa `kecamatan`, mode edit pre-filled.

### KekuatanToggle
- **Path:** src/components/kekuatan/KekuatanToggle.tsx
- **Dipakai di:** KekuatanWilayahScreen
- **Referensi desain:** context/designs/kekuatanwilayah.png
- **Pola kelas kunci:** `flex-1 rounded-lg border` + aktif `border-accent bg-accent-soft text-accent`, tidak aktif `border-border bg-surface text-text-primary`
- **Catatan:** Beda visual dari `DtdoorSegmentedControl` (dark-pill track) — desain ini pakai outline accent untuk state aktif. Component baru, bukan reuse, karena bahasa visualnya beda.

### KekuatanSummaryCards
- **Path:** src/components/kekuatan/KekuatanSummaryCards.tsx
- **Dipakai di:** KekuatanWilayahScreen
- **Referensi desain:** context/designs/kekuatanwilayah.png
- **Pola kelas kunci:** 3 kartu SEMUA `rounded-lg border border-border bg-surface p-md` (bukan 1 gelap seperti `DptSummaryCards`), angka berwarna `text-success`/`text-warning`/`text-danger` sesuai tier
- **Catatan:** "Zona Kuat"/"Zona Sedang"/"Zona Lemah" — angka dipixel-sample dari `kekuatanwilayah.png` (hijau/oranye/merah), kartunya sendiri tetap putih semua.

### KekuatanZoneStackedBar
- **Path:** src/components/kekuatan/KekuatanZoneStackedBar.tsx
- **Dipakai di:** KekuatanWilayahScreen (mode "Peta")
- **Referensi desain:** tidak ada — permintaan user "chart yang keren", dikerjakan lewat skill `dataviz`
- **Pola kelas kunci:** 1 bar horizontal `h-6 rounded-full overflow-hidden bg-background`, segmen `flexGrow` proporsional ke count per tier + gap 2px (`mr-[2px]`) antar segmen, legend di bawah (dot + label + count + persen per tier)
- **Catatan:** **GANTI `KekuatanZoneCard`** (grid kotak polos 1 kotak/kelurahan, DIHAPUS dari codebase 2026-08-22 — orphan). Job data = part-to-whole 3 kategori → stacked bar (BUKAN pie/donut, `choosing-a-form.md`). Warna reuse token status yang sudah ada (success/warning/danger), BUKAN palet baru. `validate_palette.js` FAIL pasangan warning↔danger (ΔE normal-vision 9.9 < 15) — legal karena 2 secondary encoding WAJIB ada & tidak boleh dihilangkan: gap 2px antar segmen + legend berlabel teks (bukan swatch warna doang). Lihat `progress-tracker.md` Decisions untuk detail validasi.

### KekuatanWilayahCard
- **Path:** src/components/kekuatan/KekuatanWilayahCard.tsx
- **Dipakai di:** KekuatanWilayahScreen ("Detail per Kelurahan")
- **Referensi desain:** context/designs/kekuatanwilayah.png
- **Pola kelas kunci:** `flex-row items-center justify-between gap-sm rounded-lg border border-border bg-surface p-md`, badge tier pakai `Badge` varian `success`/`warning`/`danger` (sudah ada, tidak perlu varian baru)
- **Catatan:** `"{jumlahKunjungan} kunjungan · skor rata {skorRata}"` — persis format teks di desain.

### KekuatanWilayahCardSkeleton
- **Path:** src/components/kekuatan/KekuatanWilayahCardSkeleton.tsx
- **Dipakai di:** KekuatanWilayahScreen (initial load)
- **Referensi desain:** tidak ada — pola skeleton generik disesuaikan layout `KekuatanWilayahCard`

### KekuatanEmptyState
- **Path:** src/components/kekuatan/KekuatanEmptyState.tsx
- **Dipakai di:** KekuatanWilayahScreen (tidak ada kelurahan dengan kunjungan berkategori)
- **Referensi desain:** tidak ada — mengikuti pola `ui-rules.md` § Empty States

### KekuatanWilayahScreen
- **Path:** src/screens/program/KekuatanWilayahScreen.tsx
- **Dipakai di:** ProgramStack (route "KekuatanWilayah", di-push dari ProgramPemenanganScreen tab "Door To Door" — tombol "Lihat Kekuatan Wilayah")
- **Referensi desain:** context/designs/kekuatanwilayah.png
- **Pola kelas kunci:** `bg-background` root, `SafeAreaView edges={[]}` (EKSPLISIT array kosong — pelajaran dari bug `DptListScreen`, screen ini juga di-push di dalam tab yang tab bar-nya sudah urus ruang aman bawah); native header title "Peta Kekuatan Wilayah" dari `ProgramStack.tsx`
- **Catatan:** Dikerjakan lewat `/EnterPlanMode` (2026-08-22) — plan disetujui user sebelum kode ditulis. Detail lengkap keputusan (sumber skor, entry point, scoping wilayah, asumsi toggle "List") ada di `progress-tracker.md` Decisions Feature 10. Ringkasan:
  - Skor 0-100 **tidak ada di backend manapun** (diverifikasi: baca entity `Dtdoor` + grep `skor|score|kekuatan` di seluruh backend & web client, nihil) — dihitung client-side dari `kategoriId` lewat `src/lib/dtdoorScore.ts` (mapping **proposal**, belum dikonfirmasi user/campaign team).
  - Data dari `useDtdoorAll()` (hook baru) → `fetchDtdoorAll()` (`services/dtdoor.ts`, baru, unpaginated, cabang API asli `throw` karena tidak ada endpoint agregat terkonfirmasi) — diagregasi per `desa` via `useMemo` di screen (pola sama `DptListScreen`).
  - Scoping wilayah: admin/adminsekret lihat semua kelurahan, role lain dibatasi ke kecamatan sendiri (`useProfile().kecamatan`) — client-side, pola sama `TimsesScreen`/`DptListScreen`.
  - Kelurahan tanpa kunjungan berkategori (termasuk `desa: null`) dikecualikan dari grid & list — tidak bisa dikasih tier tanpa skor.
  - **⚠️ Asumsi belum diverifikasi:** toggle "List" cuma menyembunyikan grid+legenda "Peta" — tidak ada mockup kedua untuk state "List" itu sendiri.
  - `MOCK_DTDOOR` (`services/dtdoor.ts`) diperluas 3→21 entri untuk demo yang bermakna (4 kelurahan, tier bervariasi) — lihat Decisions untuk detail.

### KekuatanWilayahSelector
- **Path:** src/components/kekuatan/KekuatanWilayahSelector.tsx
- **Dipakai di:** KekuatanPemilihScreen
- **Referensi desain:** context/designs/kekuatanpemilih.png
- **Pola kelas kunci:** trigger 1 baris `min-h-[44px] flex-row items-center justify-between rounded-md border border-border px-md py-sm` + chevron-down; modal list reuse pola `Select.tsx` (Modal+FlatList) tapi trigger gabungan "Wilayah: {value}", bukan label terpisah di atas box
- **Catatan:** Prop `disabled` mematikan interaksi (non-admin, terkunci ke kecamatan sendiri) — beda dari `Select.tsx`, chevron ikut disembunyikan saat disabled.

### KekuatanDistribusiRow
- **Path:** src/components/kekuatan/KekuatanDistribusiRow.tsx
- **Dipakai di:** KekuatanPemilihScreen ("Distribusi Kekuatan Dukungan")
- **Referensi desain:** context/designs/kekuatanpemilih.png
- **Pola kelas kunci:** label+`"N pemilih · P%"` berwarna tier di atas, progress bar tipis `h-2 rounded-full bg-surface-secondary` + fill `bg-success`/`bg-warning`/`bg-danger` di bawah
- **Catatan:** Teks range ("Kuat (skor ≥ 75)" dst.) diturunkan dari `STRENGTH_THRESHOLDS` (`lib/dtdoorScore.ts`), bukan string hardcode terpisah.

### KekuatanRankingRow
- **Path:** src/components/kekuatan/KekuatanRankingRow.tsx
- **Dipakai di:** KekuatanPemilihScreen ("Ranking Kelurahan")
- **Referensi desain:** context/designs/kekuatanpemilih.png
- **Pola kelas kunci:** `rounded-lg border border-border bg-surface p-md`, nama+skor besar berwarna tier di atas, progress bar `h-2` di bawah (persen bar = skor langsung, skala sudah 0-100)

### KekuatanPemilihCard
- **Path:** src/components/kekuatan/KekuatanPemilihCard.tsx
- **Dipakai di:** KekuatanPemilihScreen ("Pemilih Skor Tertinggi")
- **Referensi desain:** context/designs/kekuatanpemilih.png
- **Pola kelas kunci:** `flex-row items-center justify-between gap-sm rounded-lg border border-border bg-surface p-md`, badge skor kanan reuse `Badge` varian `success`/`warning`/`danger` sesuai tier
- **Catatan:** `formatTanggal` lokal (day+month, tanpa tahun) — duplikat kecil, pola sama `HomeActivityRow`/`DtdoorCard`.

### KekuatanPemilihScreen
- **Path:** src/screens/program/KekuatanPemilihScreen.tsx
- **Dipakai di:** ProgramStack (route "KekuatanPemilih", di-push dari ProgramPemenanganScreen tab "Door To Door" — tombol "Lihat Skor Pemilih")
- **Referensi desain:** context/designs/kekuatanpemilih.png
- **Pola kelas kunci:** `bg-background` root, `SafeAreaView edges={[]}` (pola sama `KekuatanWilayahScreen`), `ScrollView` bukan `FlatList` (komposisi beberapa section tetap, bukan 1 list panjang homogen — pola sama `HomeScreen`); native header title "Skoring Kekuatan Pemilih" dari `ProgramStack.tsx`
- **Catatan:** Dikerjakan 2026-08-22, sibling `KekuatanWilayahScreen` — skor PER-PEMILIH bukan agregat per-kelurahan, reuse penuh `src/lib/dtdoorScore.ts` & `DptSummaryCards` (2 kartu ringkasan "Skor Rata-rata"/"Total Dikunjungi"). 2 keputusan dikonfirmasi via pertanyaan eksplisit ke user sebelum build (detail lengkap `progress-tracker.md` Decisions): entry point (tombol di `ProgramPemenanganScreen`, bukan `KekuatanWilayahScreen`/Home shortcut) & filter wilayah eksplisit (admin bebas pilih kecamatan dari data, role lain terkunci). "Pemilih Skor Tertinggi" dibatasi top 10 (keputusan mandiri, kategori sama preseden "45%→hitungan sederhana" Feature 04/05, tidak ditanya ulang).

### DtdoorAnalyticsScreen
- **Path:** src/screens/program/DtdoorAnalyticsScreen.tsx
- **Dipakai di:** ProgramStack (route "DtdoorAnalytics", judul "Ringkasan Data"), di-push dari grid icon tab Door To Door `ProgramPemenanganScreen`
- **Referensi desain:** tidak ada
- **Pola kelas kunci:** `ScrollView` (pola komposisi sama `KekuatanPemilihScreen`) — 3 kartu ringkasan (`DptSummaryCards`) + section "Distribusi Kategori" (`DtdoorCategoryRow` × 7) + "Distribusi Gender" (`DtdoorMagnitudeRow` × 2) + "Program Bantuan Terpopuler" (`DtdoorMagnitudeRow` × top 5)
- **Catatan:** Dikerjakan & dikonfirmasi bekerja di device 2026-08-22. **⚠️ Permintaan awal user pakai contoh "pilihan pileg ada berapa orang" — Dtdoor TIDAK PUNYA field pilihan kandidat/partai sama sekali.** Proxy terdekat yang benar-benar ada = `kategoriId` (klasifikasi dukungan internal), dijelaskan ke user, dibangun sebagai "Distribusi Kategori" bukan "hasil pileg" — jangan salah kutip data ini sebagai hasil survei preferensi kandidat asli. Murni derive client-side dari `useDtdoorAll()` (scoping wilayah sama `KekuatanWilayahScreen`), tidak ada data/service baru. Persentase kategori dihitung dari kunjungan yang SUDAH berkategori (bukan total kunjungan) — sisa yang belum berkategori dicatat terpisah sebagai catatan transparansi.

### BudgetScopeToggle / BudgetHeroCard / BudgetPosRow / BudgetTrendChart / BudgetTransactionRow / BudgetPlafonRow
- **Path:** src/components/budgeting/{BudgetScopeToggle,BudgetHeroCard,BudgetPosRow,BudgetTrendChart,BudgetTransactionRow,BudgetPlafonRow}.tsx
- **Dipakai di:** BudgetingKampanyeScreen (semua), `BudgetPlafonRow` + `BudgetScopeToggle` (reuse) juga dipakai `BudgetPlafonScreen`
- **Pola kelas kunci:** `BudgetScopeToggle` — pill gelap `bg-primary` untuk state aktif, pola sama persis `DtdoorSegmentedControl`. `BudgetHeroCard` — kartu gelap `bg-primary` (progress bar track pakai `rgba(255,255,255,0.14)` hardcode, tidak ada token untuk overlay putih transparan, sama alasan scrim `Select.tsx`; teks "Terpakai" pakai `text-accent` bukan `text-inverse` untuk beda visual dari "Sisa", deviasi kecil dari `#93C5FD` di canvas, token terdekat yang ada). `BudgetPosRow` — bar 2 warna threshold (`>100%` danger, `>=85%` warning, selain itu accent) — BUKAN skema tier kekuatan (success/warning/danger) yang dipakai Kekuatan Wilayah/Pemilih, makna beda ("dekat plafon" vs "seberapa kuat"). `BudgetTrendChart` — bar chart vertikal, batang `bg-primary` kalau di atas rata-rata titik yang ditampilkan, selain itu `bg-accent`. `BudgetTransactionRow` — reuse `Badge` (variant success/warning/danger untuk status Disetujui/Menunggu/Ditolak), pola sama `DtdoorCard`; sejak 2026-08-24 tambah baris "Setujui"/"Tolak" (`canModerate`/`isModerating`/`onApprove`/`onReject` props, opsional) di bawah border, cuma render kalau `canModerate && status==="Menunggu"` — lihat detail lengkap di entry `BudgetingKampanyeScreen`. `BudgetPlafonRow` (baru 2026-08-24, tanpa referensi desain) — card dengan `Input` numerik + `Button` "Simpan" per pos, lihat detail lengkap di entry `BudgetingKampanyeScreen` di bawah.
- **Catatan:** Lihat entry `BudgetingKampanyeScreen` di bawah untuk konteks fitur lengkap.

### BudgetingKampanyeScreen / BudgetTransactionFormScreen / BudgetPlafonScreen
- **Path:** src/screens/budgeting/{BudgetingKampanyeScreen,BudgetTransactionFormScreen,BudgetPlafonScreen}.tsx
- **Dipakai di:** HomeStack (route "BudgetingKampanye"/"BudgetTransactionForm"/"BudgetPlafon"), di-push dari shortcut "Budgeting" (`icon="wallet-outline"`) di grid Akses Cepat `HomeScreen`. `BudgetPlafonScreen` di-push dari icon `options-outline` di `headerRight` `BudgetingKampanyeScreen`, **admin/adminsekret-only** (`ADMIN_ROLES` lokal, pola sama `HomeScreen`/`RootNavigator`/`DtdoorAnalyticsScreen`).
- **Referensi desain:** context/designs/budgeting-kampanye.dc.html (artboard 12 dari 13, project Claude Design user "Desain Mobile JSI Dashboard", ditarik via tool **DesignSync** 2026-08-22 — BUKAN screenshot manual seperti file `.png` lain di folder ini, tapi markup+data asli, lebih presisi dari pixel-sampling) untuk `BudgetingKampanyeScreen`/`BudgetTransactionFormScreen`. **`BudgetPlafonScreen` TIDAK ADA di canvas manapun** (canvas asli cuma menampilkan realisasi read-only, tidak ada form "set plafon") — dibangun tanpa referensi visual atas **izin eksplisit user** (2026-08-24, lihat `progress-tracker.md` Decisions), cuma pola generik `ui-rules.md`/`ui-tokens.md` + primitive yang sudah ada.
- **Pola kelas kunci:** `BudgetingKampanyeScreen` — `ScrollView` (pola sama `DtdoorAnalyticsScreen`): `BudgetScopeToggle` di atas, lalu `BudgetHeroCard`, 2 stat card inline (txCount/overCount, pola sama stat row Program Pemenangan di `HomeScreen` — bukan `DptSummaryCards` karena kartu pertama TIDAK boleh gelap di sini, keduanya putih), section "Realisasi per Pos Anggaran" (`BudgetPosRow` × 5), "Tren Pengeluaran Mingguan/Bulanan" (`BudgetTrendChart`), "Pengeluaran Terbaru" (`BudgetTransactionRow` list), tombol "+ Catat Pengeluaran" fixed di footer (`border-t bg-surface`). `headerRight` (`useLayoutEffect`) berisi 1-2 icon dalam `View flex-row gap-xs`: `options-outline` (admin-only, → `BudgetPlafon`) + `download-outline` (semua role, `Alert` "Segera hadir", non-fungsional). `BudgetTransactionFormScreen` — form `Select`+`Input`+`Button` (pola sama persis `RivalCalegFormScreen`/`SaksiFormScreen`), field "Nominal (Rp)" & "Keterangan"; "oleh" TIDAK jadi input, otomatis dari `useAuth().session.user.namaLengkap` (pola sama `DtdoorFormScreen`) untuk mock — real branch pakai nama dari response server (`user.namaLengkap` hasil include backend). `BudgetPlafonScreen` — teks penjelas + `BudgetScopeToggle` (reuse langsung) + list `BudgetPlafonRow` × 5 (1 row per pos dari `useBudgetPos(scope)`), TANPA footer/`useHideTabBar()` sendiri (di-push dari `BudgetingKampanyeScreen` yang sudah handle tab bar & tetap mounted di bawahnya).
- **`BudgetPlafonRow`** (`src/components/budgeting/BudgetPlafonRow.tsx`) — card `border-border bg-surface p-md`: nama pos + "Terpakai {rupiah}" di kanan atas, `Input` numerik (prefilled `item.plafon`, di-sync via `useEffect` kalau `item.plafon` berubah dari luar DAN mutation sedang tidak pending) + `Button variant="secondary"` "Simpan" per row (BUKAN 1 tombol submit-semua) — 1 row = 1 `useUpsertBudgetPlafon()` mutation independen, pola supaya 1 pos gagal tidak menggagalkan pos lain. Pesan sukses/gagal inline di bawah Input (`text-success`/`text-danger`), tidak pakai `Alert`.
- **Catatan (BudgetingKampanyeScreen/BudgetTransactionFormScreen):** Item #3 "saran konsultan politik" (`build-plan.md` § Fase Berikutnya), dikerjakan 2026-08-22, **WIRED ke backend real 2026-08-24** (modul `budgeting` di `/Users/asdarsaid/JSI/api/src/budgeting`, lihat `api-standards.md` § Budgeting Kampanye untuk kontrak lengkap — summary/pos/trend/transaksi SEMUA sudah live, bukan mock lagi kecuali `EXPO_PUBLIC_USE_MOCK_API=true`). **2 keputusan skema final** (lihat `progress-tracker.md` Decisions untuk kronologi lengkap — sempat berubah beberapa kali sebelum landing di sini):
  1. **5 pos anggaran OPERASIONAL** (Atribut & Alat Peraga/Operasional Timses/Door To Door/Social Event/Digital & Broadcast, `types/budgeting.ts` § `BUDGET_POS_VALUES`) — ikut mockup canvas apa adanya, **BUKAN** kategori resmi LPSDK/LPPDK (KPU/PKPU) yang sempat dikonfirmasi sebagai rencana skema di diskusi sebelumnya (keputusan itu SUPERSEDED begitu contoh UI nyata ditemukan). Backend ternyata pakai list yang SAMA PERSIS (`BUDGET_POS_LIST`), dikonfirmasi cocok byte-for-byte saat wiring.
  2. **Entry point shortcut Akses Cepat Home** (bukan drawer seperti di canvas — app ini sudah tidak pakai drawer sama sekali, lihat "TEMUAN NAVIGASI BESAR").
  - **Bottom sheet "Catat Pengeluaran" di canvas asli DIJADIKAN pushed screen** (bukan modal) — mengikuti konvensi SELURUH form lain di app ini (Dtdoor/Gotv/RivalCaleg/Saksi, semua native header), bukan literal ikut mockup. Field "Lampirkan bukti/nota" di canvas **di-skip** — upload file di luar scope sesi ini.
  - **Transaksi baru selalu berstatus "Menunggu"** saat dibuat (default backend). ~~Tidak ada UI approve/tolak~~ **RESOLVED 2026-08-24** — user tanya "dimana proses approval budgeting, belum ada UI-nya". Canvas cuma menampilkan pill status READ-ONLY (dicek lagi, tidak ada tombol Setujui/Tolak sama sekali) — dibangun tanpa referensi visual atas izin eksplisit user (`AskUserQuestion`, sama pola `BudgetPlafonScreen`). Tombol "Setujui"/"Tolak" ditambah di `BudgetTransactionRow` (dalam `View border-t`, cuma render kalau `canModerate && item.status==="Menunggu"`), pill hijau `bg-success-soft`/`text-success` & merah `bg-danger-soft`/`text-danger` (token yang sama dipakai `Badge` variant success/danger). Gating admin-only via `isAdmin` yang sudah dihitung di `BudgetingKampanyeScreen` (dilempar sebagai prop `canModerate`, BUKAN dihitung ulang di dalam row component) — role timses/relawan tidak pernah lihat tombol ini sama sekali karena backend TIDAK punya role guard di endpoint ini (`AuthGuard` doang, sama seperti seluruh endpoint budgeting lain). `useUpdateBudgetTransactionStatus()` (`src/hooks/useBudgeting.ts`) invalidate SELURUH query `["budgeting"]` on success (bukan cuma scope aktif) karena approve/reject mengubah `used`/`pct`/`overCount` yang dihitung backend dari transaksi ber-status Disetujui — bisa berdampak ke scope "total" juga meski yang di-approve transaksi bulan ini.
  - **"Biaya per suara" (tujuan akhir fitur ini di `build-plan.md`) BELUM dikerjakan** — butuh data Target Suara/Real Count yang lengkap dulu untuk dibandingkan, di luar scope sesi ini.
- **Catatan (BudgetPlafonScreen):** Dibuat 2026-08-24 menjawab pertanyaan user "dimana saya bisa setting plafon" — sebelum ini endpoint `POST /budgeting/plafon` sudah ada di backend tapi TIDAK ADA UI mobile untuk memanggilnya sama sekali, jadi tabel `budget_plafons` kemungkinan kosong (semua pos tampil 0%/0 di `BudgetingKampanyeScreen`). Tidak ada UI approve/tolak plafon atau riwayat perubahan — cuma set nilai terkini per pos per scope (bulan berjalan/total kampanye), konsisten dengan cakupan endpoint backend (`upsertPlafon` cuma terima 1 pos + 1 periode per call, tidak ada bulk endpoint).

### CustomerServiceScreen
- **Path:** src/screens/home/CustomerServiceScreen.tsx
- **Dipakai di:** HomeStack (route "CustomerService", di-push dari icon "headset" di header `HomeScreen`)
- **Referensi desain:** context/designs/customer-service.png (⚠️ **screenshot app lain** — "halo tiket"/tiket.com, chatbot AI refund/pemesanan tiket, BUKAN mockup JSI — lihat Catatan)
- **Pola kelas kunci:** kartu sambutan `items-center gap-sm rounded-lg border border-border bg-surface p-lg`; card FAQ `rounded-lg border border-border bg-surface p-md` isi list accordion (`Pressable` toggle expand, border-b antar row); input pesan fixed di bawah `border-t border-border bg-surface`, `TextInput` pill `rounded-full bg-surface-secondary`
- **Catatan:** Dikerjakan 2026-08-22, permintaan user langsung (di luar build-plan awal — ganti hamburger menu yang sebelumnya non-fungsional). Cuma **pola layout** dari `customer-service.png` yang dipakai (bubble sambutan, list topik, input di bawah) — konten diganti total jadi 6 FAQ statis nyata seputar app JSI ini (login GPS, input Dtdoor/Gotv, scoping wilayah, ubah profil, DPT belum lengkap), dikonfirmasi eksplisit ke user sebelum build. **SENGAJA TIDAK ada label/klaim "AI"** dari desain asli — repo ini tidak punya backend chat apapun. Kolom "Tulis Pesan" non-fungsional (`Alert` "Segera hadir"). Tab bar bawah disembunyikan via `useHideTabBar()` (lihat entry hook di bawah) — screen gaya chat full-height, tab bar akan bentrok dengan input fixed di bawah.

### useHideTabBar
- **Path:** src/hooks/useHideTabBar.ts
- **Dipakai di:** CustomerServiceScreen, TokohMasyarakatScreen, BudgetingKampanyeScreen, RivalCalegListScreen
- **Catatan:** Hook baru (2026-08-22) — awalnya inline di `CustomerServiceScreen` (`navigation.getParent()?.setOptions({ tabBarStyle: { display: "none" } })` di `useLayoutEffect`, restore ke `{ backgroundColor: "#ffffff", borderTopColor: "#cbd5e1" }` — HARUS sama persis dengan default `AdminTabs.tsx`/`TimsesTabs.tsx` — saat unmount). **Diekstrak jadi hook** begitu dipakai di 4 screen sekaligus (permintaan user "hilangkan navbottomnya pada halaman tokoh masyarakat, budgeting dan rival caleg") — constant default yang correctness-critical itu jadi rawan salah kalau disalin manual di banyak file, beda dari duplikasi JSX kecil biasa yang sengaja tidak diabstraksi di tempat lain. Tinggal panggil `useHideTabBar()` di body screen, tidak perlu `navigation` variable terpisah.

### LoginScreen
- **Path:** src/screens/auth/LoginScreen.tsx
- **Dipakai di:** AuthStack (route "Login")
- **Referensi desain:** context/designs/login.png
- **Pola kelas kunci:** header `bg-surface-inverse` (token baru, lihat `ui-tokens.md`), card `rounded-t-xl bg-background`
- **Catatan:** "Ingat saya" checkbox murni dekoratif (tidak wired ke logic persist — sesi selalu persist by design, sesuai verifikasi build-plan). "Lupa password?" memicu `Alert.alert` "Segera hadir" (belum ada flow forgot-password di build-plan manapun). Placeholder field "Username" dikirim ke backend sebagai `nik` (lihat api-standards.md) — label visual ikut desain, key request ikut kontrak backend.

### TokohSummaryCard / TokohKategoriRow / TokohKelurahanBar
- **Path:** src/components/tokoh/{TokohSummaryCard,TokohKategoriRow,TokohKelurahanBar}.tsx
- **Dipakai di:** TokohMasyarakatScreen
- **Referensi desain:** context/designs/tokoh1.png ("Tokoh Masyarakat" — bagian summary & filter)
- **Pola kelas kunci:** `TokohSummaryCard` — kartu gelap `bg-primary`, pola sama `BudgetHeroCard` (2 angka besar berdampingan + 3 sub-kartu `rgba(255,255,255,0.06)` untuk Mendukung/Netral/Lawan, warna teks `text-success`/`text-warning`/`text-danger`). `TokohKategoriRow` — bar horizontal (label+`"N tokoh"` di atas, bar `h-2` di bawah). `TokohKelurahanBar` — kolom bar vertikal (angka di atas, bar, label di bawah), pola sama `BudgetTrendChart`.
- **Catatan:** Dikerjakan 2026-08-22. Lebar/tinggi bar proporsional `count/maxCount*100` — cuma item RANK #1 (bukan "di atas rata-rata" seperti `BudgetTrendChart`) yang dikasih `bg-primary`, sisanya `bg-accent`, persis pola highlight di mockup (cuma "Tokoh Agama" & kelurahan tertinggi yang gelap).

### TokohCard
- **Path:** src/components/tokoh/TokohCard.tsx
- **Dipakai di:** TokohMasyarakatScreen ("Daftar Tokoh")
- **Referensi desain:** context/designs/tokohlist.png
- **Pola kelas kunci:** `flex-row gap-sm rounded-lg border border-border bg-surface p-md`, avatar inisial `h-12 w-12 rounded-lg bg-accent-soft` (kotak rounded, pola sama `TimsesMemberCard`), badge dukungan kanan atas reuse `Badge` (`success`=Mendukung/`warning`=Netral/`danger`=Lawan), baris kategori+pengaruh `text-accent`
- **Catatan:** Dikerjakan 2026-08-22. Inisial diambil huruf pertama kata PERTAMA+TERAKHIR nama (fallback 1 huruf kalau cuma 1 kata, persis contoh "K" untuk "Abah Karna" di mockup).

### TokohMasyarakatScreen
- **Path:** src/screens/tokoh/TokohMasyarakatScreen.tsx
- **Dipakai di:** HomeStack (route "TokohMasyarakat"), di-push dari shortcut "Tokoh" (`icon="star"`) di grid Akses Cepat `HomeScreen` — shortcut ini sudah ada dari Feature 08 tapi sebelumnya `handleNotImplemented`, sekarang disambungkan
- **Referensi desain:** context/designs/tokoh1.png (bagian atas: summary+filter) + context/designs/tokohlist.png (bagian bawah: "Daftar Tokoh") — SATU screen yang sama, di-export jadi 2 file karena kepanjangan (dikonfirmasi user). File `tokoh2.png` yang sempat di-upload sebelumnya ternyata duplikat persis `tokoh1.png` (MD5 identik) — `tokohlist.png` menggantikannya sebagai referensi list yang benar.
- **Pola kelas kunci:** `bg-background` root, `SafeAreaView edges={[]}` (pola sama screen pushed-di-dalam-tab lain), `ScrollView` (komposisi beberapa section, pola sama `KekuatanPemilihScreen`/`BudgetingKampanyeScreen`) + footer fixed `border-t border-border bg-surface p-md` untuk tombol "+ Identifikasi Tokoh Baru"; card "Filter Alamat Tokoh" `flex-row items-center gap-sm rounded-lg border border-border bg-surface p-md` (icon chip `bg-accent-soft` + label + breadcrumb + "Ubah") — visual identik pola "Filter Wilayah Aktif" `DptListScreen`; section "Daftar Tokoh" (heading + `"{N} hasil"` di kanan) + list `TokohCard`.
- **Catatan:** Fitur baru murni mobile — **TIDAK ADA modul "Tokoh" di backend manapun**, bukan cuma belum dikonfirmasi seperti DPT/Hasil Rekap (Aturan #6). Riset ke web `client/src/pages/tokoh/` (`Tokoh.jsx`/`FormInputTokoh.jsx`) sempat dicek sebagai kemungkinan referensi tapi ternyata entitas survei standalone tanpa DPT/kategori/dukungan sama sekali (field: nama_lengkap/no_telpon/dusun/desa/kecamatan/jenis_kelamin/pekerjaan) — TIDAK dipakai sebagai referensi, konsep beda total. Mock service standar (`services/tokoh.ts`, pola sama `rivalcaleg.ts`), 18 tokoh mock tersebar di 4 kelurahan yang sama dengan `MOCK_DTDOOR`/`MOCK_TIMSES` (Cileunyi Kulon/Cinunuk/Cileunyi Wetan/Cimekar, Kec. Cileunyi) — konsisten lintas fitur, BUKAN geografi "Jawa Barat/Bandung Barat" di mockup (placeholder ilustratif, sama seperti nama wilayah di `dpt.png`/`timses.png` yang juga tidak match data mock literal).
  1. **5 kategori tokoh diambil APA ADANYA dari mockup** (Tokoh Agama/Pemuda/Adat/Pendidikan/Perempuan) — BEDA dari 4 kategori yang sempat disebut user secara VERBAL sebelum desain di-upload (Agama/Adat/Pemuda & Organisasi/Ahli-Profesi). Visual mockup menang atas deskripsi verbal (pola sama superseded-decision Budgeting Kampanye) — lihat `types/tokoh.ts`.
  2. **"Filter Alamat Tokoh" disederhanakan jadi 1 level Kecamatan saja** (mockup breadcrumb 3-level Provinsi›Kabupaten›Kecamatan, data placeholder "Jawa Barat › Bandung Barat › Cileu...") — keputusan mandiri (bukan ditanya user), preseden identik `TimsesBreadcrumb` yang juga memangkas level Kabupaten karena tidak ada data pendukung. Admin bebas pilih dari kecamatan yang ADA di data tokoh (reuse `TimsesRegionPickerModal`), role lain terkunci ke kecamatan sendiri (`useProfile()`), scoping client-side — pola sama persis `KekuatanWilayahScreen`/`KekuatanPemilihScreen`.
  3. **2026-08-22 — Search "Cari nama tokoh..." SEKARANG fungsional & "Daftar Tokoh" DIBANGUN** (referensi `tokohlist.png` ditemukan) — search cuma memfilter list `TokohCard`, SENGAJA TIDAK ikut mengubah kartu ringkasan/kategori/kelurahan di atasnya (tetap scoped murni oleh kecamatan) — keputusan mandiri, mencegah angka KPI berubah-ubah cuma karena ketikan pencarian nama.
  4. **Tombol "+ Identifikasi Tokoh Baru"** — SEKARANG push `TokohFormScreen` (params kosong, mode standalone) — lihat entry `TokohFormScreen` di bawah.
  5. Icon download `headerRight` — non-fungsional (`Alert` "Segera hadir"), pola sama `DptListScreen`/`BudgetingKampanyeScreen`.

### TokohFormScreen
- **Path:** src/screens/tokoh/TokohFormScreen.tsx
- **Dipakai di:** HomeStack (route "TokohForm", dari tombol "+ Identifikasi Tokoh Baru" `TokohMasyarakatScreen`, params kosong) **DAN** DptStack (route "TokohForm" juga, dari icon bintang `DptCard`, params `{ dptRecord, kabWilId }`) — component YANG SAMA di-reuse di 2 stack, pola identik `DtdoorFormScreen` (param list lokal `TokohFormParams`/`TokohFormRouteParamList`, diekspor, tidak terikat ke satu stack).
- **Referensi desain:** tidak ada mockup untuk form ini sendiri (tokoh1.png/tokohlist.png cuma tunjukkan tombolnya) — field diturunkan dari model data `Tokoh` yang sudah terbukti dari kedua desain itu, form generik `Input`/`Select`/`Button` pola sama persis `RivalCalegFormScreen`/`GotvFormScreen`.
- **Catatan:** Dikerjakan 2026-08-22 (permintaan eksplisit user "alur identifikasi tokoh di DPT pakai icon bintang saja di card list dpt"). Field: Nama, Kategori (`Select`), Tingkat Pengaruh (`Select` Rendah/Sedang/Tinggi), Status Dukungan (`Select` Mendukung/Netral/Lawan), Estimasi Basis Massa (numeric), Alamat, Kecamatan, Kelurahan/Desa (semua free-text — TIDAK reuse picker Kecamatan/Kelurahan DPT, konsisten dengan `Tokoh` yang memang model wilayahnya string bebas, bukan `idKec`/`idKel`), Pekerjaan & No. Telpon (opsional). **Saat dibuka dari DptCard (`dptRecord` terisi):** Nama/Alamat/Kecamatan/Kelurahan di-prefill dari record DPT (tetap editable, pola sama `DtdoorFormScreen`) — submit sukses → `useMarkDptTokoh(kabWilId)` dipanggil supaya bintang di `DptCard` langsung terisi (`sudahTokoh: true`), murni flip client-side (tidak ada relasi baca-balik sungguhan antara mock Tokoh & mock DPT, sama keterbatasan dengan `markDptDtdoor`).

### QuickCountTpsCard / QuickCountKandidatRow / QuickCountInputSheet
- **Path:** src/components/quickcount/{QuickCountTpsCard,QuickCountKandidatRow,QuickCountInputSheet}.tsx
- **Dipakai di:** QuickCountScreen
- **Referensi desain:** artboard "12 · SAKSI & QUICK COUNT" di project Claude Design user ("Desain Mobile JSI Dashboard", project 160ea937-2f8a-4ff4-9977-f8bc398c90a0), dibaca via `DesignSync` 2026-08-22
- **Pola kelas kunci:** `QuickCountTpsCard` — `gap-xs rounded-lg border border-border bg-surface p-md`, badge status reuse `Badge` (5 status → `success`/`danger`/`muted`/`warning`, semua pixel-match hex mockup persis tanpa token baru). `QuickCountKandidatRow` — bar horizontal, label+`"N · P%"` di atas, `h-2` bar di bawah, kandidat teratas `accent`/sisanya `text-muted` (disederhanakan dari 3-tier warna mockup asli jadi 2-tier, tetap pakai token yang ada). `QuickCountInputSheet` — `Modal` bottom sheet (pola sama `DptVoterActionSheet`/`Select.tsx`, scrim rgba hardcode), placeholder foto C1 dashed-border non-fungsional (pola sama `RealCountC1Screen`), input numerik per kandidat + total suara sah auto-hitung.
- **Catatan:** Dikerjakan 2026-08-22, permintaan eksplisit user ("tiru khusus quick count saja"). Label aksi per baris TPS (`ACTION_LABEL` di `QuickCountTpsCard`) murni kosmetik turunan status — perilaku tap SEMUA baris identik (buka `QuickCountInputSheet`), persis kode asli mockup (`t.openSheet` sama untuk semua row, tidak dibedakan per status) — belum ada alur penugasan saksi/review korwil terpisah. Input di sheet pre-filled dari `hasilC1` TPS yang dipilih kalau sudah pernah kirim (beda dari mockup yang nilainya statis/demo) — supaya submit ulang jadi koreksi yang masuk akal, bukan reset ke kosong.

### QuickCountScreen
- **Path:** src/screens/quickcount/QuickCountScreen.tsx
- **Dipakai di:** HomeStack (route "QuickCount"), di-push dari shortcut "Quick Count" (`icon="stats-chart-outline"`) baru di grid Akses Cepat `HomeScreen`
- **Referensi desain:** artboard "12 · SAKSI & QUICK COUNT (SEKUNDER — DRAWER)" — SATU artboard yang sama menggabungkan 2 konsep: manajemen Saksi (assign saksi ke TPS) dan Quick Count (live tally + status TPS + input C1). **Permintaan eksplisit user: "tiru khusus quick count saja"** — cuma bagian Quick Count yang dibangun; manajemen Saksi TIDAK ikut (sudah ada fiturnya sendiri, `SaksiTpsScreen`/`SaksiFormScreen`, nested di Target Suara).
- **Pola kelas kunci:** `bg-background` root, `SafeAreaView edges={[]}`, `ScrollView` (komposisi section, pola sama `TokohMasyarakatScreen`) + footer fixed `flex-row border-t border-border bg-surface p-md` (tombol "+ Input Hasil C1" + icon download); segmented control "Hasil Live"/"Status TPS" (bar `bg-surface-secondary p-xs`, pill aktif `bg-primary`, pola sama `DtdoorSegmentedControl` tapi ditulis lokal — 2 tab beda dari Door To Door/Social Event, tidak reuse component-nya langsung); kartu ringkasan gelap `bg-primary` (pola sama `BudgetHeroCard`).
- **Catatan:** Fitur baru murni mobile — **TIDAK ADA modul ini di backend manapun** (Aturan #6). Mock service standar `services/quickcount.ts` (pola sama `tokoh.ts`), 5 kandidat + 5 TPS tersebar di 4 kelurahan yang sama dengan `MOCK_DTDOOR`/`MOCK_TOKOH` (Cileunyi Kulon/Cinunuk/Cileunyi Wetan/Cimekar, Kec. Cileunyi).
  1. **Semua angka utama BENERAN di-derive dari data** (Suara masuk, TPS terlapor, Perolehan Suara Kandidat, C1 Terverifikasi/Selisih count) — BEDA dari mockup yang nilainya statis/demo (`qcCandidates` hardcode angka tetap, tidak terhubung ke `qcTpsList`). Field `hasilC1` di `QuickCountTps` DITAMBAH SENDIRI (tidak ada di mockup) supaya ini bisa jadi kenyataan, bukan angka mati — 3 dari 5 TPS mock diberi hasilC1 awal (Terverifikasi/Selisih/Menunggu), 2 sisanya kosong (Belum masuk/Tanpa saksi).
  2. **"Suara tidak sah" (32, mock) SENGAJA statis** — mockup tidak punya mekanisme input untuk angka ini (sheet input cuma 5 baris kandidat), pola sama "mock statis" yang sudah ada preseden di `BudgetingKampanyeScreen` (realisasi-pos tidak diturunkan dari transaksi).
  3. **Tombol footer "+ Input Hasil C1"** — mockup selalu buka TPS index tetap (demo statis, `qcSheetIdx: 2`) — diganti perilaku nyata: buka TPS PERTAMA yang belum kirim hasil (fallback TPS pertama kalau semua sudah masuk). Keputusan mandiri, tetap setia ke maksud tombol ("cepat input yang pending").
  4. **Submit hasil C1 SELALU set status jadi "Menunggu"** (bukan langsung Terverifikasi/Selisih) — mockup tidak punya alur review korwil yang menentukan status akhir, di luar scope sesi ini. TPS "Tanpa saksi" tetap bisa dibuka sheet-nya (pola sama semua row lain di mockup, tidak ada validasi tambahan yang tidak diminta).
  5. **Scoping wilayah** (admin lihat semua, role lain terkunci ke kecamatan sendiri via `useProfile()`) — TIDAK ada UI switcher di mockup (cuma teks statis "Kec. Cileunyi"), scoping tetap diterapkan sebagai keputusan mandiri (kategori sama dengan preseden `KekuatanWilayahScreen`/`TokohMasyarakatScreen`, tidak ditanya ulang ke user).
  6. `useHideTabBar()` dipasang (keputusan mandiri, sama alasan Tokoh/Budgeting/Rival Caleg — screen dashboard dengan footer button fixed, konsisten pola yang baru saja ditetapkan user untuk 3 fitur sejenis).

### AntiFraudSummaryCard / AntiFraudJenisRow / AntiFraudCaseCard / AntiFraudRelawanRow / AntiFraudEvidenceSheet
- **Path:** src/components/antifraud/{AntiFraudSummaryCard,AntiFraudJenisRow,AntiFraudCaseCard,AntiFraudRelawanRow,AntiFraudEvidenceSheet}.tsx
- **Dipakai di:** AntiFraudScreen
- **Referensi desain:** artboard "14 · VERIFIKASI KUNJUNGAN / ANTI-FRAUD (SEKUNDER — DRAWER)" di project Claude Design user ("Desain Mobile JSI Dashboard", project 160ea937-2f8a-4ff4-9977-f8bc398c90a0), dibaca via `DesignSync` 2026-08-22
- **Pola kelas kunci:** `AntiFraudSummaryCard` — kartu gelap `bg-primary`, progress bar 2-segmen (hijau=tervalidasi/merah=anomali), pola sama `BudgetHeroCard`. `AntiFraudJenisRow` — bar horizontal 2 warna (danger/warning) sesuai severity. `AntiFraudCaseCard` — border warna sesuai level (`border-danger`/`border-warning`/`border-border`), note box alasan, 2 pill kecil status GPS/Foto (`rounded-md`, BUKAN `rounded-full` seperti `Badge` — ukuran lebih kecil dari mockup, jadi custom View bukan reuse `Badge`). `AntiFraudRelawanRow` — avatar inisial kotak `bg-accent-soft` (pola sama `TimsesMemberCard`), skor berwarna tier (≥85 hijau/≥60 kuning/<60 merah). `AntiFraudEvidenceSheet` — `Modal` bottom sheet (pola sama `DptVoterActionSheet`/`QuickCountInputSheet`).
- **Catatan:** Dikerjakan 2026-08-22, permintaan eksplisit user ("tiru khusus quick count saja" [sic, teks sisa dari permintaan Quick Count sebelumnya] "saya ingin membuat fitur anti fraud lagi... dengan fitur verifikasi kunjungan"). **SENGAJA READ-ONLY** — permintaan eksplisit user "generate UI-nya saja dulu, nanti saya buatkan API-nya": `services/antifraud.ts` cuma punya 1 fungsi fetch, TIDAK ADA mutation approve/reject. Tombol "Tolak Data"/"Setujui" di `AntiFraudEvidenceSheet` cuma tutup sheet + `Alert` info (tidak mengubah data) — persis perilaku kode asli mockup (`onClick="{{ closeFraudSheet }}"` SAMA untuk kedua tombol, tidak ada logic approve/reject beneran di sumbernya juga). Placeholder "Titik GPS input"/"Foto kunjungan" disederhanakan jadi kotak `bg-surface-secondary` polos (mockup pakai tekstur garis diagonal + 2 pin marker — dekoratif, tidak ada asset/library map, pola sama simplifikasi yang sudah dipakai `KekuatanWilayahScreen`). Data (4 kasus + 5 relawan + 4 jenis anomali) persis nama/detail di mockup — kasus & relawan sengaja nyambung logis (nama relawan yang sama muncul di kedua list).

### AntiFraudScreen
- **Path:** src/screens/antifraud/AntiFraudScreen.tsx
- **Dipakai di:** HomeStack (route "AntiFraud"), di-push dari shortcut "Anti-Fraud" (`icon="shield-checkmark-outline"`) baru di grid Akses Cepat `HomeScreen`
- **Referensi desain:** artboard "14 · VERIFIKASI KUNJUNGAN / ANTI-FRAUD" — SATU artboard menggabungkan konsep review kunjungan D2D anomali + skor kredibilitas relawan.
- **Pola kelas kunci:** `bg-background` root, `SafeAreaView edges={[]}`, `ScrollView` (pola sama `QuickCountScreen`); segmented control "Anomali"/"Skor Relawan" (bar `bg-surface-secondary p-xs`, pill aktif `bg-primary`, ditulis lokal — sama pola dengan segmented control `QuickCountScreen`, bukan reuse component karena label beda).
- **Catatan:** Fitur baru murni mobile — **TIDAK ADA modul ini di backend manapun** (Aturan #6), dan **SENGAJA cuma UI** (tidak ada mutation, lihat entry komponen di atas) sesuai permintaan eksplisit user. Tidak ada footer button (beda dari `QuickCountScreen`/`BudgetingKampanyeScreen`) — mockup artboard ini memang tidak punya elemen footer. Persentase bar "Jenis Anomali Terdeteksi" DI-DERIVE dari `jumlahKasus/maxKasus` (bukan angka pct statis di mockup) — konsisten dengan pola "angka turunan, bukan hardcode" yang dipakai di seluruh fitur analitik lain (`QuickCountScreen`/`KekuatanWilayahScreen`/`TokohMasyarakatScreen`). `useHideTabBar()` dipasang (keputusan mandiri, screen dashboard sejenis Quick Count/Tokoh/Budgeting/Rival Caleg).

### IsuSummaryCard / IsuKategoriRow / IsuJanjiCard / IsuPetaWilayahRow / IsuAspirasiCard / IsuAspirasiDetailSheet
- **Path:** src/components/isuaspirasi/{IsuSummaryCard,IsuKategoriRow,IsuJanjiCard,IsuPetaWilayahRow,IsuAspirasiCard,IsuAspirasiDetailSheet}.tsx
- **Dipakai di:** IsuAspirasiScreen
- **Referensi desain:** artboard "15 · ISU & ASPIRASI WARGA (SEKUNDER — DRAWER)" di project Claude Design user ("Desain Mobile JSI Dashboard", project 160ea937-2f8a-4ff4-9977-f8bc398c90a0), dibaca via `DesignSync` 2026-08-22
- **Pola kelas kunci:** `IsuSummaryCard` — kartu gelap `bg-primary` hero, pola sama `AntiFraudSummaryCard`. `IsuKategoriRow` — bar horizontal, warna tier (2 tertinggi=danger/2 berikutnya=warning/sisanya=accent) reuse pola severity `AntiFraudJenisRow`, bukan warna kategorikal arbitrer. `IsuJanjiCard` — card teks dengan pill "dampak"/prioritas `bg-accent-soft`. `IsuPetaWilayahRow` — row dot+badge berwarna `level` (tinggi/sedang/rendah). `IsuAspirasiCard` — card kutipan keluhan, badge kategori reuse `Badge variant="accent"` (semua kategori diflatten 1 warna, pola sama `DtdoorCard`), pill status kecil (`Baru`/`Ditindak`/`Selesai`) custom View bukan `Badge` (ukuran lebih kecil, sama alasan `AntiFraudCaseCard`). `IsuAspirasiDetailSheet` — `Modal` bottom sheet, pola sama `AntiFraudEvidenceSheet`.
- **Catatan:** Dikerjakan 2026-08-22, permintaan eksplisit user ("saya ingin membuat fitur Isu dan Aspirasi di claude design ini sudah ada ui nya... Generate UI nya saja dulu tidak apa apa, nanti saya buatkan API nya"). **SENGAJA READ-ONLY** — `services/isuaspirasi.ts` cuma 1 fungsi fetch, TIDAK ADA mutation. Tombol "Tandai Ditindak"/"Jadikan Materi" di sheet cuma tutup sheet + `Alert` info, persis pola `AntiFraudEvidenceSheet` (mockup juga `onClick="{{ closeIsuSheet }}"` sama untuk kedua tombol). **Tab "Peta Isu" disederhanakan** — mockup punya overlay warna dekoratif di atas tekstur peta (garis diagonal + blok warna per kelurahan), tidak ada library map/asset di project ini, diganti list wilayah berwarna (`IsuPetaWilayahRow`), pola sama simplifikasi elemen peta dekoratif di `AntiFraudEvidenceSheet`. Placeholder "Lokasi isu"/"Foto kondisi" di sheet disederhanakan jadi kotak `bg-surface-secondary` polos, sama alasan. Data (1.284 aspirasi, isu dominan "Jalan Rusak", 4 kelurahan Kec. Cileunyi) reuse dataset demo lintas fitur (kelurahan sama dengan `QuickCountScreen`/`TokohMasyarakatScreen`; nama relawan Asep Saepudin/Neng Sari/Mira Anggraini/Dedi Kurniawan reuse dari `MOCK_SNAPSHOT` antifraud.ts supaya nyambung logis). Chip filter kategori di tab "Aspirasi" **fungsional client-side** (dataset kecil, pola sama search TimsesScreen) — beda dari tombol footer/sheet yang sengaja non-fungsional.

### IsuAspirasiScreen
- **Path:** src/screens/isuaspirasi/IsuAspirasiScreen.tsx
- **Dipakai di:** HomeStack (route "IsuAspirasi"), di-push dari shortcut "Isu & Aspirasi" (`icon="chatbubble-ellipses-outline"`) baru di grid Akses Cepat `HomeScreen`
- **Referensi desain:** artboard "15 · ISU & ASPIRASI WARGA" — hero card + 3 tab (Ringkasan/Peta Isu/Aspirasi) + footer button.
- **Pola kelas kunci:** `bg-background` root, `SafeAreaView edges={[]}`, `ScrollView` (pola sama `AntiFraudScreen`/`QuickCountScreen`); segmented control 3-pill lokal (bar `bg-surface-secondary p-xs`, pill aktif `bg-primary`); footer fixed `border-t border-border bg-surface p-md` (pola sama `QuickCountScreen`).
- **Catatan:** Fitur baru murni mobile — **TIDAK ADA modul ini di backend manapun** (Aturan #6), dan **SENGAJA cuma UI** sesuai permintaan eksplisit user (lihat entry komponen di atas untuk detail). `useHideTabBar()` dipasang (keputusan mandiri, pola sama screen dashboard sejenis lain). Belum dikonfirmasi user bekerja di device asli (baru type-check bersih) — Expo dev server sudah jalan di session lain (port 8081), Fast Refresh akan otomatis pick up begitu user reload di Expo Go.

### HasilRekapPartaiRow / HasilRekapPartaiSummaryCard / HasilRekapCalegRow / HasilRekapCalegDetailSheet / HasilRekapTpsRow
- **Path:** src/components/hasilrekap/{HasilRekapPartaiRow,HasilRekapPartaiSummaryCard,HasilRekapCalegRow,HasilRekapCalegDetailSheet,HasilRekapTpsRow}.tsx
- **Dipakai di:** HasilRekapKabupatenScreen/HasilRekapKecamatanScreen/HasilRekapKelurahanScreen (summary card + Daftar Caleg + sheet) & HasilRekapDetailScreen (semuanya)
- **Referensi desain:** artboard "4 · HASIL REKAP" (Claude Design canvas user) untuk bahasa visual bar-per-partai — TAPI struktur navigasi/hierarki datanya diobservasi langsung dari `client/src/pages/hasilrekap2024/dprri2024/*` (route tree `HasilRekap2024Routes.jsx`), bukan dari mockup (mockup cuma 2 level sederhana, web py 5 level nyata) — permintaan eksplisit user "ikuti tahapan yang ada di web" → "tiru yang 2024 saja" → "1 tipe dulu — DPR RI".
- **Pola kelas kunci:** `HasilRekapPartaiRow` — bar horizontal 1 warna netral `bg-accent` (partai tidak punya polaritas baik/buruk, pola sama `DtdoorMagnitudeRow`), partai unggul (index 0, dari array yang SUDAH terurut desc) dibedakan lewat teks bold + badge "Unggul" bukan warna beda. `HasilRekapPartaiSummaryCard` — card `border border-border bg-surface`, dipakai sebagai `ListHeaderComponent` di semua screen drill, pola sama `TargetSuaraHeaderCard` (satu-satunya bagian identik di semua level, cuma data yang beda). `HasilRekapCalegRow` — `Pressable` (bukan `View` statis lagi), rank badge kotak `bg-accent-soft` + nama/partai/suara + baris `text-accent` "Unggul di {daerahUnggul}" + chevron kanan, pola sama `AntiFraudRelawanRow`. `HasilRekapCalegDetailSheet` — `Modal` bottom sheet (pola sama `AntiFraudEvidenceSheet`), list vertikal breakdown suara caleg per sub-wilayah dengan bar (reuse bahasa visual `HasilRekapPartaiRow` tapi ditulis inline, bukan reuse component langsung — konteksnya beda, daerah bukan partai). `HasilRekapTpsRow` — row flat No. TPS + total suara.
- **Catatan:** Dikerjakan 2026-08-22, 2 iterasi permintaan user di sesi yang sama:
  1. **Iterasi 1** — "tampilkan juga list caleg beserta nama daerahnya seperti di table web tapi jangan dibuat table di mobile": section "Daftar Caleg" (`HasilRekapCalegRow`, top-5 flat, BUKAN pivot penuh) ditambah ke **SEMUA** screen drill (sebelumnya cuma ada di `HasilRekapDetailScreen` sebagai "Top Caleg", sekarang seragam "Daftar Caleg" di semua level via `ListFooterComponent` FlatList, setelah list wilayah). Tiap caleg row bawa `daerahUnggul: string` — 1 sub-wilayah paling relevan per caleg (bukan breakdown penuh).
  2. **Iterasi 2** — user tanya "apakah saya tetap bisa mengikuti pola sama persis dengan yang di web?" (maksudnya kelengkapan DATA, bukan bentuk tabelnya) → ditanya via `AskUserQuestion` (breakdown penuh vs cukup 1 daerah unggul) → jawab **breakdown penuh via tap-to-detail**. Type `HasilRekapCaleg` dapat field `breakdown: HasilRekapCalegDaerahSuara[]` (suara caleg itu di **SETIAP** sub-wilayah dalam scope layar — persis kelengkapan kolom pivot web, `daerahUnggul` sekarang cuma cache `breakdown[0].nama`). `HasilRekapCalegRow` jadi `Pressable` — tap buka `HasilRekapCalegDetailSheet` (list vertikal breakdown + bar, prop `levelLabel` beda per screen: "Kabupaten/Kota"/"Kecamatan"/"Kelurahan/Desa"/"TPS"). Generator baru `generateCalegBreakdown()` (`services/hasilrekap.ts`) — bobot acak seeded per sub-wilayah supaya total breakdown ≈ `suaraCaleg` partai itu, terurut desc.
  - Data 100% mock deterministik (`services/hasilrekap.ts`, seeded PRNG per scope id — angka STABIL saat navigasi bolak-balik, bukan random ulang tiap render) — 8 partai nasional umum dengan bobot tetap, pohon wilayah kecil hand-authored (3 Dapil, cabang "Cileunyi" reuse 4 kelurahan yang sama dengan QuickCount/Tokoh/Isu Aspirasi untuk kontinuitas dataset demo lintas fitur).

### HasilRekapScreen / HasilRekapDapilScreen / HasilRekapKabupatenScreen / HasilRekapKecamatanScreen / HasilRekapKelurahanScreen / HasilRekapDetailScreen
- **Path:** src/screens/hasilrekap/{HasilRekapScreen,HasilRekapDapilScreen,HasilRekapKabupatenScreen,HasilRekapKecamatanScreen,HasilRekapKelurahanScreen,HasilRekapDetailScreen}.tsx
- **Dipakai di:** `RekapStack` (tab root "Rekap", AdminTabs & TimsesTabs — menggantikan `RekapPlaceholderScreen`)
- **Referensi desain:** artboard "4 · HASIL REKAP" (tipe chip DPR RI/DPRD Provinsi/DPRD Kabupaten) + hierarki navigasi 2024 DPR RI dari web (`HasilRekap2024Routes.jsx`): Dapil → Kabupaten → Kecamatan → Kelurahan (TERMINAL, TPS inline — DPR RI TIDAK punya route TPS terpisah, beda dari DPRD Provinsi/Kabupaten yang punya, lihat types/hasilrekap.ts).
- **Pola kelas kunci:** `HasilRekapScreen` — tab root, `SafeAreaView edges={["top"]}` + heading in-content `pt-sm` (pola sama `ProgramPemenanganScreen`). 5 screen drill lainnya — `SafeAreaView edges={[]}` (pushed-di-dalam-tab, pola wajib sesuai bug precedent DPT) + native header title DINAMIS per level (`route.params.xxxNama` — nama wilayah yang SEDANG ditampilkan, bukan judul statis), `FlatList` + `ListHeaderComponent` (summary card + label section), reuse penuh `DptRegionCard`/`DptRegionCardSkeleton` (bukan component baru) untuk 4 level list wilayah.
- **Catatan:** **SCOPE SESI INI SENGAJA CUMA DPR RI 2024** (bukan 3 tipe × 2 tahun) — user ditanya eksplisit "1 tipe dulu vs 3 tipe sekaligus" sebelum build, jawab "1 tipe dulu — DPR RI". Toggle tahun 2019/2024 di desain asli **DIHAPUS** dari `HasilRekapScreen` (bukan di-disable) — scope cuma 2024. Chip "DPRD Provinsi"/"DPRD Kabupaten" tetap tampil sesuai desain tapi `Alert` "Segera hadir" — hierarki keduanya SUDAH diketahui dari web (DPRD Provinsi: Dapil→Kabupaten→Kecamatan→Kelurahan→TPS-list→TPS-detail; DPRD Kabupaten: Provinsi→Kabupaten→Dapil→Kecamatan→Kelurahan→TPS-detail — beda urutan insersi Dapil per tipe), menyusul sesi berikutnya, BUKAN diasumsikan sama dengan DPR RI. Tidak ada scoping wilayah role-based (mirror observasi web: Hasil Rekap web tidak scope by role sama sekali, variable `roles` di-destructure tapi tidak dipakai — dead code di web-nya). `RekapStack` dipakai identik di `AdminTabs`/`TimsesTabs` (tidak ada perbedaan akses role, konsisten dengan observasi itu).
