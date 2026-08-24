import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createIsuAspirasi,
  createIsuJanji,
  deleteIsuJanji,
  fetchIsuAspirasiSnapshot,
  updateIsuAspirasi,
  updateIsuJanji,
} from "@/services/isuaspirasi";
import type {
  CreateIsuAspirasiInput,
  CreateIsuJanjiInput,
  IsuAspirasiSnapshot,
  UpdateIsuAspirasiInput,
  UpdateIsuJanjiInput,
} from "@/types/isuaspirasi";

const snapshotQueryKey = ["isuaspirasi", "snapshot"];

export function useIsuAspirasiSnapshot() {
  return useQuery<IsuAspirasiSnapshot>({
    queryKey: snapshotQueryKey,
    queryFn: fetchIsuAspirasiSnapshot,
  });
}

// Semua mutation invalidate 1 query key snapshot yang sama (backend pecah 3
// resource, mobile gabung jadi 1 snapshot) — pola sama useRivalCaleg.ts.
function useInvalidateSnapshot() {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: snapshotQueryKey });
}

// Backing "Tandai Ditindak"/"Jadikan Materi" di IsuAspirasiDetailSheet.
export function useUpdateIsuAspirasi() {
  const invalidate = useInvalidateSnapshot();
  return useMutation({
    mutationFn: (input: UpdateIsuAspirasiInput) => updateIsuAspirasi(input),
    onSuccess: invalidate,
  });
}

// `relawan` (nama user sesi aktif) dikunci saat hook dipanggil — pola sama
// useCreateRivalAktivitas(pelapor), screen ambil dari useAuth().session.
export function useCreateIsuAspirasi(relawan: string) {
  const invalidate = useInvalidateSnapshot();
  return useMutation({
    mutationFn: (input: CreateIsuAspirasiInput) => createIsuAspirasi(input, relawan),
    onSuccess: invalidate,
  });
}

export function useCreateIsuJanji() {
  const invalidate = useInvalidateSnapshot();
  return useMutation({
    mutationFn: (input: CreateIsuJanjiInput) => createIsuJanji(input),
    onSuccess: invalidate,
  });
}

export function useUpdateIsuJanji() {
  const invalidate = useInvalidateSnapshot();
  return useMutation({
    mutationFn: (input: UpdateIsuJanjiInput) => updateIsuJanji(input),
    onSuccess: invalidate,
  });
}

export function useDeleteIsuJanji() {
  const invalidate = useInvalidateSnapshot();
  return useMutation({
    mutationFn: (id: number) => deleteIsuJanji(id),
    onSuccess: invalidate,
  });
}
