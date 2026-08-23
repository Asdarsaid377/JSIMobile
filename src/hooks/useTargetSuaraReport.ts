import { useQuery } from "@tanstack/react-query";

import { fetchDptListAll, fetchKecamatanList, fetchKelurahanList } from "@/services/dpt";
import { buildTargetSuaraKey, getTargetSuaraMap } from "@/lib/targetSuara";
import type { TargetSuaraLevel } from "@/lib/targetSuara";

export const TARGET_SUARA_LEVEL_LABEL: Record<TargetSuaraLevel, string> = {
  kab: "Kabupaten",
  kec: "Kecamatan",
  kel: "Kelurahan",
  tps: "TPS",
};

// Discriminated union — tiap level butuh param navigasi berbeda buat drill-down
// balik dari daftar laporan (lihat TargetSuaraReportScreen.tsx). kabWilId TIDAK
// disertakan di sini (screen yang render laporan ini sudah tahu kabWilId-nya
// sendiri dari route params, sama untuk semua entry).
export type TargetSuaraReportEntry =
  | { level: "kab"; key: string; nama: string; totalDpt: number; target: number; percent: number }
  | { level: "kec"; key: string; nama: string; totalDpt: number; target: number; percent: number; kecWilId: number }
  | { level: "kel"; key: string; nama: string; totalDpt: number; target: number; percent: number; kelWilId: number }
  | {
      level: "tps";
      key: string;
      nama: string;
      totalDpt: number;
      target: number;
      percent: number;
      kelWilId: number;
      noTps: number;
      namaTps: string;
    };

export type TargetSuaraCompletion = { filled: number; total: number };

export type TargetSuaraReport = {
  entries: TargetSuaraReportEntry[]; // cuma yang SUDAH diisi target, sorted desc by target
  completion: Record<TargetSuaraLevel, TargetSuaraCompletion>;
};

function percentOf(target: number, totalDpt: number): number {
  return totalDpt > 0 ? Math.round((target / totalDpt) * 100) : 0;
}

// Agregasi "laporan Target Suara" 1 kabupaten — scan SEMUA kecamatan→kelurahan
// (fetch paralel) + TPS (diturunkan dari record DPT, sama pola
// TargetSuaraKelurahanScreen), gabung dengan target lokal yang sudah diisi
// (SecureStore). Tidak menjumlahkan target lintas-level jadi 1 angka "grand
// total" — kab/kec/kel/tps diisi INDEPENDEN satu sama lain (bukan hierarkis
// auto-sum), menjumlahkannya akan double-count. Laporan ini sengaja cuma
// menampilkan daftar per-entry + completion rate per level, bukan 1 angka
// gabungan yang bisa menyesatkan.
async function fetchTargetSuaraReport(kabWilId: number, kabNama: string, kabTotalDpt: number): Promise<TargetSuaraReport> {
  const [dptRecords, kecamatanList, targetMap] = await Promise.all([
    fetchDptListAll(kabWilId),
    fetchKecamatanList(kabWilId),
    getTargetSuaraMap(),
  ]);

  const kelurahanLists = await Promise.all(kecamatanList.map((kec) => fetchKelurahanList(kabWilId, kec.wilId)));
  const allKelurahan = kelurahanLists.flat();

  const tpsMap = new Map<string, { kelWilId: number; noTps: number; namaTps: string; count: number }>();
  for (const record of dptRecords) {
    const mapKey = `${record.idKel}:${record.noTps}`;
    const existing = tpsMap.get(mapKey);
    tpsMap.set(mapKey, {
      kelWilId: record.idKel,
      noTps: record.noTps,
      namaTps: record.namaTps,
      count: (existing?.count ?? 0) + 1,
    });
  }
  const tpsList = Array.from(tpsMap.values());

  const entries: TargetSuaraReportEntry[] = [];

  const kabTarget = targetMap[buildTargetSuaraKey("kab", kabWilId)];
  const kabFilled = typeof kabTarget === "number" ? 1 : 0;
  if (typeof kabTarget === "number") {
    entries.push({
      level: "kab",
      key: buildTargetSuaraKey("kab", kabWilId),
      nama: kabNama,
      totalDpt: kabTotalDpt,
      target: kabTarget,
      percent: percentOf(kabTarget, kabTotalDpt),
    });
  }

  let kecFilled = 0;
  for (const kec of kecamatanList) {
    const target = targetMap[buildTargetSuaraKey("kec", kec.wilId)];
    if (typeof target !== "number") continue;
    kecFilled += 1;
    entries.push({
      level: "kec",
      key: buildTargetSuaraKey("kec", kec.wilId),
      nama: kec.nama,
      totalDpt: kec.totalDpt,
      target,
      percent: percentOf(target, kec.totalDpt),
      kecWilId: kec.wilId,
    });
  }

  let kelFilled = 0;
  for (const kel of allKelurahan) {
    const target = targetMap[buildTargetSuaraKey("kel", kel.wilId)];
    if (typeof target !== "number") continue;
    kelFilled += 1;
    entries.push({
      level: "kel",
      key: buildTargetSuaraKey("kel", kel.wilId),
      nama: kel.nama,
      totalDpt: kel.totalDpt,
      target,
      percent: percentOf(target, kel.totalDpt),
      kelWilId: kel.wilId,
    });
  }

  let tpsFilled = 0;
  for (const tps of tpsList) {
    const target = targetMap[buildTargetSuaraKey("tps", tps.kelWilId, tps.noTps)];
    if (typeof target !== "number") continue;
    tpsFilled += 1;
    entries.push({
      level: "tps",
      key: buildTargetSuaraKey("tps", tps.kelWilId, tps.noTps),
      nama: `TPS ${tps.namaTps}`,
      totalDpt: tps.count,
      target,
      percent: percentOf(target, tps.count),
      kelWilId: tps.kelWilId,
      noTps: tps.noTps,
      namaTps: tps.namaTps,
    });
  }

  entries.sort((a, b) => b.target - a.target);

  return {
    entries,
    completion: {
      kab: { filled: kabFilled, total: 1 },
      kec: { filled: kecFilled, total: kecamatanList.length },
      kel: { filled: kelFilled, total: allKelurahan.length },
      tps: { filled: tpsFilled, total: tpsList.length },
    },
  };
}

export function useTargetSuaraReport(kabWilId: number, kabNama: string, kabTotalDpt: number) {
  return useQuery({
    queryKey: ["targetSuara", "report", kabWilId],
    queryFn: () => fetchTargetSuaraReport(kabWilId, kabNama, kabTotalDpt),
  });
}
