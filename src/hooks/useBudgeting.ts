import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createBudgetTransaction,
  fetchBudgetPos,
  fetchBudgetSummary,
  fetchBudgetTransactions,
  fetchBudgetTrend,
} from "@/services/budgeting";
import type { BudgetScope, CreateBudgetTransactionInput } from "@/types/budgeting";

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
