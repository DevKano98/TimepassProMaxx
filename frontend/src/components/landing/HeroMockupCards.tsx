import React from 'react';
import { AndroidPhoneMockup } from './AndroidPhoneMockup';
import { AlertTriangle, CheckCircle2, Shield, Sparkles, Navigation, MapPin } from 'lucide-react';
import { BadgePill } from '../common/BadgePill';

export const HeroMockupCards: React.FC = () => {
  return (
    <div className="relative w-full flex flex-col items-center justify-center py-4">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] bg-primary/20 blur-[100px] rounded-full pointer-events-none -z-10" />

      {/* Main Container with the phone and beautifully positioned side cards on large desktop */}
      <div className="relative flex items-center justify-center">
        {/* Floating Card 1: Top Left - Proactive Hazard Alert Pill (Positioned outside phone footprint) */}
        <div className="hidden 2xl:flex absolute -top-4 -left-36 z-20 bg-surface-dark-elevated/95 border border-white/10 p-3.5 rounded-xl shadow-2xl backdrop-blur-md items-center gap-3 w-56 transform -rotate-3 hover:rotate-0 transition-transform">
          <div className="w-8 h-8 rounded-full bg-severity-high/10 flex items-center justify-center text-severity-high shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-on-dark uppercase tracking-wider">Hazard Lock</span>
              <BadgePill severity="HIGH" label="HIGH" className="text-[8px] px-1.5 py-0.5" />
            </div>
            <p className="text-[11px] text-on-dark-soft font-mono mt-0.5">Ward 12 • 420m away</p>
          </div>
        </div>

        {/* Central Interactive Android Phone Mockup */}
        <div className="relative z-10">
          <AndroidPhoneMockup />
        </div>

        {/* Floating Card 2: Bottom Right - Live Field Dispatch Progress (Positioned outside phone footprint) */}
        <div className="hidden 2xl:flex absolute -bottom-4 -right-36 z-20 bg-surface-dark-elevated/95 border border-white/10 p-3.5 rounded-xl shadow-2xl backdrop-blur-md flex-col gap-2 w-56 transform rotate-3 hover:rotate-0 transition-transform">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-on-dark-soft">TICKET #INC-8812</span>
            <span className="w-2 h-2 rounded-full bg-semantic-up animate-pulse" />
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-semantic-up shrink-0" />
            <span className="text-[12px] font-semibold text-on-dark">Crew Dispatched</span>
          </div>
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div className="bg-primary h-full w-3/4 rounded-full" />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-on-dark-soft">
            <span>Rapid Unit 04</span>
            <span className="text-primary font-bold">ETA: 8m</span>
          </div>
        </div>
      </div>
    </div>
  );
};
