import { useQuery } from "@tanstack/react-query";

import { fetchDtdoorLookups } from "@/services/dtdoor";
import type { DtdoorLookupOption, PilihanPilegOption } from "@/types/dtdoor";

export const dtdoorLookupsQueryKey = (): [string, string] => ["dtdoor", "lookups"];

export function useDtdoorLookups() {
  return useQuery<{
    tipePemilih: DtdoorLookupOption[];
    pilihanPileg: PilihanPilegOption[];
    programBantuan: DtdoorLookupOption[];
  }>({
    queryKey: dtdoorLookupsQueryKey(),
    queryFn: fetchDtdoorLookups,
    staleTime: 5 * 60 * 1000,
  });
}
