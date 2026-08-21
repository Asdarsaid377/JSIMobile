# UI Rules

Aturan ringkas untuk membangun UI project ini. Token &amp; pola di bawah adalah **placeholder** yang diseed dari web `client/src/css/tailwind.config.js` — **akan diganti begitu file desain dari Claude Design canvas masuk ke `context/designs/`** (lihat `ui-workflow.md`, tidak ada exception standing di repo ini).

---

## Font

**Inter** (sama seperti web `client`) — dimuat via `@expo-google-fonts/inter` + `expo-font` di root `App.tsx`, diterapkan sebagai default `fontFamily` lewat NativeWind config (`tailwind.config.js`). Verifikasi mekanisme loading font ke dokumentasi resmi Expo versi terpasang sebelum implementasi (`context/library-docs.md`).

---

## Layout

- Padding horizontal screen: `px-margin-mobile` (16px) — konsisten di semua screen
- Gap antar section: `gap-md` (24px) di dalam screen
- Bottom tab bar: fixed di bawah, tinggi disesuaikan safe area (`useSafeAreaInsets().bottom`)
- Header screen: umumnya bawaan React Navigation (native stack header) untuk screen di dalam stack

---

## Cards

Setiap section konten hidup di dalam card:

```
background: surface
border: 1px border-border
border-radius: rounded-lg   /* 16px */
padding: p-md                /* 24px */
```

Warna masuk ke dalam card lewat badge, teks, dan icon — bukan pada permukaan card (permukaan card selalu `surface`).

---

## Hierarki Typography

| Level | Class | Weight | Token warna |
| --- | --- | --- | --- |
| Screen heading | `text-headline-md` | `font-semibold` | `text-primary` |
| Card heading | `text-body-lg` | `font-semibold` | `text-primary` |
| Body / konten utama | `text-body-md` | `font-normal` | `text-primary` |
| Label / badge | `text-label-md` | `font-medium` | sesuai konteks (token status) |
| Secondary / muted | `text-caption` | `font-normal` | `text-muted` |

Mobile tidak perlu ukuran heading sebesar desktop — layar sempit, heading terbesar yang wajar adalah `headline-lg` (jarang dipakai) / `headline-md` (heading utama screen).

---

## Buttons

Ganti `<button>` web dengan `TouchableOpacity`/`Pressable`:

- **Primary:** `bg-accent`, teks `text-on-accent`, `rounded-lg`, padding `px-lg py-sm`, `font-bold` — aksi utama (submit form, "Tandai Selesai")
- **Secondary:** `bg-surface border border-border text-text-primary`
- Semua button: `active:opacity-80`, area tekan minimum 44x44pt

---

## Icons — Berwarna &amp; Kontekstual

- Library: `@expo/vector-icons` (bundled Expo, zero install), family utama `MaterialCommunityIcons`, fallback `Ionicons`
- **DILARANG** pakai icon warna hitam/abu-abu monoton untuk icon yang punya makna status — setiap icon status HARUS berwarna sesuai perannya:

| Konteks icon | Token warna | Contoh |
| --- | --- | --- |
| Navigasi aktif | `accent` | Tab bar icon selected |
| Navigasi tidak aktif | `text-muted` | Tab bar icon idle |
| Status positif | `success` | Sudah ikut program, approved |
| Status warning | `warning` | Pending, perlu perhatian |
| Status error | `danger` | Gagal, ditolak |
| Aksi utama / brand | `accent` | FAB, action icon |
| Dekoratif / muted | `text-muted` | Chevron, divider icon |

- Setiap icon yang bisa di-tap WAJIB punya area tekan minimum 44x44pt:

```jsx
<TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} activeOpacity={0.7} onPress={onPress}>
  <Ionicons name="checkmark-circle" size={22} color={tokens.success} />
</TouchableOpacity>
```

---

## Form Inputs

```
background: surface
border: 1px border-border
border-radius: rounded-md   /* 12px */
padding: py-sm px-md
font-size: text-body-md
focus: border-accent
```

Label di atas input, pakai `text-label-md`. Keyboard type disesuaikan field (`keyboardType="numeric"` untuk usia/no. TPS, dst.).

---

## Empty States

Setiap list yang bisa kosong wajib punya empty state: teks deskriptif singkat (`text-muted`, `text-body-md`), icon opsional di atas teks, tombol CTA jika ada aksi lanjutan yang logis (mis. list DPT kosong → tombol "Tambah DPT").

---

## Loading &amp; Error States

- Skeleton untuk konten yang bentuknya bisa diprediksi (card, list row) — spinner (`ActivityIndicator`) hanya untuk aksi inline (submit button) atau blocking action singkat
- Pull-to-refresh (`RefreshControl`) di semua list utama (DPT, Timses, Hasil Rekap)
- Jangan tampilkan layar putih kosong saat fetching
- Error state: pesan human-readable + tombol "Coba Lagi" yang retry query

---

## Scroll &amp; List Performance

- Semua list WAJIB pakai `FlatList`/`FlashList` — JANGAN `.map()` di dalam `ScrollView`
- List panjang (&gt; 20 item, mis. daftar pemilih DPT) pertimbangkan `@shopify/flash-list`
- Infinite scroll / pagination server-side (bukan load-semua-lalu-filter-client) untuk data besar seperti DPT

```jsx
<FlatList
  onEndReached={loadMore}
  onEndReachedThreshold={0.5}
  ListFooterComponent={loading ? <LoadingMoreSkeleton /> : null}
/>
```

---

## Animasi &amp; Micro-interactions

- Setiap elemen yang bisa di-tap harus punya feedback visual minimal (`active:opacity-80` atau `active:scale-95`) — native tidak punya `:hover`, jadi pressed-state adalah penggantinya
- Kalau butuh animasi lebih (list masuk stagger, bounce toggle status) pakai `react-native-reanimated` — **verifikasi versi &amp; setup ke `library-docs.md`/docs resmi dulu**, jangan asumsikan API dari training data. Ini belum jadi kebutuhan di Phase 1 (scaffold), akan relevan begitu screen list (DPT, Timses) mulai dibangun.

---

## Larangan (Do Nots)

- Jangan pakai kelas warna bawaan Tailwind/NativeWind (`bg-green-900`, `text-gray-600`) — hanya token project
- Jangan tambah gradient pada background card kecuali diminta eksplisit
- Jangan pakai lebih dari satu font weight dalam satu elemen UI
- Jangan tampilkan raw error message ke user
- Jangan tumpuk lebih dari 2 level border-radius bersarang
- Jangan lupa safe area &amp; touch target minimum

## Checklist Sebelum Commit UI

- [ ] Setiap elemen touchable punya feedback pressed (scale/opacity)?
- [ ] Loading state pakai skeleton untuk list/card, bukan spinner?
- [ ] Icon berwarna sesuai token konteks, bukan default hitam/abu?
- [ ] FlatList/FlashList dipakai untuk list, bukan `.map()` di ScrollView?
- [ ] Warna dari token, bukan hex hardcode atau class bawaan Tailwind?
- [ ] Touch target minimum 44x44pt terpenuhi?
- [ ] Safe area diterapkan di screen root?
- [ ] Referensi desain di `context/designs/` sudah dicek (lihat `ui-workflow.md`)?
