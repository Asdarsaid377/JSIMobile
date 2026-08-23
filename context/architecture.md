# Architecture

---

## Stack

| Layer | Tool | Keterangan |
| --- | --- | --- |
| Framework | Expo (React Native) SDK 54 | Dipilih agar sejajar dengan `temutani-mobile` (bukan SDK 57 default `create-expo-app`) — cek `package.json` untuk versi persis terpasang |
| Bahasa | TypeScript strict | Seluruh codebase |
| Navigasi | React Navigation | Native stack (`AuthStack`) + bottom tabs per role (`AdminTabs`, `TimsesTabs`) |
| Styling | NativeWind | Sintaks Tailwind untuk React Native — token di `tailwind.config.js`, saat ini **placeholder** dari `client/src/css/tailwind.config.js` |
| Data fetching/cache | TanStack Query | Di atas `axios` instance di `src/lib/api/client.ts` |
| Backend | NestJS API | `/Users/asdarsaid/JSI/api` untuk modul auth/dtdoor/gotv/ruangpublik/timses; modul DPT & Hasil Rekap belum ada repo yang dibagikan — lihat tabel di bawah |
| Auth session | `expo-secure-store` | `src/lib/api/token.ts` — menggantikan cookie (web) |
| Realtime | `socket.io-client` | Menggantikan koneksi socket di `client/src/pages/dpt/layout-hook.js` |
| Lokasi | `expo-location` | GPS wajib saat login |
| Validasi | zod | Validasi input di boundary (form submit, service layer) |
| Animasi | `react-native-reanimated` | Dependency eksplisit (bukan cuma transitif dari NativeWind) — lihat `library-docs.md` alasannya; belum dipakai langsung, tersedia untuk `ui-rules.md` § Animasi &amp; Micro-interactions saat dibutuhkan |

---

## Cross-Reference Backend per Modul

| Modul | Repo backend | Status |
| --- | --- | --- |
| Auth | `/Users/asdarsaid/JSI/api/src/auth` | Ada — cek langsung untuk DTO/endpoint |
| Door To Door | `/Users/asdarsaid/JSI/api/src/dtdoor` | Ada |
| GOTV / Social Event | `/Users/asdarsaid/JSI/api/src/gotv` | Ada |
| Ruang Publik | `/Users/asdarsaid/JSI/api/src/ruangpublik` | Ada |
| Timses | `/Users/asdarsaid/JSI/api/src/timses` | Ada |
| DPT | Belum ada | Endpoint yang terlihat di `client` (mis. `/dpt/2024/:kabId`) adalah observasi, bukan kontrak terkonfirmasi — tanya user untuk repo-nya sebelum implementasi mendalam |
| Hasil Rekap 2019/2024 | Belum ada | Sama seperti DPT — tanya user |

---

## Struktur Folder

```
/
├── CLAUDE.md
├── AGENTS.md                       → Catatan resmi dari Expo (@ di-include otomatis oleh CLAUDE.md)
├── .claude/
│   ├── settings.json                → plugin Expo resmi (dari scaffold)
│   ├── settings.local.json          → permission allowlist
│   └── commands/                    → build-ui, new-feature, update-context
├── context/                         → Semua dokumen context (folder ini)
│   └── designs/                     → Referensi desain dari Claude Design canvas (KOSONG saat ini — lihat CLAUDE.md Aturan #1, tidak ada exception)
├── App.tsx                          → Entry point: font loading, SafeAreaProvider, QueryClientProvider, RootNavigator
├── app.json                         → Konfigurasi Expo (nama app, icon, splash, plugin native)
├── src/
│   ├── navigation/
│   │   ├── RootNavigator.tsx        → Baca useAuth() (status + role) → AuthStack vs AdminTabs/TimsesTabs;
│   │   │                              juga mount useLocationBeacon() (Feature 07, semua role)
│   │   ├── AuthStack.tsx            → Stack berisi LoginScreen
│   │   ├── AdminTabs.tsx            → Bottom tabs admin/adminsekret: Home/DPT/Rekap/Program/Profil (5 tab,
│   │   │                              persis sesuai semua desain — lihat progress-tracker.md Decisions Feature 08)
│   │   ├── TimsesTabs.tsx           → Sama struktur dengan AdminTabs (5 tab yang sama)
│   │   ├── HomeStack.tsx            → Dipakai bersama Admin/TimsesTabs: HomeScreen (root) → Timses, LacakRelawan
│   │   │                              (pushed — dipindah dari tab tersendiri, Feature 08)
│   │   ├── DptStack.tsx             → DptProvinsiScreen (root) → DptKabupatenScreen (pushed) → DptListScreen
│   │   │                              (pushed, ref context/designs/dpt.png) — 3 tahap sesuai alur asli
│   │   └── ProgramStack.tsx         → ProgramPemenanganScreen (root) → DtdoorForm, GotvForm (pushed)
│   ├── screens/
│   │   └── auth/LoginScreen.tsx     → Screen Login (Feature 02) — ref context/designs/login.png
│   ├── components/
│   │   ├── ui/                      → Primitive reusable — Button.tsx, Input.tsx (lihat ui-registry.md)
│   │   └── auth/                    → GpsStatusBanner.tsx (component per fitur)
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts            → axios instance, baseURL dari EXPO_PUBLIC_API_URL (sudah termasuk /api),
│   │   │   │                          interceptor Authorization Bearer + registerUnauthorizedHandler (401 global)
│   │   │   └── token.ts             → getToken/setSession/getSession/clearSession via expo-secure-store
│   │   └── dtdoorScore.ts           → Model skor "Kekuatan Wilayah" (Feature 10) — pure business logic,
│   │                                   BUKAN transport API, makanya di luar lib/api/ (lihat progress-tracker.md)
│   ├── services/
│   │   └── auth.ts                  → loginRequest — POST /auth/login, mapping response ke AuthUser
│   ├── hooks/
│   │   ├── useAuth.tsx              → AuthContext/AuthProvider/useAuth — session in-memory + bootstrap dari secure-store
│   │   ├── useLogin.ts              → TanStack mutation login, panggil useAuth().login on success
│   │   └── useLocationPermission.ts → Wrap expo-location permission+getCurrentPosition, re-check tiap screen focus
│   └── types/
│       └── auth.ts                  → Role, AuthUser, Session
├── assets/                          → Icon, splash screen
├── .env.example                     → Daftar env tanpa value
└── .env                             → Env asli (tidak di-commit)
```

Aturan:

- Component per fitur masuk `src/components/<fitur>/` — jangan menumpuk semua di satu folder
- Business logic (query/mutation ke API) tidak ditulis langsung di screen/component — masuk `src/services/`, dipanggil lewat hook di `src/hooks/`
- File baru harus masuk struktur di atas; jika butuh folder baru, catat alasannya di `progress-tracker.md`

---

## Data Flow

```
Screen (Component)
  → custom hook (src/hooks/*.ts, pakai TanStack Query)
  → fungsi service (src/services/*.ts) → panggil src/lib/api/client.ts (axios + Bearer token)
  → render (query) / invalidateQueries + refetch (mutation)

Auth (Feature 02, selesai — kontrak diverifikasi ke /Users/asdarsaid/JSI/api/src/auth, lihat api-standards.md):
Screen (src/screens/auth/LoginScreen.tsx)
  → src/hooks/useLogin.ts (TanStack mutation) → src/services/auth.ts → POST {EXPO_PUBLIC_API_URL}/auth/login
    (base URL sudah termasuk /api) dengan { nik, password, location: { lat, long } } — GPS wajib secara UX
    (blok submit), tapi backend tidak memvalidasi field location
  → simpan { token, user } via src/lib/api/token.ts (expo-secure-store) — tidak ada fetch profile terpisah,
    user diambil langsung dari payload response login
  → src/hooks/useAuth.tsx (AuthProvider/useAuth) pegang session di memori + bootstrap dari secure-store saat app start
  → RootNavigator baca status auth + role dari useAuth() → switch AuthStack/AdminTabs/TimsesTabs
```

Beda kunci dari web: tidak ada cookie/browser session — semua lewat JWT di `expo-secure-store` dan header `Authorization: Bearer`, bukan `axios.defaults.headers.common` global seperti `client`'s `apiDpt`/`layout-hook.js`.

---

## Environment & Deployment

- **Local dev:** `.env` perlu `EXPO_PUBLIC_API_URL` mengarah ke instance `/Users/asdarsaid/JSI/api` yang jalan (lihat README repo itu untuk cara start). Untuk testing di **physical device**, isi dengan IP LAN mesin dev (bukan `localhost`), sama seperti alasan di `client`'s Vite dev proxy.
- **Production:** `EXPO_PUBLIC_API_URL` mengarah ke domain API production yang sama dengan yang dipakai `client` (lihat `client/nginx.conf`/`Dockerfile` untuk konteks deployment webnya).
- **Distribusi:** belum ditentukan — isi detail EAS Build/App Store/Play Store saat mendekati rilis.
