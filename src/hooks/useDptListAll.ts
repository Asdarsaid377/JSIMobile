import { useQuery } from "@tanstack/react-query";

import { fetchDptListAll } from "@/services/dpt";
import type { DptRecord } from "@/types/dpt";

// Untuk konsumen yang butuh SELURUH record (agregasi TPS/laporan Target
// Suara/Real Count, demo widget HomeScreen) — BUKAN list berpaginasi biasa
// (pakai useDptList untuk itu). Lihat fetchDptListAll di services/dpt.ts
// untuk catatan risiko skalabilitas.
export function useDptListAll(kabWilId: number | null, filter: { kecId?: number; kelId?: number } = {}) {
  return useQuery<DptRecord[]>({
    queryKey: ["dpt", "list-all", kabWilId, filter.kecId ?? null, filter.kelId ?? null],
    queryFn: () => {
      if (kabWilId === null) throw new Error("kabWilId wajib diisi.");
      return fetchDptListAll(kabWilId, filter);
    },
    enabled: kabWilId !== null,
  });
}
