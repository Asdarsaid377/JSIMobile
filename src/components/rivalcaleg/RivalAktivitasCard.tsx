import { Text, View } from "react-native";

type Props = {
  rival: string;
  jenis: string;
  deskripsi: string;
  wilayah: string;
  tanggal: string;
  pelapor: string;
};

// Jenis aktivitas free-text dari canvas (bukan enum tertutup) — heuristik
// warna dari kata kunci, pola sama DtdoorCategoryRow (bukan mengarang enum
// tier baru untuk field yang aslinya bebas). Teks polos (bukan Badge pill) —
// permintaan user, konsisten dengan RivalWilayahRow/RivalCard.
function jenisTextClass(jenis: string): string {
  const lower = jenis.toLowerCase();
  if (lower.includes("isu") || lower.includes("negatif")) return "text-danger";
  if (lower.includes("bagi") || lower.includes("bansos") || lower.includes("sembako")) return "text-warning";
  return "text-accent";
}

// `tanggal` dari service SEKARANG raw ISO date ("2026-08-22", DATEONLY
// backend) — format di render, pola sama formatTanggal lokal di GotvCard.tsx/
// DtdoorCard.tsx/BudgetTransactionRow.tsx (sengaja tidak diabstraksi jadi util
// bersama, preseden yang sudah ada di project ini).
function formatTanggal(iso: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(
      new Date(iso),
    );
  } catch {
    return "-";
  }
}

// Referensi artboard "16 · DETEKSI RIVAL CALEG" tab "Aktivitas" — card nama
// rival + badge jenis + deskripsi + wilayah/tanggal + pelapor, pola sama
// IsuAspirasiCard/AntiFraudActivityCard.
export function RivalAktivitasCard({ rival, jenis, deskripsi, wilayah, tanggal, pelapor }: Props) {
  return (
    <View className="gap-xs rounded-lg border border-border bg-surface p-md">
      <View className="flex-row items-start justify-between gap-sm">
        <Text className="flex-1 text-body-md font-bold text-text-primary">{rival}</Text>
        <Text className={`shrink-0 text-label-md font-bold ${jenisTextClass(jenis)}`}>{jenis}</Text>
      </View>
      <Text className="text-label-md leading-5 text-text-secondary">{deskripsi}</Text>
      {/* flex-1 di kedua sisi — wilayah (free text kecamatan/kelurahan) &
          pelapor (nama timses) sama-sama bisa panjang dari data seed asli,
          sama kelas bug dengan RivalWilayahRow/RivalDetailSheet. */}
      <View className="flex-row items-start justify-between gap-sm">
        <Text className="flex-1 text-caption text-text-muted">
          {wilayah} · {formatTanggal(tanggal)}
        </Text>
        <Text className="flex-1 text-right text-caption font-semibold text-accent">Lapor: {pelapor}</Text>
      </View>
    </View>
  );
}
