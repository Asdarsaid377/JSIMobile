# Code Standards

Aturan implementasi dan konvensi untuk seluruh project. Claude Code wajib mengikuti ini di setiap session tanpa pengecualian. Tujuannya mencegah *pattern drift* antar session.

---

## Mindset Engineering

Claude Code di project ini beroperasi sebagai senior engineer:

- **Berpikir sebelum implement** — pahami apa yang dibangun dan kenapa, sebelum menulis satu baris pun
- **Baca context files dulu** — jangan berasumsi; verifikasi ke `architecture.md` dan `project-overview.md`
- **Scope itu sakral** — hanya build apa yang dibutuhkan feature saat ini. Jangan melebar meskipun terasa "membantu"
- **Setiap feature harus bisa diverifikasi** — kalau tidak bisa dites/dilihat langsung setelah implement, berarti belum selesai
- **Clean over clever** — kode sederhana yang bisa dibaca junior developer selalu lebih baik daripada abstraksi pintar
- **Satu hal dalam satu waktu** — selesaikan satu feature penuh sebelum menyentuh yang lain
- **Kegagalan itu normal** — bungkus operasi eksternal (network, API call) dengan try/catch, log kegagalannya, jangan biarkan satu kegagalan meruntuhkan seluruh app

---

## TypeScript

- Strict mode aktif di `tsconfig.json` — tanpa pengecualian
- Dilarang `any` — pakai `unknown` lalu narrow type-nya
- Dilarang type assertion (`as SomeType`) kecuali benar-benar perlu dan diberi komentar alasannya
- Semua parameter fungsi dan return type diketik eksplisit
- Pakai `type` untuk object shape dan union; `interface` hanya untuk component props yang perlu di-extend
- Semua async function wajib punya error handling — jangan biarkan promise mengambang
- `const` by default; `let` hanya jika memang perlu reassignment

---

## Konvensi React Native / Expo

- Function component only — tidak ada class component
- Screen (`src/screens/`) fokus komposisi & layout; logic data ada di hook (`src/hooks/`), bukan inline `useEffect` fetch manual
- Navigasi: type params tiap stack/tab secara eksplisit (`AuthStackParamList`, `AdminTabParamList`, dst. — lihat contoh di `src/navigation/`) — jangan `any` di `useNavigation<any>()`
- Style lewat NativeWind className, bukan `StyleSheet.create` — kecuali untuk kasus yang NativeWind tidak bisa handle, catat alasannya di komentar
- `SafeAreaView` / `useSafeAreaInsets` wajib di screen root — hindari konten ketutup notch/status bar/home indicator
- Loading/error/empty state wajib untuk setiap query — jangan biarkan screen putih kosong saat fetching (lihat `ui-rules.md`)

---

## Penamaan File dan Folder

- Folder: kebab-case — `job-details`, `user-settings`
- File component/screen: PascalCase — `DptListScreen.tsx`, `DptCard.tsx`
- File utility/service/hook: camelCase — `formatDate.ts`, `dpt.ts`, `useDptList.ts`
- Satu component per file — jangan export beberapa component dari satu file
- Index/barrel file hanya di `src/components/ui/` — folder lain dilarang barrel export

---

## Struktur Component

```typescript
// 1. External imports
import { useState } from "react";
import { View, Text } from "react-native";

// 2. Internal imports
import { Button } from "@/components/ui/Button";
import { useDptList } from "@/hooks/useDptList";

// 3. Type definitions
type Props = {
  kabId: string;
};

// 4. Component
export function ComponentName({ kabId }: Props) {
  // state
  // derived values
  // handlers
  // return JSX
}
```

- Named export selalu — dilarang default export, kecuali file yang diwajibkan default export oleh convention (mis. `App.tsx`)
- Type props didefinisikan tepat di atas component — bukan file terpisah, kecuali dipakai bersama

---

## Services (pengganti axios-hooks call langsung di screen)

```typescript
// src/services/dpt.ts
import { apiClient } from "@/lib/api/client";

export async function fetchDptList(kabId: string, params: Record<string, unknown>) {
  try {
    const { data } = await apiClient.get(`/dpt/2024/${kabId}`, { params });
    return data;
  } catch (error) {
    console.error("[services/dpt/fetchDptList]", error);
    throw new Error("Gagal memuat data DPT. Coba lagi.");
  }
}
```

- Log error dengan prefix `[services/nama-file/nama-fungsi]` agar mudah dicari
- Lempar `Error` dengan pesan human-readable Bahasa Indonesia — jangan lempar raw error axios ke hook/UI
- Validasi input dengan zod di boundary (sebelum submit form), bukan di kedalaman logic

---

## Hooks (TanStack Query)

- Satu hook per operasi data, prefix `use` — `useDptList`, `useCreateDpt`
- Query key konsisten & terdaftar per domain (mis. `["dpt", kabId, params]`) — hindari string key acak yang sulit di-invalidate
- Mutation wajib `onSuccess` invalidate query key yang relevan

---

## Error Handling & UX

- Jangan tampilkan raw error ke user — selalu pesan human-readable Bahasa Indonesia
- Setiap operasi async di UI punya 3 state: loading, success, error
- Setiap list punya empty state (lihat `ui-rules.md`)

---

## Git

- Commit message: bahasa Inggris, imperative — `add dpt list screen`
- Satu commit = satu perubahan logis
- Jangan commit: `.env*` (kecuali `.env.example`), folder build, `node_modules`, `.expo/`
