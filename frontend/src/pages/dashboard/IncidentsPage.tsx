import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Incident, IncidentSeverity, IncidentStatus, HazardCategory } from '../../types';
import { getIncidentsApi, IncidentFilterParams } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import { SearchInputPill } from '../../components/common/TextInput';
import { IncidentRow } from '../../components/common/AssetRow';
import { Button } from '../../components/common/Button';
import { BadgePill } from '../../components/common/BadgePill';
import { Filter, RefreshCw, Layers, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

const STATUS_FILTERS = ['ALL', 'REPORTED', 'VERIFIED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];
const SEVERITY_FILTERS = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const CATEGORY_FILTERS: (HazardCategory | 'ALL')[] = [
  'ALL',
  'POTHOLE',
  'FLOODED_ROAD',
  'BROKEN_STREETLIGHT',
  'FALLEN_TREE',
  'GARBAGE_DUMP',
  'WATER_LEAK',
  'TRAFFIC_SIGNAL_OUT',
  'OPEN_MANHOLE',
];

const DEPARTMENTS = [
  'ALL',
  'Roads & Infrastructure',
  'Water & Sanitation',
  'Electrical',
  'Disaster Management',
];

import { guestStore } from '../../api/seedData';

export const IncidentsPage: React.FC = () => {
  const { user, isGuestMode } = useAuth();
  const navigate = useNavigate();

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('ALL');
  const [severity, setSeverity] = useState<string>('ALL');
  const [category, setCategory] = useState<string>('ALL');
  const [department, setDepartment] = useState<string>(
    user?.role === 'department_officer' && user.department ? user.department : 'ALL'
  );

  const fetchIncidents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: IncidentFilterParams = {
        search: search || undefined,
        status: status !== 'ALL' ? status : undefined,
        severity: severity !== 'ALL' ? severity : undefined,
        category: category !== 'ALL' ? category : undefined,
        department: department !== 'ALL' ? department : undefined,
      };

      if (isGuestMode) {
        const data = guestStore.getIncidents(params);
        setIncidents(data);
      } else {
        const data = await getIncidentsApi(params);
        setIncidents(data);
      }
    } catch (e: any) {
      console.error('Failed to fetch incidents', e);
      setError(e.message || 'Failed to fetch incidents from live backend.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [search, status, severity, category, department, isGuestMode]);


  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="type-title-lg text-ink font-semibold">Incident Triage Feed</h1>
          <p className="type-body-sm text-muted mt-1">
            Browse, filter, and dispatch verified citizen hazard reports
            {user?.role === 'department_officer' && user.department && (
              <span className="font-semibold text-primary ml-1">
                (Filtered to: {user.department})
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary-light"
            onClick={fetchIncidents}
            icon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
            className="h-10 text-[13px]"
          >
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-semantic-down/10 border border-semantic-down/30 rounded-xl text-semantic-down text-[13px] flex items-center justify-between gap-3">
          <span>{error}</span>
          <Button variant="secondary-light" onClick={fetchIncidents} className="h-8 text-[12px]">
            Retry
          </Button>
        </div>
      )}

      {/* Filter Control Bar */}

      <div className="bg-canvas border border-hairline rounded-xl p-5 shadow-soft flex flex-col gap-4">
        {/* Search Bar + Quick Counts */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <SearchInputPill
            placeholder="Search by ID, keyword, address, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-lg"
          />

          <div className="flex items-center gap-4 text-[13px] text-muted self-end md:self-auto font-mono">
            <span>
              Showing <strong className="text-ink">{incidents.length}</strong> matching incidents
            </span>
          </div>
        </div>

        {/* Filter Chips: Status */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-hairline">
          <span className="text-[12px] font-semibold text-muted uppercase tracking-wider min-w-[70px]">
            Status:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {STATUS_FILTERS.map((st) => (
              <button
                key={st}
                onClick={() => setStatus(st)}
                className={`px-3 py-1 rounded-pill text-[12px] font-medium transition-all cursor-pointer ${
                  status === st
                    ? 'bg-ink text-canvas'
                    : 'bg-surface-strong text-body hover:text-ink'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Chips: Severity */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[12px] font-semibold text-muted uppercase tracking-wider min-w-[70px]">
            Severity:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {SEVERITY_FILTERS.map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverity(sev)}
                className={`px-3 py-1 rounded-pill text-[12px] font-medium transition-all cursor-pointer ${
                  severity === sev
                    ? 'bg-ink text-canvas'
                    : 'bg-surface-strong text-body hover:text-ink'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Department Filter (Admin & Control Room only) */}
        {user?.role !== 'department_officer' && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[12px] font-semibold text-muted uppercase tracking-wider min-w-[70px]">
              Dept:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {DEPARTMENTS.map((dep) => (
                <button
                  key={dep}
                  onClick={() => setDepartment(dep)}
                  className={`px-3 py-1 rounded-pill text-[12px] font-medium transition-all cursor-pointer ${
                    department === dep
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-strong text-body hover:text-ink'
                  }`}
                >
                  {dep}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Incident List Table */}
      <div className="bg-canvas border border-hairline rounded-xl overflow-hidden shadow-soft">
        <div className="bg-surface-soft px-4 py-3 border-b border-hairline flex items-center justify-between text-[12px] font-semibold text-muted uppercase tracking-wider">
          <span>Hazard Category & Location</span>
          <div className="flex items-center gap-8">
            <span className="hidden md:inline">Telemetry & Confidence</span>
            <span>Severity / Status</span>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-muted flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            <span className="text-[14px]">Querying incident database...</span>
          </div>
        ) : incidents.length === 0 ? (
          <div className="p-16 text-center text-muted flex flex-col items-center justify-center">
            <AlertCircle className="w-8 h-8 text-muted-soft mb-3" />
            <p className="text-[16px] font-semibold text-ink">No incidents matched filters</p>
            <p className="text-[13px] text-muted mt-1">Try resetting filter chips or searching for another keyword.</p>
            <Button
              variant="secondary-light"
              onClick={() => {
                setSearch('');
                setStatus('ALL');
                setSeverity('ALL');
                setCategory('ALL');
                setDepartment('ALL');
              }}
              className="mt-4 text-[13px]"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-hairline">
            {incidents.map((incident) => (
              <IncidentRow
                key={incident.id}
                incident={incident}
                onClick={() => navigate(`/governmentdashboard/incidents/${incident.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
