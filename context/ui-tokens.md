# UI Tokens

Diaudit pertama kali terhadap desain nyata saat `/build-ui` jalan untuk Login (`context/designs/login.png`, 2026-08-21) — lihat pixel-sampling di *Decisions* `progress-tracker.md`. Warna badge (`warning-soft`, `success-soft`) dan `accent` cocok persis dengan placeholder web-seeded; `background` dan 3 token baru (`surface-inverse`, `text-inverse`, `text-inverse-muted`) diubah/ditambah untuk mencocokkan desain. Audit ulang setiap kali screen baru dengan pola warna baru muncul — jangan asumsikan seluruh sisa tabel ini final hanya karena satu screen sudah cocok.

Pakai nilai persis dari sini — jangan hardcode warna atau memakai kelas warna bawaan Tailwind/NativeWind di component. Definisi aktualnya ada di `tailwind.config.js` — file ini harus selalu sinkron dengannya.

---

## Cara Pakai

```tsx
// Benar — pakai utility class dari token
<View className="bg-surface border border-border rounded-lg p-md">

// Jangan — hardcode hex
<View style={{ backgroundColor: "#1e293b" }}>

// Jangan — kelas warna bawaan Tailwind/NativeWind
<View className="bg-slate-800">
```

---

## Warna

| Token | Hex | Peran |
| --- | --- | --- |
| `background` | `#f8fafc` | Background screen (diaudit dari `login.png` — sedikit off-white, bukan putih murni) |
| `surface` | `#ffffff` | Card, tab bar, input field, permukaan utama (putih murni — kontras dengan `background`) |
| `surface-secondary` | `#f1f5f9` | Background section sekunder |
| `surface-inverse` | `#0f172a` | Background gelap untuk section hero/branding (mis. header login) — **beda** dari `primary` |
| `border` | `#cbd5e1` | Border card, input, divider |
| `text-primary` | `#1e293b` | Teks utama, heading |
| `text-secondary` | `#334155` | Body text sekunder |
| `text-muted` | `#64748b` | Caption, placeholder |
| `text-inverse` | `#ffffff` | Teks utama di atas `surface-inverse` |
| `text-inverse-muted` | `#94a3b8` | Teks sekunder/caption di atas `surface-inverse` |
| `primary` | `#1e293b` | Warna gelap brand (dari `primary.DEFAULT` web) |
| `accent` | `#3b82f6` | Biru brand (dari `primary.blue` web) — tab aktif, tombol primary |
| `accent-soft` | `#dbeafe` | Background lembut (badge, icon circle) |
| `on-accent` | `#ffffff` | Teks/icon di atas background `accent` |
| `success` | `#16a34a` | Status positif (ikut program, approved) |
| `success-soft` | `#dcfce7` | Background badge success |
| `warning` | `#b45309` | Status pending/perhatian |
| `warning-soft` | `#fef3c7` | Background badge warning |
| `danger` | `#dc2626` | Error, ditolak |
| `danger-soft` | `#fee2e2` | Background badge danger |

## Spacing

`xs=4px` `sm=12px` `md=24px` `lg=48px` `xl=80px` `margin-mobile=16px` — dipakai lewat `p-`, `gap-`, `px-`, dll.

## Radius

`sm=0.25rem` `md=0.75rem` `lg=1rem` `xl=1.5rem` `full=9999px`

## Typography

| Class | Size / Line-height | Weight |
| --- | --- | --- |
| `headline-lg` | 32px / 40px | `font-semibold` (600) |
| `headline-md` | 24px / 32px | `font-semibold` (600) — heading utama screen mobile |
| `body-lg` | 18px / 28px | `font-normal` (400) |
| `body-md` | 16px / 24px | `font-normal` (400) — default body text |
| `label-md` | 14px / 20px | `font-medium` (500) |
| `caption` | 12px / 16px | `font-normal` (400) |

Font: **Inter** — dimuat lewat `@expo-google-fonts/inter`.

---

## Aturan Khusus Mobile

- **Touch target minimum 44x44pt** — semua elemen yang bisa ditekan minimal sebesar ini (pakai padding untuk memperbesar area tekan, bukan ukuran visual)
- **Safe area wajib** — setiap screen root pakai `useSafeAreaInsets`/`SafeAreaView`
- **Pressed state** menggantikan hover — pakai `active:opacity-80` atau `active:scale-95`, bukan `hover:`
- **Bottom tab bar** memakai token `surface` untuk background, `border` untuk border atas, `accent`/`text-muted` untuk state aktif/tidak aktif

---

## Aturan Penambahan Token

1. Kalau desain final dari Claude Design canvas datang dengan token berbeda, **ganti tabel ini seluruhnya** — jangan campur token placeholder dengan token final
2. Nama token mendeskripsikan **peran**, bukan warna
3. Setiap token baru dicatat di file ini beserta konteks pemakaiannya, dan disinkronkan ke `tailwind.config.js`
