import { File, Paths } from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

function escapeHtml(value: string | number): string {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildHtml(title: string, headers: string[], rows: (string | number)[][]): string {
  const theadCells = headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("");
  const bodyRows = rows
    .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`)
    .join("");
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      body { font-family: -apple-system, Roboto, sans-serif; padding: 16px; color: #0f172a; }
      h1 { font-size: 16px; margin: 0 0 4px; }
      p.meta { font-size: 11px; color: #64748b; margin: 0 0 16px; }
      table { width: 100%; border-collapse: collapse; font-size: 11px; }
      th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
      th { background: #f1f5f9; }
      tr:nth-child(even) { background: #f8fafc; }
    </style>
  </head>
  <body>
    <h1>${escapeHtml(title)}</h1>
    <p class="meta">Diekspor dari JSI Mobile &middot; ${new Date().toLocaleString("id-ID")} &middot; ${rows.length} baris</p>
    <table>
      <thead><tr>${theadCells}</tr></thead>
      <tbody>${bodyRows}</tbody>
    </table>
  </body>
</html>`;
}

// Ekspor data tabular sebagai PDF lewat native share sheet (WhatsApp/email/
// Simpan ke Files, dsb) — dipakai Rival Caleg/Tokoh Masyarakat/Quick Count/
// Budgeting Kampanye ("Ekspor", 2026-08-26, awalnya CSV lalu diganti PDF atas
// permintaan user). `expo-print` render HTML→PDF ke cache dengan nama file
// acak (`printToFileAsync` tidak punya opsi filename) — di-`move()` ke nama
// yang jelas (API File/Paths BARU, sama seperti sebelumnya dipakai untuk CSV)
// supaya nama file yang muncul di share sheet/"Simpan ke Files" rapi, bukan
// gibberish.
export async function exportTableAsPdf(title: string, filename: string, headers: string[], rows: (string | number)[][]): Promise<void> {
  const html = buildHtml(title, headers, rows);
  const { uri } = await Print.printToFileAsync({ html, base64: false });

  const destination = new File(Paths.cache, filename);
  if (destination.exists) destination.delete();
  new File(uri).move(destination);

  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error("Berbagi file tidak didukung di perangkat ini.");
  }
  await Sharing.shareAsync(destination.uri, {
    mimeType: "application/pdf",
    UTI: "com.adobe.pdf",
    dialogTitle: filename,
  });
}
