import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createGotv } from "@/services/gotv";
import type { CreateGotvInput } from "@/types/gotv";

export function useCreateGotv() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateGotvInput) => createGotv(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["gotv"] });
    },
  });
}
