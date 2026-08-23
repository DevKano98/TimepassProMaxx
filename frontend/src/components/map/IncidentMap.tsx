import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Incident } from '../../types';
import { BadgePill } from '../common/BadgePill';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Crosshair, Navigation } from 'lucide-react';

// Custom SVG icon generator with exact severity color tokens
function createCustomPin(severity: string, isSelected = false) {
  let color = '#cf202f'; // default critical
  if (severity === 'HIGH') color = '#f4780a';
  else if (severity === 'MEDIUM') color = '#f4b000';
  else if (severity === 'LOW' || severity === 'RESOLVED') color = '#05b169';

  const size = isSelected ? 38 : 30;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3" fill="#ffffff"></circle>
    </svg>
  `;

  return L.divIcon({
    html: svg,
    className: 'custom-map-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

// User current location pulsing pin
function createUserLocationPin() {
  const svg = `
    <div style="position: relative; width: 24px; height: 24px;">
      <div style="position: absolute; width: 24px; height: 24px; border-radius: 50%; background: rgba(59, 130, 246, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="position: absolute; top: 4px; left: 4px; width: 16px; height: 16px; border-radius: 50%; background: #2563eb; border: 3px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>
    </div>
  `;

  return L.divIcon({
    html: svg,
    className: 'user-location-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
}

function RecenterMap({ lat, lng, zoom }: { lat: number; lng: number; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], zoom || map.getZoom(), { animate: true });
  }, [lat, lng, zoom, map]);
  return null;
}

interface IncidentMapProps {
  incidents: Incident[];
  selectedIncident?: Incident | null;
  onSelectIncident?: (incident: Incident) => void;
  center?: [number, number];
  zoom?: number;
  height?: string;
  interactive?: boolean;
}

export const IncidentMap: React.FC<IncidentMapProps> = ({
  incidents,
  selectedIncident,
  onSelectIncident,
  center = [28.6139, 77.2090], // Default central coordinates
  zoom = 13,
  height = '500px',
}) => {
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [targetCenter, setTargetCenter] = useState<[number, number] | null>(null);

  // Auto-detect real-time browser location on mount for all roles
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setUserLocation(coords);
          if (incidents.length === 0 && !selectedIncident) {
            setTargetCenter(coords);
          }
        },
        (err) => {
          console.log('Browser geolocation skipped or denied:', err.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    }
  }, []);

  const handleLocateMe = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setUserLocation(coords);
          setTargetCenter(coords);
        },
        (err) => {
          alert('Could not access your location: ' + err.message);
        },
        { enableHighAccuracy: true }
      );
    }
  };

  // Find dynamic center if incidents exist or user location found
  const initialMapCenter: [number, number] = selectedIncident
    ? [selectedIncident.location.lat, selectedIncident.location.lng]
    : incidents.length > 0
    ? [incidents[0].location.lat, incidents[0].location.lng]
    : userLocation || center;

  return (
    <div style={{ height }} className="w-full relative rounded-xl overflow-hidden border border-hairline shadow-soft">
      {/* Floating My Location Button */}
      <button
        onClick={handleLocateMe}
        title="Center on my real-time location"
        className="absolute top-3 right-3 z-[1000] bg-surface text-ink px-3 py-2 rounded-lg shadow-md border border-hairline flex items-center gap-1.5 text-xs font-semibold hover:bg-surface-soft active:scale-95 transition-all cursor-pointer"
      >
        <Crosshair className="w-4 h-4 text-primary animate-pulse" />
        <span>My Location</span>
      </button>

      <MapContainer
        center={initialMapCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {targetCenter && (
          <RecenterMap lat={targetCenter[0]} lng={targetCenter[1]} zoom={15} />
        )}

        {selectedIncident && (
          <RecenterMap
            lat={selectedIncident.location.lat}
            lng={selectedIncident.location.lng}
            zoom={15}
          />
        )}

        {/* User Real-Time Location Marker */}
        {userLocation && (
          <Marker position={userLocation} icon={createUserLocationPin()}>
            <Popup>
              <div className="text-center font-medium text-xs py-1">
                📍 You are here (Live GPS)
              </div>
            </Popup>
          </Marker>
        )}

        {incidents.map((incident) => {
          const isSelected = selectedIncident?.id === incident.id;
          const icon = createCustomPin(
            incident.status === 'RESOLVED' ? 'RESOLVED' : incident.severity,
            isSelected
          );

          return (
            <Marker
              key={incident.id}
              position={[incident.location.lat, incident.location.lng]}
              icon={icon}
              eventHandlers={{
                click: () => {
                  if (onSelectIncident) onSelectIncident(incident);
                },
              }}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-1 max-w-xs">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <BadgePill severity={incident.severity} label={incident.severity} dot className="text-[10px]" />
                    <span className="font-mono text-[11px] text-muted">{incident.id}</span>
                  </div>
                  <h4 className="font-semibold text-[14px] text-ink line-clamp-2 leading-tight">
                    {incident.title}
                  </h4>
                  <p className="text-muted text-[12px] mt-1 line-clamp-1">
                    {incident.location.address}
                  </p>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-hairline text-[12px]">
                    <span className="font-mono text-muted">
                      Reports: <strong className="text-ink">{incident.report_count}</strong>
                    </span>
                    <button
                      onClick={() => navigate(`/governmentdashboard/incidents/${incident.id}`)}
                      className="inline-flex items-center gap-1 text-primary font-semibold hover:underline text-[12px] cursor-pointer"
                    >
                      <span>Triage</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
