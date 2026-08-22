import React, { useState } from 'react';
import {
  Camera,
  MapPin,
  CheckCircle2,
  Navigation,
  Sparkles,
  Wifi,
  Battery,
  Clock,
  AlertTriangle,
  RotateCcw,
  Radio,
  Search,
  Plus,
  Compass,
} from 'lucide-react';
import { BadgePill } from '../common/BadgePill';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Crisp custom SVG pins for the mini map
function createMiniPin(color: string, label: string) {
  const svg = `
    <div style="background-color: ${color}; color: white; padding: 3px 8px; border-radius: 9999px; font-weight: 700; font-size: 10px; font-family: -apple-system, system-ui, sans-serif; display: flex; align-items: center; gap: 4px; box-shadow: 0 3px 8px rgba(0,0,0,0.3); border: 2px solid #ffffff; white-space: nowrap; pointer-events: auto;">
      <span style="width: 5px; height: 5px; border-radius: 50%; background: #ffffff;"></span>
      <span>${label}</span>
    </div>
  `;

  return L.divIcon({
    html: svg,
    className: 'custom-phone-map-marker',
    iconSize: [80, 24],
    iconAnchor: [40, 24],
  });
}

const POTHOLE_PIN = createMiniPin('#cf202f', 'POTHOLE');
const FLOOD_PIN = createMiniPin('#f4780a', 'WATER MAIN');
const LIGHT_PIN = createMiniPin('#0052ff', 'STREETLIGHT');

export const AndroidPhoneMockup: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState<'map' | 'camera' | 'track' | 'alerts'>('map');
  const [selectedHazard] = useState({
    title: 'Severe Deep Pothole',
    category: 'POTHOLE',
    address: 'Connaught Ring Road, Ward 12',
    severity: 'CRITICAL' as const,
    reports: 14,
    status: 'DISPATCHED',
    unit: 'Rapid Asphalt Unit 04',
    eta: '8 mins',
  });

  const [hazardIndex, setHazardIndex] = useState(0);

  const HAZARDS = [
    {
      title: 'Deep Structural Pothole',
      category: 'POTHOLE',
      confidence: '98.4%',
      depth: '14cm Depth',
      coords: '28.6139° N, 77.2090° E',
      image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
      ward: 'Ward 12 • Connaught Arterial',
      severity: 'CRITICAL' as const,
    },
    {
      title: 'High Pressure Water Leak',
      category: 'WATER_LEAK',
      confidence: '97.2%',
      depth: 'Subway Flooding Risk',
      coords: '28.6289° N, 77.2185° E',
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
      ward: 'Ward 04 • Barakhamba Underpass',
      severity: 'CRITICAL' as const,
    },
  ];

  const currentHazard = HAZARDS[hazardIndex];

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Sleek Modern Android Device Body with Side Buttons & Bezel */}
      <div className="relative w-[310px] sm:w-[340px] bg-[#15161a] p-2.5 rounded-[46px] shadow-[0_30px_80px_-15px_rgba(0,82,255,0.35)] border-2 border-[#33363f] ring-1 ring-white/20">
        {/* Device Screen Container (Crisp White Canvas) */}
        <div className="w-full bg-canvas text-ink rounded-[38px] overflow-hidden flex flex-col h-[590px] relative border border-hairline shadow-inner">
          {/* 1. Android Status Bar */}
          <div className="w-full h-7 px-5 pt-1 flex items-center justify-between text-[11px] font-mono text-muted z-30 bg-canvas/95 border-b border-hairline/40">
            <span className="font-semibold text-ink text-[10px]">09:41</span>

            {/* Centered Punch-Hole Camera */}
            <div className="w-3 h-3 rounded-full bg-black ring-1 ring-hairline flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-[#111]" />
            </div>

            <div className="flex items-center gap-1.5">
              <Wifi className="w-3 h-3 text-ink" />
              <span className="text-[9px] font-bold text-ink">5G</span>
              <Battery className="w-3 h-3 text-ink" />
            </div>
          </div>

          {/* 2. Android App Top Bar */}
          <div className="px-3.5 py-2 bg-canvas border-b border-hairline flex items-center justify-between z-20">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-soft">
                <Compass className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="flex items-center gap-1 leading-none">
                  <span className="font-bold text-[13px] text-ink">
                    Civic<span className="text-primary">Guard</span>
                  </span>
                  <span className="bg-primary/10 text-primary text-[8px] font-mono font-bold px-1 py-0.2 rounded">
                    GPS ON
                  </span>
                </div>
                <span className="text-[9px] text-muted block mt-0.5">Connaught Central, Ward 12</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('alerts')}
                className="w-6 h-6 rounded-full bg-surface-strong hover:bg-hairline flex items-center justify-center text-ink relative cursor-pointer"
              >
                <Radio className="w-3 h-3 text-severity-critical" />
                <span className="w-1.5 h-1.5 rounded-full bg-severity-critical absolute top-0.5 right-0.5" />
              </button>
            </div>
          </div>

          {/* 3. Main Screen Viewport */}
          <div className="flex-1 relative overflow-hidden bg-surface-soft flex flex-col">
            {/* VIEW 1: INTERACTIVE MAP (DEFAULT VIEW) */}
            {activeTab === 'map' && (
              <div className="h-full w-full flex flex-col relative">
                {/* Embedded Real Map with OSM Tiles */}
                <div className="flex-1 w-full relative">
                  <MapContainer
                    center={[28.6139, 77.2090]}
                    zoom={14}
                    zoomControl={false}
                    attributionControl={false}
                    className="w-full h-full"
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                    <Marker position={[28.6180, 77.2090]} icon={POTHOLE_PIN}>
                      <Popup>
                        <div className="text-[10px] font-sans">
                          <strong>Deep Pothole</strong><br />
                          14 reports • Dispatched
                        </div>
                      </Popup>
                    </Marker>

                    <Marker position={[28.6289, 77.2185]} icon={FLOOD_PIN}>
                      <Popup>
                        <div className="text-[10px] font-sans">
                          <strong>Water Main Leak</strong>
                        </div>
                      </Popup>
                    </Marker>

                    <Marker position={[28.5980, 77.2250]} icon={LIGHT_PIN}>
                      <Popup>
                        <div className="text-[10px] font-sans">
                          <strong>Streetlight Cluster</strong>
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>

                  {/* Clean Citizen GPS Location Pulse (Concentric Blue Rings) */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 flex items-center justify-center">
                    <span className="absolute w-8 h-8 rounded-full bg-primary/25 animate-ping" />
                    <span className="absolute w-5 h-5 rounded-full bg-primary/40" />
                    <span className="w-3 h-3 rounded-full bg-primary ring-2 ring-white shadow-md relative" />
                  </div>

                  {/* Top Floating Search Pill inside map */}
                  <div className="absolute top-2 inset-x-2.5 z-10">
                    <div className="bg-canvas/95 backdrop-blur-md border border-hairline rounded-pill px-3 py-1.5 shadow-soft flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5 text-muted">
                        <Search className="w-3 h-3 text-primary" />
                        <span className="text-ink font-medium">Search ward or hazard...</span>
                      </div>
                      <span className="font-mono text-[9px] bg-surface-strong px-1.5 py-0.5 rounded-pill text-muted">
                        3 nearby
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Sheet Card on Map */}
                <div className="bg-canvas border-t border-hairline p-3 shadow-card-hover flex flex-col gap-2 z-20">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1">
                        <BadgePill severity={selectedHazard.severity} label={selectedHazard.severity} dot className="text-[8px] px-2 py-0.5" />
                        <span className="font-mono text-[10px] text-muted">#INC-8812</span>
                      </div>
                      <h4 className="font-bold text-[12px] text-ink mt-0.5">{selectedHazard.title}</h4>
                      <p className="text-[10px] text-muted flex items-center gap-1 mt-0.5">
                        <MapPin className="w-2.5 h-2.5 text-primary shrink-0" />
                        <span className="truncate">{selectedHazard.address}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-semantic-up font-mono font-bold text-[10px] block">
                        DISPATCHED
                      </span>
                      <span className="text-[9px] text-muted">ETA: {selectedHazard.eta}</span>
                    </div>
                  </div>

                  {/* Action CTA: Report New Hazard Button */}
                  <button
                    onClick={() => setActiveTab('camera')}
                    className="w-full bg-primary hover:bg-primary-active active:scale-[0.99] text-on-primary py-2 rounded-pill font-semibold text-[12px] flex items-center justify-center gap-1.5 shadow-soft transition-all cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Report Hazard with AI Camera</span>
                  </button>
                </div>
              </div>
            )}

            {/* VIEW 2: AI CAMERA SCANNER */}
            {activeTab === 'camera' && (
              <div className="h-full flex flex-col justify-between p-3 relative bg-surface-soft">
                {/* Camera Viewfinder */}
                <div className="relative flex-1 rounded-xl overflow-hidden border border-hairline bg-black flex items-center justify-center">
                  <img
                    src={currentHazard.image}
                    alt="Hazard Viewfinder"
                    className="w-full h-full object-cover opacity-90"
                  />

                  {/* AI Laser Scan Line */}
                  <div className="absolute inset-x-0 h-1 bg-primary shadow-[0_0_15px_#0052ff] animate-bounce pointer-events-none" />

                  {/* AI Bounding Box */}
                  <div className="absolute inset-4 border-2 border-primary rounded-lg bg-primary/10 flex flex-col justify-between p-2.5 pointer-events-none">
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col gap-1">
                        <span className="bg-primary text-on-primary font-mono text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                          {currentHazard.category} {currentHazard.confidence}
                        </span>
                        <span className="bg-black/75 text-white font-mono text-[9px] px-1 py-0.5 rounded">
                          {currentHazard.depth}
                        </span>
                      </div>
                      <BadgePill severity={currentHazard.severity} label={currentHazard.severity} className="text-[8px] px-1.5 py-0.5" />
                    </div>

                    <div className="flex items-center justify-between bg-black/80 text-white px-2 py-0.5 rounded text-[9px]">
                      <span className="font-mono">{currentHazard.coords}</span>
                      <span className="text-semantic-up font-bold">LOCKED</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setHazardIndex((prev) => (prev + 1) % HAZARDS.length)}
                    className="absolute top-2 right-2 bg-white/90 hover:bg-white text-ink px-2 py-0.5 rounded-pill text-[9px] font-semibold flex items-center gap-1 shadow cursor-pointer"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>Switch</span>
                  </button>
                </div>

                {/* Bottom Diagnosis Card */}
                <div className="mt-2.5 bg-canvas border border-hairline rounded-xl p-2.5 shadow-soft flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-[12px] text-ink">{currentHazard.title}</h4>
                      <span className="text-[10px] text-muted">{currentHazard.ward}</span>
                    </div>
                    <span className="text-primary font-mono text-[10px] font-bold">98.4% MATCH</span>
                  </div>

                  <button
                    onClick={() => setActiveTab('track')}
                    className="w-full bg-primary hover:bg-primary-active text-on-primary py-2 rounded-pill font-semibold text-[12px] flex items-center justify-center gap-1.5 shadow-soft transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Submit & Dispatch Work Order</span>
                  </button>
                </div>
              </div>
            )}

            {/* VIEW 3: TRACK MY REPORTS */}
            {activeTab === 'track' && (
              <div className="h-full p-3 overflow-y-auto flex flex-col gap-2.5 bg-surface-soft">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-ink uppercase tracking-wider">My Submissions</span>
                  <BadgePill severity="HIGH" label="1 ACTIVE" dot className="text-[8px] px-1.5 py-0.5" />
                </div>

                <div className="bg-canvas border border-hairline rounded-xl p-3 shadow-soft flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-mono text-muted">#INC-8812</span>
                    <span className="text-semantic-up font-bold font-mono">DISPATCHED</span>
                  </div>

                  <h4 className="font-bold text-[12px] text-ink">Deep Asphalt Pothole Repair</h4>

                  {/* Progress Line */}
                  <div className="flex items-center justify-between text-[9px] font-mono text-muted mt-0.5">
                    <span className="text-primary font-bold">Reported</span>
                    <span className="text-primary font-bold">Verified</span>
                    <span className="text-primary font-bold">Dispatched</span>
                    <span>Resolved</span>
                  </div>
                  <div className="w-full bg-surface-strong h-1 rounded-full overflow-hidden">
                    <div className="bg-primary h-full w-3/4 rounded-full" />
                  </div>

                  <div className="bg-surface-soft p-2 rounded-lg text-[10px] flex items-center justify-between text-muted mt-0.5">
                    <span>Crew: <strong className="text-ink">Rapid Asphalt 04</strong></span>
                    <span className="font-mono text-primary font-bold">ETA: 8m</span>
                  </div>
                </div>

                <div className="bg-canvas border border-hairline rounded-xl p-2.5 shadow-soft flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-mono text-muted">#INC-8830 • YESTERDAY</span>
                    <h5 className="font-bold text-[11px] text-ink">Debris Blockage Cleared</h5>
                  </div>
                  <BadgePill status="RESOLVED" label="RESOLVED" className="text-[8px] px-1.5 py-0.5" />
                </div>
              </div>
            )}

            {/* VIEW 4: SAFETY ALERTS */}
            {activeTab === 'alerts' && (
              <div className="h-full p-3 overflow-y-auto flex flex-col gap-2.5 bg-surface-soft">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-ink uppercase tracking-wider">Live Advisories</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-severity-critical animate-ping" />
                </div>

                <div className="bg-canvas border border-severity-critical/30 rounded-xl p-3 shadow-soft">
                  <div className="flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-severity-critical shrink-0" />
                    <span className="text-[10px] font-bold text-severity-critical">CRITICAL ADVISORY</span>
                  </div>
                  <h4 className="text-[12px] font-bold text-ink mb-0.5">
                    Barakhamba Subway Waterlogged
                  </h4>
                  <p className="text-[10px] text-body leading-relaxed">
                    Underpass closed due to main breach. Traffic diverted to Tolstoy Marg.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 4. Android Navigation Bar */}
          <div className="h-12 bg-canvas border-t border-hairline px-3 flex items-center justify-around z-20 shadow-soft">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex flex-col items-center gap-0.5 cursor-pointer transition-colors ${
                activeTab === 'map' ? 'text-primary font-bold' : 'text-muted hover:text-ink'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span className="text-[9px]">Map</span>
            </button>

            <button
              onClick={() => setActiveTab('camera')}
              className={`flex flex-col items-center gap-0.5 cursor-pointer transition-colors ${
                activeTab === 'camera' ? 'text-primary font-bold' : 'text-muted hover:text-ink'
              }`}
            >
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-soft -mt-1.5">
                <Camera className="w-3.5 h-3.5" />
              </div>
              <span className="text-[9px]">Scan</span>
            </button>

            <button
              onClick={() => setActiveTab('track')}
              className={`flex flex-col items-center gap-0.5 cursor-pointer transition-colors ${
                activeTab === 'track' ? 'text-primary font-bold' : 'text-muted hover:text-ink'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span className="text-[9px]">Tickets</span>
            </button>

            <button
              onClick={() => setActiveTab('alerts')}
              className={`flex flex-col items-center gap-0.5 cursor-pointer transition-colors ${
                activeTab === 'alerts' ? 'text-primary font-bold' : 'text-muted hover:text-ink'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span className="text-[9px]">Alerts</span>
            </button>
          </div>

          {/* Android Home Bar */}
          <div className="w-full h-2.5 bg-canvas flex items-center justify-center pb-0.5">
            <div className="w-20 h-1 bg-ink/20 rounded-full" />
          </div>
        </div>
      </div>

      {/* Subtle indicator below device */}
      <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-surface-dark-elevated text-on-dark-soft text-[11px] font-mono border border-white/10">
        <Sparkles className="w-3 h-3 text-primary" />
        <span>Live Kotlin Android Simulator</span>
      </div>
    </div>
  );
};
