import { useMemo, useState } from "react";
import { Alert, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";

import { IsuAspirasiCard } from "@/components/isuaspirasi/IsuAspirasiCard";
import { IsuAspirasiDetailSheet } from "@/components/isuaspirasi/IsuAspirasiDetailSheet";
import { IsuJanjiCard } from "@/components/isuaspirasi/IsuJanjiCard";
import { IsuKategoriRow } from "@/components/isuaspirasi/IsuKategoriRow";
import { IsuPetaWilayahRow } from "@/components/isuaspirasi/IsuPetaWilayahRow";
import { IsuSummaryCard } from "@/components/isuaspirasi/IsuSummaryCard";
import { Button } from "@/components/ui/Button";
import { useIsuAspirasiSnapshot, useUpdateIsuAspirasi } from "@/hooks/useIsuAspirasi";
import { useHideTabBar } from "@/hooks/useHideTabBar";
import type { HomeStackParamList } from "@/navigation/HomeStack";
import type { IsuAspirasi } from "@/types/isuaspirasi";

type IsuTab = "ringkasan" | "peta" | "aspirasi";

const TABS: { key: IsuTab; label: string }[] = [
  { key: "ringkasan", label: "Ringkasan" },
  { key: "peta", label: "Peta Isu" },
  { key: "aspirasi", label: "Aspirasi" },
];

// Referensi: artboard "15 · ISU & ASPIRASI WARGA (SEKUNDER — DRAWER)" di
// project Claude Design user ("Desain Mobile JSI Dashboard",
// 160ea937-2f8a-4ff4-9977-f8bc398c90a0), dibaca via DesignSync 2026-08-22.
// Awalnya SENGAJA read-only ("Generate UI nya saja dulu ... nanti saya
// buatkan API nya") — modul backend `isuaspirasi` sekarang ADA & WIRED PENUH
// (2026-08-24, lihat api-standards.md § Isu & Aspirasi Warga). 2 aksi di
// IsuAspirasiDetailSheet (Tandai Ditindak/Jadikan Materi) + "+ Catat Aspirasi
// Warga" + "+ Tambah Usulan" (CRUD IsuJanji) SEKARANG mutation sungguhan —
// 2 route form terakhir (IsuAspirasiForm/IsuJanjiForm) dibangun TANPA
// referensi visual (izin eksplisit user, Aturan #1).
export function IsuAspirasiScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const snapshotQuery = useIsuAspirasiSnapshot();
  const updateMutation = useUpdateIsuAspirasi();
  useHideTabBar();

  const [tab, setTab] = useState<IsuTab>("ringkasan");
  const [kategoriFilter, setKategoriFilter] = useState<string | null>(null);
  const [sheetItem, setSheetItem] = useState<IsuAspirasi | null>(null);

  const kategori = snapshotQuery.data?.kategori ?? [];
  const janji = snapshotQuery.data?.janji ?? [];
  const petaWilayah = snapshotQuery.data?.petaWilayah ?? [];
  const aspirasi = snapshotQuery.data?.aspirasi ?? [];

  const kategoriWithPct = useMemo(() => {
    const max = kategori.reduce((m, item) => Math.max(m, item.jumlah), 0);
    return kategori.map((item, index) => ({
      ...item,
      percentOfMax: max > 0 ? (item.jumlah / max) * 100 : 0,
      tier: index < 2 ? ("tinggi" as const) : index < 4 ? ("sedang" as const) : ("rendah" as const),
    }));
  }, [kategori]);

  const kategoriChips = useMemo(() => {
    const unique = Array.from(new Set(aspirasi.map((item) => item.kategori)));
    return ["Semua", ...unique];
  }, [aspirasi]);

  const filteredAspirasi = useMemo(() => {
    if (!kategoriFilter || kategoriFilter === "Semua") return aspirasi;
    return aspirasi.filter((item) => item.kategori === kategoriFilter);
  }, [aspirasi, kategoriFilter]);

  function handleTandaiDitindak(item: IsuAspirasi): void {
    setSheetItem(null);
    updateMutation.mutate(
      { id: item.id, status: "Ditindak" },
      { onError: (error) => Alert.alert("Gagal menandai ditindak", error.message) },
    );
  }

  function handleJadikanMateri(item: IsuAspirasi): void {
    setSheetItem(null);
    updateMutation.mutate(
      { id: item.id, dijadikanMateri: true },
      { onError: (error) => Alert.alert("Gagal menandai jadi materi", error.message) },
    );
  }

  const isLoading = snapshotQuery.isLoading;
  const isError = snapshotQuery.isError;

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 12 }}
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={snapshotQuery.isRefetching} onRefresh={() => void snapshotQuery.refetch()} />
        }
      >
        <Text className="text-caption text-text-muted">Dikumpulkan relawan saat kunjungan Door To Door</Text>

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
          <IsuSummaryCard
            totalAspirasi={snapshotQuery.data.totalAspirasi}
            isuDominan={snapshotQuery.data.isuDominan}
            ringkasanSumber={snapshotQuery.data.ringkasanSumber}
          />
        ) : null}

        {isError ? (
          <View className="gap-xs">
            <Text className="text-body-md text-danger">Gagal memuat data isu &amp; aspirasi.</Text>
            <Button label="Coba Lagi" variant="secondary" onPress={() => void snapshotQuery.refetch()} />
          </View>
        ) : null}

        {isLoading ? <Text className="text-body-md text-text-muted">Memuat...</Text> : null}

        {!isLoading && !isError && tab === "ringkasan" ? (
          <>
            <View className="gap-sm">
              <Text className="text-body-lg font-semibold text-text-primary">Isu Terbanyak Disebut Warga</Text>
              <View className="gap-md rounded-lg border border-border bg-surface p-md">
                {kategoriWithPct.map((item) => (
                  <IsuKategoriRow
                    key={item.nama}
                    nama={item.nama}
                    jumlah={item.jumlah}
                    percentOfMax={item.percentOfMax}
                    wilayahTerkuat={item.wilayahTerkuat}
                    tier={item.tier}
                  />
                ))}
              </View>
            </View>

            <View className="gap-sm">
              <View className="flex-row items-center justify-between">
                <Text className="text-body-lg font-semibold text-text-primary">Usulan Materi Kampanye</Text>
                <Pressable onPress={() => navigation.navigate("IsuJanjiForm", {})}>
                  <Text className="text-label-md font-semibold text-accent">+ Tambah Usulan</Text>
                </Pressable>
              </View>
              <View className="gap-sm">
                {janji.map((item) => (
                  <IsuJanjiCard
                    key={item.id}
                    janji={item.janji}
                    dampak={item.dampak}
                    dasar={item.dasar}
                    wilayah={item.wilayah}
                    onPress={() => navigation.navigate("IsuJanjiForm", { record: item })}
                  />
                ))}
              </View>
            </View>
          </>
        ) : null}

        {!isLoading && !isError && tab === "peta" ? (
          <View className="gap-sm">
            <Text className="text-body-lg font-semibold text-text-primary">Sebaran Isu per Kelurahan</Text>
            <View className="gap-sm">
              {petaWilayah.map((item) => (
                <IsuPetaWilayahRow
                  key={item.nama}
                  nama={item.nama}
                  totalAspirasi={item.totalAspirasi}
                  isuDominan={item.isuDominan}
                  level={item.level}
                />
              ))}
            </View>
          </View>
        ) : null}

        {!isLoading && !isError && tab === "aspirasi" ? (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {kategoriChips.map((item) => {
                const active = item === "Semua" ? !kategoriFilter : kategoriFilter === item;
                return (
                  <Pressable
                    key={item}
                    onPress={() => setKategoriFilter(item === "Semua" ? null : item)}
                    className={`min-h-[44px] items-center justify-center rounded-full px-md active:opacity-80 ${
                      active ? "bg-accent-soft" : "bg-surface-secondary"
                    }`}
                  >
                    <Text className={`text-label-md font-semibold ${active ? "text-accent" : "text-text-muted"}`}>
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View className="gap-sm">
              {filteredAspirasi.map((item) => (
                <IsuAspirasiCard key={item.id} item={item} onPress={setSheetItem} />
              ))}
            </View>
          </>
        ) : null}
      </ScrollView>

      <View className="border-t border-border bg-surface p-md">
        <Button
          label="+ Catat Aspirasi Warga"
          variant="primary"
          onPress={() => navigation.navigate("IsuAspirasiForm")}
        />
      </View>

      <IsuAspirasiDetailSheet
        item={sheetItem}
        onClose={() => setSheetItem(null)}
        onTandaiDitindak={handleTandaiDitindak}
        onJadikanMateri={handleJadikanMateri}
      />
    </SafeAreaView>
  );
}
