import { useMemo } from "react";

import { WebView } from "react-native-webview";

import type { TimsesMember } from "@/types/timses";

type Props = {
  members: readonly TimsesMember[];
};

type MapMarker = {
  id: number;
  lat: number;
  long: number;
  namaLengkap: string;
  isOnline: boolean;
};

const DEFAULT_CENTER = { lat: -6.9308, long: 107.7275 }; // Kec. Cileunyi, Kab. Bandung — fallback saat belum ada anggota berkoordinat

// WebView + Leaflet/OpenStreetMap (bukan react-native-maps) — keputusan eksplisit
// user (Feature 07): project ini belum punya expo-dev-client/custom native config,
// jadi library map native butuh EAS Build + API key Google Maps di luar scope satu
// feature. Leaflet+OSM sama persis dengan yang dipakai web client
// (client/src/pages/tracking/Tracking.jsx via react-leaflet), tanpa API key, jalan
// di Expo Go biasa. Versi Leaflet 1.9.4 dari CDN unpkg — disamakan dengan
// `client/package.json` (lihat library-docs.md).
export function TrackingMapView({ members }: Props) {
  const markers = useMemo<MapMarker[]>(
    () =>
      members
        .filter((member): member is TimsesMember & { lat: number; long: number } => member.lat !== null && member.long !== null)
        .map((member) => ({
          id: member.id,
          lat: member.lat,
          long: member.long,
          namaLengkap: member.namaLengkap,
          isOnline: member.statusOnline === "online",
        })),
    [members],
  );

  const center = markers[0] ? { lat: markers[0].lat, long: markers[0].long } : DEFAULT_CENTER;

  const html = useMemo(() => buildMapHtml(center, markers), [center, markers]);

  return (
    <WebView
      originWhitelist={["*"]}
      source={{ html }}
      style={{ flex: 1 }}
      javaScriptEnabled
      domStorageEnabled={false}
    />
  );
}

function buildMapHtml(center: { lat: number; long: number }, markers: MapMarker[]): string {
  const dataJson = JSON.stringify({ center, markers });
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var data = ${dataJson};
    var map = L.map('map').setView([data.center.lat, data.center.long], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);
    data.markers.forEach(function (marker) {
      var circle = L.circleMarker([marker.lat, marker.long], {
        radius: 9,
        weight: 2,
        color: '#ffffff',
        fillColor: marker.isOnline ? '#16a34a' : '#64748b',
        fillOpacity: 1,
      }).addTo(map);
      var popupEl = document.createElement('div');
      var nameEl = document.createElement('strong');
      nameEl.textContent = marker.namaLengkap;
      var statusEl = document.createElement('div');
      statusEl.textContent = marker.isOnline ? 'Online' : 'Offline';
      var linkEl = document.createElement('a');
      linkEl.href = 'https://www.google.com/maps/?q=' + marker.lat + ',' + marker.long;
      linkEl.textContent = 'Buka di Google Maps';
      linkEl.target = '_blank';
      popupEl.appendChild(nameEl);
      popupEl.appendChild(statusEl);
      popupEl.appendChild(linkEl);
      circle.bindPopup(popupEl);
    });
  </script>
</body>
</html>`;
}
