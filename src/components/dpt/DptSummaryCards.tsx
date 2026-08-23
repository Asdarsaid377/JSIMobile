import { Text, View } from "react-native";

type SummaryItem = {
  key: string;
  value: number;
  label: string;
};

type Props = {
  items: readonly SummaryItem[];
};

function formatCount(value: number): string {
  return value.toLocaleString("id-ID");
}

// Kartu pertama selalu gelap (bg-primary), sisanya putih border — pola sama dengan
// TimsesSummaryCards (Feature 06), diperluas dari 2 kartu tetap jadi N kartu dinamis
// (1-3, mengikuti seberapa dalam Kecamatan/Kelurahan/TPS sudah dipilih di dpt.png).
// Ukuran teks & padding mengecil begitu ada 3 kartu (2026-08-22, laporan user:
// terlalu mepet di 3 kolom sempit) — angka & label DPT asli (mis. "151.952",
// "Kec. BISSAPPU") jauh lebih panjang dari contoh di dpt.png ("18.150"/"Kec.
// Cileunyi"), gampang penuh/wrap aneh di kolom 1/3 lebar kalau ukurannya tetap
// sama seperti versi 1-2 kartu. Label dibatasi 1 baris (`numberOfLines`) supaya
// tidak wrap ke 2 baris yang bikin kartu berantakan.
export function DptSummaryCards({ items }: Props) {
  const isTight = items.length >= 3;

  return (
    <View className="flex-row gap-sm">
      {items.map((item, index) => (
        <View
          key={item.key}
          className={
            index === 0
              ? `flex-1 gap-xs rounded-lg bg-primary ${isTight ? "p-sm" : "p-md"}`
              : `flex-1 gap-xs rounded-lg border border-border bg-surface ${isTight ? "p-sm" : "p-md"}`
          }
        >
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            className={`${isTight ? "text-body-lg" : "text-headline-md"} font-semibold ${index === 0 ? "text-text-inverse" : "text-text-primary"}`}
          >
            {formatCount(item.value)}
          </Text>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            className={`text-caption ${index === 0 ? "text-text-inverse-muted" : "text-text-muted"}`}
          >
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
