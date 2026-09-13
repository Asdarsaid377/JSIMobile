import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createQuickCountKandidat,
  createQuickCountTps,
  deleteQuickCountKandidat,
  deleteQuickCountTps,
  fetchQuickCountKandidatList,
  fetchQuickCountRekap,
  fetchQuickCountSummary,
  fetchQuickCountTpsList,
  submitQuickCountHasil,
  updateQuickCountKandidat,
  updateQuickCountTps,
} from "@/services/quickcount";
import type {
  CreateQuickCountKandidatInput,
  CreateQuickCountTpsInput,
  QuickCountKandidat,
  QuickCountRekapGroup,
  QuickCountRekapLevel,
  QuickCountSummary,
  QuickCountTps,
  QuickCountWilayahFilter,
  SubmitQuickCountHasilInput,
  UpdateQuickCountKandidatInput,
  UpdateQuickCountTpsInput,
} from "@/types/quickcount";

// Prefix bersama SEMUA query Quick Count — invalidate cukup 1 key ini di
// semua mutation (bukan per-resource kayak sebelumnya), karena summary/rekap
// (2026-08-24) turunan dari kombinasi tps+hasil+kandidat, jadi mutasi
// resource manapun bisa mengubah angka summary/rekap juga.
const QUICK_COUNT_PREFIX = ["quickcount"];
const QUICK_COUNT_QUERY_KEY = [...QUICK_COUNT_PREFIX, "tps"];
const QUICK_COUNT_KANDIDAT_QUERY_KEY = [...QUICK_COUNT_PREFIX, "kandidat"];

function useInvalidateQuickCount() {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: QUICK_COUNT_PREFIX });
}

export function useQuickCountTpsList() {
  return useQuery<QuickCountTps[]>({
    queryKey: QUICK_COUNT_QUERY_KEY,
    queryFn: fetchQuickCountTpsList,
  });
}

export function useSubmitQuickCountHasil() {
  const invalidate = useInvalidateQuickCount();
  return useMutation({
    mutationFn: (input: SubmitQuickCountHasilInput) => submitQuickCountHasil(input),
    onSuccess: invalidate,
  });
}

export function useCreateQuickCountTps() {
  const invalidate = useInvalidateQuickCount();
  return useMutation({
    mutationFn: (input: CreateQuickCountTpsInput) => createQuickCountTps(input),
    onSuccess: invalidate,
  });
}

export function useUpdateQuickCountTps() {
  const invalidate = useInvalidateQuickCount();
  return useMutation({
    mutationFn: (input: UpdateQuickCountTpsInput) => updateQuickCountTps(input),
    onSuccess: invalidate,
  });
}

export function useDeleteQuickCountTps() {
  const invalidate = useInvalidateQuickCount();
  return useMutation({
    mutationFn: (id: number) => deleteQuickCountTps(id),
    onSuccess: invalidate,
  });
}

export function useQuickCountKandidatList() {
  return useQuery<QuickCountKandidat[]>({
    queryKey: QUICK_COUNT_KANDIDAT_QUERY_KEY,
    queryFn: fetchQuickCountKandidatList,
  });
}

export function useCreateQuickCountKandidat() {
  const invalidate = useInvalidateQuickCount();
  return useMutation({
    mutationFn: (input: CreateQuickCountKandidatInput) => createQuickCountKandidat(input),
    onSuccess: invalidate,
  });
}

export function useUpdateQuickCountKandidat() {
  const invalidate = useInvalidateQuickCount();
  return useMutation({
    mutationFn: (input: UpdateQuickCountKandidatInput) => updateQuickCountKandidat(input),
    onSuccess: invalidate,
  });
}

export function useDeleteQuickCountKandidat() {
  const invalidate = useInvalidateQuickCount();
  return useMutation({
    mutationFn: (id: number) => deleteQuickCountKandidat(id),
    onSuccess: invalidate,
  });
}

// filter masuk query key — tiap kombinasi filter dapat cache sendiri, pindah
// filter lalu balik lagi tidak perlu refetch (pola sama useBudgetSummary(scope)).
export function useQuickCountSummary(filter: QuickCountWilayahFilter) {
  return useQuery<QuickCountSummary>({
    queryKey: [...QUICK_COUNT_PREFIX, "summary", filter],
    queryFn: () => fetchQuickCountSummary(filter),
  });
}

export function useQuickCountRekap(level: QuickCountRekapLevel, filter: QuickCountWilayahFilter) {
  return useQuery<QuickCountRekapGroup[]>({
    queryKey: [...QUICK_COUNT_PREFIX, "rekap", level, filter],
    queryFn: () => fetchQuickCountRekap(level, filter),
  });
}
