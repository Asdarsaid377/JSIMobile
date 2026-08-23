import { Modal, Pressable, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import type { DptRecord } from "@/types/dpt";

type Props = {
  record: DptRecord | null;
  onClose: () => void;
  onDtdoor: (record: DptRecord) => void;
  onEdit: (record: DptRecord) => void;
  onDelete: (record: DptRecord) => void;
};

// Referensi desain: bottom sheet "dptSheetVoter" di canvas project Claude Design
// user ("Desain Mobile JSI Dashboard", artboard 3 · DPT, project 160ea937-2f8a-
// 4ff4-9977-f8bc398c90a0, dibaca via DesignSync — file .dc.html-nya mencakup
// SEMUA screen termasuk DPT). Canvas asli punya 4 baris (Tandai ikut Door To
// Door / Tandai ikut Social Event / Edit data pemilih / Hapus data pemilih).
// 2026-08-22 — "Tandai ikut Door To Door" DIKEMBALIKAN (permintaan eksplisit
// user, fitur "Form Door To Door terintegrasi DPT" — lihat progress-tracker.md
// Decisions): icon box re-fetch langsung dari markup canvas (`background:
// #EFF6FF`, sama seperti border-b antar row lain) → `bg-accent-soft`, ikon
// Ionicons `walk-outline` dipilih sendiri (markup cuma kasih kotak warna polos,
// tidak ada glyph spesifik — sama situasinya dengan create-outline/trash-outline
// di 2 row bawah). "Tandai ikut Social Event" TETAP di-skip — user cuma minta
// integrasi Door To Door kali ini, bukan Social Event.
export function DptVoterActionSheet({ record, onClose, onDtdoor, onEdit, onDelete }: Props) {
  return (
    <Modal visible={record !== null} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        className="flex-1 justify-end"
        // Tidak ada token project untuk scrim overlay modal — hex di-hardcode,
        // sama alasan dengan Select.tsx.
        style={{ backgroundColor: "rgba(15, 23, 42, 0.45)" }}
        onPress={onClose}
      >
        <Pressable className="gap-xs rounded-t-xl bg-surface p-md pb-lg" onPress={(e) => e.stopPropagation()}>
          <View className="mx-auto mb-xs h-1 w-9 rounded-full bg-border" />
          {record ? (
            <Text className="pb-xs text-body-lg font-semibold text-text-primary">{record.nama}</Text>
          ) : null}
          <Pressable
            onPress={() => record && onDtdoor(record)}
            className="flex-row items-center gap-sm border-b border-surface-secondary py-sm active:opacity-80"
          >
            <View className="h-9 w-9 items-center justify-center rounded-md bg-accent-soft">
              <Ionicons name="walk-outline" size={16} color="#3b82f6" />
            </View>
            <Text className="text-label-md font-semibold text-text-primary">Tandai ikut Door To Door</Text>
          </Pressable>
          <Pressable
            onPress={() => record && onEdit(record)}
            className="flex-row items-center gap-sm border-b border-surface-secondary py-sm active:opacity-80"
          >
            <View className="h-9 w-9 items-center justify-center rounded-md bg-surface-secondary">
              <Ionicons name="create-outline" size={16} color="#1e293b" />
            </View>
            <Text className="text-label-md font-semibold text-text-primary">Edit data pemilih</Text>
          </Pressable>
          <Pressable
            onPress={() => record && onDelete(record)}
            className="flex-row items-center gap-sm py-sm active:opacity-80"
          >
            <View className="h-9 w-9 items-center justify-center rounded-md bg-danger-soft">
              <Ionicons name="trash-outline" size={16} color="#dc2626" />
            </View>
            <Text className="text-label-md font-semibold text-danger">Hapus data pemilih</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
