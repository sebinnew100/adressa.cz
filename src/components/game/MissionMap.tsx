'use client';

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import type { Mission } from '@/types/game';
import { useLanguage } from '@/contexts/LanguageContext';

const CB_CENTER: [number, number] = [48.9745, 14.4744];

function urgencyColor(ms: number): string {
  if (ms <= 10 * 60 * 1000) return '#ef4444';
  if (ms <= 60 * 60 * 1000) return '#f97316';
  return '#2563eb';
}

function buildingSvg(color: string, isGrandChallenge: boolean, uid: string): string {
  const wallGrad = `wallGrad-${uid}`;
  const roofGrad = `roofGrad-${uid}`;

  const topper = isGrandChallenge
    ? `
      <line x1="22" y1="1" x2="22" y2="9" stroke="#92400e" stroke-width="1.2"/>
      <path d="M22 1.5 L30 4.5 L22 7.5 Z" fill="#facc15" stroke="#92400e" stroke-width="0.5"/>
    `
    : `<circle cx="22" cy="4.5" r="2.6" fill="#facc15" stroke="#92400e" stroke-width="0.6"/>`;

  return `
    <svg width="100%" height="100%" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="${wallGrad}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="#dfe3e8"/>
        </linearGradient>
        <linearGradient id="${roofGrad}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${color}"/>
          <stop offset="100%" stop-color="${color}" stop-opacity="0.7"/>
        </linearGradient>
      </defs>

      <ellipse cx="22" cy="42" rx="15" ry="2.4" fill="rgba(0,0,0,0.2)"/>

      ${topper}

      <path d="M4 20 L22 6 L40 20 Z" fill="url(#${roofGrad})"/>
      <rect x="6" y="19.5" width="32" height="2" rx="1" fill="rgba(0,0,0,0.15)"/>

      <rect x="6" y="21.5" width="32" height="5" rx="1" fill="${color}"/>
      <rect x="9" y="21.5" width="4" height="5" fill="white" opacity="0.4"/>
      <rect x="17" y="21.5" width="4" height="5" fill="white" opacity="0.4"/>
      <rect x="25" y="21.5" width="4" height="5" fill="white" opacity="0.4"/>
      <rect x="33" y="21.5" width="4" height="5" fill="white" opacity="0.4"/>

      <rect x="8" y="27" width="28" height="14" rx="1.5" fill="url(#${wallGrad})" stroke="${color}" stroke-width="1.5"/>

      <g class="bldg-window">
        <rect x="11" y="29.5" width="5.5" height="5.5" rx="0.8" fill="#fde68a" stroke="#92400e" stroke-width="0.6"/>
        <line x1="13.75" y1="29.5" x2="13.75" y2="35" stroke="#92400e" stroke-width="0.5"/>
        <line x1="11" y1="32.25" x2="16.5" y2="32.25" stroke="#92400e" stroke-width="0.5"/>
      </g>
      <g class="bldg-window" style="animation-delay:0.7s">
        <rect x="27.5" y="29.5" width="5.5" height="5.5" rx="0.8" fill="#fde68a" stroke="#92400e" stroke-width="0.6"/>
        <line x1="30.25" y1="29.5" x2="30.25" y2="35" stroke="#92400e" stroke-width="0.5"/>
        <line x1="27.5" y1="32.25" x2="33" y2="32.25" stroke="#92400e" stroke-width="0.5"/>
      </g>

      <rect x="18.5" y="33" width="7" height="8" fill="${color}" opacity="0.9"/>
      <circle cx="24" cy="37" r="0.5" fill="#fde68a"/>
    </svg>
  `;
}

function supermarketSvg(color: string, isGrandChallenge: boolean, uid: string): string {
  const wallGrad = `smWallGrad-${uid}`;
  const roofGrad = `smRoofGrad-${uid}`;

  const topper = isGrandChallenge
    ? `
      <line x1="22" y1="1" x2="22" y2="8" stroke="#92400e" stroke-width="1.2"/>
      <path d="M22 1.5 L30 4.5 L22 7.5 Z" fill="#facc15" stroke="#92400e" stroke-width="0.5"/>
    `
    : `<text x="22" y="10" font-size="9" text-anchor="middle">🛒</text>`;

  return `
    <svg width="100%" height="100%" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="${wallGrad}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="#dfe3e8"/>
        </linearGradient>
        <linearGradient id="${roofGrad}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${color}"/>
          <stop offset="100%" stop-color="${color}" stop-opacity="0.7"/>
        </linearGradient>
      </defs>

      <ellipse cx="22" cy="42" rx="17" ry="2.4" fill="rgba(0,0,0,0.2)"/>

      ${topper}

      <rect x="4" y="12" width="36" height="6" rx="1" fill="url(#${roofGrad})"/>

      <rect x="4" y="18" width="36" height="4" fill="${color}"/>
      <rect x="7" y="18" width="4" height="4" fill="white" opacity="0.5"/>
      <rect x="15" y="18" width="4" height="4" fill="white" opacity="0.5"/>
      <rect x="23" y="18" width="4" height="4" fill="white" opacity="0.5"/>
      <rect x="31" y="18" width="4" height="4" fill="white" opacity="0.5"/>

      <rect x="5" y="22" width="34" height="19" rx="1.5" fill="url(#${wallGrad})" stroke="${color}" stroke-width="1.5"/>

      <g class="bldg-window">
        <rect x="8" y="25" width="11" height="10" rx="0.8" fill="#bae6fd" stroke="#0369a1" stroke-width="0.6"/>
      </g>
      <g class="bldg-window" style="animation-delay:0.7s">
        <rect x="25" y="25" width="11" height="10" rx="0.8" fill="#bae6fd" stroke="#0369a1" stroke-width="0.6"/>
      </g>

      <rect x="19.5" y="31" width="5" height="10" fill="${color}" opacity="0.9"/>
      <circle cx="23.5" cy="36" r="0.5" fill="#fde68a"/>
    </svg>
  `;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildIcon(mission: Mission, now: number, animateIn: boolean) {
  const remaining = new Date(mission.expiresAt).getTime() - now;
  const color = urgencyColor(remaining);
  const size = mission.isGrandChallenge ? 58 : 46;
  const entranceClass = animateIn ? 'map-pin-zoom-in' : '';
  const badgeBlock = 26;
  const nameBlock = 18;
  const totalHeight = badgeBlock + size + nameBlock;
  const name = escapeHtml(mission.provider.fullName);

  return L.divIcon({
    className: '',
    html: `
      <div class="${entranceClass}" style="width:110px;height:${totalHeight}px;">
        <div class="map-pin-bob" style="display:flex;flex-direction:column;align-items:center;">
          <div class="map-badge-pop" style="
            background:#facc15;
            color:#1f2937;
            font-size:10px;
            font-weight:800;
            padding:2px 7px;
            border-radius:9999px;
            white-space:nowrap;
            box-shadow:0 2px 5px rgba(0,0,0,0.3);
            margin-bottom:4px;
          ">+${mission.rewardPoints}</div>
          <div style="position:relative;width:${size}px;height:${size}px;cursor:pointer;filter:drop-shadow(0 3px 4px rgba(0,0,0,0.3));">
            <div class="map-pin-ping-ground" style="
              position:absolute;
              left:50%;
              bottom:1px;
              width:${size * 0.55}px;
              height:${size * 0.26}px;
              transform:translateX(-50%);
              background:${color};
            "></div>
            ${mission.provider.serviceId === 'supermarket'
              ? supermarketSvg(color, mission.isGrandChallenge, mission.id)
              : buildingSvg(color, mission.isGrandChallenge, mission.id)}
          </div>
          <div style="
            margin-top:2px;
            max-width:110px;
            background:rgba(17,24,39,0.85);
            color:white;
            font-size:9px;
            font-weight:600;
            padding:1px 6px;
            border-radius:6px;
            white-space:nowrap;
            overflow:hidden;
            text-overflow:ellipsis;
          ">${name}</div>
        </div>
      </div>
    `,
    iconSize: [110, totalHeight],
    iconAnchor: [55, badgeBlock + size - 7],
  });
}

const USER_ICON = L.divIcon({
  className: '',
  html: `
    <div class="map-pin-zoom-in" style="width:48px;height:48px;">
      <div class="map-pin-bob" style="position:relative;width:48px;height:48px;">
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
    </div>
  `,
  iconSize: [48, 48],
  iconAnchor: [24, 24],
});

function useFreshIds(missions: Mission[]): Set<string> {
  const seen = useRef<Set<string>>(new Set());
  const [fresh, setFresh] = useState<Set<string>>(new Set());

  useEffect(() => {
    const newlySeen = new Set<string>();
    for (const m of missions) {
      if (!seen.current.has(m.id)) {
        newlySeen.add(m.id);
        seen.current.add(m.id);
      }
    }
    if (newlySeen.size === 0) return;
    setFresh(newlySeen);
    const timer = setTimeout(() => setFresh(new Set()), 700);
    return () => clearTimeout(timer);
  }, [missions]);

  return fresh;
}

function HeatmapLayer({ missions, userPos }: { missions: Mission[]; userPos: [number, number] | null }) {
  const map = useMap();

  useEffect(() => {
    const withCoords = missions.filter(m => m.provider.latitude && m.provider.longitude);
    const points: [number, number, number][] = withCoords.map(
      m => [m.provider.latitude as number, m.provider.longitude as number, m.rewardPoints] as [number, number, number]
    );
    if (userPos) points.push([userPos[0], userPos[1], 60]);
    if (points.length === 0) return;

    const heatLayerFactory = (L as unknown as {
      heatLayer: (pts: [number, number, number][], opts: Record<string, unknown>) => L.Layer;
    }).heatLayer;

    const heat = heatLayerFactory(points, {
      radius: 45,
      blur: 30,
      maxZoom: 17,
      max: 500,
      minOpacity: 0.25,
      gradient: { 0.2: '#60a5fa', 0.5: '#a855f7', 0.8: '#f97316', 1.0: '#ef4444' },
    }).addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [missions, userPos, map]);

  return null;
}

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

type LocationStatus = 'idle' | 'pending' | 'success' | 'denied' | 'unsupported' | 'error';

function useLiveLocation() {
  const [pos, setPos] = useState<[number, number] | null>(null);
  const [status, setStatus] = useState<LocationStatus>('idle');
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const requestLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatus('unsupported');
      return;
    }
    setStatus('pending');
    watchIdRef.current = navigator.geolocation.watchPosition(
      p => {
        setPos([p.coords.latitude, p.coords.longitude]);
        setStatus('success');
      },
      err => {
        setStatus(err.code === err.PERMISSION_DENIED ? 'denied' : 'error');
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
  };

  return { pos, status, requestLocation };
}

function LocationPrompt({ status, onRequest }: { status: LocationStatus; onRequest: () => void }) {
  const { t } = useLanguage();
  if (status === 'success') return null;

  if (status === 'idle') {
    return (
      <div className="absolute top-3 left-3 z-[1000] bg-gray-900/95 text-white text-xs px-4 py-3 rounded-xl shadow-lg max-w-xs">
        <p className="font-semibold mb-2">{t.game.location.prompt}</p>
        <button
          onClick={onRequest}
          className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-3 py-2 rounded-lg transition-colors"
        >
          {t.game.location.allow}
        </button>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="absolute top-3 left-3 z-[1000] bg-gray-900/90 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-lg max-w-xs">
        {t.game.location.pending}
      </div>
    );
  }

  const messages: Record<'denied' | 'unsupported' | 'error', string> = {
    denied: t.game.location.denied,
    unsupported: t.game.location.unsupported,
    error: t.game.location.error,
  };

  return (
    <div className="absolute top-3 left-3 z-[1000] bg-gray-900/95 text-white text-xs px-4 py-3 rounded-xl shadow-lg max-w-xs">
      <p className="mb-2">📍 {messages[status as 'denied' | 'unsupported' | 'error']}</p>
      {status !== 'unsupported' && (
        <button
          onClick={onRequest}
          className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-3 py-2 rounded-lg transition-colors"
        >
          {t.game.location.retry}
        </button>
      )}
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
  const { pos: userPos, status: locationStatus, requestLocation } = useLiveLocation();
  const freshIds = useFreshIds(missions);

  return (
    <div className="relative rounded-2xl game-glow-header p-[3px]">
      <div className="relative rounded-2xl overflow-hidden border border-purple-700/50 h-[82dvh] sm:h-[65vh]">
        <LocationPrompt status={locationStatus} onRequest={requestLocation} />
        <MapContainer center={CB_CENTER} zoom={14} style={{ height: '100%', width: '100%', background: '#f1f3f4' }}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          <HeatmapLayer missions={missions} userPos={userPos} />
          <FitToView missions={missions} userPos={userPos} />
          {withCoords.map(mission => (
            <Marker
              key={mission.id}
              position={[mission.provider.latitude as number, mission.provider.longitude as number]}
              icon={buildIcon(mission, now, freshIds.has(mission.id))}
              eventHandlers={{ click: () => onSelect(mission) }}
            />
          ))}
          {userPos && <Marker position={userPos} icon={USER_ICON} zIndexOffset={1000} />}
        </MapContainer>
      </div>
    </div>
  );
}
