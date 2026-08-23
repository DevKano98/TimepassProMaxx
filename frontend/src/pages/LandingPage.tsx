import React from 'react';
import { Link } from 'react-router-dom';
import { TopNav } from '../components/layout/TopNav';
import { HeroMockupCards } from '../components/landing/HeroMockupCards';
import { CommandCenterShowcase } from '../components/landing/CommandCenterShowcase';
import { HowItWorks } from '../components/landing/HowItWorks';
import { VisionEngineShowcase } from '../components/landing/VisionEngineShowcase';
import { FeatureHighlights } from '../components/landing/FeatureHighlights';
import { EcosystemFlow } from '../components/landing/EcosystemFlow';
import { CtaBand } from '../components/landing/CtaBand';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/common/Button';
import { Download, ArrowRight, Shield, CheckCircle, Smartphone } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/civicguard.apk';
    link.download = 'civicguard.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const handleScrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col">
      {/* 1. Top Nav (on dark hero) */}
      <TopNav variant="on-dark" />

      {/* 2. Hero Band Dark (Full-bleed dark editorial hero) */}
      <section className="w-full bg-surface-dark text-on-dark pt-16 pb-24 px-6 border-b border-white/10 relative overflow-hidden">
        {/* Background grid texture */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none opacity-40" />

        <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
          {/* Left Column: Display Mega Headline + Subhead + CTAs (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-pill bg-surface-dark-elevated border border-white/10 text-on-dark mb-6">
              <span className="w-2 h-2 rounded-full bg-semantic-up animate-pulse" />
              <span className="text-[12px] font-mono tracking-wider uppercase text-on-dark-soft">
                Civic AI 4.2 Vision Engine Active
              </span>
            </div>

            <h1 className="type-display-mega text-on-dark max-w-xl mb-6">
              Report it. Track it. <span className="text-primary">Fixed.</span>
            </h1>

            <p className="type-body-md text-on-dark-soft max-w-lg mb-8 text-[18px] leading-relaxed">
              CivicGuard pairs citizen smartphone cameras with real-time AI vision and municipal dispatch to repair broken roads, streetlights, and water mains faster.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
              <Button
                variant="pill-cta"
                onClick={handleDownload}
                icon={<Download className="w-5 h-5" />}
              >
                Download APK (24MB)
              </Button>
              <Link
                to="/app"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm transition-all"
              >
                <Smartphone className="w-4 h-4 text-primary" />
                <span>Try App Simulator</span>
              </Link>
            </div>


            {/* Micro proof badges */}
            <div className="flex items-center gap-6 mt-10 pt-6 border-t border-white/10 text-on-dark-soft text-[13px]">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-semantic-up" />
                <span>Zero Citizen Friction</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-primary" />
                <span>Encrypted Telemetry</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-on-dark" />
                <span>Offline Sync</span>
              </div>
            </div>
          </div>

          {/* Right Column: High-Fidelity White Screen Android Phone Stage (5 cols) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <HeroMockupCards />
          </div>
        </div>
      </section>

      {/* 3. CRAZY DASHBOARD SHOWCASE: Live Interactive Command Center Deck */}
      <CommandCenterShowcase />

      {/* 4. Light Band: How It Works (4-Step Feature Grid) */}
      <HowItWorks />

      {/* 5. INTERACTIVE VISION ENGINE: AI Neural Hazard Workbench */}
      <VisionEngineShowcase />

      {/* 6. Light Band: Feature Highlights (3-Up Grid) */}
      <FeatureHighlights />

      {/* 7. ECOSYSTEM FLOW: Connected Municipal Response Pipeline */}
      <EcosystemFlow />

      {/* 8. CTA Band Dark (Pre-footer) */}
      <CtaBand />

      {/* 9. Footer Light */}
      <Footer />
    </div>
  );
};
