import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchRealCountByKelurahan, fetchRealCountByTps, submitRealCount } from "@/services/realcount";
import type { SubmitRealCountInput } from "@/types/realcount";

export const realCountByTpsQueryKey = (kelWilId: number, noTps: number): [string, string, number, number] => [
  "realcount",
  "tps",
  kelWilId,
  noTps,
];

export function useRealCountByTps(kelWilId: number, noTps: number) {
  return useQuery({
    queryKey: realCountByTpsQueryKey(kelWilId, noTps),
    queryFn: () => fetchRealCountByTps(kelWilId, noTps),
  });
}

export const realCountByKelurahanQueryKey = (kelWilId: number): [string, string, number] => [
  "realcount",
  "kelurahan",
  kelWilId,
];

export function useRealCountByKelurahan(kelWilId: number) {
  return useQuery({
    queryKey: realCountByKelurahanQueryKey(kelWilId),
    queryFn: () => fetchRealCountByKelurahan(kelWilId),
  });
}

export function useSubmitRealCount(kelWilId: number, noTps: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SubmitRealCountInput) => submitRealCount(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: realCountByTpsQueryKey(kelWilId, noTps) });
      void queryClient.invalidateQueries({ queryKey: realCountByKelurahanQueryKey(kelWilId) });
    },
  });
}
