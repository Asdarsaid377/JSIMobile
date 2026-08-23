import { useQuery } from "@tanstack/react-query";

import {
  fetchDapilList,
  fetchDetailSnapshot,
  fetchKabupatenSnapshot,
  fetchKecamatanSnapshot,
  fetchKelurahanSnapshot,
} from "@/services/hasilrekap";
import type {
  HasilRekapDapil,
  HasilRekapDetailSnapshot,
  HasilRekapKabupatenSnapshot,
  HasilRekapKecamatanSnapshot,
  HasilRekapKelurahanSnapshot,
} from "@/types/hasilrekap";

export function useHasilRekapDapilList() {
  return useQuery<HasilRekapDapil[]>({
    queryKey: ["hasilrekap", "dprri", "dapil"],
    queryFn: fetchDapilList,
  });
}

export function useHasilRekapKabupatenSnapshot(dapilId: number) {
  return useQuery<HasilRekapKabupatenSnapshot>({
    queryKey: ["hasilrekap", "dprri", "kabupaten", dapilId],
    queryFn: () => fetchKabupatenSnapshot(dapilId),
  });
}

export function useHasilRekapKecamatanSnapshot(dapilId: number, kabupatenId: number) {
  return useQuery<HasilRekapKecamatanSnapshot>({
    queryKey: ["hasilrekap", "dprri", "kecamatan", dapilId, kabupatenId],
    queryFn: () => fetchKecamatanSnapshot(dapilId, kabupatenId),
  });
}

export function useHasilRekapKelurahanSnapshot(dapilId: number, kabupatenId: number, kecamatanId: number) {
  return useQuery<HasilRekapKelurahanSnapshot>({
    queryKey: ["hasilrekap", "dprri", "kelurahan", dapilId, kabupatenId, kecamatanId],
    queryFn: () => fetchKelurahanSnapshot(dapilId, kabupatenId, kecamatanId),
  });
}

export function useHasilRekapDetailSnapshot(dapilId: number, kabupatenId: number, kecamatanId: number, kelurahanId: number) {
  return useQuery<HasilRekapDetailSnapshot>({
    queryKey: ["hasilrekap", "dprri", "detail", dapilId, kabupatenId, kecamatanId, kelurahanId],
    queryFn: () => fetchDetailSnapshot(dapilId, kabupatenId, kecamatanId, kelurahanId),
  });
}
