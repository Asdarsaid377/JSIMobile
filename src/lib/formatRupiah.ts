export function formatRupiah(value: number): string {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

// Format ringkas untuk label chart ("52jt", "612jt") — dibulatkan ke juta
// terdekat, cukup untuk sumbu bar chart, bukan angka presisi (lihat
// BudgetTrendChart.tsx).
export function formatRupiahJuta(value: number): string {
  return `${Math.round(value / 1_000_000)}jt`;
}
