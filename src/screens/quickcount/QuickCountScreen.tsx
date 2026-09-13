import { useLayoutEffect, useMemo, useState } from "react";
import { Alert, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";

import { QuickCountInputSheet } from "@/components/quickcount/QuickCountInputSheet";
import { QuickCountKandidatRow } from "@/components/quickcount/QuickCountKandidatRow";
import { QuickCountRekapCard } from "@/components/quickcount/QuickCountRekapCard";
import { QuickCountTpsCard } from "@/components/quickcount/QuickCountTpsCard";
import { TimsesRegionPickerModal } from "@/components/timses/TimsesRegionPickerModal";
import type { TimsesRegionOption } from "@/components/timses/TimsesRegionPickerModal";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useHideTabBar } from "@/hooks/useHideTabBar";
import {
  useQuickCountKandidatList,
  useQuickCountRekap,
  useQuickCountSummary,
  useQuickCountTpsList,
  useSubmitQuickCountHasil,
} from "@/hooks/useQuickCount";
import { exportTableAsPdf } from "@/lib/exportPdf";
import { ADMIN_ROLES } from "@/lib/permissions";
import type { HomeStackParamList } from "@/navigation/HomeStack";
import { QUICK_COUNT_REKAP_LEVEL_OPTIONS } from "@/types/quickcount";
import type { QuickCountKandidat, QuickCountRekapLevel, QuickCountTps, QuickCountWilayahFilter } from "@/types/quickcount";

// Suara tidak sah SENGAJA statis (bukan di-derive) — mockup tidak punya
// mekanisme input untuk angka ini (qcInputRows di sana cuma 5 baris kandidat,
// tidak ada baris "tidak sah"), beda dari suara kandidat/total suara sah yang
// SEMUANYA dihitung sungguhan dari hasilC1 tiap TPS. Pola sama "mock statis"
// yang sudah ada preseden di Budgeting Kampanye (realisasi-pos tidak
// diturunkan dari daftar transaksi). Backend `/quickcount/summary` juga TIDAK
// punya konsep ini sama sekali (tidak ada field-nya di QuickCountHasil).
const SUARA_TIDAK_SAH_MOCK = 32;

type QcTab = "hasil" | "tps" | "rekap";

// Ekspor per-TPS (bukan cuma rekap total) sesuai filter wilayah + pencarian
// yang sedang aktif — 1 kolom per kandidat (urutan `kandidatList`) supaya
// baris suaranya bisa dicek langsung per TPS, bukan cuma angka agregat.
async function handleDownload(tpsList: QuickCountTps[], kandidatList: QuickCountKandidat[]) {
  try {
    await exportTableAsPdf(
      "Quick Count — Hasil per TPS",
      "quickcount-hasil-tps.pdf",
      ["No TPS", "Kabupaten", "Kecamatan", "Kelurahan", "Status", "Nama Saksi", "Total DPT", ...kandidatList.map((k) => k.nama), "Total Suara Sah"],
      tpsList.map((item) => [
        item.noTps,
        item.kabupaten,
        item.kecamatan,
        item.kelurahan,
        item.status,
        item.namaSaksi ?? "-",
        item.totalDpt,
        ...kandidatList.map((k) => item.hasilC1?.suaraPerKandidat[k.id] ?? ""),
        item.hasilC1?.totalSuaraSah ?? "",
      ]),
    );
  } catch (error) {
    Alert.alert("Gagal ekspor", error instanceof Error ? error.message : "Terjadi kesalahan saat ekspor data.");
  }
}

function uniqueOptions(values: string[]): TimsesRegionOption[] {
  return Array.from(new Set(values))
    .sort((a, b) => a.localeCompare(b))
    .map((value) => ({ value, label: value }));
}

// Referensi: artboard "12 · SAKSI & QUICK COUNT (SEKUNDER — DRAWER)" di project
// Claude Design user, dibaca via DesignSync 2026-08-22. Permintaan eksplisit
// user: "tiru khusus quick count saja" — bagian penugasan Saksi di artboard
// yang sama TIDAK diikutkan (sudah ada SaksiTpsScreen/SaksiFormScreen sendiri).
// Detail keputusan lengkap (kandidat/TPS mock, kenapa hasilC1 ditambah sendiri,
// suara tidak sah statis, dst.) ada di progress-tracker.md Decisions &
// types/quickcount.ts. Kandidat & TPS CRUD-able (2026-08-24, admin-only) via
// 2 icon di headerRight. Modul backend `quickcount` ADA & WIRED PENUH (lihat
// api-standards.md § Quick Count) — TPS backend berdiri sendiri (BUKAN data
// wilayah/DPT resmi, keputusan eksplisit user).
//
// 2026-08-24 (lanjutan) — "filtering dan summary" ditambah atas permintaan
// eksplisit user, backend-nya JUGA ditambah user sendiri (GET /quickcount/tps
// & /hasil dapat query kabupaten/kecamatan/kelurahan, GET /quickcount/summary
// & /rekap baru). Filter wilayah TIDAK dikirim ke `GET /tps`/`GET /hasil`
// (dataset kecil, tanpa pagination — difilter CLIENT-SIDE dari 1 fetch
// unfiltered yang sudah ada, pola sama search noTps/namaSaksi yang sudah ada)
// — TAPI filter DIKIRIM ke `GET /summary`/`GET /rekap` (agregasinya
// (totalDpt/persentasePartisipasi/dst.) cuma masuk akal dihitung server-side,
// judgment call, tidak ditanyakan ulang ke user). Opsi cascading picker
// (Kabupaten→Kecamatan→Kelurahan) di-derive dari TPS list yang sudah ke-fetch
// — TIDAK ADA hierarki wilayah resmi buat validasi (TPS berdiri sendiri).
//
// 2026-08-24 (lanjutan lagi) — UI filter DIROMBAK ulang atas permintaan
// eksplisit user ("boleh tolong dibuat menjadi mirip dengan filter di list
// dpt") — dari 3 chip datar jadi 1 card "Filter Wilayah Aktif" (icon box +
// breadcrumb + "Ubah") persis pola `DptListScreen.tsx`, 3 `TimsesRegionPickerModal`
// terpisah (bukan 1 instance dinamis seperti sebelumnya) dengan auto-cascade
// (pilih kabupaten spesifik → langsung buka picker kecamatan, dst.) — kode
// dan interaksinya SEKARANG sama persis dengan alur Kecamatan→Kelurahan→TPS
// di DPT, cuma levelnya Kabupaten→Kecamatan→Kelurahan (DPT tidak perlu level
// Kabupaten karena sudah scoped dari route params, Quick Count scope-nya
// belum ada jadi ketiga level tetap jadi bagian filter).
export function QuickCountScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const { session } = useAuth();
  const isAdmin = session ? ADMIN_ROLES.includes(session.user.roles) : false;
  const tpsQuery = useQuickCountTpsList();
  const kandidatQuery = useQuickCountKandidatList();
  const submitMutation = useSubmitQuickCountHasil();

  useHideTabBar();

  const [tab, setTab] = useState<QcTab>("hasil");
  const [search, setSearch] = useState("");
  const [sheetTps, setSheetTps] = useState<QuickCountTps | null>(null);
  const [kabupatenFilter, setKabupatenFilter] = useState<string | null>(null);
  const [kecamatanFilter, setKecamatanFilter] = useState<string | null>(null);
  const [kelurahanFilter, setKelurahanFilter] = useState<string | null>(null);
  const [kabupatenPickerOpen, setKabupatenPickerOpen] = useState(false);
  const [kecamatanPickerOpen, setKecamatanPickerOpen] = useState(false);
  const [kelurahanPickerOpen, setKelurahanPickerOpen] = useState(false);
  const [rekapLevel, setRekapLevel] = useState<QuickCountRekapLevel>("kabupaten");

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View className="flex-row items-center gap-xs">
          {isAdmin ? (
            <Pressable
              onPress={() => navigation.navigate("QuickCountTpsManage")}
              hitSlop={8}
              className="h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface active:opacity-80"
            >
              <Ionicons name="location-outline" size={18} color="#334155" />
            </Pressable>
          ) : null}
          {isAdmin ? (
            <Pressable
              onPress={() => navigation.navigate("QuickCountKandidat")}
              hitSlop={8}
              className="h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface active:opacity-80"
            >
              <Ionicons name="people-outline" size={18} color="#334155" />
            </Pressable>
          ) : null}
          <View className="flex-row items-center gap-xs">
            <View className="h-1.5 w-1.5 rounded-full bg-danger" />
            <Text className="text-label-md font-medium text-danger">LIVE</Text>
          </View>
        </View>
      ),
    });
  }, [navigation, isAdmin]);

  const allTps = tpsQuery.data ?? [];
  const kandidatList = kandidatQuery.data ?? [];

  const wilayahFilter = useMemo<QuickCountWilayahFilter>(
    () => ({
      ...(kabupatenFilter ? { kabupaten: kabupatenFilter } : {}),
      ...(kecamatanFilter ? { kecamatan: kecamatanFilter } : {}),
      ...(kelurahanFilter ? { kelurahan: kelurahanFilter } : {}),
    }),
    [kabupatenFilter, kecamatanFilter, kelurahanFilter],
  );

  const kabupatenOptions = useMemo(() => uniqueOptions(allTps.map((item) => item.kabupaten)), [allTps]);
  const kecamatanOptions = useMemo(() => {
    const pool = kabupatenFilter ? allTps.filter((item) => item.kabupaten === kabupatenFilter) : allTps;
    return uniqueOptions(pool.map((item) => item.kecamatan));
  }, [allTps, kabupatenFilter]);
  const kelurahanOptions = useMemo(() => {
    const pool = allTps.filter(
      (item) =>
        (!kabupatenFilter || item.kabupaten === kabupatenFilter) &&
        (!kecamatanFilter || item.kecamatan === kecamatanFilter),
    );
    return uniqueOptions(pool.map((item) => item.kelurahan));
  }, [allTps, kabupatenFilter, kecamatanFilter]);

  // Breadcrumb "Filter Wilayah Aktif" — pola sama DptListScreen.tsx (gabung
  // level yang aktif dengan "›", fallback "Tidak ada filter" kalau kosong).
  const wilayahBreadcrumb =
    [kabupatenFilter, kecamatanFilter, kelurahanFilter].filter((part): part is string => Boolean(part)).join(" › ") ||
    "Tidak ada filter";
  const filterLabel = kelurahanFilter ?? kecamatanFilter ?? kabupatenFilter ?? "Semua Wilayah";

  const scopedTps = useMemo(
    () =>
      allTps.filter(
        (item) =>
          (!kabupatenFilter || item.kabupaten === kabupatenFilter) &&
          (!kecamatanFilter || item.kecamatan === kecamatanFilter) &&
          (!kelurahanFilter || item.kelurahan === kelurahanFilter),
      ),
    [allTps, kabupatenFilter, kecamatanFilter, kelurahanFilter],
  );

  const summaryQuery = useQuickCountSummary(wilayahFilter);
  const summary = summaryQuery.data;
  const rekapQuery = useQuickCountRekap(rekapLevel, wilayahFilter);

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
  // pernah kirim hasil (fallback ke TPS pertama kalau semua sudah masuk),
  // dari `scopedTps` — ikut filter wilayah yang sedang aktif.
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

  // Auto-cascade — pola sama DptListScreen.tsx: pilih level tertentu (bukan
  // "Semua") langsung buka picker level di bawahnya, pilih "Semua" berhenti
  // di situ (tidak auto-buka apapun).
  function handleSelectKabupaten(value: string | null): void {
    setKabupatenFilter(value);
    setKecamatanFilter(null);
    setKelurahanFilter(null);
    if (value !== null) setKecamatanPickerOpen(true);
  }

  function handleSelectKecamatan(value: string | null): void {
    setKecamatanFilter(value);
    setKelurahanFilter(null);
    if (value !== null) setKelurahanPickerOpen(true);
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
          <Pressable
            onPress={() => setTab("rekap")}
            className={`min-h-[44px] flex-1 items-center justify-center rounded-md active:opacity-80 ${
              tab === "rekap" ? "bg-primary" : "bg-transparent"
            }`}
          >
            <Text className={`text-body-md font-semibold ${tab === "rekap" ? "text-text-inverse" : "text-text-muted"}`}>
              Rekap Wilayah
            </Text>
          </Pressable>
        </View>

        <Pressable
          onPress={() => setKabupatenPickerOpen(true)}
          className="min-h-[36px] flex-row items-center gap-xs rounded-lg border border-border bg-surface px-sm py-xs active:opacity-80"
        >
          <Ionicons name="filter" size={14} color="#3b82f6" />
          <Text numberOfLines={1} ellipsizeMode="tail" className="flex-1 text-label-md font-semibold text-text-primary">
            {wilayahBreadcrumb}
          </Text>
          <Text className="shrink-0 text-caption font-semibold text-accent">Ubah</Text>
        </Pressable>

        <View className="gap-sm rounded-lg bg-primary p-md">
          <View className="flex-row items-start justify-between gap-sm">
            <View className="flex-1 gap-xs">
              <Text className="text-caption text-text-inverse-muted" numberOfLines={1}>
                Suara masuk · {filterLabel}
              </Text>
              <Text className="text-headline-md font-bold text-text-inverse">
                {(summary?.totalSuaraSah ?? 0).toLocaleString("id-ID")}
              </Text>
            </View>
            <View className="shrink-0 items-end gap-xs">
              <Text className="text-caption text-text-inverse-muted">TPS terlapor</Text>
              <Text className="text-body-lg font-bold text-accent">
                {summary?.tpsMasuk ?? 0} / {summary?.totalTps ?? 0}
              </Text>
            </View>
          </View>
          <View className="h-2.5 overflow-hidden rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.14)" }}>
            <View className="h-full rounded-full bg-accent" style={{ width: `${summary?.persentaseTpsMasuk ?? 0}%` }} />
          </View>
          <Text className="text-caption text-text-inverse-muted">
            {summary?.persentaseTpsMasuk ?? 0}% TPS sudah mengirim C1
          </Text>
          <View className="flex-row items-center justify-between gap-sm border-t pt-sm" style={{ borderColor: "rgba(255,255,255,0.14)" }}>
            <Text className="shrink-0 text-caption text-text-inverse-muted">Partisipasi pemilih</Text>
            <Text className="flex-1 text-right text-label-md font-semibold text-text-inverse" numberOfLines={1}>
              {summary?.persentasePartisipasi ?? 0}% dari {(summary?.totalDpt ?? 0).toLocaleString("id-ID")} DPT
            </Text>
          </View>
        </View>

        {isError ? (
          <View className="gap-xs">
            <Text className="text-body-md text-danger">Gagal memuat data Quick Count.</Text>
            <Button label="Coba Lagi" variant="secondary" onPress={handleRetry} />
          </View>
        ) : null}

        {isLoading ? <Text className="text-body-md text-text-muted">Memuat...</Text> : null}

        {!isLoading && !isError && tab === "hasil" ? (
          summaryQuery.isError ? (
            <View className="gap-xs">
              <Text className="text-body-md text-danger">Gagal memuat ringkasan kandidat.</Text>
              <Button label="Coba Lagi" variant="secondary" onPress={() => void summaryQuery.refetch()} />
            </View>
          ) : (
            <>
              <View className="gap-sm">
                <Text className="text-body-lg font-semibold text-text-primary">Perolehan Suara Kandidat</Text>
                <View className="gap-md rounded-lg border border-border bg-surface p-md">
                  {(summary?.kandidat ?? []).map((entry, index) => (
                    <QuickCountKandidatRow
                      key={entry.kandidatId}
                      nama={entry.nama}
                      partai={entry.partai}
                      votes={entry.totalSuara}
                      percent={entry.persentase}
                      leading={index === 0 && entry.totalSuara > 0}
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
          )
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

        {!isLoading && !isError && tab === "rekap" ? (
          <>
            <View className="flex-row gap-xs rounded-lg bg-surface-secondary p-xs">
              {QUICK_COUNT_REKAP_LEVEL_OPTIONS.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => setRekapLevel(option.value)}
                  className={`min-h-[36px] flex-1 items-center justify-center rounded-md active:opacity-80 ${
                    rekapLevel === option.value ? "bg-primary" : "bg-transparent"
                  }`}
                >
                  <Text
                    className={`text-caption font-semibold ${
                      rekapLevel === option.value ? "text-text-inverse" : "text-text-muted"
                    }`}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {rekapQuery.isLoading ? <Text className="text-body-md text-text-muted">Memuat rekap...</Text> : null}
            {rekapQuery.isError ? (
              <View className="gap-xs">
                <Text className="text-body-md text-danger">Gagal memuat rekap wilayah.</Text>
                <Button label="Coba Lagi" variant="secondary" onPress={() => void rekapQuery.refetch()} />
              </View>
            ) : null}
            {!rekapQuery.isLoading && !rekapQuery.isError ? (
              (rekapQuery.data ?? []).length === 0 ? (
                <Text className="text-body-md text-text-muted">Belum ada TPS untuk direkap.</Text>
              ) : (
                <View className="gap-sm">
                  {(rekapQuery.data ?? []).map((group) => (
                    <QuickCountRekapCard key={group.wilayah} group={group} />
                  ))}
                </View>
              )
            ) : null}
          </>
        ) : null}
      </ScrollView>

      <View className="flex-row gap-sm border-t border-border bg-surface p-md">
        <View className="flex-1">
          <Button label="+ Input Hasil C1" variant="primary" onPress={handleQuickInput} />
        </View>
        <Pressable
          onPress={() => void handleDownload(searchedTps, kandidatList)}
          className="h-11 w-11 items-center justify-center rounded-lg border border-border bg-background active:opacity-80"
        >
          <Ionicons name="download-outline" size={18} color="#334155" />
        </Pressable>
      </View>

      <QuickCountInputSheet
        tps={sheetTps}
        kandidatList={kandidatList}
        submitting={submitMutation.isPending}
        onClose={() => setSheetTps(null)}
        onSubmit={handleSubmitHasil}
      />

      <TimsesRegionPickerModal
        visible={kabupatenPickerOpen}
        title="Pilih Kabupaten/Kota"
        options={kabupatenOptions}
        selectedValue={kabupatenFilter}
        onSelect={handleSelectKabupaten}
        onClose={() => setKabupatenPickerOpen(false)}
        allLabel="Semua Kabupaten/Kota"
      />
      <TimsesRegionPickerModal
        visible={kecamatanPickerOpen}
        title="Pilih Kecamatan"
        options={kecamatanOptions}
        selectedValue={kecamatanFilter}
        onSelect={handleSelectKecamatan}
        onClose={() => setKecamatanPickerOpen(false)}
        allLabel="Semua Kecamatan"
      />
      <TimsesRegionPickerModal
        visible={kelurahanPickerOpen}
        title="Pilih Kelurahan/Desa"
        options={kelurahanOptions}
        selectedValue={kelurahanFilter}
        onSelect={setKelurahanFilter}
        onClose={() => setKelurahanPickerOpen(false)}
        allLabel="Semua Kelurahan/Desa"
      />
    </SafeAreaView>
  );
}
