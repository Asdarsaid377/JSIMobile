# UI Workflow — Aturan Wajib Sebelum Membuat UI

Dokumen ini adalah **gerbang wajib** untuk semua pekerjaan UI. Claude Code tidak boleh membuat halaman atau component apapun tanpa melewati workflow ini. Tujuannya: hasil UI konsisten dengan desain Claude Design canvas yang sudah dibuat user, bukan hasil "selera default" AI.

---

## Prinsip

1. **Desain adalah source of truth.** Referensi visual (screenshot/export dari canvas) selalu menang atas asumsi.
2. **Tidak ada referensi = tidak ada UI.** Lebih baik bertanya sekali daripada generate halaman yang harus dibuang. **Repo ini tidak punya pengecualian standing** — beda dari repo mobile lain milik user.
3. **Registry sebelum inovasi.** Component yang mirip sudah ada? Pakai/extend yang ada, jangan bikin varian baru.

---

## Checklist Wajib (jalankan berurutan)

### Step 1 — Cari referensi desain

Cek `context/designs/`:

- Format nama file: `<nama-halaman>.png` atau `<nama-halaman>-<bagian>.png`
  Contoh: `dpt-list.png`, `login.png`, `lacak-relawan-map.png`

**Ditemukan?** → Buka dan amati file gambarnya. Ekstrak: layout, hierarchy, spacing, komponen yang terlihat. Lanjut ke Step 2.

**Tidak ditemukan?** → **BERHENTI.** Tanyakan ke user dengan template ini:

> Saya tidak menemukan referensi desain untuk **[nama halaman/component]** di `context/designs/`.
> Pilih salah satu:
> 1. Upload screenshot/export dari Claude Design canvas ke `context/designs/[nama].png`
> 2. Berikan link canvas/Figma yang mau ditiru
> 3. Izinkan saya build hanya berdasarkan `ui-rules.md` + `ui-tokens.md` (hasil mungkin perlu revisi visual besar — token saat ini cuma placeholder dari web)

Jangan lanjut sampai user menjawab. Kalau user memilih opsi 3, catat di `progress-tracker.md` bagian *Decisions* bahwa halaman tersebut dibuat tanpa referensi visual — ini keputusan per-halaman, bukan izin permanen untuk halaman lain.

### Step 2 — Cek ui-registry.md

- Component serupa sudah ada? → **Pakai component yang sama / extend props-nya.** Dilarang membuat duplikat dengan nama beda.
- Belum ada? → Lanjut ke Step 3.

### Step 3 — Baca aturan visual

- `ui-rules.md` — pola layout, card, typography, button, form, empty state
- `ui-tokens.md` — semua warna, font, spacing. **Dilarang hardcode hex atau memakai kelas warna bawaan Tailwind.**

### Step 4 — Build

- Ikuti struktur component di `code-standards.md`
- Mock data dulu jika logic backend belum ada (terutama untuk modul DPT/Hasil Rekap yang backend-nya belum terkonfirmasi — lihat `api-standards.md`) — UI harus bisa diverifikasi visual sebelum wiring data
- Satu component per file, named export

### Step 5 — Update registry

Setelah component selesai, tambahkan entry di `ui-registry.md`:

```markdown
### NamaComponent
- **Path:** src/components/<folder>/NamaComponent.tsx
- **Dipakai di:** screen mana
- **Referensi desain:** context/designs/<file>.png
- **Pola kelas kunci:** bg-surface border border-border rounded-lg p-md
- **Catatan:** (varian, props penting, batasan)
```

---

## Kapan Boleh Skip Step 1?

Hanya jika **semua** kondisi ini terpenuhi:

- Component adalah primitive murni tanpa modifikasi visual berarti (mis. wrapper tipis di atas `TouchableOpacity`), ATAU
- User secara eksplisit dalam pesan yang sama mengatakan "tanpa referensi, pakai ui-rules saja" **untuk halaman/component itu**

Perintah singkat seperti "buatkan halaman settings" **BUKAN** izin skip. Tetap jalankan Step 1.

---

## Aturan Konsistensi Antar-Session

Claude Code tidak punya memori antar session. Registry adalah memorinya. Karena itu:

- Registry yang tidak di-update = component hantu yang akan diduplikasi di session berikutnya
- Setiap selesai kerja UI, jalankan `/update-context` sebelum mengakhiri session
