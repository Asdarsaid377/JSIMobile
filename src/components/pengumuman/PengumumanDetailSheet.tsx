import { Modal, Pressable, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { Badge } from "@/components/ui/Badge";
import type { Pengumuman, PengumumanPrioritas } from "@/types/pengumuman";

type Props = {
  item: Pengumuman | null;
  isAdmin: boolean;
  onClose: () => void;
  onHapus: (item: Pengumuman) => void;
};

const PRIORITAS_VARIANT: Record<PengumumanPrioritas, "muted" | "warning" | "danger"> = {
  Normal: "muted",
  Penting: "warning",
  Mendesak: "danger",
};

function formatTanggal(iso: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "-";
  }
}

// TIDAK ADA referensi desain (izin eksplisit user, Aturan #1) — bottom sheet
// Modal, pola sama IsuAspirasiDetailSheet. Row "Hapus" (bukan Button — pola
// sama RivalDetailSheet § "Hapus rival") cuma render untuk admin/adminsekret
// (DELETE /pengumuman/:id di-guard RolesGuard server-side juga, ini cuma
// gating UI supaya relawan tidak lihat aksi yang pasti 403). Konfirmasi
// Alert.alert dilakukan di PengumumanScreen (pola sama handleDelete
// RivalCalegScreen), sheet ini cuma panggil onHapus langsung.
export function PengumumanDetailSheet({ item, isAdmin, onClose, onHapus }: Props) {
  return (
    <Modal visible={item !== null} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        className="flex-1 justify-end"
        style={{ backgroundColor: "rgba(15, 23, 42, 0.45)" }}
        onPress={onClose}
      >
        <Pressable className="gap-sm rounded-t-xl bg-surface p-md pb-lg" onPress={(e) => e.stopPropagation()}>
          <View className="mx-auto h-1 w-9 rounded-full bg-border" />
          {item ? (
            <>
              <View className="flex-row items-start justify-between gap-sm">
                <Text className="flex-1 text-body-lg font-semibold text-text-primary">{item.judul}</Text>
                <Badge label={item.prioritas} variant={PRIORITAS_VARIANT[item.prioritas]} />
              </View>

              <View className="rounded-md bg-surface-secondary p-sm">
                <Text className="text-label-md text-text-secondary">{item.isi}</Text>
              </View>

              <View>
                <View className="flex-row items-center justify-between border-b border-surface-secondary py-sm">
                  <Text className="text-label-md text-text-secondary">Dibuat oleh</Text>
                  <Text className="text-label-md font-bold text-text-primary">{item.pembuat}</Text>
                </View>
                <View className="flex-row items-center justify-between py-sm">
                  <Text className="text-label-md text-text-secondary">Tanggal</Text>
                  <Text className="text-label-md font-bold text-text-primary">{formatTanggal(item.createdAt)}</Text>
                </View>
              </View>

              {isAdmin ? (
                <View className="border-t border-surface-secondary pt-sm">
                  <Pressable
                    onPress={() => onHapus(item)}
                    className="flex-row items-center gap-sm py-xs active:opacity-80"
                  >
                    <View className="h-9 w-9 items-center justify-center rounded-md bg-danger-soft">
                      <Ionicons name="trash-outline" size={16} color="#dc2626" />
                    </View>
                    <Text className="text-label-md font-semibold text-danger">Hapus pengumuman</Text>
                  </Pressable>
                </View>
              ) : null}
            </>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
