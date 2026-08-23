export type SaksiStatus = "belum_konfirmasi" | "terkonfirmasi" | "hadir_tps";

export const SAKSI_STATUS_OPTIONS: readonly { value: SaksiStatus; label: string }[] = [
  { value: "belum_konfirmasi", label: "Belum Dikonfirmasi" },
  { value: "terkonfirmasi", label: "Terkonfirmasi" },
  { value: "hadir_tps", label: "Hadir di TPS" },
];

export const SAKSI_STATUS_LABEL: Record<SaksiStatus, string> = {
  belum_konfirmasi: "Belum Dikonfirmasi",
  terkonfirmasi: "Terkonfirmasi",
  hadir_tps: "Hadir di TPS",
};

export type Saksi = {
  id: number;
  namaLengkap: string;
  noTelpon: string;
  kelWilId: number;
  noTps: number;
  namaTps: string;
  status: SaksiStatus;
  createdAt: string;
};

export type CreateSaksiInput = {
  namaLengkap: string;
  noTelpon: string;
  kelWilId: number;
  noTps: number;
  namaTps: string;
};
