import { useEffect, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { Button } from "@/components/ui/Button";
import type { QuickCountKandidat, QuickCountTps } from "@/types/quickcount";

type Props = {
  tps: QuickCountTps | null;
  kandidatList: readonly QuickCountKandidat[];
  submitting: boolean;
  onClose: () => void;
  onSubmit: (tpsId: number, rows: { kandidatId: number; jumlah: number }[]) => void;
};

function handleUploadNotImplemented(): void {
  Alert.alert("Segera hadir", "Upload foto formulir C1 belum tersedia.");
}

// Referensi mockup — bottom sheet "Input Suara — {TPS}": placeholder foto C1
// (wajib, TAPI non-fungsional — pola sama RealCountC1Screen), 1 input numerik
// per kandidat (pre-filled dari hasilC1 kalau TPS ini sudah pernah kirim,
// kosong kalau belum — beda dari mockup yang nilainya statis/demo, di sini
// beneran nyambung ke data), total suara sah dihitung otomatis (bukan dietik
// manual), catatan GPS/waktu otomatis (teks saja, tidak ada mekanisme
// sungguhan — sama seperti keterangan serupa di desain lain).
export function QuickCountInputSheet({ tps, kandidatList, submitting, onClose, onSubmit }: Props) {
  const [values, setValues] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!tps) return;
    const initial: Record<number, string> = {};
    for (const kandidat of kandidatList) {
      const existing = tps.hasilC1?.suaraPerKandidat[kandidat.id];
      initial[kandidat.id] = existing !== undefined ? String(existing) : "";
    }
    setValues(initial);
  }, [tps, kandidatList]);

  const totalSuaraSah = Object.values(values).reduce((sum, value) => sum + (Number(value) || 0), 0);

  function handleSubmit() {
    if (!tps) return;
    const rows = kandidatList.map((kandidat) => ({ kandidatId: kandidat.id, jumlah: Number(values[kandidat.id]) || 0 }));
    onSubmit(tps.id, rows);
  }

  return (
    <Modal visible={tps !== null} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        className="flex-1 justify-end"
        style={{ backgroundColor: "rgba(15, 23, 42, 0.45)" }}
        onPress={onClose}
      >
        <Pressable className="gap-sm rounded-t-xl bg-surface p-md pb-lg" onPress={(e) => e.stopPropagation()}>
          <View className="mx-auto h-1 w-9 rounded-full bg-border" />
          {tps ? (
            <View className="gap-xs">
              <Text className="text-body-lg font-semibold text-text-primary">Input Suara — {tps.noTps}</Text>
              <Text className="text-caption text-text-muted">
                {tps.kelurahan} · saksi {tps.namaSaksi ?? "belum ditugaskan"}
              </Text>
            </View>
          ) : null}

          <Pressable
            onPress={handleUploadNotImplemented}
            className="items-center rounded-lg border border-dashed border-border p-lg active:opacity-80"
          >
            <Text className="text-label-md font-semibold text-text-muted">📷 Foto formulir C1 (wajib)</Text>
          </Pressable>

          <ScrollView style={{ maxHeight: 220 }} keyboardShouldPersistTaps="handled">
            <View className="gap-sm">
              {kandidatList.map((kandidat) => (
                <View key={kandidat.id} className="flex-row items-center justify-between gap-sm">
                  <Text className="flex-1 text-label-md font-semibold text-text-primary" numberOfLines={1}>
                    {kandidat.nama}
                    {kandidat.partai ? ` (${kandidat.partai})` : ""}
                  </Text>
                  <TextInput
                    value={values[kandidat.id] ?? ""}
                    onChangeText={(t) => setValues((prev) => ({ ...prev, [kandidat.id]: t.replace(/[^0-9]/g, "") }))}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#94a3b8"
                    className="w-20 rounded-md border border-border bg-background px-md py-sm text-right text-body-md font-bold text-text-primary"
                    textAlignVertical="center"
                    style={{ includeFontPadding: false, paddingVertical: 0, lineHeight: 20, height: 40 }}
                  />
                </View>
              ))}
            </View>
          </ScrollView>

          <View className="flex-row items-center justify-between rounded-lg bg-accent-soft px-md py-sm">
            <Text className="text-label-md font-semibold text-accent">Total suara sah</Text>
            <Text className="text-label-md font-bold text-accent">{totalSuaraSah.toLocaleString("id-ID")}</Text>
          </View>
          <Text className="text-caption text-text-muted">Lokasi GPS &amp; waktu input dicatat otomatis untuk audit.</Text>

          <Button label="Kirim Hasil C1" variant="primary" loading={submitting} onPress={handleSubmit} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
