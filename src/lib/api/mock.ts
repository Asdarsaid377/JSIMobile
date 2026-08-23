// Toggle mock mode lewat EXPO_PUBLIC_USE_MOCK_API — dipakai services (auth.ts, dan
// modul lain yang dibangun selama backend production diblokir Cloudflare Managed
// Challenge, lihat context/api-standards.md § Mock Mode & progress-tracker.md Decisions).
// Matikan (hapus/"false") begitu integrasi API asli aktif lagi.
export function isMockApiEnabled(): boolean {
  return process.env.EXPO_PUBLIC_USE_MOCK_API === "true";
}

export function mockDelay(ms = 400): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
