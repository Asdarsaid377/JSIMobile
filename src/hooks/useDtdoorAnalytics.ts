import { useQuery } from "@tanstack/react-query";

import { fetchDtdoorAnalytics } from "@/services/dtdoor";
import type { DtdoorAnalyticsSnapshot } from "@/types/dtdoor";

export function useDtdoorAnalytics() {
  return useQuery<DtdoorAnalyticsSnapshot>({
    queryKey: ["dtdoor", "analytics"],
    queryFn: fetchDtdoorAnalytics,
  });
}
