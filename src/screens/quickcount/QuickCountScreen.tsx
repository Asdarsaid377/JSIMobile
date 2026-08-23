import { useLayoutEffect, useMemo, useState } from "react";
import { Alert, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";

import { QuickCountInputSheet } from "@/components/quickcount/QuickCountInputSheet";
import { QuickCountKandidatRow } from "@/components/quickcount/QuickCountKandidatRow";
import { QuickCountTpsCard } from "@/components/quickcount/QuickCountTpsCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useHideTabBar } from "@/hooks/useHideTabBar";
import { useQuickCountTpsList, useSubmitQuickCountHasil } from "@/hooks/useQuickCount";
import type { HomeStackParamList } from "@/navigation/HomeStack";
import { MOCK_KANDIDAT } from "@/services/quickcount";
import type { QuickCountTps } from "@/types/quickcount";

// Suara tidak sah SENGAJA statis (bukan di-derive) — mockup tidak punya
// mekanisme input untuk angka ini (qcInputRows di sana cuma 5 baris kandidat,
// tidak ada baris "tidak sah"), beda dari suara kandidat/total suara sah yang
// SEMUANYA dihitung sungguhan dari hasilC1 tiap TPS. Pola sama "mock statis"
// yang sudah ada preseden di Budgeting Kampanye (realisasi-pos tidak
// diturunkan dari daftar transaksi).
const SUARA_TIDAK_SAH_MOCK = 32;

type QcTab = "hasil" | "tps";

function handleDownload(): void {
  Alert.alert("Segera hadir", "Ekspor hasil Quick Count belum tersedia.");
}

// Referensi: artboard "12 · SAKSI & QUICK COUNT (SEKUNDER — DRAWER)" di project
// Claude Design user, dibaca via DesignSync 2026-08-22. Permintaan eksplisit
// user: "tiru khusus quick count saja" — bagian penugasan Saksi di artboard
// yang sama TIDAK diikutkan (sudah ada SaksiTpsScreen/SaksiFormScreen sendiri).
// Detail keputusan lengkap (kandidat/TPS mock, kenapa hasilC1 ditambah sendiri,
// suara tidak sah statis, dst.) ada di progress-tracker.md Decisions &
// types/quickcount.ts.
export function QuickCountScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const tpsQuery = useQuickCountTpsList();
  const submitMutation = useSubmitQuickCountHasil();

  useHideTabBar();

  const [tab, setTab] = useState<QcTab>("hasil");
  const [search, setSearch] = useState("");
  const [sheetTps, setSheetTps] = useState<QuickCountTps | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <Badge label="LIVE" variant="danger" dot />,
    });
  }, [navigation]);

  const allTps = tpsQuery.data ?? [];

  // Tidak ada UI switcher kecamatan di mockup (cuma teks statis "Kec.
  // Cileunyi"). Scoping akses (admin lihat semua, role lain dikunci ke
  // kecamatan sendiri) SEMENTARA dimatikan 2026-08-23 — data kecamatan
  // profil sudah tidak ada di backend (lihat types/profile.ts), semua role
  // lihat semua TPS untuk sekarang.
  const scopedTps = allTps;

  const kecamatanLabel = scopedTps[0]?.kecamatan ?? "-";

  const submittedTps = useMemo(() => scopedTps.filter((item) => item.hasilC1 !== null), [scopedTps]);
  const suaraMasuk = useMemo(
    () => submittedTps.reduce((sum, item) => sum + (item.hasilC1?.totalSuaraSah ?? 0), 0),
    [submittedTps],
  );
  const tpsTerlaporPct = scopedTps.length > 0 ? Math.round((submittedTps.length / scopedTps.length) * 100) : 0;

  const kandidatHasil = useMemo(() => {
    const totals = MOCK_KANDIDAT.map((kandidat) => {
      const votes = submittedTps.reduce((sum, item) => sum + (item.hasilC1?.suaraPerKandidat[kandidat.id] ?? 0), 0);
      return { kandidat, votes };
    });
    const sorted = [...totals].sort((a, b) => b.votes - a.votes);
    return sorted.map((entry, index) => ({
      ...entry,
      percent: suaraMasuk > 0 ? (entry.votes / suaraMasuk) * 100 : 0,
      leading: index === 0 && entry.votes > 0,
    }));
  }, [submittedTps, suaraMasuk]);

  const terverifikasiCount = scopedTps.filter((item) => item.status === "Terverifikasi").length;
  const selisihCount = scopedTps.filter((item) => item.status === "Selisih").length;

  const searchedTps = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return scopedTps;
    return scopedTps.filter(
      (item) => item.noTps.toLowerCase().includes(query) || (item.namaSaksi ?? "").toLowerCase().includes(query),
    );
  }, [scopedTps, search]);

  const isLoading = tpsQuery.isLoading;
  const isError = tpsQuery.isError;

  function handleRetry(): void {
    void tpsQuery.refetch();
  }

  function handleOpenSheet(item: QuickCountTps): void {
    setSheetTps(item);
  }

  // Footer "+ Input Hasil C1" di mockup selalu buka TPS index tetap (demo
  // statis) — di sini diganti perilaku nyata: buka TPS PERTAMA yang belum
  // pernah kirim hasil (fallback ke TPS pertama kalau semua sudah masuk).
  // Keputusan mandiri, tetap setia ke maksud tombolnya ("cepat input yang
  // masih pending"), bukan hardcode index seperti prototype.
  function handleQuickInput(): void {
    const target = scopedTps.find((item) => item.hasilC1 === null) ?? scopedTps[0];
    if (target) setSheetTps(target);
  }

  function handleSubmitHasil(tpsId: number, rows: { kandidatId: number; jumlah: number }[]): void {
    submitMutation.mutate(
      { tpsId, suaraPerKandidat: rows },
      {
        onSuccess: () => setSheetTps(null),
        onError: (error) => Alert.alert("Gagal menyimpan", error.message),
      },
    );
  }

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 12 }}
        className="flex-1"
        refreshControl={<RefreshControl refreshing={tpsQuery.isRefetching} onRefresh={handleRetry} />}
      >
        <View className="flex-row gap-xs rounded-lg bg-surface-secondary p-xs">
          <Pressable
            onPress={() => setTab("hasil")}
            className={`min-h-[44px] flex-1 items-center justify-center rounded-md active:opacity-80 ${
              tab === "hasil" ? "bg-primary" : "bg-transparent"
            }`}
          >
            <Text className={`text-body-md font-semibold ${tab === "hasil" ? "text-text-inverse" : "text-text-muted"}`}>
              Hasil Live
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setTab("tps")}
            className={`min-h-[44px] flex-1 items-center justify-center rounded-md active:opacity-80 ${
              tab === "tps" ? "bg-primary" : "bg-transparent"
            }`}
          >
            <Text className={`text-body-md font-semibold ${tab === "tps" ? "text-text-inverse" : "text-text-muted"}`}>
              Status TPS
            </Text>
          </Pressable>
        </View>

        <View className="gap-sm rounded-lg bg-primary p-md">
          <View className="flex-row items-start justify-between">
            <View className="gap-xs">
              <Text className="text-caption text-text-inverse-muted">Suara masuk · Kec. {kecamatanLabel}</Text>
              <Text className="text-headline-md font-bold text-text-inverse">{suaraMasuk.toLocaleString("id-ID")}</Text>
            </View>
            <View className="items-end gap-xs">
              <Text className="text-caption text-text-inverse-muted">TPS terlapor</Text>
              <Text className="text-body-lg font-bold text-accent">
                {submittedTps.length} / {scopedTps.length}
              </Text>
            </View>
          </View>
          <View className="h-2.5 overflow-hidden rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.14)" }}>
            <View className="h-full rounded-full bg-accent" style={{ width: `${tpsTerlaporPct}%` }} />
          </View>
          <Text className="text-caption text-text-inverse-muted">{tpsTerlaporPct}% TPS sudah mengirim C1</Text>
        </View>

        {isError ? (
          <View className="gap-xs">
            <Text className="text-body-md text-danger">Gagal memuat data Quick Count.</Text>
            <Button label="Coba Lagi" variant="secondary" onPress={handleRetry} />
          </View>
        ) : null}

        {isLoading ? <Text className="text-body-md text-text-muted">Memuat...</Text> : null}

        {!isLoading && !isError && tab === "hasil" ? (
          <>
            <View className="gap-sm">
              <Text className="text-body-lg font-semibold text-text-primary">Perolehan Suara Kandidat</Text>
              <View className="gap-md rounded-lg border border-border bg-surface p-md">
                {kandidatHasil.map((entry) => (
                  <QuickCountKandidatRow
                    key={entry.kandidat.id}
                    nama={entry.kandidat.nama}
                    partai={entry.kandidat.partai}
                    votes={entry.votes}
                    percent={entry.percent}
                    leading={entry.leading}
                  />
                ))}
                <View className="flex-row items-center justify-between border-t border-surface-secondary pt-sm">
                  <Text className="text-caption text-text-muted">Suara tidak sah</Text>
                  <Text className="text-caption font-semibold text-text-muted">{SUARA_TIDAK_SAH_MOCK} suara</Text>
                </View>
              </View>
            </View>

            <View className="flex-row gap-sm">
              <View className="flex-1 gap-xs rounded-lg border border-border bg-surface p-md">
                <Text className="text-headline-md font-semibold text-success">{terverifikasiCount}</Text>
                <Text className="text-caption text-text-muted">C1 terverifikasi</Text>
              </View>
              <View className="flex-1 gap-xs rounded-lg border border-border bg-surface p-md">
                <Text className="text-headline-md font-semibold text-danger">{selisihCount}</Text>
                <Text className="text-caption text-text-muted">Selisih perlu cek</Text>
              </View>
            </View>

            {selisihCount > 0 ? (
              <View className="flex-row gap-sm rounded-lg bg-warning-soft p-md">
                <View className="mt-xs h-2 w-2 rounded-full bg-warning" />
                <View className="flex-1 gap-xs">
                  <Text className="text-label-md font-semibold text-warning">
                    {selisihCount} TPS terdeteksi selisih data
                  </Text>
                  <Text className="text-caption text-warning">
                    Input saksi tidak cocok dengan angka pada foto C1. Perlu verifikasi ulang oleh korwil.
                  </Text>
                </View>
              </View>
            ) : null}
          </>
        ) : null}

        {!isLoading && !isError && tab === "tps" ? (
          <>
            <View className="flex-row items-center gap-sm rounded-md border border-border bg-surface px-md py-sm">
              <Ionicons name="search" size={18} color="#64748b" />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Cari nomor TPS atau nama saksi..."
                placeholderTextColor="#64748b"
                className="flex-1 text-body-md text-text-primary"
                textAlignVertical="center"
                style={{ includeFontPadding: false, paddingVertical: 0, lineHeight: 20 }}
              />
            </View>
            {searchedTps.length === 0 ? (
              <Text className="text-body-md text-text-muted">Tidak ada TPS yang cocok.</Text>
            ) : (
              <View className="gap-sm">
                {searchedTps.map((item) => (
                  <QuickCountTpsCard key={item.id} item={item} onPress={handleOpenSheet} />
                ))}
              </View>
            )}
          </>
        ) : null}
      </ScrollView>

      <View className="flex-row gap-sm border-t border-border bg-surface p-md">
        <View className="flex-1">
          <Button label="+ Input Hasil C1" variant="primary" onPress={handleQuickInput} />
        </View>
        <Pressable
          onPress={handleDownload}
          className="h-11 w-11 items-center justify-center rounded-lg border border-border bg-background active:opacity-80"
        >
          <Ionicons name="download-outline" size={18} color="#334155" />
        </Pressable>
      </View>

      <QuickCountInputSheet
        tps={sheetTps}
        kandidatList={MOCK_KANDIDAT}
        submitting={submitMutation.isPending}
        onClose={() => setSheetTps(null)}
        onSubmit={handleSubmitHasil}
      />
    </SafeAreaView>
  );
}
