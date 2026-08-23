import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createTokoh } from "@/services/tokoh";
import type { CreateTokohInput } from "@/types/tokoh";

export function useCreateTokoh() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTokohInput) => createTokoh(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tokoh"] });
    },
  });
}
