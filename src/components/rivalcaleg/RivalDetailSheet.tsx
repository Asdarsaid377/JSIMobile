import { Modal, Pressable, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import type { RivalCalegSummary, RivalTren } from "@/types/rivalcaleg";

type Props = {
  item: RivalCalegSummary | null;
  onClose: () => void;
  onEdit: (item: RivalCalegSummary) => void;
  onDelete: (item: RivalCalegSummary) => void;
};

function initialsOf(nama: string): string {
  const parts = nama.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

const TREN_LABEL: Record<RivalTren, string> = { naik: "Naik", turun: "Turun", stabil: "Stabil" };
// naik = tren suara rival naik (buruk buat kita) = danger, turun = baik buat
// kita = success, stabil = netral.
const TREN_CLASS: Record<RivalTren, string> = { naik: "text-danger", turun: "text-success", stabil: "text-text-muted" };

// Referensi artboard "16 · DETEKSI RIVAL CALEG" § bottom sheet detail
// (rivalSheet) — Modal bottom sheet, pola sama IsuAspirasiDetailSheet/
// DptVoterActionSheet. Konten info ATAS mengikuti canvas apa adanya
// (read-only). Footer "Edit"/"Hapus" (2026-08-24 lanjutan) BUKAN dari canvas —
// izin build tanpa referensi (Aturan #1), icon-box row pola sama
// DptVoterActionSheet (bukan 2 tombol besar seperti IsuAspirasiDetailSheet,
// supaya tidak menutupi konten info di atasnya kalau sheet discroll).
export function RivalDetailSheet({ item, onClose, onEdit, onDelete }: Props) {
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
              <View className="flex-row items-center gap-sm">
                <View className="h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-surface-secondary">
                  <Text className="text-body-lg font-bold text-text-secondary">{initialsOf(item.namaLengkap)}</Text>
                </View>
                {/* flex-1 wajib — tanpa ini namaLengkap/partai panjang (data
                    seed asli) dorong konten keluar dari sheet, sama kelas bug
                    dengan RivalWilayahRow. */}
                <View className="flex-1 gap-0.5">
                  <Text className="text-body-lg font-bold text-text-primary">{item.namaLengkap}</Text>
                  <Text className="text-label-md text-text-muted">
                    {item.partai} · no. urut {item.noUrut}
                  </Text>
                </View>
              </View>

              <View className="flex-row gap-xs">
                <View className="flex-1 items-center rounded-md bg-surface-secondary p-sm">
                  <Text className="text-body-md font-bold text-text-primary">
                    {item.estimasiSuara.toLocaleString("id-ID")}
                  </Text>
                  <Text className="text-caption text-text-muted">Est. suara</Text>
                </View>
                <View className="flex-1 items-center rounded-md bg-surface-secondary p-sm">
                  <Text className="text-body-md font-bold text-text-primary">
                    {item.suara2024.toLocaleString("id-ID")}
                  </Text>
                  <Text className="text-caption text-text-muted">Suara 2024</Text>
                </View>
                <View className="flex-1 items-center rounded-md bg-surface-secondary p-sm">
                  <Text className={`text-body-md font-bold ${TREN_CLASS[item.tren]}`}>{TREN_LABEL[item.tren]}</Text>
                  <Text className="text-caption text-text-muted">Tren</Text>
                </View>
              </View>

              {/* Baris label-value: label shrink-0 (pendek, tetap), value
                  flex-1 + text-right supaya WRAP alih-alih dorong keluar sheet
                  kalau isinya teks bebas panjang dari data seed asli
                  (basis/wilayahBentrok/tokohBerpihak/isuDiangkat semua free
                  text di backend, bukan enum pendek). */}
              <View>
                <View className="flex-row items-start justify-between gap-sm border-b border-surface-secondary py-sm">
                  <Text className="shrink-0 text-label-md text-text-secondary">Basis kekuatan</Text>
                  <Text className="flex-1 text-right text-label-md font-bold text-text-primary">{item.basis}</Text>
                </View>
                <View className="flex-row items-start justify-between gap-sm border-b border-surface-secondary py-sm">
                  <Text className="shrink-0 text-label-md text-text-secondary">Wilayah bentrok</Text>
                  <Text className="flex-1 text-right text-label-md font-bold text-danger">{item.wilayahBentrok}</Text>
                </View>
                <View className="flex-row items-start justify-between gap-sm border-b border-surface-secondary py-sm">
                  <Text className="shrink-0 text-label-md text-text-secondary">Tokoh yang berpihak</Text>
                  <Text className="flex-1 text-right text-label-md font-bold text-text-primary">
                    {item.tokohBerpihak}
                  </Text>
                </View>
                <View className="flex-row items-start justify-between gap-sm py-sm">
                  <Text className="shrink-0 text-label-md text-text-secondary">Isu yang diangkat</Text>
                  <Text className="flex-1 text-right text-label-md font-bold text-text-primary">
                    {item.isuDiangkat}
                  </Text>
                </View>
              </View>

              <View className="gap-1 rounded-md bg-accent-soft p-md">
                <Text className="text-label-md font-bold text-accent">Rekomendasi strategi</Text>
                <Text className="text-label-md leading-5 text-accent">{item.strategi}</Text>
              </View>

              <View className="gap-xs border-t border-surface-secondary pt-sm">
                <Pressable
                  onPress={() => onEdit(item)}
                  className="flex-row items-center gap-sm py-xs active:opacity-80"
                >
                  <View className="h-9 w-9 items-center justify-center rounded-md bg-surface-secondary">
                    <Ionicons name="create-outline" size={16} color="#1e293b" />
                  </View>
                  <Text className="text-label-md font-semibold text-text-primary">Edit data rival</Text>
                </Pressable>
                <Pressable
                  onPress={() => onDelete(item)}
                  className="flex-row items-center gap-sm py-xs active:opacity-80"
                >
                  <View className="h-9 w-9 items-center justify-center rounded-md bg-danger-soft">
                    <Ionicons name="trash-outline" size={16} color="#dc2626" />
                  </View>
                  <Text className="text-label-md font-semibold text-danger">Hapus rival</Text>
                </Pressable>
              </View>
            </>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
