import { apiClient } from "@/lib/api/client";
import { isMockApiEnabled, mockDelay } from "@/lib/api/mock";
import type { AntiFraudSnapshot } from "@/types/antifraud";

// 2026-08-25: modul backend `antifraud` sekarang ADA (dibaca langsung dari
// /Users/asdarsaid/JSI/api/src/antifraud + live curl ke backend LOKAL —
// GET /antifraud/summary & /cases balas 401 Unauthorized bukan 404, route ADA
// & ter-guard). WIRED penuh: GET /antifraud/summary (baca) + PATCH
// /antifraud/cases/:id/approve|reject (mutation sungguhan, bukan lagi dummy
// Alert — lihat AntiFraudScreen.tsx & hooks/useAntiFraud.ts).

// 4 kasus & 5 relawan persis nama/detail di mockup (contoh ilustratif) — kasus
// dihubungkan ke relawan yang sama dengan `fraudRelawanList` (Asep Saepudin,
// Neng Sari, Mira Anggraini, Dedi Kurniawan) supaya datanya nyambung logis.
const MOCK_SNAPSHOT: AntiFraudSnapshot = {
  kunjunganTervalidasi: 218,
  totalKunjungan: 245,
  jenisAnomali: [
    { nama: "Foto duplikat / dari galeri", jumlahKasus: 11, severity: "tinggi" },
    { nama: "Lokasi jauh dari alamat target", jumlahKasus: 8, severity: "tinggi" },
    { nama: "Input terlalu cepat (burst)", jumlahKasus: 5, severity: "sedang" },
    { nama: "GPS nonaktif saat input", jumlahKasus: 3, severity: "sedang" },
  ],
  cases: [
    {
      id: 1,
      relawan: "Asep Saepudin",
      target: "Bambang Sutrisno · Jl. Mawar No. 3",
      waktu: "20 Agu, 14:12",
      level: "Tinggi",
      alasan: "11 kunjungan diinput dalam 4 menit — mustahil dilakukan secara fisik.",
      gpsStatus: "ada",
      fotoStatus: "duplikat",
      checks: [
        { label: "Jarak GPS ke alamat target", value: "1,8 km (di luar radius 200 m)", bermasalah: true },
        { label: "Jeda antar input", value: "11 input / 4 menit", bermasalah: true },
        { label: "Foto", value: "Identik dengan 6 kunjungan lain", bermasalah: true },
        { label: "Timestamp perangkat", value: "Cocok dengan waktu server", bermasalah: false },
      ],
    },
    {
      id: 2,
      relawan: "Neng Sari",
      target: "Siti Nur Hasanah · Jl. Anggrek No. 21",
      waktu: "20 Agu, 10:38",
      level: "Sedang",
      alasan: "Lokasi input 640 m dari alamat pemilih yang dilaporkan.",
      gpsStatus: "menyimpang",
      fotoStatus: "ada",
      checks: [
        { label: "Jarak GPS ke alamat target", value: "640 m (di luar radius 200 m)", bermasalah: true },
        { label: "Jeda antar input", value: "Normal · 18 menit", bermasalah: false },
        { label: "Foto", value: "Unik · diambil in-app", bermasalah: false },
        { label: "Timestamp perangkat", value: "Cocok dengan waktu server", bermasalah: false },
      ],
    },
    {
      id: 3,
      relawan: "Mira Anggraini",
      target: "Dewi Lestari · Jl. Melati No. 15",
      waktu: "19 Agu, 16:04",
      level: "Sedang",
      alasan: "Foto diambil dari galeri, bukan kamera aplikasi.",
      gpsStatus: "ada",
      fotoStatus: "galeri",
      checks: [
        { label: "Jarak GPS ke alamat target", value: "85 m · dalam radius", bermasalah: false },
        { label: "Jeda antar input", value: "Normal · 25 menit", bermasalah: false },
        { label: "Foto", value: "Dari galeri · metadata 3 hari lalu", bermasalah: true },
        { label: "Timestamp perangkat", value: "Cocok dengan waktu server", bermasalah: false },
      ],
    },
    {
      id: 4,
      relawan: "Dedi Kurniawan",
      target: "Rina Amelia Putri · Jl. Merdeka No. 12",
      waktu: "19 Agu, 09:20",
      level: "Rendah",
      alasan: "GPS mati saat input, lokasi diisi manual oleh relawan.",
      gpsStatus: "manual",
      fotoStatus: "ada",
      checks: [
        { label: "Jarak GPS ke alamat target", value: "Tidak terekam · GPS nonaktif", bermasalah: true },
        { label: "Jeda antar input", value: "Normal · 32 menit", bermasalah: false },
        { label: "Foto", value: "Unik · diambil in-app", bermasalah: false },
        { label: "Timestamp perangkat", value: "Cocok dengan waktu server", bermasalah: false },
      ],
    },
  ],
  relawanSkor: [
    { id: 1, nama: "Dedi Kurniawan", skor: 96, jumlahKunjungan: 62, jumlahDitandai: 1 },
    { id: 2, nama: "Mira Anggraini", skor: 88, jumlahKunjungan: 54, jumlahDitandai: 3 },
    { id: 3, nama: "Neng Sari", skor: 74, jumlahKunjungan: 48, jumlahDitandai: 6 },
    { id: 4, nama: "Yayat Hidayat", skor: 91, jumlahKunjungan: 39, jumlahDitandai: 2 },
    { id: 5, nama: "Asep Saepudin", skor: 42, jumlahKunjungan: 30, jumlahDitandai: 15 },
  ],
};

async function fetchAntiFraudSnapshotMock(): Promise<AntiFraudSnapshot> {
  await mockDelay();
  return MOCK_SNAPSHOT;
}

async function fetchAntiFraudSnapshotReal(): Promise<AntiFraudSnapshot> {
  try {
    // Bentuk response getSummary() (backend) sudah cocok 1:1 dengan
    // AntiFraudSnapshot — tidak perlu mapping field seperti fitur lain.
    const { data: envelope } = await apiClient.get<{ message: string; data: AntiFraudSnapshot }>(
      "/antifraud/summary",
    );
    return envelope.data;
  } catch (error) {
    console.error("[services/antifraud/fetchAntiFraudSnapshot]", error);
    throw new Error("Gagal memuat data verifikasi kunjungan. Coba lagi.");
  }
}

export async function fetchAntiFraudSnapshot(): Promise<AntiFraudSnapshot> {
  if (isMockApiEnabled()) return fetchAntiFraudSnapshotMock();
  return fetchAntiFraudSnapshotReal();
}

// Mock mode tidak memodelkan status FraudCase sama sekali (MOCK_SNAPSHOT
// statis) — approve/reject di mock cuma delay tanpa efek, cukup untuk demo UI.
export async function approveFraudCase(id: number): Promise<void> {
  if (isMockApiEnabled()) {
    await mockDelay();
    return;
  }
  try {
    await apiClient.patch(`/antifraud/cases/${id}/approve`);
  } catch (error) {
    console.error("[services/antifraud/approveFraudCase]", error);
    throw new Error("Gagal menyetujui kasus. Coba lagi.");
  }
}

export async function rejectFraudCase(id: number): Promise<void> {
  if (isMockApiEnabled()) {
    await mockDelay();
    return;
  }
  try {
    await apiClient.patch(`/antifraud/cases/${id}/reject`);
  } catch (error) {
    console.error("[services/antifraud/rejectFraudCase]", error);
    throw new Error("Gagal menolak kasus. Coba lagi.");
  }
}
