import React from 'react';
import { Camera, BrainCircuit, Users, CheckCheck, MapPin, Navigation, Sparkles } from 'lucide-react';
import { BadgePill } from '../common/BadgePill';
import { ScannerPulseLottie, VerifiedCheckLottie } from './LottieAnimations';

const STEPS = [
  {
    step: '01',
    title: 'Snap photo & precise GPS',
    description:
      'Point your phone camera at potholes, broken lights, or water leaks. CivicGuard captures high-accuracy coordinates automatically.',
    icon: <Camera className="w-5 h-5 text-primary" />,
    tag: 'CITIZEN CAPTURE',
    visual: (
      <div className="mt-4 p-2.5 rounded-lg bg-surface-dark text-on-dark text-[11px] font-mono flex items-center justify-between border border-white/10">
        <div className="flex items-center gap-1.5 text-on-dark-soft">
          <Navigation className="w-3 h-3 text-primary animate-pulse" />
          <span>28.6139° N, 77.2090° E</span>
        </div>
        <span className="text-primary font-bold">±1.2m</span>
      </div>
    ),
  },
  {
    step: '02',
    title: 'Instant AI classification',
    description:
      'On-device and cloud vision models assess hazard type, structural severity, and eliminate duplicate reports in seconds.',
    icon: <BrainCircuit className="w-5 h-5 text-primary" />,
    tag: 'VISION AI v4.2',
    visual: (
      <div className="mt-4 p-2.5 rounded-lg bg-primary/10 border border-primary/20 text-[11px] font-mono flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="font-bold text-ink">POTHOLE DETECTED</span>
        </div>
        <span className="text-primary font-bold">98.4% CONF</span>
      </div>
    ),
  },
  {
    step: '03',
    title: 'Authority triage & dispatch',
    description:
      'Municipal control rooms verify work orders and direct dedicated field crews with turn-by-turn routing and parts manifest.',
    icon: <Users className="w-5 h-5 text-primary" />,
    tag: 'RAPID DISPATCH',
    visual: (
      <div className="mt-4 p-2.5 rounded-lg bg-surface-strong text-[11px] font-mono flex items-center justify-between">
        <span className="text-muted truncate">Unit: Rapid Asphalt 04</span>
        <span className="text-semantic-up font-bold">EN ROUTE</span>
      </div>
    ),
  },
  {
    step: '04',
    title: 'Live resolution updates',
    description:
      'Track the repair in real time. Receive verified before-and-after photo confirmation once the street is safe.',
    icon: <CheckCheck className="w-5 h-5 text-semantic-up" />,
    tag: 'VERIFICATION',
    visual: (
      <div className="mt-4 p-2.5 rounded-lg bg-semantic-up/10 border border-semantic-up/20 text-semantic-up text-[11px] font-mono flex items-center justify-between">
        <span className="font-bold">✓ Road Surface Restored</span>
        <span className="text-[10px] text-muted">Audited</span>
      </div>
    ),
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="w-full bg-canvas py-24 border-b border-hairline">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <BadgePill label="HOW CIVICGUARD WORKS" variant="neutral" className="mb-4" />
          <h2 className="type-display-lg text-ink max-w-2xl">
            From citizen report to municipal repair in four transparent steps.
          </h2>
          <p className="type-body-md text-muted max-w-xl mt-4">
            CivicGuard bridges citizens and municipal engineers with real-time telemetry, automated triage, and verifiable proof of work.
          </p>
        </div>

        {/* 4-Step Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step) => (
            <div
              key={step.step}
              className="bg-canvas border border-hairline rounded-xl p-6 flex flex-col justify-between hover:border-hairline/80 hover:shadow-card-hover transition-all duration-200 group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-full bg-surface-strong flex items-center justify-center group-hover:scale-105 transition-transform">
                    {step.icon}
                  </div>
                  <span className="font-mono text-[18px] font-bold text-muted-soft">
                    {step.step}
                  </span>
                </div>
                <BadgePill label={step.tag} variant="outline" className="text-[10px] mb-2.5" />
                <h3 className="type-title-md text-ink mb-2 group-hover:text-primary transition-colors">
                  {step.title}
                </h3>
                <p className="type-body-sm text-body leading-relaxed text-[13px]">
                  {step.description}
                </p>
              </div>

              {step.visual}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
