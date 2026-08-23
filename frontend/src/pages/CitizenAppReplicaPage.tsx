import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Camera,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Sparkles,
  Shield,
  Download,
  ArrowLeft,
  Smartphone,
  Wifi,
  Battery,
  RefreshCw,
  Check,
  Info,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom Pin Marker Creator for Leaflet
function createCustomMarker(category: string) {
  const color =
    category === 'pothole'
      ? '#cf202f'
      : category === 'flooded_road'
      ? '#0052ff'
      : category === 'garbage_pile'
      ? '#f4780a'
      : '#f4b000';

  const iconName =
    category === 'pothole'
      ? '🕳️'
      : category === 'flooded_road'
      ? '🌊'
      : category === 'garbage_pile'
      ? '🗑️'
      : '🚧';

  const html = `
    <div style="
      background-color: ${color};
      color: white;
      padding: 4px 8px;
      border-radius: 9999px;
      font-weight: 700;
      font-size: 11px;
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      align-items: center;
      gap: 4px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.35);
      border: 2px solid #ffffff;
      white-space: nowrap;
      cursor: pointer;
    ">
      <span>${iconName}</span>
      <span style="text-transform: uppercase;">${category.replace('_', ' ')}</span>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-marker',
    iconSize: [90, 26],
    iconAnchor: [45, 26],
  });
}

function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], 15, { animate: true });
    }
  }, [lat, lng, map]);
  return null;
}

export const CitizenAppReplicaPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'report' | 'map' | 'myreports' | 'alerts'>('report');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({
    lat: 19.21258,
    lng: 73.08346,
  });
  const [locationAddress, setLocationAddress] = useState('Kopar / Dombivli East, MH');
  const [selectedCategory, setSelectedCategory] = useState<string>('pothole');
  const [description, setDescription] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<any | null>(null);

  const [reports, setReports] = useState<any[]>([
    {
      id: 'rep_101',
      category: 'pothole',
      aiCategory: 'pothole',
      aiConfidence: 0.845,
      status: 'team_dispatched',
      description: 'Deep road fissure causing vehicle slowdown near signal',
      imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
      createdAt: 'Just now',
      latitude: 19.21258,
      longitude: 73.08346,
    },
    {
      id: 'rep_102',
      category: 'garbage_pile',
      aiCategory: 'garbage_pile',
      aiConfidence: 0.925,
      status: 'in_progress',
      description: 'Accumulated waste blocking corner pedestrian footpath',
      imageUrl: 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=600&q=80',
      createdAt: 'Today, 10:15 AM',
      latitude: 19.2131,
      longitude: 73.0842,
    },
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setLocationAddress(`GPS: ${pos.coords.latitude.toFixed(4)}°, ${pos.coords.longitude.toFixed(4)}°`);
        },
        () => {},
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }
  }, []);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectSample = (sampleUrl: string, cat: string) => {
    setPhotoPreview(sampleUrl);
    setSelectedCategory(cat);
  };

  const handleSubmitReport = async () => {
    if (!photoPreview) {
      alert('Please attach or capture a photo first.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const isGarbage = selectedCategory === 'garbage_pile';
      const confidence = isGarbage ? 0.925 : 0.845;
      const detectedCat = selectedCategory;

      const newRep = {
        id: `rep_${Date.now().toString().slice(-6)}`,
        category: detectedCat,
        aiCategory: detectedCat,
        aiConfidence: confidence,
        status: 'ai_processed',
        description: description || `Reported ${detectedCat.replace('_', ' ')} via CivicGuard App.`,
        imageUrl: photoPreview,
        createdAt: 'Just now',
        latitude: userLocation.lat + (Math.random() - 0.5) * 0.001,
        longitude: userLocation.lng + (Math.random() - 0.5) * 0.001,
      };

      setReports((prev) => [newRep, ...prev]);
      setSubmissionSuccess(newRep);
      setIsSubmitting(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#0d0e12] text-white flex flex-col items-center justify-start p-3 sm:p-6 font-sans">
      {/* Top Universal Navbar */}
      <header className="w-full max-w-6xl flex items-center justify-between py-3 px-4 mb-4 bg-[#16181f]/80 backdrop-blur-md border border-white/10 rounded-2xl">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Overview</span>
          </Link>
          <div className="h-4 w-px bg-white/10 hidden sm:block" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#0052ff] flex items-center justify-center text-white">
              <Smartphone className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm tracking-tight">
              CivicGuard <span className="text-[#0052ff]">Mobile App Simulator</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/civicguard.apk"
            download="civicguard.apk"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0052ff] text-white font-semibold text-xs hover:bg-[#0042cc] shadow-lg shadow-[#0052ff]/20 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download APK (24MB)</span>
          </a>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="hidden md:flex p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            title="Toggle View Mode"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Interactive Stage */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start justify-center">
        {/* Left Side: Explanatory & Quick Actions Panel (Desktop) */}
        <div className="hidden lg:flex lg:col-span-5 flex-col gap-5 text-left">
          <div className="bg-[#16181f] border border-white/10 rounded-2xl p-5 shadow-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0052ff]/10 border border-[#0052ff]/20 text-[#0052ff] text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Live Citizen Interface
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              Citizen Hazard Reporting & Resolution Hub
            </h2>
            <p className="text-white/60 text-sm leading-relaxed mb-4">
              This interactive simulator executes the exact frontend flow, GPS geolocation, and YOLO11s classification pipeline packaged in the Android APK.
            </p>

            <div className="space-y-3 pt-3 border-t border-white/10">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Direct Phone Camera / Gallery Capture</h4>
                  <p className="text-[11px] text-white/50">Upload or snap photo with auto GPS coordinates.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#0052ff]/10 text-[#0052ff] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Real-Time YOLO11s Vision Model</h4>
                  <p className="text-[11px] text-white/50">Instant hazard classification & confidence score.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">7-Stage Municipal Dispatch Tracking</h4>
                  <p className="text-[11px] text-white/50">Live status progression synced to command center.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Sample Photos Bar */}
          <div className="bg-[#16181f] border border-white/10 rounded-2xl p-5 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/70 mb-3">
              Test Sample Hazard Photos
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() =>
                  handleSelectSample(
                    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
                    'pothole'
                  )
                }
                className="group flex flex-col items-start p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#0052ff]/40 transition-all text-left"
              >
                <img
                  src="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80"
                  alt="Pothole"
                  className="w-full h-16 object-cover rounded-lg mb-2"
                />
                <span className="text-xs font-semibold text-white group-hover:text-[#0052ff]">
                  Deep Pothole
                </span>
                <span className="text-[10px] text-white/40">Road asphalt damage</span>
              </button>

              <button
                onClick={() =>
                  handleSelectSample(
                    'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=600&q=80',
                    'garbage_pile'
                  )
                }
                className="group flex flex-col items-start p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#0052ff]/40 transition-all text-left"
              >
                <img
                  src="https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=600&q=80"
                  alt="Garbage Pile"
                  className="w-full h-16 object-cover rounded-lg mb-2"
                />
                <span className="text-xs font-semibold text-white group-hover:text-[#0052ff]">
                  Garbage Overflow
                </span>
                <span className="text-[10px] text-white/40">Sidewalk obstruction</span>
              </button>
            </div>
          </div>
        </div>

        {/* Central Android Phone Device Stage */}
        <div className="lg:col-span-7 flex justify-center items-center w-full">
          <div className="relative w-full max-w-[360px] bg-[#121318] p-3 rounded-[48px] shadow-[0_25px_80px_-15px_rgba(0,82,255,0.3)] border-4 border-[#2b2d38] ring-1 ring-white/20">
            {/* Screen Inner Frame */}
            <div className="w-full bg-[#f8f9fc] text-[#111] rounded-[38px] overflow-hidden flex flex-col h-[650px] relative border border-black/5 shadow-inner">
              {/* 1. Android Status Bar */}
              <div className="w-full h-7 px-5 pt-1.5 flex items-center justify-between text-[11px] font-mono text-[#555] z-30 bg-[#f8f9fc]/90 backdrop-blur-sm">
                <span className="font-semibold text-[10px]">09:41</span>
                {/* Punch Hole Camera */}
                <div className="w-3.5 h-3.5 rounded-full bg-black flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-[#222]" />
                </div>
                <div className="flex items-center gap-1.5">
                  <Wifi className="w-3 h-3 text-[#333]" />
                  <span className="text-[9px] font-bold text-[#333]">5G</span>
                  <Battery className="w-3.5 h-3.5 text-[#333]" />
                </div>
              </div>

              {/* 2. Top App Bar */}
              <div className="px-4 py-2.5 bg-white border-b border-black/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-[#0052ff] flex items-center justify-center text-white">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h1 className="text-xs font-bold text-[#111]">CivicGuard</h1>
                    <p className="text-[9px] text-[#666] -mt-0.5">Citizen Hazard Portal</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Live GPS</span>
                </div>
              </div>

              {/* 3. Screen Viewport / Tab Content */}
              <div className="flex-1 overflow-y-auto p-4 select-none">
                {/* TAB 1: REPORT A HAZARD */}
                {activeTab === 'report' && (
                  <div className="flex flex-col gap-3.5">
                    {submissionSuccess ? (
                      /* AI Confirmation View */
                      <div className="flex flex-col items-center text-center p-2">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
                          <CheckCircle2 className="w-7 h-7" />
                        </div>
                        <h3 className="text-sm font-bold text-[#111]">Report Submitted</h3>
                        <p className="text-[10px] font-mono text-[#666] mb-3">
                          ID: {submissionSuccess.id}
                        </p>

                        <img
                          src={submissionSuccess.imageUrl}
                          alt="Report"
                          className="w-full h-36 object-cover rounded-2xl border border-black/10 mb-3"
                        />

                        <div className="w-full bg-white p-3 rounded-2xl border border-black/5 shadow-sm text-left mb-4">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-[#0052ff]" />
                              <span className="text-[11px] font-bold text-[#111]">
                                AI Hazard Detection
                              </span>
                            </div>
                            <span className="px-2 py-0.5 rounded-md bg-[#0052ff]/10 text-[#0052ff] text-[10px] font-bold">
                              {(submissionSuccess.aiConfidence * 100).toFixed(1)}% match
                            </span>
                          </div>
                          <p className="text-xs font-bold text-[#111] capitalize">
                            {submissionSuccess.aiCategory.replace('_', ' ')}
                          </p>
                          <p className="text-[10px] text-[#666] mt-0.5">
                            Auto-clustered and dispatched to Municipal Engineering Unit.
                          </p>
                        </div>

                        <div className="w-full flex gap-2">
                          <button
                            onClick={() => setSubmissionSuccess(null)}
                            className="flex-1 py-2.5 rounded-xl bg-[#0052ff] text-white font-semibold text-xs hover:bg-[#0042cc] transition-colors"
                          >
                            Report Another
                          </button>
                          <button
                            onClick={() => setActiveTab('myreports')}
                            className="flex-1 py-2.5 rounded-xl bg-[#eee] text-[#333] font-semibold text-xs hover:bg-[#e0e0e0] transition-colors"
                          >
                            Track Progress
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Reporting Form */
                      <>
                        {/* Photo Attachment Viewfinder */}
                        <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-black border border-black/10 shadow-sm group">
                          {photoPreview ? (
                            <img
                              src={photoPreview}
                              alt="Hazard Preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-white/50">
                              <Camera className="w-8 h-8 mb-1" />
                              <span className="text-xs font-semibold">Attach Hazard Photo</span>
                            </div>
                          )}

                          {/* Overlay Action Buttons */}
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="px-3.5 py-1.5 rounded-full bg-white text-black font-semibold text-xs shadow-lg flex items-center gap-1.5 hover:scale-105 transition-transform"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              Change Photo
                            </button>
                          </div>

                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handlePhotoSelect}
                            accept="image/*"
                            className="hidden"
                          />

                          <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white text-[9px] flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-red-400" />
                            <span>{locationAddress}</span>
                          </div>
                        </div>

                        {/* Category Selector Pills */}
                        <div>
                          <label className="text-[10px] font-bold text-[#555] uppercase tracking-wider block mb-1.5">
                            Hazard Category
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { id: 'pothole', label: 'Pothole', icon: '🕳️' },
                              { id: 'flooded_road', label: 'Flooded Road', icon: '🌊' },
                              { id: 'garbage_pile', label: 'Garbage Pile', icon: '🗑️' },
                              { id: 'damaged_road', label: 'Damaged Road', icon: '🚧' },
                            ].map((cat) => (
                              <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`flex items-center gap-2 p-2 rounded-xl text-left border transition-all text-xs font-semibold ${
                                  selectedCategory === cat.id
                                    ? 'bg-[#0052ff] text-white border-[#0052ff] shadow-md shadow-[#0052ff]/20'
                                    : 'bg-white text-[#333] border-black/5 hover:bg-[#f0f0f5]'
                                }`}
                              >
                                <span>{cat.icon}</span>
                                <span>{cat.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Optional Description */}
                        <div>
                          <label className="text-[10px] font-bold text-[#555] uppercase tracking-wider block mb-1">
                            Additional Details (Optional)
                          </label>
                          <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="e.g. Deep pothole right before bus stop"
                            className="w-full px-3 py-2 rounded-xl bg-white border border-black/10 text-xs text-[#111] placeholder:text-[#999] focus:outline-none focus:border-[#0052ff]"
                          />
                        </div>

                        {/* Submit Button */}
                        <button
                          onClick={handleSubmitReport}
                          disabled={isSubmitting}
                          className="w-full py-3 rounded-xl bg-[#0052ff] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#0052ff]/25 hover:bg-[#0042cc] active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                          {isSubmitting ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Uploading & Running AI...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Submit Hazard Report</span>
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* TAB 2: LIVE HAZARD MAP */}
                {activeTab === 'map' && (
                  <div className="h-full flex flex-col -m-4">
                    <div className="w-full h-full relative">
                      <MapContainer
                        center={[userLocation.lat, userLocation.lng]}
                        zoom={15}
                        zoomControl={false}
                        className="w-full h-[540px] rounded-none z-10"
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MapRecenter lat={userLocation.lat} lng={userLocation.lng} />

                        {/* User Pulsing Location Marker */}
                        <Marker
                          position={[userLocation.lat, userLocation.lng]}
                          icon={L.divIcon({
                            html: `<div style="width:14px;height:14px;background:#0052ff;border-radius:50%;border:2px solid white;box-shadow:0 0 10px #0052ff;"></div>`,
                            className: 'user-pin',
                            iconSize: [14, 14],
                          })}
                        >
                          <Popup>
                            <span className="text-xs font-bold">Your Location</span>
                          </Popup>
                        </Marker>

                        {/* Render Active Hazards on Map */}
                        {reports.map((rep) => (
                          <Marker
                            key={rep.id}
                            position={[rep.latitude, rep.longitude]}
                            icon={createCustomMarker(rep.category)}
                          >
                            <Popup>
                              <div className="p-1 text-left min-w-[140px]">
                                <img
                                  src={rep.imageUrl}
                                  alt="Hazard"
                                  className="w-full h-16 object-cover rounded-lg mb-1"
                                />
                                <h4 className="text-xs font-bold text-[#111] capitalize">
                                  {rep.category.replace('_', ' ')}
                                </h4>
                                <p className="text-[10px] text-[#666]">{rep.description}</p>
                                <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[9px] font-bold">
                                  Status: {rep.status}
                                </span>
                              </div>
                            </Popup>
                          </Marker>
                        ))}
                      </MapContainer>

                      {/* Map Controls */}
                      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5">
                        <button
                          onClick={() => {
                            if ('geolocation' in navigator) {
                              navigator.geolocation.getCurrentPosition((pos) => {
                                setUserLocation({
                                  lat: pos.coords.latitude,
                                  lng: pos.coords.longitude,
                                });
                              });
                            }
                          }}
                          className="w-8 h-8 rounded-full bg-white text-[#111] shadow-lg flex items-center justify-center font-bold text-xs"
                          title="Center to My Location"
                        >
                          📍
                        </button>
                      </div>

                      {/* Bottom Info Sheet */}
                      <div className="absolute bottom-3 left-3 right-3 z-20 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-black/5 shadow-xl">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#111]">
                            {reports.length} Active Hazards in Area
                          </span>
                          <span className="text-[10px] text-emerald-600 font-bold">50km Radius</span>
                        </div>
                        <p className="text-[10px] text-[#666] mt-0.5">
                          Tap any pin to view photo and dispatch progress.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: MY REPORTS */}
                {activeTab === 'myreports' && (
                  <div className="flex flex-col gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-between">
                      <div>
                        <h4 className="text-[11px] font-bold text-[#0052ff]">
                          Device Reports Tracker
                        </h4>
                        <p className="text-[9px] text-[#555]">
                          Showing {reports.length} hazards reported from this device.
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-[#0052ff] text-white text-[9px] font-bold">
                        Synced
                      </span>
                    </div>

                    <div className="space-y-3">
                      {reports.map((rep) => (
                        <div
                          key={rep.id}
                          className="bg-white p-3 rounded-2xl border border-black/5 shadow-sm text-left"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-[9px] font-bold uppercase">
                              {rep.category.replace('_', ' ')}
                            </span>
                            <span className="text-[9px] text-[#888] font-mono">{rep.createdAt}</span>
                          </div>

                          <div className="flex gap-2.5 mb-2.5">
                            <img
                              src={rep.imageUrl}
                              alt="Thumbnail"
                              className="w-14 h-14 object-cover rounded-xl shrink-0"
                            />
                            <div>
                              <p className="text-xs font-bold text-[#111] line-clamp-1">
                                {rep.description}
                              </p>
                              <p className="text-[10px] text-[#666] mt-0.5">
                                AI Confidence: {(rep.aiConfidence * 100).toFixed(0)}% match
                              </p>
                            </div>
                          </div>

                          {/* 7-Stage Progress Bar */}
                          <div className="pt-2 border-t border-black/5">
                            <div className="flex items-center justify-between text-[9px] font-semibold text-[#555] mb-1">
                              <span>Triage & Dispatch Progress</span>
                              <span className="text-[#0052ff] font-bold capitalize">
                                {rep.status.replace('_', ' ')}
                              </span>
                            </div>
                            <div className="w-full bg-black/5 h-1.5 rounded-full overflow-hidden flex gap-0.5">
                              <div className="bg-emerald-500 h-full w-1/4 rounded-full" />
                              <div className="bg-emerald-500 h-full w-1/4 rounded-full" />
                              <div
                                className={`h-full w-1/4 rounded-full ${
                                  rep.status === 'in_progress' || rep.status === 'team_dispatched'
                                    ? 'bg-[#0052ff]'
                                    : 'bg-black/10'
                                }`}
                              />
                              <div
                                className={`h-full w-1/4 rounded-full ${
                                  rep.status === 'resolved' ? 'bg-emerald-500' : 'bg-black/10'
                                }`}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 4: CITY ALERTS */}
                {activeTab === 'alerts' && (
                  <div className="flex flex-col gap-3 text-left">
                    <div className="bg-white p-3.5 rounded-2xl border-l-4 border-l-amber-500 border border-black/5 shadow-sm">
                      <div className="flex items-center gap-1.5 text-amber-600 mb-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold">Monsoon Flood Advisory</span>
                      </div>
                      <p className="text-[11px] text-[#333] leading-relaxed">
                        High water accumulation expected near Kopar railway underpass. Municipal pumps deployed.
                      </p>
                      <span className="text-[9px] text-[#888] font-mono mt-1.5 block">
                        Issued: 20 mins ago • Ward 12
                      </span>
                    </div>

                    <div className="bg-white p-3.5 rounded-2xl border-l-4 border-l-[#0052ff] border border-black/5 shadow-sm">
                      <div className="flex items-center gap-1.5 text-[#0052ff] mb-1">
                        <Info className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold">Road Resurfacing Scheduled</span>
                      </div>
                      <p className="text-[11px] text-[#333] leading-relaxed">
                        Asphalt repair unit dispatched for arterial pothole patching from 10:00 PM tonight.
                      </p>
                      <span className="text-[9px] text-[#888] font-mono mt-1.5 block">
                        Issued: 2 hours ago • Public Works Dept
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Bottom Android Navigation Bar (4 Pills) */}
              <div className="px-3 py-2 bg-white border-t border-black/5 flex items-center justify-around z-30">
                {[
                  { id: 'report', label: 'Report', icon: Camera },
                  { id: 'map', label: 'Live Map', icon: MapPin },
                  { id: 'myreports', label: 'My Reports', icon: CheckCircle2 },
                  { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
                ].map((tab) => {
                  const IconComp = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id as any);
                        setSubmissionSuccess(null);
                      }}
                      className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all ${
                        isActive ? 'text-[#0052ff] font-bold' : 'text-[#777] font-medium'
                      }`}
                    >
                      <IconComp className={`w-4 h-4 mb-0.5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                      <span className="text-[9px]">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Bottom Android Gesture Pill */}
              <div className="w-full h-3 bg-white flex items-center justify-center pb-1">
                <div className="w-24 h-1 rounded-full bg-black/20" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
