import { useQuery } from "@tanstack/react-query";

import { fetchDtdoorAll } from "@/services/dtdoor";
import type { Dtdoor } from "@/types/dtdoor";

export function useDtdoorAll() {
  return useQuery<Dtdoor[]>({
    queryKey: ["dtdoor", "all"],
    queryFn: fetchDtdoorAll,
  });
}
