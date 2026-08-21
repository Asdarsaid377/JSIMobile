# Library Docs

Catatan referensi library yang dipakai project ini. Tujuan file ini: mencegah Claude Code mengarang API dari training data yang usang.

**Aturan utama:** Jika kamu (Claude Code) tidak 100% yakin dengan sebuah API — signature-nya, nama package-nya, perilakunya di versi yang terpasang — **jangan menebak.** Cek `package.json` untuk versi terpasang, lalu baca dokumentasi resmi (via WebFetch/WebSearch) atau baca langsung type definition di `node_modules`.

---

## Area yang Paling Sering Berubah (WASPADA)

### Expo — `~57.0.15`
- Scaffold ini pakai **Expo SDK 57** (`AGENTS.md` di root sudah menandai ini dan menunjuk ke `docs.expo.dev/versions/v57.0.0/`) — **baca versi persis itu**, jangan asumsikan API dari training data atau dari blog SDK lama.
- `babel-preset-expo` **tidak otomatis** jadi devDependency dari template `blank-typescript` — harus di-install eksplisit (`npx expo install babel-preset-expo`) begitu `babel.config.js` mereferensikannya, kalau tidak Metro gagal transform dengan error "Cannot find module 'babel-preset-expo'".
- Cek Expo Go App Store availability sebelum asumsi bisa test versi SDK terbaru lewat Expo Go biasa — riwayat sebelumnya (di project React Native lain milik user) Expo Go sempat tertinggal beberapa versi SDK dari `npm create-expo-app` default. Verifikasi ke `docs.expo.dev` atau changelog Expo kalau mau test di device fisik tanpa development build.
- Cek: https://docs.expo.dev

### React Navigation — `^7`
- v6 vs v7 punya perbedaan API (cara define param list, opsi `Navigator`) — API dasar yang dipakai di `src/navigation/*` (native-stack + bottom-tabs v7) sudah diverifikasi jalan (lihat entry di bawah)
- Cek: https://reactnavigation.org/docs/getting-started

### NativeWind — `^4.2.6` (dengan `tailwindcss@^3.4.19`, bukan Tailwind v4 `@theme`)
- Butuh 3 file: `babel.config.js` (preset `nativewind/babel` + `jsxImportSource: "nativewind"`), `metro.config.js` (`withNativeWind`), `tailwind.config.js` (preset `nativewind/preset`)
- **Gotcha ditemukan saat scaffold:** versi NativeWind ini tidak mendeklarasikan ambient module untuk `import "./global.css"` — TypeScript 6's `TS2882` ("Cannot find module or type declarations for side-effect import") akan error tanpa `declare module "*.css";` manual di `nativewind-env.d.ts`. Sudah ditambahkan — jangan hapus baris itu.
- `react-native-css-interop` (dependency NativeWind) menarik `react-native-reanimated`/`react-native-worklets` versi tertentu sebagai peer — ada warning `ERESOLVE` saat install (`react-native-worklets@0.12.1` vs yang diminta `expo-modules-core`). Ini **hanya warning**, install tetap sukses dan bundle tetap jalan (diverifikasi lewat `npx expo start` + request bundle manual, 1448 modules, tanpa error). Kalau nanti butuh animasi eksplisit pakai `react-native-reanimated` langsung, cek versi yang ter-resolve di `node_modules` dulu, jangan asumsikan versi dari `npm view`.
- Cek: https://www.nativewind.dev

### TanStack Query — `^5.101.4`
- Setup dasar (`QueryClient` + `QueryClientProvider`) belum ada gotcha spesifik ditemukan — baru provider di-mount di `App.tsx`, belum ada query/mutation nyata
- v5 punya perubahan API dari v4 (mis. `cacheTime` → `gcTime`) — cek versi terpasang sebelum pakai opsi dari training data
- Cek: https://tanstack.com/query/latest/docs/framework/react/overview

### expo-secure-store — `~57.0.1`
- Ada batas ukuran value yang disimpan (~2048 byte) — JWT dari backend NestJS kemungkinan jauh di bawah ini, tapi **verifikasi ukuran token asli** begitu login feature dikerjakan (lihat `api-standards.md`)
- Cek: https://docs.expo.dev/versions/latest/sdk/securestore/

### expo-location — `~57.0.12`
- API permission (`requestForegroundPermissionsAsync`, dst.) berubah antar versi SDK — cek versi terpasang &amp; docs resmi sebelum implementasi Login feature (yang mewajibkan GPS)
- Cek: https://docs.expo.dev/versions/latest/sdk/location/

### socket.io-client — `^4.8.3`
- Belum diwiring ke kode nyata (belum ada Login/realtime feature) — verifikasi shape event `onlineUsers` (atau apapun namanya di backend NestJS ini) langsung ke gateway socket.io di `/Users/asdarsaid/JSI/api`, jangan asumsikan identik dengan yang diamati di `client` web (backend web mungkin beda versi/kontrak dari NestJS API ini)
- Cek: https://socket.io/docs/v4/client-api/

### zod — `^4.4.3`
- `z.email()` (bukan `z.string().email()`), custom message pakai `{ error: "..." }` (bukan `{ message: "..." }`) — API v4, beda dari v3 yang lazim di training data

### @expo-google-fonts/inter — `^0.4.2`
- Export nama font persis `Inter_400Regular`, `Inter_500Medium`, `Inter_600SemiBold`, `Inter_700Bold` (format `Inter_{weight}{Nama}`) — dipetakan ke `fontFamily` di `tailwind.config.js`. Load lewat `useFonts()` dari package ini di `App.tsx`, gate render sampai `fontsLoaded || fontError`.
