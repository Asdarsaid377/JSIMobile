import { useQuery } from "@tanstack/react-query";

import { fetchTimsesList } from "@/services/timses";
import type { TimsesMember } from "@/types/timses";

export const timsesListQueryKey = (): [string, string] => ["timses", "list"];

export function useTimsesList() {
  return useQuery<TimsesMember[]>({
    queryKey: timsesListQueryKey(),
    queryFn: fetchTimsesList,
  });
}
