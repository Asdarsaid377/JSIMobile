import { useLayoutEffect, useMemo, useState } from "react";
import { Alert, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";

import { TimsesRegionPickerModal } from "@/components/timses/TimsesRegionPickerModal";
import type { TimsesRegionOption } from "@/components/timses/TimsesRegionPickerModal";
import { TokohCard } from "@/components/tokoh/TokohCard";
import { TokohKategoriRow } from "@/components/tokoh/TokohKategoriRow";
import { TokohKelurahanBar } from "@/components/tokoh/TokohKelurahanBar";
import { TokohSummaryCard } from "@/components/tokoh/TokohSummaryCard";
import { Button } from "@/components/ui/Button";
import { useHideTabBar } from "@/hooks/useHideTabBar";
import { useTokohList } from "@/hooks/useTokohList";
import { exportTableAsPdf } from "@/lib/exportPdf";
import type { HomeStackParamList } from "@/navigation/HomeStack";
import { TOKOH_KATEGORI_OPTIONS } from "@/types/tokoh";
import type { Tokoh } from "@/types/tokoh";

// Ekspor "Daftar Tokoh" sesuai filter kecamatan + pencarian yang sedang aktif
// di screen (bukan semua data) — konsisten dengan angka "N hasil" yang tampil.
async function handleDownload(records: Tokoh[]) {
  try {
    await exportTableAsPdf(
      "Daftar Tokoh Masyarakat",
      "tokoh-masyarakat.pdf",
      ["Nama", "Kategori", "Pengaruh", "Dukungan", "Estimasi Basis Massa", "Alamat", "Kecamatan", "Desa", "Pekerjaan", "No. Telepon"],
      records.map((item) => [
        item.nama,
        item.kategoriLabel,
        item.pengaruh,
        item.dukungan,
        item.estimasiBasisMassa,
        item.alamat,
        item.kecamatan,
        item.desa,
        item.pekerjaan ?? "-",
        item.noTelpon ?? "-",
      ]),
    );
  } catch (error) {
    Alert.alert("Gagal ekspor", error instanceof Error ? error.message : "Terjadi kesalahan saat ekspor data.");
  }
}

// Referensi context/designs/tokoh1.png (bagian atas: summary + filter) dan
// context/designs/tokohlist.png (bagian bawah: "Daftar Tokoh") — SATU screen
// yang sama, cuma di-export jadi 2 file karena kepanjangan (dikonfirmasi user).
// Header/search/filter yang tampil di kedua file itu elemen yang SAMA, bukan
// diulang di 2 screen berbeda.
//
// Fitur baru, tidak ada modul backend apapun (bukan cuma DPT/Hasil Rekap yang
// belum dikonfirmasi — memang tidak ada sama sekali, lihat services/tokoh.ts).
// 5 kategori ("Tokoh Agama"/"Pemuda"/"Adat"/"Pendidikan"/"Perempuan") diambil
// APA ADANYA dari mockup — beda dari 4 kategori yang sempat disebut user
// secara verbal sebelum desain ini di-upload (lihat types/tokoh.ts).
//
// Scoping wilayah: pola sama KekuatanWilayahScreen/KekuatanPemilihScreen —
// admin bebas pilih kecamatan (dari data yang ada, default "Semua Kecamatan"),
// role lain terkunci ke kecamatan sendiri. Mockup breadcrumb "Filter Alamat
// Tokoh" tampil 3 level (Provinsi > Kabupaten > Kecamatan, data placeholder
// "Jawa Barat > Bandung Barat > Cileu...") — disederhanakan jadi 1 level
// Kecamatan saja (keputusan mandiri, bukan ditanya user): tidak ada data
// provinsi/kabupaten nyata yang cocok untuk tokoh (geografi mock reuse
// Dtdoor/Timses yang cuma py Kecamatan/Desa), preseden sama persis dengan
// TimsesBreadcrumb yang juga memangkas level Kabupaten karena alasan serupa.
//
// Search "Cari nama tokoh..." SEKARANG fungsional (2026-08-22, begitu
// tokohlist.png ditemukan) — TAPI cuma memfilter "Daftar Tokoh" di bawah,
// TIDAK ikut mengubah kartu ringkasan/kategori/kelurahan di atasnya (yang
// tetap scoped murni oleh kecamatan) — keputusan mandiri, mencegah angka KPI
// berubah-ubah cuma karena ketikan pencarian nama.
// 2026-08-23: scoping wilayah (admin bebas pilih kecamatan, role lain
// dikunci ke kecamatan sendiri) SEMENTARA dimatikan — data kecamatan profil
// sudah tidak ada di backend (lihat types/profile.ts), semua role sekarang
// bebas pilih kecamatan manapun, sama seperti admin dulu.
export function TokohMasyarakatScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList, "TokohMasyarakat">>();
  const tokohQuery = useTokohList();

  useHideTabBar();

  const [search, setSearch] = useState("");
  const [selectedKecamatan, setSelectedKecamatan] = useState<string | null>(null);
  const [kecamatanPickerOpen, setKecamatanPickerOpen] = useState(false);

  const allRecords = tokohQuery.data ?? [];

  const kecamatanOptions: TimsesRegionOption[] = useMemo(() => {
    const set = new Set<string>();
    for (const item of allRecords) set.add(item.kecamatan);
    return Array.from(set)
      .sort((a, b) => a.localeCompare(b))
      .map((nama) => ({ value: nama, label: nama }));
  }, [allRecords]);

  const scopedRecords = useMemo(() => {
    if (!selectedKecamatan) return allRecords;
    return allRecords.filter((item) => item.kecamatan === selectedKecamatan);
  }, [allRecords, selectedKecamatan]);

  const activeKecamatanLabel = selectedKecamatan ?? "Semua Kecamatan";

  const searchedRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return scopedRecords;
    return scopedRecords.filter((item) => item.nama.toLowerCase().includes(query));
  }, [scopedRecords, search]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => void handleDownload(searchedRecords)}
          hitSlop={8}
          className="h-9 w-9 items-center justify-center active:opacity-80"
        >
          <Ionicons name="download-outline" size={20} color="#3b82f6" />
        </Pressable>
      ),
    });
  }, [navigation, searchedRecords]);

  const dukunganCounts = useMemo(() => {
    const counts = { Mendukung: 0, Netral: 0, Lawan: 0 };
    for (const item of scopedRecords) counts[item.dukungan] += 1;
    return counts;
  }, [scopedRecords]);

  const totalEstimasiBasisMassa = useMemo(
    () => scopedRecords.reduce((sum, item) => sum + item.estimasiBasisMassa, 0),
    [scopedRecords],
  );

  const kategoriDistribution = useMemo(() => {
    const counts = new Map<number, number>();
    for (const item of scopedRecords) counts.set(item.kategoriId, (counts.get(item.kategoriId) ?? 0) + 1);
    const rows = TOKOH_KATEGORI_OPTIONS.map((option) => ({ label: option.label, count: counts.get(option.id) ?? 0 })).filter(
      (row) => row.count > 0,
    );
    rows.sort((a, b) => b.count - a.count);
    const max = rows[0]?.count ?? 0;
    return rows.map((row, index) => ({ ...row, percentOfMax: max > 0 ? (row.count / max) * 100 : 0, highlight: index === 0 }));
  }, [scopedRecords]);

  const kelurahanDistribution = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of scopedRecords) counts.set(item.desa, (counts.get(item.desa) ?? 0) + 1);
    const rows = Array.from(counts.entries()).map(([label, count]) => ({ label, count }));
    rows.sort((a, b) => b.count - a.count);
    const max = rows[0]?.count ?? 0;
    return rows.map((row, index) => ({ ...row, percentOfMax: max > 0 ? (row.count / max) * 100 : 0, highlight: index === 0 }));
  }, [scopedRecords]);

  const isLoading = tokohQuery.isLoading;
  const isError = tokohQuery.isError;

  function handleRetry(): void {
    void tokohQuery.refetch();
  }

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 12 }}
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={tokohQuery.isRefetching} onRefresh={handleRetry} />}
      >
        <View className="flex-row items-center gap-sm rounded-md border border-border bg-surface px-md py-sm">
          <Ionicons name="search" size={18} color="#64748b" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Cari nama tokoh..."
            placeholderTextColor="#64748b"
            className="flex-1 text-body-md text-text-primary"
            textAlignVertical="center"
            style={{ includeFontPadding: false, paddingVertical: 0, lineHeight: 20 }}
          />
        </View>

        <Pressable
          onPress={() => setKecamatanPickerOpen(true)}
          className="flex-row items-center gap-sm rounded-lg border border-border bg-surface p-md active:opacity-80"
        >
          <View className="h-10 w-10 items-center justify-center rounded-lg bg-accent-soft">
            <Ionicons name="filter" size={18} color="#3b82f6" />
          </View>
          <View className="flex-1 gap-xs">
            <Text className="text-caption text-text-muted">Filter Alamat Tokoh</Text>
            <Text numberOfLines={1} ellipsizeMode="tail" className="text-body-md font-semibold text-text-primary">
              Kec. {activeKecamatanLabel}
            </Text>
          </View>
          <Text className="text-label-md font-semibold text-accent">Ubah</Text>
        </Pressable>

        {isError ? (
          <View className="gap-xs">
            <Text className="text-body-md text-danger">Gagal memuat data tokoh masyarakat.</Text>
            <Button label="Coba Lagi" variant="secondary" onPress={handleRetry} />
          </View>
        ) : null}

        {isLoading ? <Text className="text-body-md text-text-muted">Memuat...</Text> : null}

        {!isLoading && !isError && scopedRecords.length === 0 ? (
          <View className="items-center gap-md px-margin-mobile py-xl">
            <Ionicons name="star-outline" size={40} color="#64748b" />
            <Text className="text-center text-body-md text-text-muted">Belum ada tokoh masyarakat teridentifikasi di wilayah ini.</Text>
          </View>
        ) : null}

        {!isLoading && !isError && scopedRecords.length > 0 ? (
          <>
            <TokohSummaryCard
              total={scopedRecords.length}
              estimasiBasisMassa={totalEstimasiBasisMassa}
              mendukung={dukunganCounts.Mendukung}
              netral={dukunganCounts.Netral}
              lawan={dukunganCounts.Lawan}
            />

            <View className="gap-sm">
              <Text className="text-body-lg font-semibold text-text-primary">Tokoh per Kategori</Text>
              <View className="gap-md rounded-lg border border-border bg-surface p-md">
                {kategoriDistribution.map((row) => (
                  <TokohKategoriRow key={row.label} label={row.label} count={row.count} percentOfMax={row.percentOfMax} highlight={row.highlight} />
                ))}
              </View>
            </View>

            <View className="gap-sm">
              <Text className="text-body-lg font-semibold text-text-primary">Sebaran per Kelurahan</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="rounded-lg border border-border bg-surface p-md">
                <View className="flex-row gap-md">
                  {kelurahanDistribution.map((row) => (
                    <TokohKelurahanBar key={row.label} label={row.label} count={row.count} percentOfMax={row.percentOfMax} highlight={row.highlight} />
                  ))}
                </View>
              </ScrollView>
            </View>

            <View className="gap-sm">
              <View className="flex-row items-center justify-between">
                <Text className="text-body-lg font-semibold text-text-primary">Daftar Tokoh</Text>
                <Text className="text-caption text-text-muted">{searchedRecords.length} hasil</Text>
              </View>
              {searchedRecords.length === 0 ? (
                <Text className="text-body-md text-text-muted">Tidak ada tokoh yang cocok dengan pencarian.</Text>
              ) : (
                <View className="gap-sm">
                  {searchedRecords.map((item) => (
                    <TokohCard key={item.id} item={item} />
                  ))}
                </View>
              )}
            </View>
          </>
        ) : null}
      </ScrollView>

      <View className="gap-sm border-t border-border bg-surface p-md">
        <Button
          label="+ Identifikasi Tokoh Baru"
          variant="primary"
          onPress={() => navigation.navigate("TokohForm", {})}
        />
      </View>

      <TimsesRegionPickerModal
        visible={kecamatanPickerOpen}
        title="Pilih Kecamatan"
        options={kecamatanOptions}
        selectedValue={selectedKecamatan}
        onSelect={setSelectedKecamatan}
        onClose={() => setKecamatanPickerOpen(false)}
        allLabel="Semua Kecamatan"
      />
    </SafeAreaView>
  );
}
