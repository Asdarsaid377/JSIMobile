import { isMockApiEnabled, mockDelay } from "@/lib/api/mock";
import type { AntiFraudSnapshot } from "@/types/antifraud";

// Tidak ada endpoint/schema apapun untuk "Verifikasi Kunjungan / Anti-Fraud"
// (CLAUDE.md Aturan #6) — beda dari fitur mock lain di app ini, sesi ini
// SENGAJA cuma bikin UI + 1 fungsi READ (permintaan eksplisit user "generate
// UI-nya saja dulu, nanti saya buatkan API-nya"). Tidak ada fungsi
// create/update/approve/reject — tombol "Setujui"/"Tolak Data" di
// AntiFraudEvidenceSheet cuma tutup sheet + Alert, persis perilaku asli di
// mockup (`onClick="{{ closeFraudSheet }}"` SAMA untuk kedua tombol, tidak
// ada logic approve/reject beneran di kode sumbernya juga).
const ENDPOINT_NOT_CONFIRMED =
  "Endpoint Verifikasi Kunjungan belum ada — fitur ini masih UI saja. Aktifkan EXPO_PUBLIC_USE_MOCK_API=true untuk demo.";

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

export async function fetchAntiFraudSnapshot(): Promise<AntiFraudSnapshot> {
  if (isMockApiEnabled()) return fetchAntiFraudSnapshotMock();
  throw new Error(ENDPOINT_NOT_CONFIRMED);
}
