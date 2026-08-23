import { useInfiniteQuery } from "@tanstack/react-query";

import { fetchDtdoorList } from "@/services/dtdoor";
import type { DtdoorListResponse } from "@/types/dtdoor";

const DTDOOR_PAGE_LIMIT = 20;

export const dtdoorListQueryKey = (): [string, string] => ["dtdoor", "list"];

export function useDtdoorList() {
  return useInfiniteQuery<DtdoorListResponse>({
    queryKey: dtdoorListQueryKey(),
    queryFn: ({ pageParam }) => fetchDtdoorList(pageParam as number, DTDOOR_PAGE_LIMIT),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.page < lastPage.totalPage ? lastPage.page + 1 : undefined),
  });
}
