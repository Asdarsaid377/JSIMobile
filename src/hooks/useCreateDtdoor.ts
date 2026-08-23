import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createDtdoor } from "@/services/dtdoor";
import type { CreateDtdoorInput } from "@/types/dtdoor";

export function useCreateDtdoor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateDtdoorInput) => createDtdoor(input),
    onSuccess: () => {
      // Prefix match — invalidate baik ["dtdoor","list"] maupun ["dtdoor","count"]
      // sekaligus (TanStack Query invalidate by key-prefix secara default).
      void queryClient.invalidateQueries({ queryKey: ["dtdoor"] });
    },
  });
}
