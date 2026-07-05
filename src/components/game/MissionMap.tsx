'use client';

import { useEffect, useRef, useState } from 'react';
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

const USER_ICON = L.divIcon({
  className: '',
  html: `
    <div style="position:relative;width:48px;height:48px;">
      <div class="map-pin-ping" style="background:#7c3aed;"></div>
      <div style="
        position:relative;
        background:white;
        width:48px;
        height:48px;
        border-radius:50%;
        border:3px solid #7c3aed;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:28px;
        box-shadow:0 3px 10px rgba(0,0,0,0.35);
      ">🐼</div>
    </div>
  `,
  iconSize: [48, 48],
  iconAnchor: [24, 24],
});

function FitToView({ missions, userPos }: { missions: Mission[]; userPos: [number, number] | null }) {
  const map = useMap();
  const userInteracted = useRef(false);

  useEffect(() => {
    const stop = () => { userInteracted.current = true; };
    map.on('dragstart', stop);
    map.on('zoomstart', stop);
    return () => {
      map.off('dragstart', stop);
      map.off('zoomstart', stop);
    };
  }, [map]);

  useEffect(() => {
    if (userInteracted.current) return;
    const withCoords = missions.filter(m => m.provider.latitude && m.provider.longitude);
    const points: [number, number][] = withCoords.map(
      m => [m.provider.latitude as number, m.provider.longitude as number] as [number, number]
    );
    if (userPos) points.push(userPos);
    if (points.length === 0) return;
    map.fitBounds(L.latLngBounds(points), { padding: [56, 56], maxZoom: 16 });
  }, [missions, userPos, map]);

  return null;
}

type LocationStatus = 'pending' | 'success' | 'denied' | 'unsupported' | 'error';

function useLiveLocation(): { pos: [number, number] | null; status: LocationStatus } {
  const [pos, setPos] = useState<[number, number] | null>(null);
  const [status, setStatus] = useState<LocationStatus>('pending');

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatus('unsupported');
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      p => {
        setPos([p.coords.latitude, p.coords.longitude]);
        setStatus('success');
      },
      err => {
        setStatus(err.code === err.PERMISSION_DENIED ? 'denied' : 'error');
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return { pos, status };
}

function LocationBanner({ status }: { status: LocationStatus }) {
  if (status === 'success') return null;

  const messages: Record<Exclude<LocationStatus, 'success'>, string> = {
    pending: '📍 Hledám vaši polohu…',
    denied: '📍 Přístup k poloze byl zamítnut — povolte ho v nastavení prohlížeče, aby se zobrazila vaše panda.',
    unsupported: '📍 Váš prohlížeč nepodporuje sdílení polohy.',
    error: '📍 Polohu se nepodařilo zjistit. Zkontrolujte, že má prohlížeč/zařízení povolené služby polohy.',
  };

  return (
    <div className="absolute top-3 left-3 z-[1000] bg-gray-900/90 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-lg max-w-xs">
      {messages[status]}
    </div>
  );
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
  const { pos: userPos, status: locationStatus } = useLiveLocation();

  return (
    <div className="relative rounded-2xl overflow-hidden border border-purple-700/50" style={{ height: '65vh' }}>
      <LocationBanner status={locationStatus} />
      <MapContainer center={CB_CENTER} zoom={14} style={{ height: '100%', width: '100%', background: '#f1f3f4' }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <FitToView missions={missions} userPos={userPos} />
        {withCoords.map(mission => (
          <Marker
            key={mission.id}
            position={[mission.provider.latitude as number, mission.provider.longitude as number]}
            icon={buildIcon(mission, now)}
            eventHandlers={{ click: () => onSelect(mission) }}
          />
        ))}
        {userPos && <Marker position={userPos} icon={USER_ICON} zIndexOffset={1000} />}
      </MapContainer>
    </div>
  );
}
