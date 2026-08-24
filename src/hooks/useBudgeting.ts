import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createBudgetTransaction,
  fetchBudgetPos,
  fetchBudgetSummary,
  fetchBudgetTransactions,
  fetchBudgetTrend,
  updateBudgetTransactionStatus,
  upsertBudgetPlafon,
} from "@/services/budgeting";
import type {
  BudgetScope,
  CreateBudgetTransactionInput,
  UpdateBudgetTransactionStatusInput,
  UpsertBudgetPlafonInput,
} from "@/types/budgeting";

export function useBudgetSummary(scope: BudgetScope) {
  return useQuery({ queryKey: ["budgeting", "summary", scope], queryFn: () => fetchBudgetSummary(scope) });
}

export function useBudgetPos(scope: BudgetScope) {
  return useQuery({ queryKey: ["budgeting", "pos", scope], queryFn: () => fetchBudgetPos(scope) });
}

export function useBudgetTrend(scope: BudgetScope) {
  return useQuery({ queryKey: ["budgeting", "trend", scope], queryFn: () => fetchBudgetTrend(scope) });
}

export const budgetTransactionsQueryKey = (): [string, string] => ["budgeting", "transactions"];

export function useBudgetTransactions() {
  return useQuery({ queryKey: budgetTransactionsQueryKey(), queryFn: fetchBudgetTransactions });
}

export function useCreateBudgetTransaction(oleh: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBudgetTransactionInput) => createBudgetTransaction(input, oleh),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: budgetTransactionsQueryKey() });
    },
  });
}

// Set Plafon Anggaran (admin-only) — invalidate query "pos" & "summary" untuk
// scope yang baru diedit, supaya BudgetPlafonScreen & BudgetingKampanyeScreen
// (kalau dibuka lagi) langsung lihat angka plafon terbaru tanpa perlu restart.
export function useUpsertBudgetPlafon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpsertBudgetPlafonInput) => upsertBudgetPlafon(input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["budgeting", "pos", variables.scope] });
      void queryClient.invalidateQueries({ queryKey: ["budgeting", "summary", variables.scope] });
    },
  });
}

// Approval transaksi (admin-only, tombol Setujui/Tolak di BudgetTransactionRow)
// — Disetujui/Ditolak mengubah `used`/`pct`/`overCount` (summary & pos backend
// cuma hitung transaksi status Disetujui, lihat BudgetingService.usedByPos),
// dan scope yang lagi tidak aktif di screen (bulan vs total) juga bisa
// terdampak (transaksi bulan ini kepakai di agregat "total" juga). Invalidate
// SEMUA query budgeting (bukan cuma scope aktif) daripada coba tebak yang mana
// yang perlu di-refresh.
export function useUpdateBudgetTransactionStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateBudgetTransactionStatusInput) => updateBudgetTransactionStatus(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["budgeting"] });
    },
  });
}
