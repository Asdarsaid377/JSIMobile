import { useState } from "react";
import { Alert, RefreshControl, ScrollView, Text, View } from "react-native";

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";

import { PengumumanCard } from "@/components/pengumuman/PengumumanCard";
import { PengumumanDetailSheet } from "@/components/pengumuman/PengumumanDetailSheet";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useHideTabBar } from "@/hooks/useHideTabBar";
import { useDeletePengumuman, usePengumumanList } from "@/hooks/usePengumuman";
import { isAdmin } from "@/lib/permissions";
import type { HomeStackParamList } from "@/navigation/HomeStack";
import type { Pengumuman } from "@/types/pengumuman";

// TIDAK ADA referensi desain untuk screen ini (izin eksplisit user 2026-08-26,
// Aturan #1 CLAUDE.md — lihat api-standards.md § Pengumuman & progress-tracker.md
// Decisions) — MENGGANTIKAN shortcut "Broadcast" lama di HomeScreen (dulu cuma
// Alert "Segera hadir"). List ini berlaku untuk SEMUA role (relawan lihat
// pengumuman relevan buat mereka) — GET /pengumuman SUDAH di-scope server-side
// (backend baca kabId/kecId/kelId requester, admin/adminsekret lihat semua),
// mobile TIDAK filter ulang di client. Tombol "+ Buat Pengumuman" & aksi hapus
// di detail sheet cuma render untuk admin/adminsekret (POST/DELETE di-guard
// RolesGuard server-side juga).
export function PengumumanScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const { session } = useAuth();
  const listQuery = usePengumumanList();
  const deleteMutation = useDeletePengumuman();
  useHideTabBar();

  const [sheetItem, setSheetItem] = useState<Pengumuman | null>(null);

  const canManage = session ? isAdmin(session.user.roles) : false;
  const list = listQuery.data ?? [];
  const isLoading = listQuery.isLoading;
  const isError = listQuery.isError;

  function handleHapus(item: Pengumuman): void {
    setSheetItem(null);
    Alert.alert("Hapus pengumuman?", `"${item.judul}" akan dihapus untuk semua penerima.`, [
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
        refreshControl={<RefreshControl refreshing={listQuery.isRefetching} onRefresh={() => void listQuery.refetch()} />}
      >
        <Text className="text-caption text-text-muted">
          Pengumuman dari HQ untuk seluruh jajaran timses sesuai wilayah tugas Anda
        </Text>

        {isError ? (
          <View className="gap-xs">
            <Text className="text-body-md text-danger">Gagal memuat daftar pengumuman.</Text>
            <Button label="Coba Lagi" variant="secondary" onPress={() => void listQuery.refetch()} />
          </View>
        ) : null}

        {isLoading ? <Text className="text-body-md text-text-muted">Memuat...</Text> : null}

        {!isLoading && !isError && list.length === 0 ? (
          <View className="items-center gap-xs rounded-lg border border-border bg-surface p-lg">
            <Text className="text-body-md font-semibold text-text-primary">Belum ada pengumuman</Text>
            <Text className="text-center text-caption text-text-muted">
              Pengumuman baru dari HQ akan muncul di sini.
            </Text>
          </View>
        ) : null}

        {!isLoading && !isError ? (
          <View className="gap-sm">
            {list.map((item) => (
              <PengumumanCard key={item.id} item={item} onPress={setSheetItem} />
            ))}
          </View>
        ) : null}
      </ScrollView>

      {canManage ? (
        <View className="border-t border-border bg-surface p-md">
          <Button label="+ Buat Pengumuman" variant="primary" onPress={() => navigation.navigate("PengumumanForm")} />
        </View>
      ) : null}

      <PengumumanDetailSheet item={sheetItem} isAdmin={canManage} onClose={() => setSheetItem(null)} onHapus={handleHapus} />
    </SafeAreaView>
  );
}
