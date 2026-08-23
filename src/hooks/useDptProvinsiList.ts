import { useQuery } from "@tanstack/react-query";

import { fetchProvinsiList } from "@/services/dpt";
import type { DptProvinsi } from "@/types/dpt";

export function useDptProvinsiList() {
  return useQuery<DptProvinsi[]>({
    queryKey: ["dpt", "provinsi"],
    queryFn: fetchProvinsiList,
  });
}
