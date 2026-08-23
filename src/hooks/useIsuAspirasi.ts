import { useQuery } from "@tanstack/react-query";

import { fetchIsuAspirasiSnapshot } from "@/services/isuaspirasi";
import type { IsuAspirasiSnapshot } from "@/types/isuaspirasi";

export function useIsuAspirasiSnapshot() {
  return useQuery<IsuAspirasiSnapshot>({
    queryKey: ["isuaspirasi", "snapshot"],
    queryFn: fetchIsuAspirasiSnapshot,
  });
}
