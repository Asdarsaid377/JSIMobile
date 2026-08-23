import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateProfile } from "@/services/profile";
import { profileQueryKey } from "@/hooks/useProfile";
import type { UpdateProfileInput } from "@/types/profile";

export function useUpdateProfile(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateProfileInput) => updateProfile(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: profileQueryKey(id) });
    },
  });
}
