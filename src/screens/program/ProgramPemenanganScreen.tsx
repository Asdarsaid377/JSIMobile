import { useState } from "react";
import { FlatList, RefreshControl, Text, View } from "react-native";

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";

import { DtdoorCard } from "@/components/dtdoor/DtdoorCard";
import { DtdoorCardSkeleton } from "@/components/dtdoor/DtdoorCardSkeleton";
import { DtdoorEmptyState } from "@/components/dtdoor/DtdoorEmptyState";
import type { ProgramTab } from "@/components/dtdoor/DtdoorSegmentedControl";
import { DtdoorSegmentedControl } from "@/components/dtdoor/DtdoorSegmentedControl";
import { DtdoorSummaryCard } from "@/components/dtdoor/DtdoorSummaryCard";
import { GotvCard } from "@/components/gotv/GotvCard";
import { GotvCardSkeleton } from "@/components/gotv/GotvCardSkeleton";
import { GotvEmptyState } from "@/components/gotv/GotvEmptyState";
import { GotvSummaryCard } from "@/components/gotv/GotvSummaryCard";
import { HomeQuickAccessItem } from "@/components/home/HomeQuickAccessItem";
import { Button } from "@/components/ui/Button";
import { useDtdoorCount } from "@/hooks/useDtdoorCount";
import { useDtdoorList } from "@/hooks/useDtdoorList";
import { useGotvCount } from "@/hooks/useGotvCount";
import { useGotvList } from "@/hooks/useGotvList";
import type { ProgramStackParamList } from "@/navigation/ProgramStack";
import type { Dtdoor } from "@/types/dtdoor";
import type { Gotv } from "@/types/gotv";

export function ProgramPemenanganScreen() {
  const [activeTab, setActiveTab] = useState<ProgramTab>("doorToDoor");
  const navigation = useNavigation<NativeStackNavigationProp<ProgramStackParamList, "ProgramPemenangan">>();

  const dtdoorCountQuery = useDtdoorCount();
  const dtdoorListQuery = useDtdoorList();
  const gotvCountQuery = useGotvCount();
  const gotvListQuery = useGotvList();

  const dtdoorItems: Dtdoor[] = dtdoorListQuery.data?.pages.flatMap((page) => page.data) ?? [];
  const gotvItems: Gotv[] = gotvListQuery.data?.pages.flatMap((page) => page.data) ?? [];

  function handleAddDtdoor() {
    navigation.navigate("DtdoorForm");
  }

  function handleAddGotv() {
    navigation.navigate("GotvForm");
  }

  function handleViewKekuatanWilayah() {
    navigation.navigate("KekuatanWilayah");
  }

  function handleViewKekuatanPemilih() {
    navigation.navigate("KekuatanPemilih");
  }

  function handleViewSwingVoterFollowUp() {
    navigation.navigate("SwingVoterFollowUp");
  }

  function handleViewDtdoorAnalytics() {
    navigation.navigate("DtdoorAnalytics");
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <View className="gap-sm px-margin-mobile pt-sm">
        <Text className="text-headline-md font-semibold text-text-primary">Program Pemenangan</Text>
        <DtdoorSegmentedControl active={activeTab} onChange={setActiveTab} />
      </View>

      {activeTab === "doorToDoor" ? (
        <FlatList
          data={dtdoorItems}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          ListHeaderComponent={
            <View className="gap-sm pb-sm">
              <DtdoorSummaryCard count={dtdoorCountQuery.data} isLoading={dtdoorCountQuery.isLoading} />
              <Button label="+ Input Kunjungan Baru" variant="primary" onPress={handleAddDtdoor} />
              <View className="flex-row flex-wrap rounded-lg border border-border bg-surface p-sm">
                <HomeQuickAccessItem
                  icon="map-outline"
                  label="Kekuatan Wilayah"
                  widthClass="w-1/4"
                  onPress={handleViewKekuatanWilayah}
                />
                <HomeQuickAccessItem
                  icon="podium-outline"
                  label="Skor Pemilih"
                  widthClass="w-1/4"
                  onPress={handleViewKekuatanPemilih}
                />
                <HomeQuickAccessItem
                  icon="alert-circle-outline"
                  label="Follow-up Swing"
                  widthClass="w-1/4"
                  onPress={handleViewSwingVoterFollowUp}
                />
                <HomeQuickAccessItem
                  icon="stats-chart-outline"
                  label="Ringkasan Data"
                  widthClass="w-1/4"
                  onPress={handleViewDtdoorAnalytics}
                />
              </View>
              {dtdoorListQuery.isError ? (
                <View className="gap-xs">
                  <Text className="text-body-md text-danger">Gagal memuat daftar kunjungan.</Text>
                  <Button label="Coba Lagi" variant="secondary" onPress={() => void dtdoorListQuery.refetch()} />
                </View>
              ) : null}
              {dtdoorListQuery.isLoading ? (
                <View className="gap-xs">
                  <DtdoorCardSkeleton />
                  <DtdoorCardSkeleton />
                  <DtdoorCardSkeleton />
                </View>
              ) : null}
            </View>
          }
          renderItem={({ item }) => <DtdoorCard item={item} />}
          ItemSeparatorComponent={() => <View className="h-xs" />}
          ListEmptyComponent={
            !dtdoorListQuery.isLoading && !dtdoorListQuery.isError ? (
              <DtdoorEmptyState onAdd={handleAddDtdoor} />
            ) : null
          }
          onEndReached={() => {
            if (dtdoorListQuery.hasNextPage && !dtdoorListQuery.isFetchingNextPage) {
              void dtdoorListQuery.fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={dtdoorListQuery.isFetchingNextPage ? <DtdoorCardSkeleton /> : null}
          refreshControl={
            <RefreshControl
              refreshing={dtdoorListQuery.isRefetching}
              onRefresh={() => void dtdoorListQuery.refetch()}
            />
          }
        />
      ) : (
        <FlatList
          data={gotvItems}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          ListHeaderComponent={
            <View className="gap-sm pb-sm">
              <GotvSummaryCard count={gotvCountQuery.data} isLoading={gotvCountQuery.isLoading} />
              <Button label="+ Input Kegiatan Baru" variant="primary" onPress={handleAddGotv} />
              {gotvListQuery.isError ? (
                <View className="gap-xs">
                  <Text className="text-body-md text-danger">Gagal memuat daftar kegiatan.</Text>
                  <Button label="Coba Lagi" variant="secondary" onPress={() => void gotvListQuery.refetch()} />
                </View>
              ) : null}
              {gotvListQuery.isLoading ? (
                <View className="gap-xs">
                  <GotvCardSkeleton />
                  <GotvCardSkeleton />
                  <GotvCardSkeleton />
                </View>
              ) : null}
            </View>
          }
          renderItem={({ item }) => <GotvCard item={item} />}
          ItemSeparatorComponent={() => <View className="h-xs" />}
          ListEmptyComponent={
            !gotvListQuery.isLoading && !gotvListQuery.isError ? <GotvEmptyState onAdd={handleAddGotv} /> : null
          }
          onEndReached={() => {
            if (gotvListQuery.hasNextPage && !gotvListQuery.isFetchingNextPage) {
              void gotvListQuery.fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={gotvListQuery.isFetchingNextPage ? <GotvCardSkeleton /> : null}
          refreshControl={
            <RefreshControl refreshing={gotvListQuery.isRefetching} onRefresh={() => void gotvListQuery.refetch()} />
          }
        />
      )}
    </SafeAreaView>
  );
}
