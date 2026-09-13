import { useQuery } from "@tanstack/react-query";

import { fetchKekuatanPemilihList } from "@/services/dtdoor";
import type { KekuatanPemilihFilter, KekuatanPemilihRecord } from "@/types/dtdoor";

// Selalu fetch UNFILTERED (filter kecamatan backend tidak dipakai di sini) —
// KekuatanPemilihScreen butuh daftar penuh untuk derive opsi dropdown kecamatan
// SEKALIGUS memfilter client-side by selectedKecamatan, pola sama persis dengan
// logika lama (sebelum wiring, saat sumbernya masih useDtdoorAll()).
export function useKekuatanPemilihList(filter?: KekuatanPemilihFilter) {
  return useQuery<KekuatanPemilihRecord[]>({
    queryKey: ["dtdoor", "kekuatan-pemilih", filter ?? null],
    queryFn: () => fetchKekuatanPemilihList(filter),
  });
}
