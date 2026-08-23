import { useQuery } from "@tanstack/react-query";

import { fetchTokohList } from "@/services/tokoh";
import type { Tokoh } from "@/types/tokoh";

export function useTokohList() {
  return useQuery<Tokoh[]>({
    queryKey: ["tokoh", "list"],
    queryFn: fetchTokohList,
  });
}
