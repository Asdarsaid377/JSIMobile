import { useQuery } from "@tanstack/react-query";

import { fetchAntiFraudSnapshot } from "@/services/antifraud";
import type { AntiFraudSnapshot } from "@/types/antifraud";

export function useAntiFraudSnapshot() {
  return useQuery<AntiFraudSnapshot>({
    queryKey: ["antifraud", "snapshot"],
    queryFn: fetchAntiFraudSnapshot,
  });
}
