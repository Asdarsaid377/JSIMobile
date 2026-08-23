import { useQuery } from "@tanstack/react-query";

import { fetchKecamatanList } from "@/services/dpt";
import type { DptKecamatan } from "@/types/dpt";

export function useDptKecamatanList(kabWilId: number | null) {
  return useQuery<DptKecamatan[]>({
    queryKey: ["dpt", "kecamatan", kabWilId],
    queryFn: () => {
      if (kabWilId === null) throw new Error("kabWilId wajib diisi.");
      return fetchKecamatanList(kabWilId);
    },
    enabled: kabWilId !== null,
  });
}
