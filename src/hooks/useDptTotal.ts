import { useQuery } from "@tanstack/react-query";

import { fetchDptTotal } from "@/services/dpt";

// GET /dpt/2024/total/:wilId — total count AKURAT yang ikut filter aktif
// (list endpoint sendiri tidak balas total, lihat types/dpt.ts § DptListResult).
export function useDptTotal(kabWilId: number | null, filter: { nama?: string; kecId?: number; kelId?: number; tps?: number }) {
  return useQuery<number>({
    queryKey: ["dpt", "total", kabWilId, filter.nama ?? null, filter.kecId ?? null, filter.kelId ?? null, filter.tps ?? null],
    queryFn: () => {
      if (kabWilId === null) throw new Error("kabWilId wajib diisi.");
      return fetchDptTotal(kabWilId, filter);
    },
    enabled: kabWilId !== null,
  });
}
