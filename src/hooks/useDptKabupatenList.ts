import { useQuery } from "@tanstack/react-query";

import { fetchKabupatenList } from "@/services/dpt";
import type { DptKabupaten } from "@/types/dpt";

export function useDptKabupatenList(provinsiWilId: number | null) {
  return useQuery<DptKabupaten[]>({
    queryKey: ["dpt", "kabupaten", provinsiWilId],
    queryFn: () => {
      if (provinsiWilId === null) throw new Error("provinsiWilId wajib diisi.");
      return fetchKabupatenList(provinsiWilId);
    },
    enabled: provinsiWilId !== null,
  });
}
