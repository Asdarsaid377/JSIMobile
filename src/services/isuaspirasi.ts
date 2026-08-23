import { isMockApiEnabled, mockDelay } from "@/lib/api/mock";
import type { IsuAspirasiSnapshot } from "@/types/isuaspirasi";

// Tidak ada endpoint/schema apapun untuk "Isu & Aspirasi Warga" (CLAUDE.md
// Aturan #6) — sesi ini SENGAJA cuma bikin UI + 1 fungsi READ (permintaan
// eksplisit user "Generate UI nya saja dulu tidak apa apa, nanti saya
// buatkan API nya"). Tidak ada fungsi create/update — tombol "+ Catat
// Aspirasi Warga" dan aksi di IsuAspirasiDetailSheet cuma Alert info, pola
// sama services/antifraud.ts.
const ENDPOINT_NOT_CONFIRMED =
  "Endpoint Isu & Aspirasi Warga belum ada — fitur ini masih UI saja. Aktifkan EXPO_PUBLIC_USE_MOCK_API=true untuk demo.";

// 4 kelurahan sama dengan yang dipakai fitur lain (QuickCount/Tokoh/Kekuatan
// Wilayah, Kec. Cileunyi) — konsisten dataset demo lintas fitur. Relawan
// (Asep Saepudin/Neng Sari/Mira Anggraini/Dedi Kurniawan) reuse nama dari
// MOCK_SNAPSHOT antifraud.ts supaya nyambung logis (relawan yang sama
// muncul di beberapa fitur aktivitas lapangan).
const MOCK_SNAPSHOT: IsuAspirasiSnapshot = {
  totalAspirasi: 1284,
  isuDominan: "Jalan Rusak",
  ringkasanSumber: "Dari 245 kunjungan D2D di 4 kelurahan · 68% warga menyebut isu infrastruktur",
  kategori: [
    { nama: "Jalan Rusak", jumlah: 412, wilayahTerkuat: "Cileunyi Kulon" },
    { nama: "Air Bersih", jumlah: 268, wilayahTerkuat: "Cinunuk" },
    { nama: "Pupuk & Pertanian", jumlah: 195, wilayahTerkuat: "Cileunyi Wetan" },
    { nama: "Kesehatan", jumlah: 158, wilayahTerkuat: "Cimekar" },
    { nama: "Pendidikan", jumlah: 132, wilayahTerkuat: "Cinunuk" },
    { nama: "Ekonomi & UMKM", jumlah: 119, wilayahTerkuat: "Cileunyi Kulon" },
  ],
  janji: [
    {
      janji: "Program Perbaikan Jalan Lingkungan Bertahap",
      dampak: "Prioritas Tinggi",
      dasar: "412 aspirasi menyebut kondisi jalan rusak, mayoritas dari Cileunyi Kulon dan Cinunuk.",
      wilayah: "Cileunyi Kulon",
    },
    {
      janji: "Bantuan Sumur Bor & Perbaikan Saluran Air Bersih",
      dampak: "Prioritas Tinggi",
      dasar: "268 aspirasi soal krisis air bersih, terutama menjelang musim kemarau.",
      wilayah: "Cinunuk",
    },
    {
      janji: "Subsidi Pupuk & Pendampingan Kelompok Tani",
      dampak: "Prioritas Sedang",
      dasar: "195 aspirasi petani soal harga dan kelangkaan pupuk bersubsidi.",
      wilayah: "Cileunyi Wetan",
    },
  ],
  petaWilayah: [
    { nama: "Cileunyi Kulon", totalAspirasi: 356, isuDominan: "Jalan Rusak", level: "tinggi" },
    { nama: "Cinunuk", totalAspirasi: 298, isuDominan: "Air Bersih", level: "tinggi" },
    { nama: "Cileunyi Wetan", totalAspirasi: 341, isuDominan: "Pupuk & Pertanian", level: "sedang" },
    { nama: "Cimekar", totalAspirasi: 289, isuDominan: "Jalan Rusak", level: "sedang" },
  ],
  aspirasi: [
    {
      id: 1,
      warga: "Warga RT 03",
      alamat: "Jl. Cikuda, Cileunyi Kulon",
      kategori: "Jalan",
      keluhan: "Jalan rusak parah sejak musim hujan, motor sering jatuh di lubang besar dekat gang.",
      relawan: "Asep Saepudin",
      tanggal: "20 Agu 2026",
      status: "Baru",
      laporanSerupa: 14,
    },
    {
      id: 2,
      warga: "Ibu Yayah",
      alamat: "Kp. Cibiru, Cinunuk",
      kategori: "Air",
      keluhan: "Sudah 2 minggu air PAM mati total, warga terpaksa beli air galon tiap hari.",
      relawan: "Neng Sari",
      tanggal: "19 Agu 2026",
      status: "Ditindak",
      laporanSerupa: 9,
    },
    {
      id: 3,
      warga: "Pak Ujang",
      alamat: "Kp. Awilarangan, Cileunyi Wetan",
      kategori: "Pupuk",
      keluhan: "Harga pupuk subsidi naik dan sulit dicari menjelang musim tanam.",
      relawan: "Mira Anggraini",
      tanggal: "18 Agu 2026",
      status: "Baru",
      laporanSerupa: 6,
    },
    {
      id: 4,
      warga: "Ibu Rini",
      alamat: "Jl. Padasuka, Cimekar",
      kategori: "Kesehatan",
      keluhan: "Posyandu tidak buka rutin, jarak ke puskesmas terdekat cukup jauh untuk balita.",
      relawan: "Dedi Kurniawan",
      tanggal: "17 Agu 2026",
      status: "Selesai",
      laporanSerupa: 3,
    },
    {
      id: 5,
      warga: "Pak Dadan",
      alamat: "Jl. Cileunyi Raya, Cileunyi Kulon",
      kategori: "Jalan",
      keluhan: "Lampu jalan mati total sejak sebulan, rawan kecelakaan saat malam hari.",
      relawan: "Asep Saepudin",
      tanggal: "16 Agu 2026",
      status: "Baru",
      laporanSerupa: 11,
    },
  ],
};

async function fetchIsuAspirasiSnapshotMock(): Promise<IsuAspirasiSnapshot> {
  await mockDelay();
  return MOCK_SNAPSHOT;
}

export async function fetchIsuAspirasiSnapshot(): Promise<IsuAspirasiSnapshot> {
  if (isMockApiEnabled()) return fetchIsuAspirasiSnapshotMock();
  throw new Error(ENDPOINT_NOT_CONFIRMED);
}
