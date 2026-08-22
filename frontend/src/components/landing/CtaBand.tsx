import React from 'react';
import { Button } from '../common/Button';
import { APK_DOWNLOAD_URL } from '../layout/TopNav';
import { Download, Sparkles } from 'lucide-react';

export const CtaBand: React.FC = () => {
  const handleDownload = () => {
    if (APK_DOWNLOAD_URL && APK_DOWNLOAD_URL !== 'REPLACE_ME') {
      window.open(APK_DOWNLOAD_URL, '_blank');
    } else {
      alert('Downloading CivicGuard Citizen Android App (APK Release v1.0)...');
    }
  };

  return (
    <section id="download-cta" className="w-full bg-surface-dark text-on-dark py-24 px-6 border-t border-white/10 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[1200px] mx-auto text-center flex flex-col items-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-pill bg-surface-dark-elevated border border-white/10 text-on-dark mb-6">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-[12px] font-mono tracking-wider uppercase text-on-dark-soft">
            Available Now on Android
          </span>
        </div>

        <h2 className="type-display-lg text-on-dark max-w-2xl mb-6">
          Take back your streets.
        </h2>

        <p className="type-body-md text-on-dark-soft max-w-lg mb-10">
          Join thousands of proactive citizens improving community safety, reporting infrastructure hazards, and holding municipal response accountable.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Button
            variant="pill-cta"
            onClick={handleDownload}
            icon={<Download className="w-5 h-5" />}
            className="w-full sm:w-auto"
          >
            Download for Android (APK)
          </Button>
        </div>

        <span className="text-on-dark-soft text-[12px] font-mono mt-6">
          Direct APK Download • Free & Open Source Citizen Client • v1.0.0
        </span>
      </div>
    </section>
  );
};
