import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { approveFraudCase, fetchAntiFraudSnapshot, rejectFraudCase } from "@/services/antifraud";
import type { AntiFraudSnapshot } from "@/types/antifraud";

export function useAntiFraudSnapshot() {
  return useQuery<AntiFraudSnapshot>({
    queryKey: ["antifraud", "snapshot"],
    queryFn: fetchAntiFraudSnapshot,
  });
}

export function useApproveFraudCase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => approveFraudCase(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["antifraud"] }),
  });
}

export function useRejectFraudCase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => rejectFraudCase(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["antifraud"] }),
  });
}
