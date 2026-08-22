import React, { useState } from 'react';
import { BadgePill } from '../common/BadgePill';
import {
  Sparkles,
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Camera,
  Navigation,
  ShieldCheck,
  Eye,
} from 'lucide-react';

const VISION_CASES = [
  {
    id: 'case_1',
    label: 'Deep Road Pothole',
    category: 'POTHOLE',
    severity: 'CRITICAL' as const,
    confidence: '98.6%',
    depthAnalysis: '15.4cm depth • 42cm width',
    classification: 'High-speed tire blowout hazard',
    coords: '28.6139° N, 77.2090° E (Ward 12)',
    image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    tags: ['Asphalt Structural Failure', 'Sub-base Exposed', 'Immediate Patch Required'],
  },
  {
    id: 'case_2',
    label: 'Subway Water Breach',
    category: 'WATER_LEAK',
    severity: 'CRITICAL' as const,
    confidence: '99.1%',
    depthAnalysis: '32cm standing water inundation',
    classification: 'Municipal main pipe rupture',
    coords: '28.6289° N, 77.2185° E (Ward 04)',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    tags: ['Underpass Submersion', 'Hydro Isolation Needed', 'Traffic Diversion Active'],
  },
  {
    id: 'case_3',
    label: 'Fallen Tree on Powerline',
    category: 'FALLEN_TREE',
    severity: 'HIGH' as const,
    confidence: '96.4%',
    depthAnalysis: '6.2m limb span on 11kV conductor',
    classification: 'Arboreal electrical fire hazard',
    coords: '28.5980° N, 77.2250° E (Ward 08)',
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
    tags: ['Live Conductor Contact', 'Arbor Squad Required', 'Zone Grid De-energized'],
  },
  {
    id: 'case_4',
    label: 'Uncovered Manhole Cover',
    category: 'OPEN_MANHOLE',
    severity: 'CRITICAL' as const,
    confidence: '97.8%',
    depth: '1.8m shaft fall hazard',
    classification: 'Pedestrian & cyclist fall danger',
    coords: '28.6350° N, 77.2010° E (Ward 15)',
    image: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80',
    tags: ['Missing Ductile Iron Grate', 'School Zone Proximity', 'Emergency Cordon Dispatched'],
  },
];

export const VisionEngineShowcase: React.FC = () => {
  const [activeCaseIndex, setActiveCaseIndex] = useState(0);
  const activeCase = VISION_CASES[activeCaseIndex];

  return (
    <section className="w-full bg-canvas py-24 px-6 border-b border-hairline">
      <div className="max-w-[1200px] mx-auto text-left">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <BadgePill label="MULTIMODAL NEURAL VISION" variant="neutral" className="mb-4" />
          <h2 className="type-display-lg text-ink max-w-2xl">
            AI trained on millions of municipal infrastructure failure patterns.
          </h2>
          <p className="type-body-md text-muted max-w-xl mt-4">
            On-device and cloud neural networks classify street hazards in under 300 milliseconds, calculate spatial dimensions, and reject duplicates instantly.
          </p>
        </div>

        {/* Interactive Case Selector Bar */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-8">
          {VISION_CASES.map((c, idx) => (
            <button
              key={c.id}
              onClick={() => setActiveCaseIndex(idx)}
              className={`px-4 py-2 rounded-pill text-[13px] font-semibold transition-all cursor-pointer ${
                activeCaseIndex === idx
                  ? 'bg-ink text-canvas shadow-soft'
                  : 'bg-surface-strong text-body hover:text-ink'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Vision Inspection Workbench */}
        <div className="bg-surface-soft border border-hairline rounded-2xl p-6 sm:p-8 shadow-card-hover grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Viewfinder with Bounding Reticle (7 cols) */}
          <div className="lg:col-span-7 relative rounded-xl overflow-hidden border border-hairline aspect-video bg-black shadow-soft flex items-center justify-center">
            <img
              src={activeCase.image}
              alt={activeCase.label}
              className="w-full h-full object-cover opacity-90 transition-opacity duration-300"
            />

            {/* Neural Bounding Box Overlay */}
            <div className="absolute inset-6 border-2 border-primary rounded-xl bg-primary/10 flex flex-col justify-between p-3.5 pointer-events-none">
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <span className="bg-primary text-on-primary font-mono text-[11px] font-bold px-2 py-0.5 rounded shadow">
                    NEURAL MATCH: {activeCase.category}
                  </span>
                  <span className="bg-black/80 text-white font-mono text-[10px] px-2 py-0.5 rounded">
                    {activeCase.depthAnalysis || activeCase.classification}
                  </span>
                </div>
                <BadgePill severity={activeCase.severity} label={activeCase.severity} dot />
              </div>

              <div className="flex items-center justify-between bg-black/85 text-white px-3 py-1.5 rounded-lg text-[11px] font-mono">
                <div className="flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-primary" />
                  <span>{activeCase.coords}</span>
                </div>
                <span className="text-semantic-up font-bold">VERIFIED REAL-TIME</span>
              </div>
            </div>
          </div>

          {/* Right: Neural Telemetry Breakdown (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-primary" />
                  <span className="font-mono text-[12px] font-semibold text-primary uppercase">
                    Neural Inference Engine
                  </span>
                </div>
                <span className="font-mono font-bold text-ink text-[18px]">
                  {activeCase.confidence}
                </span>
              </div>

              <h3 className="type-title-md text-ink text-[22px] font-bold">
                {activeCase.label}
              </h3>
              <p className="type-body-sm text-body mt-1 leading-relaxed">
                {activeCase.classification}
              </p>
            </div>

            {/* Feature Tag Pills */}
            <div className="flex flex-wrap gap-2">
              {activeCase.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-pill bg-canvas border border-hairline text-ink text-[12px] font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Latency & Hardware Benchmarks */}
            <div className="pt-4 border-t border-hairline grid grid-cols-2 gap-3 text-[12px]">
              <div className="p-3 bg-canvas rounded-lg border border-hairline">
                <span className="text-muted block text-[10px] uppercase font-mono">Inference Time</span>
                <strong className="font-mono text-ink text-[16px]">240ms</strong>
                <span className="text-muted block text-[11px]">On-device Kotlin SDK</span>
              </div>
              <div className="p-3 bg-canvas rounded-lg border border-hairline">
                <span className="text-muted block text-[10px] uppercase font-mono">Deduplication</span>
                <strong className="font-mono text-semantic-up text-[16px]">Automated</strong>
                <span className="text-muted block text-[11px]">Spatial Clustering</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
