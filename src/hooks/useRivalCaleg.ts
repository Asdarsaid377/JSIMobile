import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createRivalCaleg, fetchRivalAssessments, fetchRivalCalegList, upsertRivalAssessment } from "@/services/rivalcaleg";
import type { CreateRivalCalegInput, UpsertRivalAssessmentInput } from "@/types/rivalcaleg";

export const rivalCalegListQueryKey = (): [string, string] => ["rivalCaleg", "list"];

export function useRivalCalegList() {
  return useQuery({ queryKey: rivalCalegListQueryKey(), queryFn: fetchRivalCalegList });
}

export function useCreateRivalCaleg() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRivalCalegInput) => createRivalCaleg(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: rivalCalegListQueryKey() });
    },
  });
}

export const rivalAssessmentsQueryKey = (rivalCalegId: number): [string, string, number] => [
  "rivalCaleg",
  "assessments",
  rivalCalegId,
];

export function useRivalAssessments(rivalCalegId: number) {
  return useQuery({
    queryKey: rivalAssessmentsQueryKey(rivalCalegId),
    queryFn: () => fetchRivalAssessments(rivalCalegId),
  });
}

export function useUpsertRivalAssessment(rivalCalegId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpsertRivalAssessmentInput) => upsertRivalAssessment(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: rivalAssessmentsQueryKey(rivalCalegId) });
    },
  });
}
