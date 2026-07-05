'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Mission } from '@/types/game';

const CB_CENTER: [number, number] = [48.9745, 14.4744];

function urgencyColor(ms: number): string {
  if (ms <= 10 * 60 * 1000) return '#ef4444';
  if (ms <= 60 * 60 * 1000) return '#f97316';
  return '#2563eb';
}

function buildIcon(mission: Mission, now: number) {
  const remaining = new Date(mission.expiresAt).getTime() - now;
  const color = urgencyColor(remaining);
  const crown = mission.isGrandChallenge ? '👑' : '🎯';
  const size = mission.isGrandChallenge ? 46 : 36;

  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:${size}px;height:${size}px;">
        <div class="map-pin-ping" style="background:${color};"></div>
        <div style="
          position:relative;
          background:${color};
          width:${size}px;
          height:${size}px;
          border-radius:50%;
          border:3px solid white;
          display:flex;
          align-items:center;
          justify-content:center;
          font-size:${mission.isGrandChallenge ? 20 : 16}px;
          box-shadow:0 3px 10px rgba(0,0,0,0.35);
          cursor:pointer;
        ">${crown}</div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function FitToMarkers({ missions }: { missions: Mission[] }) {
  const map = useMap();

  useEffect(() => {
    const withCoords = missions.filter(m => m.provider.latitude && m.provider.longitude);
    if (withCoords.length === 0) return;
    const bounds = L.latLngBounds(
      withCoords.map(m => [m.provider.latitude as number, m.provider.longitude as number] as [number, number])
    );
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 16 });
  }, [missions, map]);

  return null;
}

export default function MissionMap({
  missions,
  now,
  onSelect,
}: {
  missions: Mission[];
  now: number;
  onSelect: (mission: Mission) => void;
}) {
  const withCoords = missions.filter(m => m.provider.latitude && m.provider.longitude);

  return (
    <div className="rounded-2xl overflow-hidden border border-purple-700/50" style={{ height: '65vh' }}>
      <MapContainer center={CB_CENTER} zoom={14} style={{ height: '100%', width: '100%', background: '#f1f3f4' }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <FitToMarkers missions={missions} />
        {withCoords.map(mission => (
          <Marker
            key={mission.id}
            position={[mission.provider.latitude as number, mission.provider.longitude as number]}
            icon={buildIcon(mission, now)}
            eventHandlers={{ click: () => onSelect(mission) }}
          />
        ))}
      </MapContainer>
    </div>
  );
}
