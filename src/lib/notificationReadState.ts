import * as SecureStore from "expo-secure-store";

// Notification Center (2026-08-26) TIDAK PUNYA backend sama sekali — murni
// agregasi client-side dari data yang sudah ada (Pengumuman/Anti-Fraud/
// Budgeting, lihat NotificationScreen.tsx). Status "sudah dibaca" pun cuma
// 1 timestamp LOCAL-ONLY di device (pola sama `targetSuara.ts`), BUKAN
// per-item — dot merah di Home hilang begitu Notification Center dibuka
// (pengumuman lebih baru dari timestamp ini dianggap "baru"), bukan per-baris
// dicentang baca.
const STORAGE_KEY = "notification_last_seen_at";

export async function getNotificationLastSeenAt(): Promise<string | null> {
  return SecureStore.getItemAsync(STORAGE_KEY);
}

export async function markNotificationsSeenNow(): Promise<void> {
  await SecureStore.setItemAsync(STORAGE_KEY, new Date().toISOString());
}
