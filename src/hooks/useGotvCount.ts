import { useQuery } from "@tanstack/react-query";

import { fetchGotvCount } from "@/services/gotv";

export const gotvCountQueryKey = (): [string, string] => ["gotv", "count"];

export function useGotvCount() {
  return useQuery<number>({ queryKey: gotvCountQueryKey(), queryFn: fetchGotvCount });
}
