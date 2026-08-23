import { useQuery } from "@tanstack/react-query";

import { fetchProfile } from "@/services/profile";
import { useAuth } from "@/hooks/useAuth";
import type { TimsesProfile } from "@/types/profile";

export const profileQueryKey = (id: number): [string, number] => ["profile", id];

export function useProfile() {
  const { session } = useAuth();
  const id = session?.user.id;

  return useQuery<TimsesProfile>({
    queryKey: profileQueryKey(id ?? -1),
    queryFn: () => fetchProfile(id as number),
    enabled: id !== undefined,
  });
}
