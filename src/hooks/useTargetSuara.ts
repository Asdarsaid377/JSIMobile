import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getTargetSuaraMap, setTargetSuara } from "@/lib/targetSuara";
import type { TargetSuaraLevel } from "@/lib/targetSuara";

const TARGET_SUARA_QUERY_KEY = ["targetSuara", "map"];

// 1 query untuk SELURUH map, bukan per-wilayah — supaya screen yang menampilkan
// list anak wilayah (mis. Kecamatan menampilkan N Kelurahan) tidak perlu N query
// terpisah, cukup baca map yang sama pakai `buildTargetSuaraKey` per baris.
export function useTargetSuaraMap() {
  return useQuery({ queryKey: TARGET_SUARA_QUERY_KEY, queryFn: getTargetSuaraMap });
}

type SetTargetSuaraInput = {
  level: TargetSuaraLevel;
  wilId: number;
  subId?: number;
  value: number;
};

export function useSetTargetSuara() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ level, wilId, subId, value }: SetTargetSuaraInput) => setTargetSuara(level, wilId, value, subId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: TARGET_SUARA_QUERY_KEY });
    },
  });
}
