import { Text, View } from "react-native";

type Props = {
  count: number | undefined;
  isLoading: boolean;
};

// Desain program-pemenangan.png menampilkan progress bar persentase, tapi itu
// untuk tab "Social Event" — tidak ada sumber data target/kuota untuk dtdoor
// di backend maupun web (lihat progress-tracker.md Decisions). Diganti hitungan
// sederhana sesuai keputusan user.
export function DtdoorSummaryCard({ count, isLoading }: Props) {
  return (
    <View className="rounded-lg border border-border bg-surface p-md">
      {isLoading ? (
        <View className="h-6 w-32 rounded-sm bg-surface-secondary" />
      ) : (
        <Text className="text-body-lg font-semibold text-text-primary">{count ?? 0} kunjungan tercatat</Text>
      )}
      <Text className="text-caption text-text-muted">Total kunjungan Door To Door</Text>
    </View>
  );
}
