import { useInfiniteQuery } from "@tanstack/react-query";

import { fetchGotvList } from "@/services/gotv";
import type { GotvListResponse } from "@/types/gotv";

const GOTV_PAGE_LIMIT = 20;

export const gotvListQueryKey = (): [string, string] => ["gotv", "list"];

export function useGotvList() {
  return useInfiniteQuery<GotvListResponse>({
    queryKey: gotvListQueryKey(),
    queryFn: ({ pageParam }) => fetchGotvList(pageParam as number, GOTV_PAGE_LIMIT),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.page < lastPage.totalPage ? lastPage.page + 1 : undefined),
  });
}
