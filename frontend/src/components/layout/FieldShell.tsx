import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, LogOut, Radio } from 'lucide-react';
import { BadgePill } from '../common/BadgePill';

export const FieldShell: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/governmentdashboard');
  };

  return (
    <div className="min-h-screen bg-surface-soft text-ink flex flex-col items-center">
      {/* Mobile-first sticky top bar */}
      <header className="w-full max-w-xl bg-canvas border-b border-hairline px-4 py-3 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-on-primary">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[15px] text-ink">Field Operations</span>
              <BadgePill role="field_team" label="UNIT ON DUTY" className="text-[10px]" />
            </div>
            <div className="flex items-center gap-1.5 text-muted text-[11px] font-mono">
              <Radio className="w-3 h-3 text-semantic-up animate-pulse" />
              <span>GPS Tracking Active</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLogout}
            className="p-2 rounded-full hover:bg-surface-strong text-muted hover:text-ink cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* User profile strip */}
      <div className="w-full max-w-xl bg-surface-strong/60 px-4 py-2 flex items-center justify-between text-[12px] border-b border-hairline/60">
        <span className="text-muted">Assigned: <strong className="text-ink">{user?.name}</strong></span>
        <span className="text-muted">{user?.department || 'Rapid Response'}</span>
      </div>

      {/* Single column container */}
      <main className="w-full max-w-xl p-4 flex-1">
        <Outlet />
      </main>
    </div>
  );
};
