import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createDtdoor } from "@/services/dtdoor";
import type { CreateDtdoorInput, FotoKunjunganInput } from "@/types/dtdoor";

export function useCreateDtdoor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ input, foto }: { input: CreateDtdoorInput; foto?: FotoKunjunganInput }) =>
      createDtdoor(input, foto),
    onSuccess: () => {
      // Prefix match — invalidate baik ["dtdoor","list"] maupun ["dtdoor","count"]
      // sekaligus (TanStack Query invalidate by key-prefix secara default).
      void queryClient.invalidateQueries({ queryKey: ["dtdoor"] });
    },
  });
}
