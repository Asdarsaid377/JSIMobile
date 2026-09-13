import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createPengumuman, deletePengumuman, fetchPengumumanList } from "@/services/pengumuman";
import type { CreatePengumumanInput, Pengumuman } from "@/types/pengumuman";

const listQueryKey = ["pengumuman", "list"];

export function usePengumumanList() {
  return useQuery<Pengumuman[]>({
    queryKey: listQueryKey,
    queryFn: fetchPengumumanList,
  });
}

export function useCreatePengumuman() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePengumumanInput) => createPengumuman(input),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: listQueryKey }),
  });
}

export function useDeletePengumuman() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletePengumuman(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: listQueryKey }),
  });
}
