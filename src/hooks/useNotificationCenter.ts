import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAntiFraudSnapshot } from "@/hooks/useAntiFraud";
import { usePengumumanList } from "@/hooks/usePengumuman";
import { getNotificationLastSeenAt, markNotificationsSeenNow } from "@/lib/notificationReadState";

const lastSeenQueryKey = ["notifications", "lastSeenAt"] as const;

export function useNotificationLastSeen() {
  return useQuery({ queryKey: lastSeenQueryKey, queryFn: getNotificationLastSeenAt });
}

export function useMarkNotificationsSeen() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationsSeenNow,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: lastSeenQueryKey });
    },
  });
}

// Dot merah di Home — SENGAJA cuma dari Pengumuman (baru sejak lastSeenAt,
// timestamp asli & reliable) + jumlah kasus Anti-Fraud (`snapshot.cases`,
// semuanya "perlu ditinjau" — backend belum expose `status` per kasus di
// endpoint summary, lihat catatan di types/antifraud.ts, jadi count ini
// TIDAK bisa dikurangi kasus yang sudah di-approve/reject di sesi lalu).
// Transaksi Budgeting "Menunggu" SENGAJA TIDAK ikut dihitung di sini (beda
// dari sectionnya sendiri di NotificationScreen) — supaya Home tidak perlu
// fetch daftar transaksi penuh cuma untuk 1 titik merah, keputusan mandiri
// demi tidak menambah request tak perlu di screen paling sering dibuka.
export function useUnreadNotificationCount(): number {
  const lastSeenQuery = useNotificationLastSeen();
  const pengumumanQuery = usePengumumanList();
  const fraudQuery = useAntiFraudSnapshot();

  const lastSeenAt = lastSeenQuery.data ? new Date(lastSeenQuery.data).getTime() : 0;
  const newPengumumanCount = (pengumumanQuery.data ?? []).filter(
    (item) => new Date(item.createdAt).getTime() > lastSeenAt,
  ).length;
  const fraudCount = fraudQuery.data?.cases.length ?? 0;

  return newPengumumanCount + fraudCount;
}
