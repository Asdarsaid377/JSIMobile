import { useQuery } from "@tanstack/react-query";

import { fetchDtdoorByTipePemilih } from "@/services/dtdoor";
import type { Dtdoor } from "@/types/dtdoor";

// kategoriId/tipePemilihId 7 = "Belum Menentukan" (lib/dtdoorScore.ts) — SATU-
// SATUNYA kategori yang benar-benar "swing" (persuadable). Lihat catatan lengkap
// di SwingVoterFollowUpScreen.tsx kenapa "Pemilih Kompetitor" (6) tidak termasuk.
const SWING_TIPE_PEMILIH_ID = 7;

export function useSwingVoterList() {
  return useQuery<Dtdoor[]>({
    queryKey: ["dtdoor", "tipePemilih", SWING_TIPE_PEMILIH_ID],
    queryFn: () => fetchDtdoorByTipePemilih(SWING_TIPE_PEMILIH_ID),
  });
}
