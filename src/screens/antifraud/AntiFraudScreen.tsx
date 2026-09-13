import { useMemo, useState } from "react";
import { Alert, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { AntiFraudCaseCard } from "@/components/antifraud/AntiFraudCaseCard";
import { AntiFraudEvidenceSheet } from "@/components/antifraud/AntiFraudEvidenceSheet";
import { AntiFraudJenisRow } from "@/components/antifraud/AntiFraudJenisRow";
import { AntiFraudRelawanRow } from "@/components/antifraud/AntiFraudRelawanRow";
import { AntiFraudSummaryCard } from "@/components/antifraud/AntiFraudSummaryCard";
import { Button } from "@/components/ui/Button";
import { useAntiFraudSnapshot, useApproveFraudCase, useRejectFraudCase } from "@/hooks/useAntiFraud";
import { useHideTabBar } from "@/hooks/useHideTabBar";
import type { FraudCase } from "@/types/antifraud";

type FraudTab = "anomali" | "relawan";

// Referensi: artboard "14 · VERIFIKASI KUNJUNGAN / ANTI-FRAUD (SEKUNDER —
// DRAWER)" di project Claude Design user ("Desain Mobile JSI Dashboard",
// 160ea937-2f8a-4ff4-9977-f8bc398c90a0), dibaca via DesignSync 2026-08-22.
// 2026-08-25: modul backend `antifraud` sekarang ADA — WIRED penuh ke
// GET /antifraud/summary + PATCH /antifraud/cases/:id/approve|reject
// sungguhan (lihat services/antifraud.ts, hooks/useAntiFraud.ts).
export function AntiFraudScreen() {
  const snapshotQuery = useAntiFraudSnapshot();
  const approveMutation = useApproveFraudCase();
  const rejectMutation = useRejectFraudCase();
  useHideTabBar();

  const [tab, setTab] = useState<FraudTab>("anomali");
  const [sheetCase, setSheetCase] = useState<FraudCase | null>(null);
  // GET /antifraud/summary (backend) belum menyertakan `status` di array
  // `cases` (lihat catatan di types/antifraud.ts) — jadi kasus yang baru saja
  // di-approve/reject TIDAK otomatis hilang dari respons berikutnya. Filter
  // sesi-lokal ini menyembunyikannya dari tab "Perlu Ditinjau" selama layar
  // masih terbuka; reset lagi begitu screen di-remount (navigasi keluar-masuk
  // atau restart app) sampai backend menambah field status ke mapping itu.
  const [reviewedIds, setReviewedIds] = useState<Set<number>>(new Set());

  const jenisAnomali = snapshotQuery.data?.jenisAnomali ?? [];
  const cases = (snapshotQuery.data?.cases ?? []).filter((item) => !reviewedIds.has(item.id));
  const relawanSkor = snapshotQuery.data?.relawanSkor ?? [];

  const jenisAnomaliWithPct = useMemo(() => {
    const max = jenisAnomali.reduce((m, item) => Math.max(m, item.jumlahKasus), 0);
    return jenisAnomali.map((item) => ({
      ...item,
      percentOfMax: max > 0 ? (item.jumlahKasus / max) * 100 : 0,
    }));
  }, [jenisAnomali]);

  function handleApprove(item: FraudCase): void {
    setSheetCase(null);
    approveMutation.mutate(item.id, {
      onSuccess: () => {
        setReviewedIds((prev) => new Set(prev).add(item.id));
        Alert.alert("Disetujui", `Kunjungan ${item.relawan} → ${item.target} ditandai disetujui.`);
      },
      onError: (error) => Alert.alert("Gagal menyetujui", error.message),
    });
  }

  function handleReject(item: FraudCase): void {
    setSheetCase(null);
    rejectMutation.mutate(item.id, {
      onSuccess: () => {
        setReviewedIds((prev) => new Set(prev).add(item.id));
        Alert.alert("Ditolak", `Kunjungan ${item.relawan} → ${item.target} ditandai ditolak.`);
      },
      onError: (error) => Alert.alert("Gagal menolak", error.message),
    });
  }

  const isLoading = snapshotQuery.isLoading;
  const isError = snapshotQuery.isError;

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 12 }}
        className="flex-1"
        refreshControl={<RefreshControl refreshing={snapshotQuery.isRefetching} onRefresh={() => void snapshotQuery.refetch()} />}
      >
        <Text className="text-caption text-text-muted">
          Setiap kunjungan D2D wajib GPS-stamp, foto, dan timestamp
        </Text>

        <View className="flex-row gap-xs rounded-lg bg-surface-secondary p-xs">
          <Pressable
            onPress={() => setTab("anomali")}
            className={`min-h-[44px] flex-1 items-center justify-center rounded-md active:opacity-80 ${
              tab === "anomali" ? "bg-primary" : "bg-transparent"
            }`}
          >
            <Text className={`text-body-md font-semibold ${tab === "anomali" ? "text-text-inverse" : "text-text-muted"}`}>
              Anomali
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setTab("relawan")}
            className={`min-h-[44px] flex-1 items-center justify-center rounded-md active:opacity-80 ${
              tab === "relawan" ? "bg-primary" : "bg-transparent"
            }`}
          >
            <Text className={`text-body-md font-semibold ${tab === "relawan" ? "text-text-inverse" : "text-text-muted"}`}>
              Skor Relawan
            </Text>
          </Pressable>
        </View>

        {snapshotQuery.data ? (
          <AntiFraudSummaryCard
            tervalidasi={snapshotQuery.data.kunjunganTervalidasi}
            total={snapshotQuery.data.totalKunjungan}
            anomaliCount={cases.length}
          />
        ) : null}

        {isError ? (
          <View className="gap-xs">
            <Text className="text-body-md text-danger">Gagal memuat data verifikasi kunjungan.</Text>
            <Button label="Coba Lagi" variant="secondary" onPress={() => void snapshotQuery.refetch()} />
          </View>
        ) : null}

        {isLoading ? <Text className="text-body-md text-text-muted">Memuat...</Text> : null}

        {!isLoading && !isError && tab === "anomali" ? (
          <>
            <View className="gap-sm">
              <Text className="text-body-lg font-semibold text-text-primary">Jenis Anomali Terdeteksi</Text>
              <View className="gap-md rounded-lg border border-border bg-surface p-md">
                {jenisAnomaliWithPct.map((item) => (
                  <AntiFraudJenisRow
                    key={item.nama}
                    nama={item.nama}
                    jumlahKasus={item.jumlahKasus}
                    percentOfMax={item.percentOfMax}
                    severity={item.severity}
                  />
                ))}
              </View>
            </View>

            <View className="gap-sm">
              <Text className="text-body-lg font-semibold text-text-primary">Perlu Ditinjau</Text>
              <View className="gap-sm">
                {cases.map((item) => (
                  <AntiFraudCaseCard key={item.id} item={item} onPress={setSheetCase} />
                ))}
              </View>
            </View>
          </>
        ) : null}

        {!isLoading && !isError && tab === "relawan" ? (
          <>
            <View className="gap-sm">
              <Text className="text-body-lg font-semibold text-text-primary">Skor Kredibilitas Relawan</Text>
              <View className="gap-sm">
                {relawanSkor.map((item) => (
                  <AntiFraudRelawanRow key={item.id} item={item} />
                ))}
              </View>
            </View>

            <View className="flex-row gap-sm rounded-lg bg-accent-soft p-md">
              <View className="mt-xs h-2 w-2 rounded-full bg-accent" />
              <Text className="flex-1 text-caption text-accent">
                Skor turun otomatis saat kunjungan ditolak korwil. Relawan dengan skor di bawah 60 tidak bisa menginput
                kunjungan tanpa approval.
              </Text>
            </View>
          </>
        ) : null}
      </ScrollView>

      <AntiFraudEvidenceSheet
        item={sheetCase}
        onClose={() => setSheetCase(null)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </SafeAreaView>
  );
}
