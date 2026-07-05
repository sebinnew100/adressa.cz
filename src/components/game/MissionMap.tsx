'use client';

import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Mission } from '@/types/game';

const CB_CENTER: [number, number] = [48.9745, 14.4744];

function urgencyColor(ms: number): string {
  if (ms <= 10 * 60 * 1000) return '#ef4444';
  if (ms <= 60 * 60 * 1000) return '#f97316';
  return '#3b82f6';
}

function buildIcon(mission: Mission, now: number) {
  const remaining = new Date(mission.expiresAt).getTime() - now;
  const color = urgencyColor(remaining);
  const glowClass = remaining <= 10 * 60 * 1000 ? 'game-glow-urgent' : mission.isGrandChallenge ? 'game-pulse' : '';
  const crown = mission.isGrandChallenge ? '👑' : '🎯';

  return L.divIcon({
    className: '',
    html: `
      <div class="${glowClass}" style="
        background:${color};
        width:${mission.isGrandChallenge ? 44 : 36}px;
        height:${mission.isGrandChallenge ? 44 : 36}px;
        border-radius:50%;
        border:3px solid white;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:${mission.isGrandChallenge ? 20 : 16}px;
        box-shadow:0 2px 8px rgba(0,0,0,0.5);
        cursor:pointer;
      ">${crown}</div>
    `,
    iconSize: [mission.isGrandChallenge ? 44 : 36, mission.isGrandChallenge ? 44 : 36],
    iconAnchor: [mission.isGrandChallenge ? 22 : 18, mission.isGrandChallenge ? 22 : 18],
  });
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
      <MapContainer center={CB_CENTER} zoom={14} style={{ height: '100%', width: '100%', background: '#0a0a0f' }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
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
