import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Incident, AnalyticsSummary, IncidentSeverity } from '../../types';
import { getIncidentsApi, getAnalyticsSummaryApi } from '../../api/endpoints';
import { IncidentMap } from '../../components/map/IncidentMap';
import { StatCard } from '../../components/common/StatCard';
import { BadgePill } from '../../components/common/BadgePill';
import { Button } from '../../components/common/Button';
import {
  AlertTriangle,
  Flame,
  Users,
  CheckCircle,
  ArrowRight,
  Filter,
  RefreshCw,
  Layers,
  MapPin,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { guestStore } from '../../api/seedData';

export const CommandCenterPage: React.FC = () => {
  const { isGuestMode } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (isGuestMode) {
        const incList = guestStore.getIncidents();
        setIncidents(incList);
        setAnalytics(guestStore.analytics);
        if (incList.length > 0) {
          setSelectedIncident(incList[0]);
        }
      } else {
        const [incList, analData] = await Promise.all([
          getIncidentsApi(),
          getAnalyticsSummaryApi(),
        ]);
        setIncidents(incList);
        setAnalytics(analData);
        if (incList.length > 0) {
          setSelectedIncident(incList[0]);
        }
      }
    } catch (e: any) {
      console.error('Failed to load command center data', e);
      setError(e.message || 'Failed to connect to backend server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isGuestMode]);


  const filteredIncidents = incidents.filter((inc) => {
    if (severityFilter === 'ALL') return true;
    return inc.severity === severityFilter;
  });

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Top Header Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="type-title-lg text-ink font-semibold">City Command Center</h1>
            <BadgePill label="LIVE STREAM" variant="neutral" dot />
          </div>
          <p className="type-body-sm text-muted mt-1">
            Real-time geospatial telemetry, active citizen hazard reports, and unit deployments
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary-light"
            onClick={loadData}
            icon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
            className="h-10 text-[13px]"
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/governmentdashboard/incidents')}
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
            className="h-10 text-[13px]"
          >
            Manage Feed
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-semantic-down/10 border border-semantic-down/30 rounded-xl text-semantic-down text-[13px] flex items-center justify-between gap-3">
          <span>{error}</span>
          <Button variant="secondary-light" onClick={loadData} className="h-8 text-[12px]">
            Retry Connection
          </Button>
        </div>
      )}

      {/* Summary Strip: number-display styled stat cards */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Incidents"
          value={analytics?.active_incidents ?? 24}
          subtext="Requiring response"
          icon={<AlertTriangle className="w-4 h-4 text-severity-high" />}
          trend="+3 last hr"
          trendType="negative"
        />
        <StatCard
          label="Critical Severity"
          value={analytics?.critical_count ?? 5}
          subtext="High-risk public hazards"
          icon={<Flame className="w-4 h-4 text-severity-critical" />}
          highlight={true}
        />
        <StatCard
          label="Teams Available"
          value={analytics?.teams_available ?? 3}
          subtext="Field units on standby"
          icon={<Users className="w-4 h-4 text-primary" />}
        />
        <StatCard
          label="Resolved Today"
          value={analytics?.resolved_today ?? 18}
          subtext="Verified proof of repair"
          icon={<CheckCircle className="w-4 h-4 text-semantic-up" />}
          trend="94.2% rate"
          trendType="positive"
        />
      </div>

      {/* Map & Live Triage Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Full-width interactive Leaflet Map (Left 8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          {/* Map Controls / Severity Legend */}
          <div className="bg-canvas border border-hairline rounded-lg p-3 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted" />
              <span className="text-[13px] font-medium text-body">Severity:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setSeverityFilter(sev)}
                    className={`px-2.5 py-1 rounded-pill text-[11px] font-semibold transition-all cursor-pointer ${
                      severityFilter === sev
                        ? 'bg-ink text-canvas'
                        : 'bg-surface-strong text-body hover:text-ink'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 text-[12px] text-muted">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-severity-critical" /> Critical
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-severity-high" /> High
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-severity-medium" /> Medium
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-severity-resolved" /> Resolved
              </span>
            </div>
          </div>

          {/* Leaflet Map */}
          <IncidentMap
            incidents={filteredIncidents}
            selectedIncident={selectedIncident}
            onSelectIncident={(inc) => setSelectedIncident(inc)}
            height="540px"
          />
        </div>

        {/* Selected Incident Quick Action / Active Triage Drawer (Right 4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-canvas border border-hairline rounded-xl p-5 shadow-soft">
            <div className="flex items-center justify-between mb-3">
              <span className="type-caption text-muted uppercase font-semibold">
                Pin Inspector
              </span>
              {selectedIncident && (
                <BadgePill severity={selectedIncident.severity} label={selectedIncident.severity} dot />
              )}
            </div>

            {selectedIncident ? (
              <div className="flex flex-col gap-4">
                {/* Photo Preview */}
                <div className="relative rounded-lg overflow-hidden border border-hairline aspect-video bg-surface-dark">
                  <img
                    src={selectedIncident.image_url}
                    alt={selectedIncident.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <BadgePill
                      label={`AI: ${selectedIncident.ai_confidence}%`}
                      variant="dark"
                      className="text-[10px]"
                    />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-0.5 rounded text-[11px] font-mono text-white">
                    {selectedIncident.report_count} Reports
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-ink text-[16px] leading-snug">
                    {selectedIncident.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-muted text-[13px] mt-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{selectedIncident.location.address}</span>
                  </div>
                  <p className="text-body text-[13px] mt-2 line-clamp-3">
                    {selectedIncident.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-hairline flex items-center justify-between text-[13px]">
                  <span className="text-muted">Department:</span>
                  <strong className="text-ink">{selectedIncident.department}</strong>
                </div>

                <div className="pt-1 flex items-center justify-between text-[13px]">
                  <span className="text-muted">Status:</span>
                  <BadgePill status={selectedIncident.status} label={selectedIncident.status} />
                </div>

                <Button
                  variant="primary"
                  onClick={() => navigate(`/governmentdashboard/incidents/${selectedIncident.id}`)}
                  className="w-full mt-2 h-11 text-[14px]"
                >
                  Open Full Incident Workspace
                </Button>
              </div>
            ) : (
              <div className="py-12 text-center text-muted text-[14px]">
                Select a marker on the map to inspect telemetry details.
              </div>
            )}
          </div>

          {/* Quick Hotspot Forecast Alert Box */}
          <div className="bg-surface-strong/70 border border-hairline rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-primary" />
              <span className="text-[13px] font-semibold text-ink">Active Weather Alert</span>
            </div>
            <p className="text-[12px] text-body">
              Heavy monsoon precipitation active in Ward 04 & Ward 12. Automated stormwater alerts engaged.
            </p>
            <button
              onClick={() => navigate('/governmentdashboard/predictions')}
              className="mt-2 text-[12px] font-semibold text-primary hover:underline cursor-pointer"
            >
              View Risk Predictions →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
