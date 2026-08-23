import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createSaksi, fetchSaksiByTps, updateSaksiStatus } from "@/services/saksi";
import type { CreateSaksiInput, SaksiStatus } from "@/types/saksi";

export const saksiByTpsQueryKey = (kelWilId: number, noTps: number): [string, string, number, number] => [
  "saksi",
  "tps",
  kelWilId,
  noTps,
];

export function useSaksiByTps(kelWilId: number, noTps: number) {
  return useQuery({
    queryKey: saksiByTpsQueryKey(kelWilId, noTps),
    queryFn: () => fetchSaksiByTps(kelWilId, noTps),
  });
}

export function useCreateSaksi(kelWilId: number, noTps: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSaksiInput) => createSaksi(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: saksiByTpsQueryKey(kelWilId, noTps) });
    },
  });
}

export function useUpdateSaksiStatus(kelWilId: number, noTps: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: SaksiStatus }) => updateSaksiStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: saksiByTpsQueryKey(kelWilId, noTps) });
    },
  });
}
