# Library Docs

Catatan referensi library yang dipakai project ini. Tujuan file ini: mencegah Claude Code mengarang API dari training data yang usang.

**Aturan utama:** Jika kamu (Claude Code) tidak 100% yakin dengan sebuah API — signature-nya, nama package-nya, perilakunya di versi yang terpasang — **jangan menebak.** Cek `package.json` untuk versi terpasang, lalu baca dokumentasi resmi (via WebFetch/WebSearch) atau baca langsung type definition di `node_modules`.

---

## Area yang Paling Sering Berubah (WASPADA)

### Expo — `~54.0.37` (bukan 57 — downgrade disengaja)
- Scaffold awal repo ini pakai **Expo SDK 57** (default `npx create-expo-app@latest`). **Didowngrade ke SDK 54 (2026-08-21)** atas permintaan eksplisit user, supaya sejajar dengan `temutani-mobile` (yang juga pin ke SDK 54 karena Expo Go di Apple App Store sempat tertinggal beberapa versi SDK — lihat `temutani-mobile/context/library-docs.md` untuk histori lengkapnya). Sebelum upgrade SDK apapun ke depan di repo ini, cek dulu apakah alasan yang sama masih berlaku (Expo Go App Store availability), jangan asumsikan versi `npm` terbaru = yang bisa dites via Expo Go.
- **Cara downgrade yang terbukti jalan** (dokumentasikan ulang di sini kalau perlu downgrade versi lain nanti): `npm install expo@<versi SDK target>` → `npx expo install --fix` → cek `npm ls react-native react-native-reanimated @types/react` untuk pastikan tidak ada nested duplicate (lihat gotcha NativeWind di bawah — ini yang sering kejadian) → kalau masih ada duplikat, `rm -rf node_modules package-lock.json && npm install` (bukan sekali, tapi setiap kali `package.json` berubah signifikan selama proses downgrade).
- **Baca `docs.expo.dev/versions/v54.0.0/`** untuk versi persis ini — jangan asumsikan API dari training data atau dari blog SDK lain.
- `babel-preset-expo` **tidak otomatis** jadi devDependency dari template `blank-typescript` — harus di-install eksplisit (`npx expo install babel-preset-expo`) begitu `babel.config.js` mereferensikannya, kalau tidak Metro gagal transform dengan error "Cannot find module 'babel-preset-expo'".
- Cek: https://docs.expo.dev

### React Navigation — `^7`
- v6 vs v7 punya perbedaan API (cara define param list, opsi `Navigator`) — API dasar yang dipakai di `src/navigation/*` (native-stack + bottom-tabs v7) sudah diverifikasi jalan (lihat entry di bawah)
- Cek: https://reactnavigation.org/docs/getting-started

### NativeWind — `^4.2.6` (dengan `tailwindcss@^3.4.19`, bukan Tailwind v4 `@theme`)
- Butuh 3 file: `babel.config.js` (preset `nativewind/babel` + `jsxImportSource: "nativewind"`), `metro.config.js` (`withNativeWind`), `tailwind.config.js` (preset `nativewind/preset`)
- **Gotcha (scaffold awal, masih berlaku):** versi NativeWind ini tidak mendeklarasikan ambient module untuk `import "./global.css"` — TypeScript 6's `TS2882` ("Cannot find module or type declarations for side-effect import") akan error tanpa `declare module "*.css";` manual di `nativewind-env.d.ts`. Sudah ditambahkan — jangan hapus baris itu.
- **Gotcha kritis, ditemukan saat downgrade SDK 57→54 (2026-08-21):** `react-native-css-interop` (dependency NativeWind) punya peer dependency permisif (`react-native: '*'`, `react-native-reanimated: '>=3.6.2'`), TAPI kalau `react-native-reanimated` **tidak** dideklarasikan sebagai dependency langsung di root `package.json`, npm akan menarik versi *default* `react-native-reanimated`/`react-native-worklets` milik `react-native-css-interop` sendiri (versi terbaru, mis. reanimated `4.6.0`/worklets `0.12.1`) — versi itu punya peer requirement `react`/`react-native` yang lebih baru dari SDK 54, sehingga npm **menaruh copy `react-native`/`@types/react` bercabang (nested)** khusus untuk subtree itu, bukan dedupe ke root.
  - **Gejala:** `npx tsc --noEmit` error `TS2769` masif di semua file yang pakai prop `className` (`Property 'className' does not exist on type ...`) — karena module augmentation `declare module "react-native"` dari `react-native-css-interop/types` menempel ke `@types/react`/`react-native` versi nested yang berbeda dari yang dipakai kode kita, sehingga tidak ke-merge.
  - **Cara pastikan:** `npm ls react-native-reanimated react-native @types/react` — kalau muncul lebih dari satu versi/baris "deduped" untuk salah satunya, ini masalahnya.
  - **Fix:** tambahkan `react-native-reanimated` sebagai dependency langsung (`npx expo install react-native-reanimated` — otomatis pilih versi kompatibel SDK yang terpasang, ikut menarik `react-native-worklets` yang benar), lalu **full clean install** (`rm -rf node_modules package-lock.json && npm install`) supaya npm resolve ulang seluruh tree jadi satu copy. Verifikasi lagi dengan `npm ls` sampai semuanya "deduped" ke root.
  - **Reanimated v4 juga butuh plugin babel terpisah:** `react-native-worklets/plugin` di `babel.config.js`, **harus paling akhir** di array `plugins` (lihat file itu) — tanpa ini worklet function berisiko tidak ter-transform dengan benar meski `tsc`/bundle tetap kelihatan jalan.
- Cek: https://www.nativewind.dev

### TanStack Query — `^5.101.4`
- Setup dasar (`QueryClient` + `QueryClientProvider`) belum ada gotcha spesifik ditemukan — baru provider di-mount di `App.tsx`, belum ada query/mutation nyata
- v5 punya perubahan API dari v4 (mis. `cacheTime` → `gcTime`) — cek versi terpasang sebelum pakai opsi dari training data
- Cek: https://tanstack.com/query/latest/docs/framework/react/overview

### expo-secure-store — `~15.0.8`
- Ada batas ukuran value yang disimpan (~2048 byte) — JWT dari backend NestJS kemungkinan jauh di bawah ini, tapi **verifikasi ukuran token asli** begitu login feature dikerjakan (lihat `api-standards.md`)
- Cek: https://docs.expo.dev/versions/latest/sdk/securestore/

### expo-location — `~19.0.8`
- API permission (`requestForegroundPermissionsAsync`, dst.) berubah antar versi SDK — cek versi terpasang &amp; docs resmi sebelum implementasi Login feature (yang mewajibkan GPS)
- Cek: https://docs.expo.dev/versions/latest/sdk/location/

### socket.io-client — `^4.8.3`
- Belum diwiring ke kode nyata (belum ada Login/realtime feature) — verifikasi shape event `onlineUsers` (atau apapun namanya di backend NestJS ini) langsung ke gateway socket.io di `/Users/asdarsaid/JSI/api`, jangan asumsikan identik dengan yang diamati di `client` web (backend web mungkin beda versi/kontrak dari NestJS API ini)
- Cek: https://socket.io/docs/v4/client-api/

### zod — `^4.4.3`
- `z.email()` (bukan `z.string().email()`), custom message pakai `{ error: "..." }` (bukan `{ message: "..." }`) — API v4, beda dari v3 yang lazim di training data

### @expo-google-fonts/inter — `^0.4.2`
- Export nama font persis `Inter_400Regular`, `Inter_500Medium`, `Inter_600SemiBold`, `Inter_700Bold` (format `Inter_{weight}{Nama}`) — dipetakan ke `fontFamily` di `tailwind.config.js`. Load lewat `useFonts()` dari package ini di `App.tsx`, gate render sampai `fontsLoaded || fontError`.

### react-native-webview — `13.15.0`
- Ditambahkan di Feature 07 (Lacak Relawan) khusus untuk render map (`TrackingMapView.tsx`) — bukan `react-native-maps`, karena project belum punya `expo-dev-client`/native config dan native map butuh EAS Build + API key Google Maps (keputusan eksplisit user, lihat `progress-tracker.md` Decisions). Diinstall via `npx expo install react-native-webview` (resolve versi kompatibel SDK 54 otomatis, sama pola dengan library lain di repo ini) — tidak butuh entry di `app.json` plugins untuk pemakaian dasar (`source={{ html }}`, tanpa native file access/permission tambahan).
- HTML internal (Leaflet 1.9.4 + tile OpenStreetMap dari CDN unpkg) di-generate sebagai string JS biasa, bukan file terpisah — konten HTML/JS di dalam `source.html` TIDAK kena NativeWind/babel transform project (beda "dunia" dari RN tree), jadi styling di sana pakai CSS biasa, bukan className.
- Butuh koneksi internet device untuk load `leaflet.css`/`leaflet.js`/tile OSM dari CDN — konsisten dengan kebutuhan internet yang sudah ada untuk `apiClient` (axios), bukan requirement baru.

### react-native-reanimated — `~4.1.1` (dengan `react-native-worklets@0.8.3`, resolved)
- Ditambahkan sebagai dependency langsung 2026-08-21 — bukan karena ada animasi yang butuh ini, tapi untuk mem-fix gotcha dedup NativeWind di atas (lihat entry NativeWind). Belum dipakai langsung di kode manapun.
- v4 pisah worklet transform ke package `react-native-worklets` — plugin babel `react-native-worklets/plugin` wajib ada di `babel.config.js`, **harus paling akhir** di array `plugins`. Verifikasi ke `docs.swmansion.com/react-native-reanimated` sebelum pakai API animasi apapun dari sini.
