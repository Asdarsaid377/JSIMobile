import { useQuery } from "@tanstack/react-query";

import { fetchKelurahanList } from "@/services/dpt";
import type { DptKelurahan } from "@/types/dpt";

// kabWilId JUGA wajib (bukan cuma kecWilId) — endpoint asli GET /kelurahan
// butuh query param kabId & kecId bersamaan (lihat services/dpt.ts).
export function useDptKelurahanList(kabWilId: number | null, kecWilId: number | null) {
  return useQuery<DptKelurahan[]>({
    queryKey: ["dpt", "kelurahan", kabWilId, kecWilId],
    queryFn: () => {
      if (kabWilId === null || kecWilId === null) throw new Error("kabWilId & kecWilId wajib diisi.");
      return fetchKelurahanList(kabWilId, kecWilId);
    },
    enabled: kabWilId !== null && kecWilId !== null,
  });
}
