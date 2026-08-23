import { Text, View } from "react-native";

type Props = {
  count: number | undefined;
  isLoading: boolean;
};

// Sama seperti DtdoorSummaryCard: desain program-pemenangan.png menampilkan
// progress bar persentase untuk tab ini, tapi tidak ada sumber data
// target/kuota di backend gotv (lihat api-standards.md § gotv) — diganti
// hitungan sederhana, keputusan sudah dikonfirmasi user untuk pola yang sama
// di tab Door To Door (Feature 04).
export function GotvSummaryCard({ count, isLoading }: Props) {
  return (
    <View className="rounded-lg border border-border bg-surface p-md">
      {isLoading ? (
        <View className="h-6 w-32 rounded-sm bg-surface-secondary" />
      ) : (
        <Text className="text-body-lg font-semibold text-text-primary">{count ?? 0} kegiatan tercatat</Text>
      )}
      <Text className="text-caption text-text-muted">Total kegiatan Social Event</Text>
    </View>
  );
}
