import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Alert, FlatList, Pressable, RefreshControl, Text, TextInput, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { TimsesBreadcrumb } from "@/components/timses/TimsesBreadcrumb";
import { TimsesEmptyState } from "@/components/timses/TimsesEmptyState";
import { TimsesMemberCard } from "@/components/timses/TimsesMemberCard";
import { TimsesMemberCardSkeleton } from "@/components/timses/TimsesMemberCardSkeleton";
import type { TimsesRegionOption } from "@/components/timses/TimsesRegionPickerModal";
import { TimsesRegionPickerModal } from "@/components/timses/TimsesRegionPickerModal";
import { TimsesSummaryCards } from "@/components/timses/TimsesSummaryCards";
import { useAuth } from "@/hooks/useAuth";
import { useTimsesList } from "@/hooks/useTimsesList";
import type { TimsesMember } from "@/types/timses";

function groupWithCount(items: readonly TimsesMember[], key: "kecamatan" | "desa"): TimsesRegionOption[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    counts.set(item[key], (counts.get(item[key]) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([value, count]) => ({ value, label: value, sublabel: `${count} anggota` }));
}

// 2026-08-23: scoping wilayah (role selain admin/adminsekret dibatasi ke
// kecamatan sendiri) SEMENTARA dimatikan — data kecamatan profil sudah
// tidak ada di backend (lihat types/profile.ts), semua role lihat semua
// anggota untuk sekarang. `listQuery` (`useTimsesList`) sendiri BELUM
// wired ke backend real — modul `timses` sudah tidak ada (diganti `user`,
// self-service only, tidak ada endpoint list-semua-anggota), lihat
// progress-tracker.md Decisions & api-standards.md § Hasil Rekap area
// koreksi Auth Flow untuk detail.
export function TimsesScreen() {
  const { session } = useAuth();
  const navigation = useNavigation();
  const listQuery = useTimsesList();

  const [selectedKecamatan, setSelectedKecamatan] = useState<string | null>(null);
  const [selectedDesa, setSelectedDesa] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [kecamatanPickerOpen, setKecamatanPickerOpen] = useState(false);
  const [desaPickerOpen, setDesaPickerOpen] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void listQuery.refetch();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const scopedMembers = listQuery.data ?? [];

  const kecamatanOptions = useMemo(() => groupWithCount(scopedMembers, "kecamatan"), [scopedMembers]);

  const membersInKecamatan = useMemo(
    () => scopedMembers.filter((member) => member.kecamatan === selectedKecamatan),
    [scopedMembers, selectedKecamatan],
  );

  const desaOptions = useMemo(() => groupWithCount(membersInKecamatan, "desa"), [membersInKecamatan]);

  useEffect(() => {
    if (kecamatanOptions.length === 0) return;
    const stillValid = selectedKecamatan !== null && kecamatanOptions.some((o) => o.value === selectedKecamatan);
    if (stillValid) return;
    setSelectedKecamatan(kecamatanOptions[0].value);
    setSelectedDesa(null);
  }, [kecamatanOptions, selectedKecamatan]);

  const membersInDesa = useMemo(
    () => (selectedDesa ? membersInKecamatan.filter((member) => member.desa === selectedDesa) : membersInKecamatan),
    [membersInKecamatan, selectedDesa],
  );

  const searchedMembers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return membersInDesa;
    return membersInDesa.filter((member) =>
      [member.namaLengkap, member.nik, member.desa, member.dusun ?? "", member.noTelpon ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [membersInDesa, search]);

  const total = membersInDesa.length;
  const online = membersInDesa.filter((member) => member.statusOnline === "online").length;
  const isLoading = listQuery.isLoading;
  const isError = listQuery.isError;

  function handleRetry() {
    void listQuery.refetch();
  }

  function handleAdd() {
    Alert.alert("Segera hadir", "Fitur tambah anggota timses akan datang.");
  }

  // Timses sekarang di-push dari HomeStack (Feature 08) — header native (title +
  // back chevron) menggantikan heading in-content yang dipakai saat masih jadi tab
  // root. Tombol "+" dipindah jadi headerRight, bukan dihapus (masih non-fungsional,
  // sama seperti sebelumnya).
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={handleAdd}
          hitSlop={8}
          className="h-11 w-11 items-center justify-center rounded-lg bg-accent active:opacity-80"
        >
          <Ionicons name="add" size={22} color="#ffffff" />
        </Pressable>
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

  if (!session) {
    return null;
  }

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-background">
      <View className="gap-md px-margin-mobile pt-sm">
        {selectedKecamatan ? (
          <TimsesBreadcrumb
            kecamatan={selectedKecamatan}
            desaLabel={selectedDesa ? `Ds. ${selectedDesa}` : "Semua Desa"}
            isAllDesa={!selectedDesa}
            kecamatanTappable
            onPressKecamatan={() => setKecamatanPickerOpen(true)}
            onPressDesa={() => setDesaPickerOpen(true)}
          />
        ) : null}
      </View>

      <FlatList
        data={searchedMembers}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, gap: 12, flexGrow: 1 }}
        ListHeaderComponent={
          <View className="gap-md pb-md">
            <View className="flex-row items-center gap-sm rounded-md border border-border bg-surface px-md py-sm">
              <Ionicons name="search" size={18} color="#64748b" />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Cari anggota timses..."
                placeholderTextColor="#64748b"
                className="flex-1 text-body-md text-text-primary"
              />
            </View>
            <TimsesSummaryCards total={total} online={online} isLoading={isLoading} />
            {isError ? (
              <View className="gap-sm">
                <Text className="text-body-md text-danger">Gagal memuat daftar anggota timses.</Text>
                <Button label="Coba Lagi" variant="secondary" onPress={handleRetry} />
              </View>
            ) : null}
            {isLoading ? (
              <View className="gap-sm">
                <TimsesMemberCardSkeleton />
                <TimsesMemberCardSkeleton />
                <TimsesMemberCardSkeleton />
              </View>
            ) : null}
          </View>
        }
        renderItem={({ item }) => <TimsesMemberCard item={item} />}
        ItemSeparatorComponent={() => <View className="h-sm" />}
        ListEmptyComponent={!isLoading && !isError ? <TimsesEmptyState hasSearch={search.trim().length > 0} /> : null}
        refreshControl={<RefreshControl refreshing={listQuery.isRefetching} onRefresh={() => void listQuery.refetch()} />}
      />

      <TimsesRegionPickerModal
        visible={kecamatanPickerOpen}
        title="Pilih Kecamatan"
        options={kecamatanOptions}
        selectedValue={selectedKecamatan}
        onSelect={(value) => {
          if (value === null) return;
          setSelectedKecamatan(value);
          setSelectedDesa(null);
        }}
        onClose={() => setKecamatanPickerOpen(false)}
      />

      <TimsesRegionPickerModal
        visible={desaPickerOpen}
        title="Pilih Desa"
        options={desaOptions}
        selectedValue={selectedDesa}
        onSelect={setSelectedDesa}
        onClose={() => setDesaPickerOpen(false)}
        allLabel="Semua Desa"
      />
    </SafeAreaView>
  );
}
