import { Text, View } from "react-native";

import { HasilRekapPartaiRow } from "@/components/hasilrekap/HasilRekapPartaiRow";
import type { HasilRekapPartaiSuara } from "@/types/hasilrekap";

type Props = {
  nama: string;
  totalSuaraSah: number;
  partaiSuara: HasilRekapPartaiSuara[];
};

// Kartu "Rekap Suara Partai" per scope (Dapil/Kabupaten/Kecamatan/Kelurahan)
// — dipakai sebagai ListHeaderComponent di semua screen drill Hasil Rekap,
// pola sama TargetSuaraHeaderCard (satu-satunya bagian yang bentuknya
// identik di semua level). `partaiSuara` HARUS sudah terurut desc by
// suaraTotal (lihat services/hasilrekap.ts) — item pertama = partai unggul.
export function HasilRekapPartaiSummaryCard({ nama, totalSuaraSah, partaiSuara }: Props) {
  const max = partaiSuara[0]?.suaraTotal ?? 0;

  return (
    <View className="gap-md rounded-lg border border-border bg-surface p-md">
      <View className="gap-xs">
        <Text className="text-body-lg font-semibold text-text-primary">{nama}</Text>
        <Text className="text-caption text-text-muted">{totalSuaraSah.toLocaleString("id-ID")} suara sah</Text>
      </View>
      <View className="gap-sm">
        {partaiSuara.map((item, index) => (
          <HasilRekapPartaiRow
            key={item.partai}
            partai={item.partai}
            suaraTotal={item.suaraTotal}
            percentOfMax={max > 0 ? (item.suaraTotal / max) * 100 : 0}
            isTop={index === 0}
          />
        ))}
      </View>
    </View>
  );
}
