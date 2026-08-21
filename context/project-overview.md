# Project Overview

---

## Tentang Project

**JSI Mobile** adalah aplikasi native (React Native/Expo, iOS & Android) untuk dashboard kampanye/pemilu JSI. Ini kanal tambahan untuk produk yang sama dengan web (repo `client` di `/Users/asdarsaid/JSI/client`) — bukan produk baru. Backend yang dipakai **sama** dengan web (NestJS API di `/Users/asdarsaid/JSI/api`, sebagian modul), sehingga satu akun berlaku lintas web & mobile.

Desain visual untuk redesign mobile ini dibuat lewat Claude Design canvas oleh user (`JSI Mobile Dashboard.dc.html`). 8 dari 9 screen sudah diexport ke `context/designs/` — cek Step 1 `ui-workflow.md` sebelum build UI screen manapun, jangan asumsikan token/layout tanpa membuka file desainnya.

---

## Masalah yang Diselesaikan

Sama dengan masalah inti produk JSI (lihat `client/CLAUDE.md`): tim kampanye (timses) dan admin butuh mengelola data pemilih (DPT), memantau hasil rekap, mengelola program pemenangan (Door To Door, Social Event/GOTV), dan melacak posisi relawan di lapangan.

**Delta spesifik mobile:** anggota timses sering berada di lapangan (kunjungan door-to-door, TPS, lokasi kampanye) tanpa laptop. App native memberi akses lebih cepat, kamera/GPS langsung, dan pengalaman berulang yang lebih mulus (cek data pemilih di TPS, update status kunjungan) dibanding browser mobile membuka dashboard admin yang didesain untuk layar desktop.

---

## Peran (Roles)

- **admin / adminsekret** — akses penuh: semua modul, semua wilayah
- **timses** — akses dibatasi ke wilayah/tim yang relevan (kabupaten/kecamatan/desa sesuai hierarki di `client`'s modul Timses)

Role dibaca dari response login/profile (`roles` field, sama seperti web) — lihat `context/api-standards.md`.

---

## Halaman (Screens) — MVP

Daftar ini diturunkan dari desain yang sudah dibuat user di Claude Design canvas (redesign mobile dari `client`'s sidebar menu). Kolom "Desain" menunjuk file referensi di `context/designs/`:

```
Login                    → username/password + verifikasi GPS wajib (mengikuti client/src/pages/Login.jsx)
                            Desain: context/designs/login.png
Home / Dashboard         → ringkasan "Program Pemenangan" (jumlah Door To Door, Social Event/GOTV), quick access
                            Desain: context/designs/home-dashboard.png
DPT                      → daftar pemilih per kabupaten, filter Kecamatan → Kelurahan → TPS, search,
                            badge status ikut Door To Door/Social Event, tambah/edit/hapus data
                            Desain: context/designs/dpt.png
Hasil Rekap (2019/2024)  → drill-down Provinsi → Kabupaten → Kecamatan → Kelurahan → TPS untuk
                            DPR RI / DPRD Provinsi / DPRD Kabupaten
                            Desain: context/designs/hasil-rekap.png
Timses                   → hierarki Kabupaten → Kecamatan → Desa, status online/offline anggota
                            Desain: context/designs/timses.png
Program Pemenangan       → input & progress Door To Door dan Social Event
                            Desain: context/designs/program-pemenangan.png
Lacak Relawan / Tracking → peta posisi anggota tim real-time (socket.io) + list status online
                            Desain: context/designs/lacak-relawan.png
Profile                  → edit profil user yang sedang login
                            Desain: context/designs/profile.png
```

---

## Navigasi

Bottom tab bar, isi tab berbeda sesuai role, muncul **setelah login**:

- **Admin/adminsekret:** akses semua modul (lihat `AdminTabs`)
- **Timses:** modul yang relevan untuk perannya di lapangan (lihat `TimsesTabs`) — detail tab final menyusul saat feature masing-masing dikerjakan, mengikuti struktur menu `client`'s Sidebar

**Sebelum login:** stack terpisah tanpa tab bar — Login saja untuk MVP (tidak ada alur Register mandiri; akun dibuat lewat admin, sama seperti pola `client`).

---

## Fitur Utama (MVP)

- Auth: username/password + verifikasi GPS wajib saat login, sesi via JWT (`expo-secure-store`)
- DPT: browse & filter data pemilih, tandai partisipasi program, CRUD dasar
- Hasil Rekap: lihat hasil rekap per level wilayah
- Timses: lihat hierarki tim & status online
- Program Pemenangan: input kunjungan Door To Door & Social Event
- Lacak Relawan: peta + list status online tim (realtime via socket.io)
- Profile: lihat & edit profil sendiri

## Di Luar Scope (Out of Scope untuk MVP)

- **WhatsApp Broadcast** — dikeluarkan dari scope MVP (belum ada desain untuk screen ini); bisa masuk kembali begitu desainnya dibuat
- Modul yang belum ada di daftar screen MVP di atas (Survey, Tokoh, Zona, Bigdata Pendukung, Pengeluaran, Ruang Publik sebagai screen terpisah, Pertanyaan) — bisa ditambahkan di fase berikutnya, catat di `build-plan.md` saat mulai dikerjakan
- Admin approval/back-office yang lebih nyaman di layar besar tetap di web `client`
- Fitur apapun yang butuh schema DPT/Hasil Rekap yang belum dikonfirmasi lewat repo backend (lihat `CLAUDE.md` Aturan #6)
