# UI Patterns Reference

Pola UI umum yang relevan untuk modul-modul JSI Mobile. Ini catatan pola generik untuk dipertimbangkan saat build — **tetap tunduk pada `ui-workflow.md`**: referensi desain dari `context/designs/` selalu menang atas pola generik di sini.

## Data List dengan Filter Bertingkat (DPT)

- Filter bertingkat: Kecamatan → Kelurahan → TPS, tiap level me-reset level di bawahnya saat berubah (mengikuti pola `client/src/pages/dpt/dpt-page.jsx`)
- Search + filter di atas list, sticky di bawah header
- Card per item (bukan tabel horizontal-scroll seperti web) — info sekunder (RT/RW, TPS) dikelompokkan dalam satu baris kecil
- Badge kecil untuk status partisipasi program (mis. sudah ikut Door To Door / Social Event)

## Drill-Down Wilayah (Hasil Rekap, DPT)

- Chart ringkas di atas (kalau ada data agregat), list wilayah untuk drill-down di bawah
- Breadcrumb atau back button jelas di level manapun (Provinsi → Kabupaten → Kecamatan → Kelurahan → TPS)

## Peta Realtime (Lacak Relawan)

- List anggota tim dengan status online/offline berdampingan dengan map view, bukan cuma map penuh layar — memudahkan tap-to-focus dari list ke map
- Marker map dibedakan warna status (online = `success`, offline = `text-muted`)

## Status Badge

- Warna badge selalu dari token status (`success`/`warning`/`danger`), bukan warna custom per fitur
- Bentuk konsisten: `rounded-full`, padding kecil, teks `text-label-md`
