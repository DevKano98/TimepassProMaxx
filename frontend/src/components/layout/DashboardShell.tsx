import React, { useState } from 'react';
import { NavLink, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BadgePill } from '../common/BadgePill';
import {
  Shield,
  LayoutDashboard,
  AlertTriangle,
  Users2,
  UserPlus,
  BellRing,
  TrendingUp,
  BarChart3,
  LogOut,
  Menu,
  X,
  Radio,
  Sparkles,
} from 'lucide-react';


export const DashboardShell: React.FC = () => {
  const { user, logout, isGuestMode, exitGuestMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleLogout = () => {
    if (isGuestMode) {
      exitGuestMode();
    } else {
      logout();
    }
    navigate('/governmentdashboard');
  };


  const navItems = [
    {
      to: '/governmentdashboard/home',
      label: 'Command Center',
      icon: <LayoutDashboard className="w-4 h-4" />,
      roles: ['admin', 'control_room', 'department_officer'],
    },
    {
      to: '/governmentdashboard/incidents',
      label: 'Incidents Feed',
      icon: <AlertTriangle className="w-4 h-4" />,
      roles: ['admin', 'control_room', 'department_officer'],
    },
    {
      to: '/governmentdashboard/teams',
      label: 'Response Teams',
      icon: <Users2 className="w-4 h-4" />,
      roles: ['admin', 'control_room'],
    },
    {
      to: '/governmentdashboard/users',
      label: 'Staff & Roles',
      icon: <UserPlus className="w-4 h-4" />,
      roles: ['admin'],
    },
    {
      to: '/governmentdashboard/alerts',
      label: 'Broadcast Alerts',
      icon: <BellRing className="w-4 h-4" />,
      roles: ['admin', 'control_room', 'department_officer'],
    },
    {
      to: '/governmentdashboard/predictions',
      label: 'Risk Predictions',
      icon: <TrendingUp className="w-4 h-4" />,
      roles: ['admin', 'control_room'],
    },
    {
      to: '/governmentdashboard/analytics',
      label: 'Analytics',
      icon: <BarChart3 className="w-4 h-4" />,
      roles: ['admin', 'control_room', 'department_officer'],
    },
  ];

  const visibleNavItems = navItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  return (
    <div className="min-h-screen flex bg-canvas text-ink">
      {/* Left Sidebar (Desktop) */}
      <aside className="hidden lg:flex w-64 flex-col bg-surface-soft border-r border-hairline select-none shrink-0 sticky top-0 h-screen">
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-hairline bg-canvas">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary">
            <Shield className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-sans font-bold text-[16px] leading-none text-ink">
              Civic<span className="text-primary">Guard</span>
            </span>
            <span className="text-muted text-[11px] font-mono tracking-wider uppercase mt-1">
              Command Suite
            </span>
          </div>
        </div>

        {/* Live System Beacon */}
        <div className="px-6 py-3 border-b border-hairline/60 bg-surface-strong/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-semantic-up animate-pulse" />
            <span className="text-[12px] font-mono font-medium text-ink">LIVE DISPATCH</span>
          </div>
          <span className="text-[11px] font-mono text-muted">24/7 ONLINE</span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const isActive = location.pathname === item.to || (item.to !== '/governmentdashboard/home' && location.pathname.startsWith(item.to));
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-colors ${
                  isActive
                    ? 'bg-canvas text-primary font-semibold shadow-soft border border-hairline'
                    : 'text-body hover:bg-surface-strong hover:text-ink'
                }`}
              >
                <span className={isActive ? 'text-primary' : 'text-muted'}>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Card & Logout Bottom */}
        <div className="p-4 border-t border-hairline bg-canvas">
          <div className="flex items-center justify-between mb-2">
            <div className="min-w-0 flex-1 mr-2">
              <p className="text-[13px] font-semibold text-ink truncate">{user?.name || 'Officer'}</p>
              <p className="text-[11px] text-muted truncate">{user?.department || user?.email}</p>
            </div>
            {user && <BadgePill role={user.role} label={user.role.replace('_', ' ')} className="text-[10px]" />}
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-md bg-surface-strong text-ink hover:bg-hairline text-[13px] font-medium transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-muted" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-canvas border-b border-hairline px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="lg:hidden p-2 rounded-md hover:bg-surface-strong text-ink"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-[14px] text-muted">Portal:</span>
              <span className="text-[14px] font-semibold text-ink">
                {user?.department ? `${user.department} Control` : 'City Operations Hub'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-semantic-up" />
              <span className="text-[13px] font-mono text-muted">Sync: 100% OK</span>
            </div>
            {user && (
              <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-hairline">
                <span className="text-[13px] font-medium text-ink">{user.name}</span>
                <BadgePill role={user.role} label={user.role.replace('_', ' ')} className="text-[10px]" />
              </div>
            )}
            <button
              onClick={handleLogout}
              className="p-2 text-muted hover:text-ink rounded-md hover:bg-surface-strong cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div className="lg:hidden bg-surface-soft border-b border-hairline p-4 flex flex-col gap-1">
            {visibleNavItems.map((item) => {
              const isActive = location.pathname.startsWith(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileNavOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium ${
                    isActive ? 'bg-canvas text-primary font-semibold' : 'text-body'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        )}

        {/* Persistent Guest Demo Mode Banner */}
        {isGuestMode && (
          <div className="bg-surface-strong border-b border-hairline px-6 py-2.5 flex items-center justify-between gap-4 text-[13px] text-body z-10 shadow-soft animate-fade-in">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary shrink-0" />
              <span className="font-medium text-ink">Viewing demo data — not connected to a live backend.</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1 rounded-pill bg-canvas border border-hairline hover:bg-surface-soft text-ink font-semibold text-[12px] transition-colors cursor-pointer shrink-0"
            >
              Exit demo
            </button>
          </div>
        )}

        {/* Page View Container */}
        <main className="flex-1 p-6 md:p-8 bg-surface-soft/40 overflow-y-auto">
          <Outlet />
        </main>

      </div>
    </div>
  );
};
