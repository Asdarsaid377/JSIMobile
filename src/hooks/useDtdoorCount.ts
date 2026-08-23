import { useQuery } from "@tanstack/react-query";

import { fetchDtdoorCount } from "@/services/dtdoor";

export const dtdoorCountQueryKey = (): [string, string] => ["dtdoor", "count"];

export function useDtdoorCount() {
  return useQuery<number>({ queryKey: dtdoorCountQueryKey(), queryFn: fetchDtdoorCount });
}
