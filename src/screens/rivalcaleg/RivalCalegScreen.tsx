import { useLayoutEffect, useMemo, useState } from "react";
import { Alert, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";

import { RivalAktivitasCard } from "@/components/rivalcaleg/RivalAktivitasCard";
import { RivalCard } from "@/components/rivalcaleg/RivalCard";
import { RivalDetailSheet } from "@/components/rivalcaleg/RivalDetailSheet";
import { RivalHeroCard } from "@/components/rivalcaleg/RivalHeroCard";
import { RivalKekuatanRow } from "@/components/rivalcaleg/RivalKekuatanRow";
import { RivalWilayahRow } from "@/components/rivalcaleg/RivalWilayahRow";
import { Button } from "@/components/ui/Button";
import { useHideTabBar } from "@/hooks/useHideTabBar";
import { useDeleteRivalCaleg, useRivalDeteksiSnapshot } from "@/hooks/useRivalCaleg";
import { exportTableAsPdf } from "@/lib/exportPdf";
import { RIVAL_ANCAMAN_LABEL, RIVAL_TREN_LABEL } from "@/types/rivalcaleg";
import type { HomeStackParamList } from "@/navigation/HomeStack";
import type { RivalAktivitas, RivalCalegSummary, RivalKekuatanItem } from "@/types/rivalcaleg";

type RivalTab = "kekuatan" | "daftar" | "aktivitas";

const TABS: { key: RivalTab; label: string }[] = [
  { key: "kekuatan", label: "Kekuatan" },
  { key: "daftar", label: "Daftar Rival" },
  { key: "aktivitas", label: "Aktivitas" },
];

// Ekspor mengikuti tab yang sedang aktif (bukan gabungan semua tab) — data
// per tab shape-nya beda total, digabung cuma bikin PDF kolom "kosong" acak.
async function handleDownload(tab: RivalTab, kekuatan: RivalKekuatanItem[], daftar: RivalCalegSummary[], aktivitas: RivalAktivitas[]) {
  try {
    if (tab === "kekuatan") {
      await exportTableAsPdf(
        "Deteksi Rival Caleg — Estimasi Kekuatan Suara",
        "deteksi-rival-caleg-kekuatan.pdf",
        ["Nama", "Partai", "Kita/Rival", "Estimasi Suara", "Persentase", "Basis Dukungan"],
        kekuatan.map((item) => [item.namaLengkap, item.partai, item.isKita ? "Kita" : "Rival", item.estimasiSuara, `${item.pct}%`, item.basis]),
      );
    } else if (tab === "daftar") {
      await exportTableAsPdf(
        "Deteksi Rival Caleg — Daftar Rival",
        "deteksi-rival-caleg-daftar.pdf",
        ["Nama", "Partai", "No. Urut", "Ancaman", "Estimasi Suara", "Suara 2024", "Tren", "Wilayah Bentrok", "Tokoh Berpihak", "Isu Diangkat", "Strategi"],
        daftar.map((item) => [
          item.namaLengkap,
          item.partai,
          item.noUrut,
          RIVAL_ANCAMAN_LABEL[item.ancaman],
          item.estimasiSuara,
          item.suara2024,
          RIVAL_TREN_LABEL[item.tren],
          item.wilayahBentrok,
          item.tokohBerpihak,
          item.isuDiangkat,
          item.strategi,
        ]),
      );
    } else {
      await exportTableAsPdf(
        "Deteksi Rival Caleg — Aktivitas Terdeteksi",
        "deteksi-rival-caleg-aktivitas.pdf",
        ["Rival", "Jenis", "Deskripsi", "Wilayah", "Tanggal", "Pelapor"],
        aktivitas.map((item) => [item.rival, item.jenis, item.deskripsi, item.wilayah, item.tanggal, item.pelapor]),
      );
    }
  } catch (error) {
    Alert.alert("Gagal ekspor", error instanceof Error ? error.message : "Terjadi kesalahan saat ekspor data.");
  }
}

// Referensi: artboard "16 · DETEKSI RIVAL CALEG (SEKUNDER — DRAWER)" di project
// Claude Design user ("Desain Mobile JSI Dashboard",
// 160ea937-2f8a-4ff4-9977-f8bc398c90a0), dibaca via DesignSync 2026-08-24,
// disimpan di context/designs/rival-caleg.dc.html. MENGGANTIKAN TOTAL fitur
// "Rival Caleg" lama (CRM list+assessment, dibangun tanpa referensi visual
// 2026-08-22) — keputusan eksplisit user saat referensi ini ditemukan.
// Dashboard analitik 3 tab, WIRED ke backend real (modul `rivalcaleg`, lihat
// api-standards.md). 2026-08-24 (lanjutan) — tombol tambah + tap-to-edit/hapus
// ditambah (izin build tanpa referensi, Aturan #1 — canvas cuma versi
// read-only). Semua role login boleh mutasi (keputusan eksplisit user).
export function RivalCalegScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const snapshotQuery = useRivalDeteksiSnapshot();
  const deleteMutation = useDeleteRivalCaleg();
  useHideTabBar();

  const [tab, setTab] = useState<RivalTab>("kekuatan");
  const [search, setSearch] = useState("");
  const [sheetItem, setSheetItem] = useState<RivalCalegSummary | null>(null);

  const kekuatan = snapshotQuery.data?.kekuatan ?? [];
  const wilayah = snapshotQuery.data?.wilayah ?? [];
  const daftar = snapshotQuery.data?.daftar ?? [];
  const aktivitas = snapshotQuery.data?.aktivitas ?? [];

  const filteredDaftar = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return daftar;
    return daftar.filter(
      (item) => item.namaLengkap.toLowerCase().includes(q) || item.partai.toLowerCase().includes(q),
    );
  }, [daftar, search]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => void handleDownload(tab, kekuatan, filteredDaftar, aktivitas)}
          hitSlop={8}
          className="h-11 w-11 items-center justify-center rounded-lg border border-border bg-surface active:opacity-80"
        >
          <Ionicons name="download-outline" size={20} color="#334155" />
        </Pressable>
      ),
    });
  }, [navigation, tab, kekuatan, filteredDaftar, aktivitas]);

  const isLoading = snapshotQuery.isLoading;
  const isError = snapshotQuery.isError;

  function handleEdit(item: RivalCalegSummary): void {
    setSheetItem(null);
    navigation.navigate("RivalCalegForm", { record: item });
  }

  function handleDelete(item: RivalCalegSummary): void {
    setSheetItem(null);
    Alert.alert("Hapus rival caleg?", `Data "${item.namaLengkap}" akan dihapus dari daftar.`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: () => {
          deleteMutation.mutate(item.id, {
            onError: (error) => Alert.alert("Gagal menghapus", error.message),
          });
        },
      },
    ]);
  }

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 12 }}
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={snapshotQuery.isRefetching} onRefresh={() => void snapshotQuery.refetch()} />
        }
      >
        <Text className="text-caption text-text-muted">
          Dapil Jabar I · dianalisis dari data D2D, tokoh, dan rekap 2024
        </Text>

        <View className="flex-row gap-xs rounded-lg bg-surface-secondary p-xs">
          {TABS.map((item) => (
            <Pressable
              key={item.key}
              onPress={() => setTab(item.key)}
              className={`min-h-[44px] flex-1 items-center justify-center rounded-md active:opacity-80 ${
                tab === item.key ? "bg-primary" : "bg-transparent"
              }`}
            >
              <Text
                className={`text-label-md font-semibold ${tab === item.key ? "text-text-inverse" : "text-text-muted"}`}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {snapshotQuery.data ? (
          <RivalHeroCard
            totalTerpetakan={snapshotQuery.data.totalTerpetakan}
            posisiKita={snapshotQuery.data.posisiKita}
            ancamanTinggiCount={snapshotQuery.data.ancamanTinggiCount}
            wilayahBentrokCount={snapshotQuery.data.wilayahBentrokCount}
            selisihKePeringkat1Pct={snapshotQuery.data.selisihKePeringkat1Pct}
          />
        ) : null}

        {isError ? (
          <View className="gap-xs">
            <Text className="text-body-md text-danger">Gagal memuat data deteksi rival caleg.</Text>
            <Button label="Coba Lagi" variant="secondary" onPress={() => void snapshotQuery.refetch()} />
          </View>
        ) : null}

        {isLoading ? <Text className="text-body-md text-text-muted">Memuat...</Text> : null}

        {!isLoading && !isError && tab === "kekuatan" ? (
          <>
            <View className="gap-sm">
              <View className="flex-row items-center justify-between">
                <Text className="text-body-lg font-semibold text-text-primary">Estimasi Kekuatan Suara</Text>
                <Pressable onPress={() => navigation.navigate("RivalCalegForm", {})}>
                  <Text className="text-label-md font-semibold text-accent">+ Tambah Rival</Text>
                </Pressable>
              </View>
              <View className="gap-md rounded-lg border border-border bg-surface p-md">
                {kekuatan.map((item) => (
                  <RivalKekuatanRow
                    key={item.id}
                    namaLengkap={item.namaLengkap}
                    estimasiSuara={item.estimasiSuara}
                    pct={item.pct}
                    basis={item.basis}
                    isKita={item.isKita}
                    onPress={() => setSheetItem(item)}
                  />
                ))}
              </View>
            </View>

            <View className="gap-sm">
              <View className="flex-row items-center justify-between">
                <Text className="text-body-lg font-semibold text-text-primary">Penguasaan Wilayah</Text>
                <Pressable onPress={() => navigation.navigate("RivalWilayahForm", {})}>
                  <Text className="text-label-md font-semibold text-accent">+ Tambah Wilayah</Text>
                </Pressable>
              </View>
              <View className="gap-md rounded-lg border border-border bg-surface p-md">
                {wilayah.map((item) => (
                  <RivalWilayahRow
                    key={item.id}
                    nama={item.nama}
                    rivalPenantang={item.rivalPenantang}
                    status={item.status}
                    onPress={() => navigation.navigate("RivalWilayahForm", { record: item })}
                  />
                ))}
              </View>
            </View>
          </>
        ) : null}

        {!isLoading && !isError && tab === "daftar" ? (
          <>
            <View className="flex-row gap-sm">
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Cari nama caleg atau partai..."
                placeholderTextColor="#94A3B8"
                className="min-h-[44px] flex-1 rounded-md border border-border bg-surface px-md text-body-md text-text-primary"
              />
            </View>
            <Button label="+ Tambah Rival Caleg" variant="secondary" onPress={() => navigation.navigate("RivalCalegForm", {})} />
            <View className="gap-sm">
              {filteredDaftar.map((item) => (
                <RivalCard key={item.id} item={item} onPress={() => setSheetItem(item)} />
              ))}
            </View>
          </>
        ) : null}

        {!isLoading && !isError && tab === "aktivitas" ? (
          <>
            <View className="flex-row items-start justify-between gap-sm">
              <View className="flex-1 gap-1">
                <Text className="text-body-lg font-semibold text-text-primary">Aktivitas Rival Terdeteksi</Text>
                <Text className="text-caption text-text-muted">Dilaporkan relawan di lapangan · 7 hari terakhir</Text>
              </View>
              <Pressable onPress={() => navigation.navigate("RivalAktivitasForm")}>
                <Text className="text-label-md font-semibold text-accent">+ Lapor</Text>
              </Pressable>
            </View>
            <View className="gap-sm">
              {aktivitas.map((item) => (
                <RivalAktivitasCard
                  key={item.id}
                  rival={item.rival}
                  jenis={item.jenis}
                  deskripsi={item.deskripsi}
                  wilayah={item.wilayah}
                  tanggal={item.tanggal}
                  pelapor={item.pelapor}
                />
              ))}
            </View>
            <View className="flex-row gap-sm rounded-md bg-warning-soft p-md">
              <View className="mt-1 h-2 w-2 rounded-full bg-warning" />
              <Text className="flex-1 text-label-md leading-5 text-warning">
                Laporan aktivitas rival hanya untuk analisis internal. Dugaan pelanggaran pemilu diteruskan ke tim
                hukum, bukan dipublikasikan.
              </Text>
            </View>
          </>
        ) : null}
      </ScrollView>

      <RivalDetailSheet item={sheetItem} onClose={() => setSheetItem(null)} onEdit={handleEdit} onDelete={handleDelete} />
    </SafeAreaView>
  );
}
