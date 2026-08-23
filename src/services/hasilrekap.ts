import axios from "axios";

import { apiClient } from "@/lib/api/client";
import { isMockApiEnabled, mockDelay } from "@/lib/api/mock";
import type {
  HasilRekapCaleg,
  HasilRekapCalegDaerahSuara,
  HasilRekapDapil,
  HasilRekapDetailSnapshot,
  HasilRekapKabupatenSnapshot,
  HasilRekapKecamatanSnapshot,
  HasilRekapKelurahanSnapshot,
  HasilRekapPartaiSuara,
  HasilRekapRegion,
  HasilRekapTps,
} from "@/types/hasilrekap";

// **2026-08-23: WIRED ke backend real** `/Users/asdarsaid/JSI/api/src/dpr`
// (module `DprController`, route `hasil-rekap/...`) — kontrak diverifikasi
// LIVE via curl langsung ke production (bukan cuma baca kode), lihat
// api-standards.md § Hasil Rekap untuk detail lengkap tiap level. Pakai
// `apiClient` biasa (BUKAN client terpisah lagi — sempat dibuat `rekapApiClient`
// dengan asumsi cuma modul ini yang tanpa prefix `/api`, ternyata SELURUH
// backend tidak pasang prefix itu, termasuk auth — lihat koreksi base URL
// `EXPO_PUBLIC_API_URL` di api-standards.md § Auth Flow). Modul ini tidak
// ada auth guard, tapi token yang tetap terkirim dari `apiClient` interceptor
// tidak masalah — backend abaikan saja. Mock (`DAPIL_TREE` dst. di bawah)
// TETAP dipertahankan (bukan dihapus) — pola sama semua service lain di app
// ini, supaya `EXPO_PUBLIC_USE_MOCK_API=true` masih bisa dipakai untuk demo
// offline kapan pun dibutuhkan.
type ApiRegionSuara = { id: number; nama: string; suara: number };
type ApiCalegGroup<K extends string> = { id: number; nama: string } & Record<K, ApiRegionSuara[]>;
type ApiPartaiCalegGroup<K extends string> = {
  id: number;
  nama: string;
  nomor_urut: number;
  suaraPartai: number;
  suaraCalegs: number;
  suaraTotal: number;
  calegs: ApiCalegGroup<K>[];
};
type ApiPartaiSummary = { id: number; nama: string; suara: number; name?: string };
type ApiDapilItem = { id: string; nama: string; jmlKursi: number; hargaKursi: number; partai: ApiPartaiSummary[] };
type ApiDapilListResponse = { dapil: ApiDapilItem[] };
type ApiRekapDetailResponse<K extends string> = { partai_calegs: ApiPartaiCalegGroup<K>[] };

// Levels 2-5 (Kabupaten/Kecamatan/Kelurahan/Detail) semua balas struktur
// nested yang SAMA (`partai_calegs[].calegs[].<regionKey>[]`) — cuma nama
// key-nya beda per level (`kabupatens`/`keluarahans`/`keluarahans`/`tps`,
// ada typo `keluarahans` di backend, lihat api-standards.md). 1 helper untuk
// semua level: bangun (a) ringkasan partai (langsung dari `partai_calegs`,
// sudah bawa `suaraPartai`/`suaraCalegs`/`suaraTotal` — sengaja TIDAK baca
// field top-level `partai`/`partais` yang penamaannya tidak konsisten antar
// level), (b) list sub-wilayah (akumulasi suara lintas semua caleg×partai
// per id wilayah, plus partai mana yang unggul di situ), (c) top-5 caleg
// lintas semua partai dengan breakdown penuh per sub-wilayah.
function buildFromPartaiCalegs<K extends string>(
  partaiCalegs: ApiPartaiCalegGroup<K>[],
  regionKey: K,
): { partaiSuara: HasilRekapPartaiSuara[]; regions: HasilRekapRegion[]; calegList: HasilRekapCaleg[] } {
  const partaiSuara: HasilRekapPartaiSuara[] = partaiCalegs
    .map((p) => ({ partai: p.nama, suaraPartai: p.suaraPartai, suaraCaleg: p.suaraCalegs, suaraTotal: p.suaraTotal }))
    .sort((a, b) => b.suaraTotal - a.suaraTotal);

  const regionMap = new Map<number, { nama: string; totalSuara: number; byPartai: Map<string, number> }>();
  const flatCalegs: { nama: string; partai: string; totalSuara: number; breakdown: HasilRekapCalegDaerahSuara[] }[] = [];

  for (const partaiGroup of partaiCalegs) {
    for (const caleg of partaiGroup.calegs) {
      const regionEntries = caleg[regionKey];
      let calegTotal = 0;
      const breakdown: HasilRekapCalegDaerahSuara[] = [];
      for (const region of regionEntries) {
        calegTotal += region.suara;
        breakdown.push({ nama: region.nama, suara: region.suara });

        const entry = regionMap.get(region.id) ?? { nama: region.nama, totalSuara: 0, byPartai: new Map<string, number>() };
        entry.totalSuara += region.suara;
        entry.byPartai.set(partaiGroup.nama, (entry.byPartai.get(partaiGroup.nama) ?? 0) + region.suara);
        regionMap.set(region.id, entry);
      }
      breakdown.sort((a, b) => b.suara - a.suara);
      flatCalegs.push({ nama: caleg.nama, partai: partaiGroup.nama, totalSuara: calegTotal, breakdown });
    }
  }

  const regions: HasilRekapRegion[] = Array.from(regionMap.entries()).map(([id, entry]) => {
    let partaiUnggul = "-";
    let max = -1;
    entry.byPartai.forEach((suara, partai) => {
      if (suara > max) {
        max = suara;
        partaiUnggul = partai;
      }
    });
    return { id, nama: entry.nama, totalSuara: entry.totalSuara, partaiUnggul };
  });

  const calegList: HasilRekapCaleg[] = flatCalegs
    .sort((a, b) => b.totalSuara - a.totalSuara)
    .slice(0, 5)
    .map((c) => ({
      nama: c.nama,
      partai: c.partai,
      suara: c.totalSuara,
      daerahUnggul: c.breakdown[0]?.nama ?? "-",
      breakdown: c.breakdown,
    }));

  return { partaiSuara, regions, calegList };
}

// "TPS 1"/"TPS 2" dst. → 1/2 — fallback 0 kalau format berubah (tidak boleh crash).
function parseTpsNumber(nama: string): number {
  const match = nama.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function mapDapil(item: ApiDapilItem): HasilRekapDapil {
  const totalSuara = item.partai.reduce((sum, p) => sum + p.suara, 0);
  const top = item.partai.reduce<ApiPartaiSummary | undefined>(
    (best, p) => (p.suara > (best?.suara ?? -1) ? p : best),
    undefined,
  );
  return {
    id: Number(item.id),
    nama: item.nama,
    jumlahKursi: item.jmlKursi,
    totalSuara,
    partaiUnggul: top?.name ?? top?.nama ?? "-",
  };
}

// Dua-tingkat error handling (pola sama services/dtdoor.ts): tampilkan pesan
// dari backend kalau ada (`error.response.data.message`), fallback pesan
// Indonesia kalau bukan AxiosError dengan response (network/timeout).
function toHumanError(error: unknown, fallbackMessage: string): Error {
  if (axios.isAxiosError(error) && error.response) {
    const message = (error.response.data as { message?: unknown } | undefined)?.message;
    return new Error(typeof message === "string" ? message : fallbackMessage);
  }
  return new Error("Gagal terhubung ke server. Periksa koneksi internet Anda.");
}

// 8 partai nasional umum dipakai sebagai partai demo, dengan bobot relatif
// tetap (deterministik) supaya urutan "partai unggul" masuk akal & stabil
// antar navigasi, bukan acak murni tiap render.
const PARTAI_WEIGHTS: { nama: string; bobot: number }[] = [
  { nama: "PDIP", bobot: 22 },
  { nama: "Golkar", bobot: 16 },
  { nama: "Gerindra", bobot: 15 },
  { nama: "PKB", bobot: 12 },
  { nama: "NasDem", bobot: 10 },
  { nama: "PKS", bobot: 10 },
  { nama: "Demokrat", bobot: 9 },
  { nama: "PAN", bobot: 6 },
];

const CALEG_NAMES = [
  "H. Dedi Mulyadi, S.H.",
  "Hj. Euis Kurniasih",
  "Ahmad Fauzan Ridwan",
  "Rina Marlina, S.Sos.",
  "Budi Santoso",
  "Hj. Siti Aisyah, M.Ag.",
];

// Hash string → seed 32-bit, lalu PRNG mulberry32 — deterministik per
// scope (kombinasi id wilayah) supaya angka mock STABIL saat user
// navigasi bolak-balik (tap Dapil A dua kali harus tampil angka yang
// sama), bukan random ulang tiap render/refetch.
function hashSeed(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generatePartaiSuara(seedKey: string, magnitude: number): HasilRekapPartaiSuara[] {
  const rand = mulberry32(hashSeed(seedKey));
  return PARTAI_WEIGHTS.map(({ nama, bobot }) => {
    const jitter = 0.7 + rand() * 0.6;
    const suaraTotal = Math.max(0, Math.round(((magnitude * bobot) / 100) * jitter));
    const suaraPartai = Math.round(suaraTotal * (0.25 + rand() * 0.2));
    return { partai: nama, suaraPartai, suaraCaleg: suaraTotal - suaraPartai, suaraTotal };
  });
}

function summarize(seedKey: string, magnitude: number): { totalSuaraSah: number; partaiSuara: HasilRekapPartaiSuara[] } {
  const partaiSuara = generatePartaiSuara(seedKey, magnitude).sort((a, b) => b.suaraTotal - a.suaraTotal);
  const totalSuaraSah = partaiSuara.reduce((sum, item) => sum + item.suaraTotal, 0);
  return { totalSuaraSah, partaiSuara };
}

function topPartai(partaiSuara: HasilRekapPartaiSuara[]): string {
  return partaiSuara[0]?.partai ?? "-";
}

// Breakdown PENUH suara 1 caleg di SETIAP sub-wilayah dalam `regionNames` —
// persis kelengkapan data kolom pivot caleg × sub-wilayah di web, jumlah
// tiap baris di-derive supaya total-nya = `totalSuaraCaleg` (bobot acak
// seeded, bukan rata rata supaya tidak terlihat artifisial). Terurut desc.
// Kalau `regionNames` kosong, fallback 1 baris pakai `seedKey` sendiri.
function generateCalegBreakdown(seedKey: string, totalSuaraCaleg: number, regionNames: string[]): HasilRekapCalegDaerahSuara[] {
  if (regionNames.length === 0) return [{ nama: seedKey, suara: totalSuaraCaleg }];
  const rand = mulberry32(hashSeed(seedKey));
  const weights = regionNames.map(() => 0.4 + rand());
  const weightSum = weights.reduce((sum, w) => sum + w, 0);
  return regionNames
    .map((nama, index) => ({ nama, suara: Math.round((weights[index] / weightSum) * totalSuaraCaleg) }))
    .sort((a, b) => b.suara - a.suara);
}

// Menggantikan kolom pivot caleg × sub-wilayah di web (`DprRiProvinsi.jsx`
// dst.) — 1 caleg per partai (top 5 partai, `partaiSuara` SUDAH terurut
// desc). `breakdown` bawa data selengkap web (suara caleg di SETIAP
// sub-wilayah dari `regionNames` — list Kabupaten/Kecamatan/Kelurahan/TPS
// yang SEDANG ditampilkan di layar itu), `daerahUnggul` cuma cache
// `breakdown[0].nama` untuk dipakai `HasilRekapCalegRow` (list ringkas)
// tanpa perlu tahu bentuk `breakdown`.
function generateCalegList(seedKey: string, partaiSuara: HasilRekapPartaiSuara[], regionNames: string[]): HasilRekapCaleg[] {
  return partaiSuara.slice(0, 5).map((item, index) => {
    const breakdown = generateCalegBreakdown(`caleg-${seedKey}-${index}`, item.suaraCaleg, regionNames);
    return {
      nama: CALEG_NAMES[index % CALEG_NAMES.length],
      partai: item.partai,
      suara: item.suaraCaleg,
      daerahUnggul: breakdown[0]?.nama ?? seedKey,
      breakdown,
    };
  });
}

type KelurahanNode = { id: number; nama: string };
type KecamatanNode = { id: number; nama: string; kelurahan: KelurahanNode[] };
type KabupatenNode = { id: number; nama: string; kecamatan: KecamatanNode[] };
type DapilNode = { id: number; nama: string; jumlahKursi: number; kabupaten: KabupatenNode[] };

// Pohon wilayah kecil hand-authored (3 dapil, tiap dapil 1-2 kabupaten) —
// pola sama dengan MOCK_SNAPSHOT fitur lain (AntiFraud/Isu Aspirasi): cukup
// untuk demo drill penuh, bukan replika data pemilu sungguhan. Cabang
// "Cileunyi" reuse 4 kelurahan yang sama dengan fitur lain (QuickCount/
// Tokoh/Isu Aspirasi) untuk kontinuitas dataset demo lintas fitur.
const DAPIL_TREE: DapilNode[] = [
  {
    id: 1,
    nama: "Dapil Jabar I",
    jumlahKursi: 8,
    kabupaten: [
      {
        id: 101,
        nama: "Bandung Barat",
        kecamatan: [
          {
            id: 1001,
            nama: "Cileunyi",
            kelurahan: [
              { id: 10001, nama: "Cileunyi Kulon" },
              { id: 10002, nama: "Cinunuk" },
              { id: 10003, nama: "Cileunyi Wetan" },
              { id: 10004, nama: "Cimekar" },
            ],
          },
          {
            id: 1002,
            nama: "Cililin",
            kelurahan: [
              { id: 10005, nama: "Cililin" },
              { id: 10006, nama: "Rancapanggung" },
            ],
          },
        ],
      },
      {
        id: 102,
        nama: "Bandung",
        kecamatan: [
          {
            id: 1003,
            nama: "Margahayu",
            kelurahan: [
              { id: 10007, nama: "Sayati" },
              { id: 10008, nama: "Margahayu Tengah" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 2,
    nama: "Dapil Jabar II",
    jumlahKursi: 7,
    kabupaten: [
      {
        id: 103,
        nama: "Cianjur",
        kecamatan: [
          {
            id: 1004,
            nama: "Cianjur Kota",
            kelurahan: [
              { id: 10009, nama: "Pamoyanan" },
              { id: 10010, nama: "Sawah Gede" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 3,
    nama: "Dapil Jabar III",
    jumlahKursi: 6,
    kabupaten: [
      {
        id: 104,
        nama: "Garut",
        kecamatan: [
          {
            id: 1005,
            nama: "Garut Kota",
            kelurahan: [
              { id: 10011, nama: "Kota Wetan" },
              { id: 10012, nama: "Kota Kulon" },
            ],
          },
        ],
      },
    ],
  },
];

function findDapil(dapilId: number): DapilNode {
  const dapil = DAPIL_TREE.find((item) => item.id === dapilId);
  if (!dapil) throw new Error("Dapil tidak ditemukan.");
  return dapil;
}
function findKabupaten(dapilId: number, kabupatenId: number): KabupatenNode {
  const kabupaten = findDapil(dapilId).kabupaten.find((item) => item.id === kabupatenId);
  if (!kabupaten) throw new Error("Kabupaten tidak ditemukan.");
  return kabupaten;
}
function findKecamatan(dapilId: number, kabupatenId: number, kecamatanId: number): KecamatanNode {
  const kecamatan = findKabupaten(dapilId, kabupatenId).kecamatan.find((item) => item.id === kecamatanId);
  if (!kecamatan) throw new Error("Kecamatan tidak ditemukan.");
  return kecamatan;
}

async function fetchDapilListMock(): Promise<HasilRekapDapil[]> {
  await mockDelay();
  return DAPIL_TREE.map((dapil) => {
    const { totalSuaraSah, partaiSuara } = summarize(`dapil-${dapil.id}`, 180000);
    return {
      id: dapil.id,
      nama: dapil.nama,
      jumlahKursi: dapil.jumlahKursi,
      totalSuara: totalSuaraSah,
      partaiUnggul: topPartai(partaiSuara),
    };
  });
}

function regionListFrom<T extends { id: number; nama: string }>(
  nodes: T[],
  seedPrefix: string,
  magnitude: number,
): HasilRekapRegion[] {
  return nodes.map((node) => {
    const { totalSuaraSah, partaiSuara } = summarize(`${seedPrefix}-${node.id}`, magnitude);
    return { id: node.id, nama: node.nama, totalSuara: totalSuaraSah, partaiUnggul: topPartai(partaiSuara) };
  });
}

async function fetchKabupatenSnapshotMock(dapilId: number): Promise<HasilRekapKabupatenSnapshot> {
  await mockDelay();
  const dapil = findDapil(dapilId);
  const seedKey = `dapil-${dapilId}`;
  const { totalSuaraSah, partaiSuara } = summarize(seedKey, 180000);
  const kabupatenNames = dapil.kabupaten.map((item) => item.nama);
  return {
    totalSuaraSah,
    partaiSuara,
    kabupaten: regionListFrom(dapil.kabupaten, `kab-d${dapilId}`, 60000),
    calegList: generateCalegList(seedKey, partaiSuara, kabupatenNames),
  };
}

async function fetchKecamatanSnapshotMock(dapilId: number, kabupatenId: number): Promise<HasilRekapKecamatanSnapshot> {
  await mockDelay();
  const kabupaten = findKabupaten(dapilId, kabupatenId);
  const seedKey = `kab-d${dapilId}-${kabupatenId}`;
  const { totalSuaraSah, partaiSuara } = summarize(seedKey, 60000);
  const kecamatanNames = kabupaten.kecamatan.map((item) => item.nama);
  return {
    totalSuaraSah,
    partaiSuara,
    kecamatan: regionListFrom(kabupaten.kecamatan, `kec-k${kabupatenId}`, 20000),
    calegList: generateCalegList(seedKey, partaiSuara, kecamatanNames),
  };
}

async function fetchKelurahanSnapshotMock(
  dapilId: number,
  kabupatenId: number,
  kecamatanId: number,
): Promise<HasilRekapKelurahanSnapshot> {
  await mockDelay();
  const kecamatan = findKecamatan(dapilId, kabupatenId, kecamatanId);
  const seedKey = `kec-k${kabupatenId}-${kecamatanId}`;
  const { totalSuaraSah, partaiSuara } = summarize(seedKey, 20000);
  const kelurahanNames = kecamatan.kelurahan.map((item) => item.nama);
  return {
    totalSuaraSah,
    partaiSuara,
    kelurahan: regionListFrom(kecamatan.kelurahan, `kel-c${kecamatanId}`, 3000),
    calegList: generateCalegList(seedKey, partaiSuara, kelurahanNames),
  };
}

async function fetchDetailSnapshotMock(
  dapilId: number,
  kabupatenId: number,
  kecamatanId: number,
  kelurahanId: number,
): Promise<HasilRekapDetailSnapshot> {
  await mockDelay();
  const seedKey = `kel-c${kecamatanId}-${kelurahanId}`;
  const { totalSuaraSah, partaiSuara } = summarize(seedKey, 3000);

  const rand = mulberry32(hashSeed(`tps-${seedKey}`));
  const tps: HasilRekapTps[] = Array.from({ length: 4 }, (_, index) => ({
    noTps: index + 1,
    totalSuara: Math.round((totalSuaraSah / 4) * (0.8 + rand() * 0.4)),
  }));
  const tpsLabels = tps.map((item) => `TPS ${String(item.noTps).padStart(2, "0")}`);

  return { totalSuaraSah, partaiSuara, calegList: generateCalegList(seedKey, partaiSuara, tpsLabels), tps };
}

export async function fetchDapilList(): Promise<HasilRekapDapil[]> {
  if (isMockApiEnabled()) return fetchDapilListMock();
  try {
    const { data: body } = await apiClient.get<{ data: ApiDapilListResponse }>("/dpr/hasil-rekap");
    return body.data.dapil.map(mapDapil);
  } catch (error) {
    console.error("[services/hasilrekap/fetchDapilList]", error);
    throw toHumanError(error, "Gagal memuat daftar Dapil. Coba lagi.");
  }
}

export async function fetchKabupatenSnapshot(dapilId: number): Promise<HasilRekapKabupatenSnapshot> {
  if (isMockApiEnabled()) return fetchKabupatenSnapshotMock(dapilId);
  try {
    const { data: body } = await apiClient.get<{ data: ApiRekapDetailResponse<"kabupatens"> }>(
      `/dpr/hasil-rekap/${dapilId}`,
    );
    const { partaiSuara, regions, calegList } = buildFromPartaiCalegs(body.data.partai_calegs, "kabupatens");
    const totalSuaraSah = partaiSuara.reduce((sum, p) => sum + p.suaraTotal, 0);
    return { totalSuaraSah, partaiSuara, kabupaten: regions, calegList };
  } catch (error) {
    console.error("[services/hasilrekap/fetchKabupatenSnapshot]", error);
    throw toHumanError(error, "Gagal memuat data Kabupaten. Coba lagi.");
  }
}

export async function fetchKecamatanSnapshot(dapilId: number, kabupatenId: number): Promise<HasilRekapKecamatanSnapshot> {
  if (isMockApiEnabled()) return fetchKecamatanSnapshotMock(dapilId, kabupatenId);
  try {
    const { data: body } = await apiClient.get<{ data: ApiRekapDetailResponse<"keluarahans"> }>(
      `/dpr/hasil-rekap/${dapilId}/${kabupatenId}`,
    );
    const { partaiSuara, regions, calegList } = buildFromPartaiCalegs(body.data.partai_calegs, "keluarahans");
    const totalSuaraSah = partaiSuara.reduce((sum, p) => sum + p.suaraTotal, 0);
    return { totalSuaraSah, partaiSuara, kecamatan: regions, calegList };
  } catch (error) {
    console.error("[services/hasilrekap/fetchKecamatanSnapshot]", error);
    throw toHumanError(error, "Gagal memuat data Kecamatan. Coba lagi.");
  }
}

export async function fetchKelurahanSnapshot(
  dapilId: number,
  kabupatenId: number,
  kecamatanId: number,
): Promise<HasilRekapKelurahanSnapshot> {
  if (isMockApiEnabled()) return fetchKelurahanSnapshotMock(dapilId, kabupatenId, kecamatanId);
  try {
    // Endpoint level ini balas HTTP 201 (bug di backend, dikonfirmasi live) —
    // axios resolve semua status 2xx sama, tidak perlu penanganan khusus.
    const { data: body } = await apiClient.get<{ data: ApiRekapDetailResponse<"keluarahans"> }>(
      `/dpr/hasil-rekap/${dapilId}/${kabupatenId}/${kecamatanId}`,
    );
    const { partaiSuara, regions, calegList } = buildFromPartaiCalegs(body.data.partai_calegs, "keluarahans");
    const totalSuaraSah = partaiSuara.reduce((sum, p) => sum + p.suaraTotal, 0);
    return { totalSuaraSah, partaiSuara, kelurahan: regions, calegList };
  } catch (error) {
    console.error("[services/hasilrekap/fetchKelurahanSnapshot]", error);
    throw toHumanError(error, "Gagal memuat data Kelurahan. Coba lagi.");
  }
}

export async function fetchDetailSnapshot(
  dapilId: number,
  kabupatenId: number,
  kecamatanId: number,
  kelurahanId: number,
): Promise<HasilRekapDetailSnapshot> {
  if (isMockApiEnabled()) return fetchDetailSnapshotMock(dapilId, kabupatenId, kecamatanId, kelurahanId);
  try {
    const { data: body } = await apiClient.get<{ data: ApiRekapDetailResponse<"tps"> }>(
      `/dpr/hasil-rekap/${dapilId}/${kabupatenId}/${kecamatanId}/${kelurahanId}`,
    );
    const { partaiSuara, regions, calegList } = buildFromPartaiCalegs(body.data.partai_calegs, "tps");
    const totalSuaraSah = partaiSuara.reduce((sum, p) => sum + p.suaraTotal, 0);
    const tps: HasilRekapTps[] = regions
      .map((r) => ({ noTps: parseTpsNumber(r.nama), totalSuara: r.totalSuara }))
      .sort((a, b) => a.noTps - b.noTps);
    return { totalSuaraSah, partaiSuara, calegList, tps };
  } catch (error) {
    console.error("[services/hasilrekap/fetchDetailSnapshot]", error);
    throw toHumanError(error, "Gagal memuat data Kelurahan. Coba lagi.");
  }
}
