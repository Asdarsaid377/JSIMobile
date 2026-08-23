import { useInfiniteQuery } from "@tanstack/react-query";

import { fetchDptList } from "@/services/dpt";
import type { DptListResult } from "@/types/dpt";

const DPT_PAGE_LIMIT = 30;

export type DptListFilter = {
  nama?: string;
  kecId?: number;
  kelId?: number;
  tps?: number;
};

// Server-side filter+pagination (2026-08-23, ganti dari fetch-penuh-lalu-filter-
// client-side — WAJIB begitu endpoint asli dikonfirmasi, lihat api-standards.md
// § DPT: dataset asli per-kabupaten bisa >100rb baris). Filter jadi bagian dari
// queryKey — ganti filter otomatis reset pagination via React Query.
export function useDptList(kabWilId: number | null, filter: DptListFilter) {
  return useInfiniteQuery<DptListResult>({
    queryKey: ["dpt", "list", kabWilId, filter.nama ?? null, filter.kecId ?? null, filter.kelId ?? null, filter.tps ?? null],
    queryFn: ({ pageParam }) => {
      if (kabWilId === null) throw new Error("kabWilId wajib diisi.");
      return fetchDptList(kabWilId, { page: pageParam as number, limit: DPT_PAGE_LIMIT, ...filter });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    enabled: kabWilId !== null,
  });
}
