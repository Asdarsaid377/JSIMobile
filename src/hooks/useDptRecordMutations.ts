import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createDptRecord, deleteDptRecord, markDptDtdoor, markDptTokoh, updateDptRecord } from "@/services/dpt";
import type { CreateDptRecordInput, DptRecord, UpdateDptRecordInput } from "@/types/dpt";

// 3 hook CRUD terpisah (bukan 1 hook gabungan) — pola sama `useRivalCaleg.ts`
// (`useCreateRivalCaleg`/`useUpsertRivalAssessment` terpisah). Semua invalidate
// queryKey `["dpt","list",kabWilId]` yang sama dipakai `useDptList` supaya
// DptListScreen refetch otomatis setelah create/update/delete.
function dptListQueryKey(kabWilId: number): [string, string, number] {
  return ["dpt", "list", kabWilId];
}

export function useCreateDptRecord(kabWilId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDptRecordInput) => createDptRecord(kabWilId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: dptListQueryKey(kabWilId) });
    },
  });
}

export function useUpdateDptRecord(kabWilId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateDptRecordInput) => updateDptRecord(kabWilId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: dptListQueryKey(kabWilId) });
    },
  });
}

export function useDeleteDptRecord(kabWilId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (record: Pick<DptRecord, "id" | "idDpt">) => deleteDptRecord(kabWilId, record),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: dptListQueryKey(kabWilId) });
    },
  });
}

// Dipanggil dari DtdoorFormScreen setelah createDtdoor() sukses dengan idDpt
// terhubung ke record DPT ini — lihat services/dpt.ts § markDptDtdoor.
export function useMarkDptDtdoor(kabWilId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => markDptDtdoor(kabWilId, id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: dptListQueryKey(kabWilId) });
    },
  });
}

// Dipanggil dari TokohFormScreen setelah createTokoh() sukses dari icon
// bintang DptCard — lihat services/dpt.ts § markDptTokoh.
export function useMarkDptTokoh(kabWilId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => markDptTokoh(kabWilId, id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: dptListQueryKey(kabWilId) });
    },
  });
}
