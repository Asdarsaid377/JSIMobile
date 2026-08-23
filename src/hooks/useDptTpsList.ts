import { useQuery } from "@tanstack/react-query";

import { fetchDptTpsList } from "@/services/dpt";
import type { DptTpsOption } from "@/types/dpt";

// GET /dpt/2024/:wilId?type=tps — endpoint lookup TPS asli (baru ditemukan
// 2026-08-23) — menggantikan opsi TPS yang dulu di-derive client-side dari
// record yang sudah termuat (tidak akurat untuk list yang sekarang paginated).
export function useDptTpsList(kabWilId: number | null, kecWilId: number | null, kelWilId: number | null) {
  return useQuery<DptTpsOption[]>({
    queryKey: ["dpt", "tps", kabWilId, kecWilId, kelWilId],
    queryFn: () => {
      if (kabWilId === null) throw new Error("kabWilId wajib diisi.");
      return fetchDptTpsList(kabWilId, { kecId: kecWilId ?? undefined, kelId: kelWilId ?? undefined });
    },
    enabled: kabWilId !== null,
  });
}
