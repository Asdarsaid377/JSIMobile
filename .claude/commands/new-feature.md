---
description: Kerjakan satu feature dari build-plan sampai tuntas
---

Feature yang dikerjakan: $ARGUMENTS (jika kosong, ambil item "Berikutnya" dari `progress-tracker.md`)

Workflow:

1. Baca `context/progress-tracker.md` — konfirmasi posisi build saat ini.
2. Baca definisi feature di `context/build-plan.md`. Scope feature ini adalah batas kerjamu — jangan melebar.
3. Baca file context yang relevan dengan feature ini (UI → ui-workflow dst.; API/auth → `context/api-standards.md`).
4. Jika feature menyentuh modul DPT atau Hasil Rekap dan belum ada repo backend yang diberikan user: BERHENTI, tanyakan path repo-nya (lihat `CLAUDE.md` Aturan #6) sebelum implementasi mendalam.
5. Jika feature melibatkan UI: jalankan workflow `/build-ui` sebagai bagian dari pekerjaan (referensi desain wajib).
6. Jika feature butuh endpoint baru/berubah di backend yang sudah ada repo-nya (`/Users/asdarsaid/JSI/api`): beri tahu user perubahan itu dikerjakan di sana, jangan tulis kode backend di repo ini.
7. Implement sampai feature bisa diverifikasi (visual atau fungsional). Sebutkan langkah verifikasinya secara eksplisit ke user.
8. Setelah user konfirmasi feature bekerja: update `context/progress-tracker.md` (status, last completed, next) dan `context/ui-registry.md` bila relevan.

Jangan menyentuh feature berikutnya sebelum feature ini tuntas dan tracker ter-update.
