import { Text, View } from "react-native";

import type { Gotv } from "@/types/gotv";

type Props = {
  item: Gotv;
};

function formatTanggal(iso: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(
      new Date(iso),
    );
  } catch {
    return "-";
  }
}

// Desain program-pemenangan.png menampilkan badge status ("Selesai"/
// "Terjadwal") di kanan atas card ini, TAPI relasi `status` di entity Gotv
// backend sengaja di-comment-out (bukan kolom aktif — lihat
// api-standards.md § gotv). Badge status sengaja TIDAK ditampilkan di sini
// supaya tidak mengarang state yang tidak ada datanya di backend.
export function GotvCard({ item }: Props) {
  return (
    <View className="gap-xs rounded-lg border border-border bg-surface p-md">
      <Text className="text-body-lg font-semibold text-text-primary">{item.namaKegiatan}</Text>
      <Text className="text-caption text-text-muted">
        {item.desa} · {item.jumlahWajibPilih} peserta
      </Text>
      <Text className="text-caption text-text-muted">
        PIC: {item.namaLengkap} · {formatTanggal(item.createdAt)}
      </Text>
    </View>
  );
}
