import { Pressable, Text, View } from "react-native";

import { RIVAL_WILAYAH_STATUS_LABEL } from "@/types/rivalcaleg";
import type { RivalWilayahStatus } from "@/types/rivalcaleg";

type Props = {
  nama: string;
  rivalPenantang: string;
  status: RivalWilayahStatus;
  onPress?: () => void;
};

// unggul=accent(biru, sama seperti zona "Kita unggul" #3B82F6 di canvas),
// rival-kuat=danger (#DC2626), bentrok=warning (#F59E0B) — cocok persis warna
// zona "Peta penguasaan wilayah" di canvas.
const STATUS_DOT_CLASS: Record<RivalWilayahStatus, string> = {
  unggul: "bg-accent",
  "rival-kuat": "bg-danger",
  bentrok: "bg-warning",
};

// Teks polos (bukan Badge pill ber-background) — permintaan user "coba
// hilangkan warna backgroundnya" setelah lihat di device: pill berwarna di
// kanan terasa berat/redundan karena dot status di kiri sudah bawa warna yang
// sama. Warna tetap dipertahankan di teks label supaya status masih terbaca
// tanpa perlu buka detail.
const STATUS_TEXT_CLASS: Record<RivalWilayahStatus, string> = {
  unggul: "text-accent",
  "rival-kuat": "text-danger",
  bentrok: "text-warning",
};

// Referensi artboard "16 · DETEKSI RIVAL CALEG" § list wilayah di bawah "Peta
// penguasaan wilayah" — "Peta penguasaan wilayah" dekoratifnya sendiri (tekstur
// diagonal + kotak zona absolute-positioned) DISEDERHANAKAN, tidak dibangun
// sama sekali (tidak ada library/asset map di project ini) — list status per
// wilayah ini SUDAH cukup mewakili data yang sama, pola simplifikasi sama
// dengan tab "Peta Isu" IsuAspirasiScreen/"Peta Kekuatan Wilayah".
// 2026-08-24 (lanjutan) — Pressable (tadinya View statis) — tap buka
// RivalWilayahFormScreen mode edit (izin build tanpa referensi, lihat
// progress-tracker.md Decisions & CreateRivalWilayah/UpdateRivalWilayah di
// hooks/useRivalCaleg.ts). Backend TIDAK punya endpoint DELETE untuk resource
// ini — form cuma Simpan, tidak ada tombol Hapus.
export function RivalWilayahRow({ nama, rivalPenantang, status, onPress }: Props) {
  return (
    // items-start (bukan items-center) — badge status HARUS tetap nempel rata
    // kanan-atas apapun tinggi baris kiri (rivalPenantang panjang bisa wrap 2
    // baris). Dengan items-center, badge ikut ke-center vertikal relatif ke
    // tinggi baris yang berubah-ubah antar row → posisinya kelihatan
    // "loncat"/tidak sejajar saat di-scroll (laporan user). items-start bikin
    // badge selalu sejajar baris pertama "nama", konsisten di semua row.
    <Pressable onPress={onPress} className="flex-row items-start justify-between gap-sm active:opacity-70">
      {/* flex-1 wajib di sini — RN View default flexShrink:0, tanpa ini teks
          rivalPenantang yang panjang (data seed asli, bukan lagi nama demo
          pendek) dorong Badge status keluar dari card alih-alih wrap. */}
      <View className="flex-1 flex-row items-center gap-sm">
        <View className={`h-2.5 w-2.5 shrink-0 rounded-sm ${STATUS_DOT_CLASS[status]}`} />
        <View className="flex-1 gap-0.5">
          <Text className="text-label-md font-bold text-text-primary" numberOfLines={1}>
            {nama}
          </Text>
          <Text className="text-caption text-text-muted">Penantang: {rivalPenantang}</Text>
        </View>
      </View>
      <Text className={`shrink-0 text-label-md font-bold ${STATUS_TEXT_CLASS[status]}`}>
        {RIVAL_WILAYAH_STATUS_LABEL[status]}
      </Text>
    </Pressable>
  );
}
