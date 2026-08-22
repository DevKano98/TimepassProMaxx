import React, { useState } from 'react';
import { IncidentMap } from '../map/IncidentMap';
import { INITIAL_INCIDENTS } from '../../api/mockData';
import { Incident, IncidentSeverity } from '../../types';
import { BadgePill } from '../common/BadgePill';
import { Button } from '../common/Button';
import {
  Shield,
  Activity,
  AlertTriangle,
  Flame,
  Radio,
  Truck,
  CheckCircle2,
  Filter,
  ArrowRight,
  Sparkles,
  MapPin,
  Clock,
  Layers,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const CommandCenterShowcase: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [selectedIncident, setSelectedIncident] = useState<Incident>(INITIAL_INCIDENTS[0]);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [dispatchedSuccess, setDispatchedSuccess] = useState<string | null>(null);

  const filteredIncidents = incidents.filter((inc) => {
    if (severityFilter === 'ALL') return true;
    return inc.severity === severityFilter;
  });

  const handleSimulatedDispatch = (incidentId: string) => {
    setIncidents(
      incidents.map((i) =>
        i.id === incidentId ? { ...i, status: 'IN_PROGRESS', assigned_team_name: 'Rapid Asphalt Unit 04' } : i
      )
    );
    if (selectedIncident.id === incidentId) {
      setSelectedIncident({
        ...selectedIncident,
        status: 'IN_PROGRESS',
        assigned_team_name: 'Rapid Asphalt Unit 04',
      });
    }
    setDispatchedSuccess(`Rapid Unit 04 dispatched to ${selectedIncident.title}`);
    setTimeout(() => setDispatchedSuccess(null), 3500);
  };

  return (
    <section className="w-full bg-surface-dark text-on-dark py-24 px-6 border-b border-white/10 relative overflow-hidden">
      {/* High-tech grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-40" />

      <div className="max-w-[1280px] mx-auto relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-pill bg-surface-dark-elevated border border-white/10 text-on-dark mb-4">
            <Radio className="w-3.5 h-3.5 text-semantic-up animate-pulse" />
            <span className="text-[12px] font-mono tracking-wider uppercase text-on-dark-soft">
              Municipal Command Deck Live UI
            </span>
          </div>

          <h2 className="type-display-lg text-on-dark max-w-3xl">
            Real-time civic command center. Built for instant triage.
          </h2>

          <p className="type-body-md text-on-dark-soft max-w-2xl mt-4 text-[17px]">
            Experience the actual internal command interface used by city control rooms to verify citizen reports, visualize geospatial hazards, and dispatch field units in seconds.
          </p>
        </div>

        {/* Live Command Dashboard Frame (Window Simulation) */}
        <div className="bg-surface-dark-elevated border border-white/15 rounded-2xl overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.6)]">
          {/* Dashboard Window Titlebar */}
          <div className="h-12 bg-surface-dark border-b border-white/10 px-4 sm:px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
              </div>
              <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-white/10 text-[12px] font-mono text-on-dark-soft">
                <span>gov.civicguard.internal/command</span>
                <span className="text-white/20">•</span>
                <span className="text-semantic-up flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-semantic-up animate-pulse" /> LIVE TELEMETRY
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/governmentdashboard"
                className="text-[12px] font-semibold text-primary hover:text-primary-active flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-pill border border-primary/30 transition-colors"
              >
                <span>Launch Full Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 border-b border-white/10 text-on-dark text-left">
            <div className="bg-surface-dark-elevated p-4">
              <span className="type-caption text-on-dark-soft uppercase font-semibold">Active Incidents</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-mono text-[26px] font-bold text-on-dark">24</span>
                <span className="text-semantic-up text-[12px] font-mono font-bold">+3 new</span>
              </div>
            </div>

            <div className="bg-surface-dark-elevated p-4">
              <span className="type-caption text-on-dark-soft uppercase font-semibold">Critical Hazards</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-mono text-[26px] font-bold text-severity-critical">5</span>
                <span className="text-on-dark-soft text-[11px] font-mono">Priority Triage</span>
              </div>
            </div>

            <div className="bg-surface-dark-elevated p-4">
              <span className="type-caption text-on-dark-soft uppercase font-semibold">Units Dispatched</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-mono text-[26px] font-bold text-primary">8</span>
                <span className="text-on-dark-soft text-[11px] font-mono">3 on standby</span>
              </div>
            </div>

            <div className="bg-surface-dark-elevated p-4">
              <span className="type-caption text-on-dark-soft uppercase font-semibold">Avg Triage Latency</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-mono text-[26px] font-bold text-semantic-up">4.2m</span>
                <span className="text-semantic-up text-[12px] font-mono font-bold">98% SLA</span>
              </div>
            </div>
          </div>

          {/* Command Center Workspace (Map Left + Triage Stream Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
            {/* Map View (7 cols) */}
            <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-white/10 p-4 flex flex-col gap-3">
              {/* Map Filter Strip */}
              <div className="flex items-center justify-between flex-wrap gap-2 text-[12px]">
                <div className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-on-dark-soft" />
                  <span className="text-on-dark-soft font-medium">Filter Severity:</span>
                  {['ALL', 'CRITICAL', 'HIGH'].map((sev) => (
                    <button
                      key={sev}
                      onClick={() => setSeverityFilter(sev)}
                      className={`px-2.5 py-0.5 rounded-pill text-[10px] font-semibold font-mono transition-all cursor-pointer ${
                        severityFilter === sev
                          ? 'bg-primary text-on-primary'
                          : 'bg-white/10 text-on-dark-soft hover:text-on-dark'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-[11px] text-on-dark-soft">
                  <span className="flex items-center gap-1 font-mono">
                    <span className="w-2 h-2 rounded-full bg-severity-critical" /> Critical
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <span className="w-2 h-2 rounded-full bg-severity-high" /> High
                  </span>
                </div>
              </div>

              {/* Leaflet Map Embed */}
              <div className="flex-1 rounded-xl overflow-hidden border border-white/10 relative min-h-[380px]">
                <IncidentMap
                  incidents={filteredIncidents}
                  selectedIncident={selectedIncident}
                  onSelectIncident={(inc) => setSelectedIncident(inc)}
                  height="100%"
                />
              </div>
            </div>

            {/* Live Triage Inspector & Incident Stream (5 cols) */}
            <div className="lg:col-span-5 p-5 flex flex-col justify-between bg-surface-dark/95 text-left">
              <div className="flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-on-dark text-[14px]">Live Triage Inspector</span>
                  </div>
                  <BadgePill severity={selectedIncident.severity} label={selectedIncident.severity} dot className="text-[9px]" />
                </div>

                {dispatchedSuccess && (
                  <div className="p-2.5 bg-semantic-up/10 border border-semantic-up/30 rounded-lg text-semantic-up text-[12px] font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{dispatchedSuccess}</span>
                  </div>
                )}

                {/* Selected Incident Card */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-[16px] text-on-dark leading-snug">
                      {selectedIncident.title}
                    </h3>
                    <span className="font-mono text-[11px] text-on-dark-soft shrink-0">
                      {selectedIncident.id}
                    </span>
                  </div>

                  <p className="text-[13px] text-on-dark-soft leading-relaxed">
                    {selectedIncident.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[12px] font-mono pt-2 border-t border-white/10">
                    <div className="p-2 rounded bg-surface-dark-elevated border border-white/5">
                      <span className="text-on-dark-soft block text-[10px] uppercase">AI Confidence</span>
                      <strong className="text-primary text-[14px]">{selectedIncident.ai_confidence}%</strong>
                    </div>
                    <div className="p-2 rounded bg-surface-dark-elevated border border-white/5">
                      <span className="text-on-dark-soft block text-[10px] uppercase">Citizen Reports</span>
                      <strong className="text-on-dark text-[14px]">{selectedIncident.report_count} verified</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[12px] pt-2 border-t border-white/10">
                    <span className="text-on-dark-soft">Assigned Crew:</span>
                    <strong className="text-on-dark font-mono">
                      {selectedIncident.assigned_team_name || 'Standby Triage'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Interactive Dispatch Action */}
              <div className="pt-4 mt-4 border-t border-white/10 flex flex-col sm:flex-row items-center gap-2.5">
                <Button
                  variant="primary"
                  onClick={() => handleSimulatedDispatch(selectedIncident.id)}
                  icon={<Truck className="w-4 h-4" />}
                  className="w-full text-[13px] h-10"
                >
                  {selectedIncident.status === 'IN_PROGRESS' ? 'Unit En Route' : 'Dispatch Field Squad'}
                </Button>

                <Link
                  to={`/governmentdashboard/incidents/${selectedIncident.id}`}
                  className="w-full sm:w-auto px-4 py-2 rounded-pill bg-surface-dark-elevated hover:bg-white/10 border border-white/10 text-on-dark text-[13px] font-semibold text-center transition-colors shrink-0"
                >
                  Full Details →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
