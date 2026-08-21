# API Standards — Mobile (Backend NestJS Terpisah, Kontrak Dibagi dengan Web)

Semua aturan pemakaian API dan session dari **sisi mobile app**. Backend adalah NestJS + TypeORM + MySQL, source ada di `/Users/asdarsaid/JSI/api` — **tapi baru mencakup modul auth, dtdoor, gotv, ruangpublik, timses**. Modul DPT dan Hasil Rekap **belum punya repo yang dibagikan ke sesi ini**.

**Aturan sumber kebenaran:**
- Modul yang repo-nya ada (`auth`, `dtdoor`, `gotv`, `ruangpublik`, `timses`) → baca controller/DTO langsung di `/Users/asdarsaid/JSI/api/src/<modul>` sebelum implementasi, jangan asumsi dari training data atau dari cara web memanggilnya saja.
- Modul yang repo-nya belum ada (DPT, Hasil Rekap) → satu-satunya observasi yang ada adalah cara `client` memanggilnya (lihat `client/src/pages/dpt/dpt-page.jsx`, `client/CLAUDE.md`). Perlakukan ini sebagai **kontrak yang belum terkonfirmasi** — kalau sebuah feature butuh detail di luar apa yang sudah diamati (mis. field yang tidak muncul di tabel DPT web), **tanya user untuk path repo backend-nya**, jangan mengarang.

---

## Environment Variables

```bash
# .env — JANGAN pernah di-commit
EXPO_PUBLIC_API_URL=...   # analog VITE_API_URL di client/.env
```

Aturan:

- Expo hanya mengekspos env var ke client kalau diberi prefix `EXPO_PUBLIC_` — jangan pakai prefix ini untuk apapun yang sensitif
- `.env.example` selalu berisi nama variabel tanpa value — update saat ada env baru

---

## Struktur Client

```typescript
// src/lib/api/client.ts
import axios from "axios";
import { getToken } from "@/lib/api/token";

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

```typescript
// src/lib/api/token.ts
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "acces_token";

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}
export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}
export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
```

Catatan: JWT dari NestJS biasanya jauh di bawah batas ukuran `expo-secure-store` (~2048 byte) — beda dari kasus Supabase session yang butuh `LargeSecureStore`. **Verifikasi ukuran token asli** begitu login feature dikerjakan; kalau ternyata mendekati batas, baru pertimbangkan pola penyimpanan alternatif — jangan pre-optimize sebelum tahu ukurannya.

---

## Auth Flow

Mengikuti `client/src/pages/Login.jsx` persis, hanya beda medium penyimpanan sesi:

1. Ambil lokasi GPS (`expo-location`) — **wajib**, tolak submit kalau user belum kasih izin/lokasi belum didapat (pesan: "Mohon aktifkan GPS anda terlebih dahulu untuk login", sama seperti web)
2. `POST {EXPO_PUBLIC_API_URL}/backend-api/auth/login` dengan body `{ username, password, location: { lat, long } }`
3. Response sukses (diamati dari web, verifikasi ke `/Users/asdarsaid/JSI/api/src/auth` saat implementasi): `data.data.acces_token`, `data.data.namaLengkap`, `data.data.id`, `data.data.roles`, `data.data.nik`
4. Simpan `acces_token` via `src/lib/api/token.ts`
5. Role (`admin` / `adminsekret` / lainnya = timses) menentukan tab navigator mana yang dirender — lihat `RootNavigator.tsx`
6. 401 di response manapun → hapus token, kembali ke `AuthStack` (analog interceptor `layout-hook.js` di web yang menghapus cookie & redirect)

---

## Realtime (Socket.io)

Web (`client/src/pages/dpt/layout-hook.js`) connect ke `io(proxyTarget, { query: { token } })` untuk event `onlineUsers`. Mobile mengikuti pola yang sama: connect setelah login pakai `EXPO_PUBLIC_API_URL` + token, disconnect saat logout/unmount. Verifikasi shape event yang sebenarnya ke `/Users/asdarsaid/JSI/api` (cek gateway socket.io di sana) sebelum implementasi — jangan asumsi identik dengan yang diamati di web kalau backend NestJS ini ternyata sudah beda kontrak dari backend lama yang dipakai web.

---

## Known Endpoints (per modul)

### Auth — repo ada (`/Users/asdarsaid/JSI/api/src/auth`)
- `POST /backend-api/auth/login` — lihat Auth Flow di atas
- `GET /backend-api/user/profile` — bootstrap user setelah token ada (diamati dari `layout-hook.js`)

### Door To Door / GOTV / Ruang Publik / Timses — repo ada
- Baca `/Users/asdarsaid/JSI/api/src/dtdoor`, `src/gotv`, `src/ruangpublik`, `src/timses` langsung untuk daftar endpoint & DTO. Jangan salin daftar dari `client` tanpa cross-check — web bisa saja memanggil endpoint versi lama yang beda dari NestJS API ini.

### DPT — **repo belum ada, kontrak belum terkonfirmasi**
- Diamati dari `client/src/pages/dpt/dpt-page.jsx`: `GET /dpt/2024/:kabId` (params `page`, `limit`, `nama`, `kecId`, `kelId`, `tps`), `GET /dpt/2024/total/:kabId` — field pemilih yang terlihat: `nama`, `usia`, `jenisKelamin`, `namaKec`, `namaKel`, `namaTps`, `alamat`, `rt`, `rw`, `dtdoor`, `gotv`
- **Jangan implementasi CRUD DPT mendalam sebelum user memberi path repo backend-nya**

### Hasil Rekap 2019/2024 — **repo belum ada, kontrak belum terkonfirmasi**
- Diamati dari `client/src/pages/hasilrekap*`: drill-down provinsi/kabupaten/kecamatan/kelurahan/TPS per jenis pemilihan (DPR RI, DPRD Provinsi, DPRD Kabupaten)
- **Jangan implementasi mendalam sebelum user memberi path repo backend-nya**

---

## Query Patterns

- Selalu handle error (lihat contoh di `code-standards.md` bagian Services)
- Jangan `select` semua field kalau API mendukung field selection — kalau tidak, terima payload penuh dari backend dan biarkan
