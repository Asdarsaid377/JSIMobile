import { useQuery } from "@tanstack/react-query";

import { fetchKekuatanWilayahRekap } from "@/services/dtdoor";
import type { KekuatanWilayahFilter, KekuatanWilayahRekap } from "@/types/dtdoor";

export function useKekuatanWilayahRekap(filter?: KekuatanWilayahFilter) {
  return useQuery<KekuatanWilayahRekap[]>({
    queryKey: ["dtdoor", "rekap-kekuatan-wilayah", filter ?? null],
    queryFn: () => fetchKekuatanWilayahRekap(filter),
  });
}
