import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Menu, X, ArrowRight } from 'lucide-react';
import { Button } from '../common/Button';

// Static APK download URL placeholder
export const APK_DOWNLOAD_URL = 'REPLACE_ME';

interface TopNavProps {
  variant?: 'on-dark' | 'light';
}

export const TopNav: React.FC<TopNavProps> = ({ variant = 'on-dark' }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleDownload = () => {
    if (APK_DOWNLOAD_URL && APK_DOWNLOAD_URL !== 'REPLACE_ME') {
      window.open(APK_DOWNLOAD_URL, '_blank');
    } else {
      const el = document.getElementById('download-cta');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        alert('CivicGuard Citizen App APK build will download here.');
      }
    }
  };

  const isDark = variant === 'on-dark';

  return (
    <header
      className={`w-full h-16 transition-colors border-b select-none ${
        isDark
          ? 'bg-surface-dark text-on-dark border-white/10'
          : 'bg-canvas text-ink border-hairline'
      }`}
    >
      <div className="max-w-[1200px] mx-auto h-full px-6 flex items-center justify-between">
        {/* Left: Brand Wordmark */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary">
            <Shield className="w-4 h-4" />
          </div>
          <span
            className={`font-sans font-bold text-[18px] tracking-tight ${
              isDark ? 'text-on-dark' : 'text-ink'
            }`}
          >
            Civic<span className="text-primary">Guard</span>
          </span>
        </Link>

        {/* Center: Nav links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8">
          <a
            href="#how-it-works"
            className={`type-nav-link transition-colors ${
              isDark ? 'text-on-dark-soft hover:text-on-dark' : 'text-body hover:text-ink'
            }`}
          >
            How it works
          </a>
          <a
            href="#features"
            className={`type-nav-link transition-colors ${
              isDark ? 'text-on-dark-soft hover:text-on-dark' : 'text-body hover:text-ink'
            }`}
          >
            Features
          </a>
          <Link
            to="/governmentdashboard"
            className={`type-nav-link transition-colors opacity-80 hover:opacity-100 ${
              isDark ? 'text-on-dark-soft hover:text-on-dark' : 'text-muted hover:text-ink'
            }`}
          >
            For Government
          </Link>
        </nav>

        {/* Right: CTA Button (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="primary" onClick={handleDownload} className="h-10 px-5 text-[14px]">
            Download the app
          </Button>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden items-center gap-2">
          <Button variant="primary" onClick={handleDownload} className="h-9 px-3.5 text-[13px]">
            Get App
          </Button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-md ${
              isDark ? 'text-on-dark hover:bg-white/10' : 'text-ink hover:bg-surface-strong'
            }`}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown sheet */}
      {mobileMenuOpen && (
        <div
          className={`md:hidden px-6 py-6 border-b flex flex-col gap-4 shadow-soft ${
            isDark ? 'bg-surface-dark-elevated text-on-dark border-white/10' : 'bg-canvas text-ink border-hairline'
          }`}
        >
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="text-[16px] font-medium py-2"
          >
            How it works
          </a>
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="text-[16px] font-medium py-2"
          >
            Features
          </a>
          <Link
            to="/governmentdashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="text-[16px] font-medium py-2 text-primary flex items-center justify-between"
          >
            <span>Government Command Portal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Button variant="pill-cta" onClick={handleDownload} className="w-full mt-2">
            Download for Android
          </Button>
        </div>
      )}
    </header>
  );
};
