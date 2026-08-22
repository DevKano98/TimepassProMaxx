import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-canvas text-body border-t border-hairline pt-16 pb-12">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* 6-Column Grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-16">
          {/* Col 1: Brand */}
          <div className="col-span-2 flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-on-primary">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <span className="font-sans font-bold text-[18px] text-ink">
                Civic<span className="text-primary">Guard</span>
              </span>
            </Link>
            <p className="type-body-sm text-muted max-w-xs">
              Next-generation civic infrastructure triage and citizen hazard reporting powered by multimodal AI.
            </p>
          </div>

          {/* Col 2: Citizen App */}
          <div className="flex flex-col gap-3">
            <span className="text-ink font-semibold text-[14px]">Citizen App</span>
            <a href="#how-it-works" className="type-body-sm text-body hover:text-ink transition-colors">
              Report Hazards
            </a>
            <a href="#features" className="type-body-sm text-body hover:text-ink transition-colors">
              Live Hazard Map
            </a>
            <a href="#download-cta" className="type-body-sm text-body hover:text-ink transition-colors">
              Android APK
            </a>
            <span className="type-caption text-muted-soft">iOS (Coming Soon)</span>
          </div>

          {/* Col 3: Capabilities */}
          <div className="flex flex-col gap-3">
            <span className="text-ink font-semibold text-[14px]">Capabilities</span>
            <span className="type-body-sm text-body">AI Vision Triage</span>
            <span className="type-body-sm text-body">GPS Deduplication</span>
            <span className="type-body-sm text-body">Automated Dispatch</span>
            <span className="type-body-sm text-body">Risk Hotspots</span>
          </div>

          {/* Col 4: Municipalities */}
          <div className="flex flex-col gap-3">
            <span className="text-ink font-semibold text-[14px]">Municipalities</span>
            <span className="type-body-sm text-body">Public Works</span>
            <span className="type-body-sm text-body">Water & Sanitation</span>
            <span className="type-body-sm text-body">Disaster Relief</span>
            <span className="type-body-sm text-body">Central Command</span>
          </div>

          {/* Col 5: Legal & Trust */}
          <div className="flex flex-col gap-3">
            <span className="text-ink font-semibold text-[14px]">Trust & Safety</span>
            <span className="type-body-sm text-body">Privacy Policy</span>
            <span className="type-body-sm text-body">Terms of Service</span>
            <span className="type-body-sm text-body">Security Architecture</span>
            <span className="type-body-sm text-body">Open Data Standards</span>
          </div>
        </div>

        {/* Legal Band */}
        <div className="pt-8 border-t border-hairline flex flex-col md:flex-row items-center justify-between gap-4 text-[13px] text-muted">
          <div className="flex items-center gap-6 flex-wrap">
            <span>© {new Date().getFullYear()} CivicGuard Initiative. All rights reserved.</span>
            <span>Government Infrastructure & Citizen Safety Suite</span>
          </div>

          {/* Subtle Government portal link placed in the bottom legal band per spec */}
          <div className="flex items-center gap-4">
            <Link
              to="/governmentdashboard"
              className="text-muted hover:text-ink underline-offset-4 hover:underline text-[12px] opacity-75 hover:opacity-100 transition-opacity"
            >
              Government Staff Portal (Authorized Access Only)
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
