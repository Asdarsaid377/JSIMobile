import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchQuickCountTpsList, submitQuickCountHasil } from "@/services/quickcount";
import type { QuickCountTps, SubmitQuickCountHasilInput } from "@/types/quickcount";

const QUICK_COUNT_QUERY_KEY = ["quickcount", "tps"];

export function useQuickCountTpsList() {
  return useQuery<QuickCountTps[]>({
    queryKey: QUICK_COUNT_QUERY_KEY,
    queryFn: fetchQuickCountTpsList,
  });
}

export function useSubmitQuickCountHasil() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SubmitQuickCountHasilInput) => submitQuickCountHasil(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUICK_COUNT_QUERY_KEY });
    },
  });
}
