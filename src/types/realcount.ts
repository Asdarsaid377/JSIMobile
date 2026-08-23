export type RealCountC1 = {
  id: number;
  kelWilId: number;
  noTps: number;
  namaTps: string;
  suaraCalon: number;
  suaraPartaiLain: number;
  suaraTidakSah: number;
  suaraSahTotal: number;
  catatan: string | null;
  submittedAt: string;
};

export type SubmitRealCountInput = {
  kelWilId: number;
  noTps: number;
  namaTps: string;
  suaraCalon: number;
  suaraPartaiLain: number;
  suaraTidakSah: number;
  suaraSahTotal: number;
  catatan?: string;
};
