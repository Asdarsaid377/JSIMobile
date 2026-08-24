import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createRivalAktivitas,
  createRivalCaleg,
  createRivalWilayah,
  deleteRivalCaleg,
  fetchRivalDeteksiSnapshot,
  updateRivalCaleg,
  updateRivalWilayah,
} from "@/services/rivalcaleg";
import type {
  CreateRivalAktivitasInput,
  CreateRivalCalegInput,
  CreateRivalWilayahInput,
  RivalDeteksiSnapshot,
  UpdateRivalCalegInput,
  UpdateRivalWilayahInput,
} from "@/types/rivalcaleg";

const snapshotQueryKey = ["rivalcaleg", "snapshot"];

export function useRivalDeteksiSnapshot() {
  return useQuery<RivalDeteksiSnapshot>({
    queryKey: snapshotQueryKey,
    queryFn: fetchRivalDeteksiSnapshot,
  });
}

// Semua mutation invalidate 1 query key snapshot yang sama (bukan per-resource
// kayak useDptRecordMutations.ts) — backend pecah 4 endpoint tapi mobile
// gabung jadi 1 snapshot gabungan, jadi 1 invalidate cukup bikin SEMUA tab
// (Kekuatan/Daftar Rival/Aktivitas) refetch sekaligus.
function useInvalidateSnapshot() {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: snapshotQueryKey });
}

export function useCreateRivalCaleg() {
  const invalidate = useInvalidateSnapshot();
  return useMutation({
    mutationFn: (input: CreateRivalCalegInput) => createRivalCaleg(input),
    onSuccess: invalidate,
  });
}

export function useUpdateRivalCaleg() {
  const invalidate = useInvalidateSnapshot();
  return useMutation({
    mutationFn: (input: UpdateRivalCalegInput) => updateRivalCaleg(input),
    onSuccess: invalidate,
  });
}

export function useDeleteRivalCaleg() {
  const invalidate = useInvalidateSnapshot();
  return useMutation({
    mutationFn: (id: number) => deleteRivalCaleg(id),
    onSuccess: invalidate,
  });
}

export function useCreateRivalWilayah() {
  const invalidate = useInvalidateSnapshot();
  return useMutation({
    mutationFn: (input: CreateRivalWilayahInput) => createRivalWilayah(input),
    onSuccess: invalidate,
  });
}

export function useUpdateRivalWilayah() {
  const invalidate = useInvalidateSnapshot();
  return useMutation({
    mutationFn: (input: UpdateRivalWilayahInput) => updateRivalWilayah(input),
    onSuccess: invalidate,
  });
}

// `pelapor` (nama user sesi aktif) dikunci saat hook dipanggil — pola sama
// useCreateBudgetTransaction(oleh), screen ambil dari useAuth().session.
export function useCreateRivalAktivitas(pelapor: string) {
  const invalidate = useInvalidateSnapshot();
  return useMutation({
    mutationFn: (input: CreateRivalAktivitasInput) => createRivalAktivitas(input, pelapor),
    onSuccess: invalidate,
  });
}
