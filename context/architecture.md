# Architecture

---

## Stack

| Layer | Tool | Keterangan |
| --- | --- | --- |
| Framework | Expo (React Native) SDK 57 | Cek `package.json` untuk versi persis terpasang |
| Bahasa | TypeScript strict | Seluruh codebase |
| Navigasi | React Navigation | Native stack (`AuthStack`) + bottom tabs per role (`AdminTabs`, `TimsesTabs`) |
| Styling | NativeWind | Sintaks Tailwind untuk React Native — token di `tailwind.config.js`, saat ini **placeholder** dari `client/src/css/tailwind.config.js` |
| Data fetching/cache | TanStack Query | Di atas `axios` instance di `src/lib/api/client.ts` |
| Backend | NestJS API | `/Users/asdarsaid/JSI/api` untuk modul auth/dtdoor/gotv/ruangpublik/timses; modul DPT & Hasil Rekap belum ada repo yang dibagikan — lihat tabel di bawah |
| Auth session | `expo-secure-store` | `src/lib/api/token.ts` — menggantikan cookie (web) |
| Realtime | `socket.io-client` | Menggantikan koneksi socket di `client/src/pages/dpt/layout-hook.js` |
| Lokasi | `expo-location` | GPS wajib saat login |
| Validasi | zod | Validasi input di boundary (form submit, service layer) |

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
│   │   ├── RootNavigator.tsx        → Pilih AuthStack vs tab navigator berdasar session + role
│   │   ├── AuthStack.tsx            → Login (stub — real screen belum dibangun)
│   │   ├── AdminTabs.tsx            → Bottom tabs untuk admin/adminsekret (stub)
│   │   └── TimsesTabs.tsx           → Bottom tabs untuk timses (stub)
│   ├── screens/                     → Satu folder per fitur, satu file per screen (belum ada isinya — dibangun via /new-feature)
│   ├── components/
│   │   ├── ui/                      → Primitive reusable (Button, Card, Input, dst.) — belum ada, build sesuai ui-workflow.md
│   │   └── <fitur>/                 → Component per fitur
│   ├── lib/
│   │   └── api/
│   │       ├── client.ts            → axios instance, baseURL dari EXPO_PUBLIC_API_URL, interceptor Authorization Bearer
│   │       └── token.ts             → getToken/setToken/clearToken via expo-secure-store
│   ├── services/                    → Fungsi query/mutation per domain, dipanggil dari hooks — belum ada
│   ├── hooks/                       → Custom hook TanStack Query per domain — belum ada
│   └── types/                       → Type bersama lintas domain — belum ada
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

Auth:
Screen (Login — belum dibangun)
  → src/services/auth.ts (belum dibangun) → POST {EXPO_PUBLIC_API_URL}/backend-api/auth/login
    dengan { username, password, location: { lat, long } } (GPS wajib, lihat client/src/pages/Login.jsx)
  → simpan acces_token via src/lib/api/token.ts (expo-secure-store)
  → RootNavigator baca status auth + role → switch AuthStack/AdminTabs/TimsesTabs
```

Beda kunci dari web: tidak ada cookie/browser session — semua lewat JWT di `expo-secure-store` dan header `Authorization: Bearer`, bukan `axios.defaults.headers.common` global seperti `client`'s `apiDpt`/`layout-hook.js`.

---

## Environment & Deployment

- **Local dev:** `.env` perlu `EXPO_PUBLIC_API_URL` mengarah ke instance `/Users/asdarsaid/JSI/api` yang jalan (lihat README repo itu untuk cara start). Untuk testing di **physical device**, isi dengan IP LAN mesin dev (bukan `localhost`), sama seperti alasan di `client`'s Vite dev proxy.
- **Production:** `EXPO_PUBLIC_API_URL` mengarah ke domain API production yang sama dengan yang dipakai `client` (lihat `client/nginx.conf`/`Dockerfile` untuk konteks deployment webnya).
- **Distribusi:** belum ditentukan — isi detail EAS Build/App Store/Play Store saat mendekati rilis.
