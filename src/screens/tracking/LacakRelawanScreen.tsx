import { useCallback } from "react";
import { FlatList, RefreshControl, Text, View } from "react-native";

import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TrackingEmptyState } from "@/components/tracking/TrackingEmptyState";
import { TrackingMapView } from "@/components/tracking/TrackingMapView";
import { TrackingMemberRow } from "@/components/tracking/TrackingMemberRow";
import { TrackingMemberRowSkeleton } from "@/components/tracking/TrackingMemberRowSkeleton";
import { useTimsesList } from "@/hooks/useTimsesList";
import type { TimsesMember } from "@/types/timses";

export function LacakRelawanScreen() {
  const listQuery = useTimsesList();

  useFocusEffect(
    useCallback(() => {
      void listQuery.refetch();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const members: TimsesMember[] = listQuery.data ?? [];
  const total = members.length;
  const online = members.filter((member) => member.statusOnline === "online").length;
  const isLoading = listQuery.isLoading;
  const isError = listQuery.isError;

  return (
    // Dipush dari HomeStack (Feature 08) — header native (title "Lacak Relawan" +
    // back chevron) menggantikan heading in-content yang dipakai saat masih jadi tab
    // root, jadi edges di sini "bottom" saja (top sudah ditangani header).
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-background">
      <View className="items-end px-margin-mobile pt-sm pb-sm">
        {/* Label "Real-time" di desain diganti "Update berkala" — backend gateway
            socket.io tidak pernah emit apapun (temuan sama dengan Feature 06,
            lihat progress-tracker.md Decisions), jadi peta ini snapshot yang
            di-refresh tiap fokus screen + beacon lokasi 30 detik, bukan realtime
            sungguhan. Label jujur, visual pill tetap dipertahankan dari desain. */}
        <Badge label="Update berkala" variant="success" dot />
      </View>

      <View className="flex-1">
        <TrackingMapView members={members} />

        <View className="absolute inset-x-0 bottom-0 h-[45%] rounded-t-xl border-t border-border bg-surface px-margin-mobile pt-sm">
          <View className="mb-sm h-1 w-10 self-center rounded-full bg-border" />
          <View className="flex-row items-center justify-between pb-sm">
            <Text className="text-body-lg font-semibold text-text-primary">Anggota Tim ({total})</Text>
            <Text className="text-body-md font-semibold text-success">{online} online</Text>
          </View>

          {isError ? (
            <View className="gap-sm pb-md">
              <Text className="text-body-md text-danger">Gagal memuat daftar anggota timses.</Text>
              <Button label="Coba Lagi" variant="secondary" onPress={() => void listQuery.refetch()} />
            </View>
          ) : null}

          {isLoading ? (
            <View className="gap-xs">
              <TrackingMemberRowSkeleton />
              <TrackingMemberRowSkeleton />
              <TrackingMemberRowSkeleton />
            </View>
          ) : (
            <FlatList
              className="flex-1"
              data={members}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => <TrackingMemberRow item={item} />}
              ItemSeparatorComponent={() => <View className="h-px bg-border" />}
              ListEmptyComponent={!isError ? <TrackingEmptyState /> : null}
              refreshControl={
                <RefreshControl refreshing={listQuery.isRefetching} onRefresh={() => void listQuery.refetch()} />
              }
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
