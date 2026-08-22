import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Incident, Team, IncidentStatus, IncidentSeverity } from '../../types';
import {
  getIncidentByIdApi,
  getTeamsApi,
  verifyIncidentApi,
  rejectIncidentApi,
  assignDepartmentApi,
  dispatchTeamApi,
  updateIncidentStatusApi,
} from '../../api/endpoints';
import { BadgePill } from '../../components/common/BadgePill';
import { Button } from '../../components/common/Button';
import { SelectInput } from '../../components/common/TextInput';
import { IncidentMap } from '../../components/map/IncidentMap';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Truck,
  Building2,
  MapPin,
  Clock,
  Sparkles,
  Layers,
  Check,
  AlertTriangle,
} from 'lucide-react';

const DEPARTMENTS = [
  'Roads & Infrastructure',
  'Water & Sanitation',
  'Electrical',
  'Disaster Management',
  'Traffic Police Enforcement',
];

const STATUS_OPTIONS: { label: string; value: IncidentStatus }[] = [
  { label: 'REPORTED', value: 'REPORTED' },
  { label: 'VERIFIED', value: 'VERIFIED' },
  { label: 'IN_PROGRESS', value: 'IN_PROGRESS' },
  { label: 'RESOLVED', value: 'RESOLVED' },
  { label: 'REJECTED', value: 'REJECTED' },
];

import { useAuth } from '../../context/AuthContext';
import { guestStore } from '../../api/seedData';

export const IncidentDetailPage: React.FC = () => {
  const { isGuestMode } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [incident, setIncident] = useState<Incident | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<IncidentStatus>('REPORTED');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      if (isGuestMode) {
        const incData = guestStore.getIncidentById(id);
        if (!incData) {
          setError(`Incident ${id} not found in demo dataset.`);
          setIsLoading(false);
          return;
        }
        setIncident(incData);
        setTeams(guestStore.teams);
        setSelectedDept(incData.department);
        setSelectedTeamId(incData.assigned_team_id || (guestStore.teams.length > 0 ? guestStore.teams[0].id : ''));
        setSelectedStatus(incData.status);
      } else {
        const [incData, teamList] = await Promise.all([
          getIncidentByIdApi(id),
          getTeamsApi(),
        ]);
        setIncident(incData);
        setTeams(teamList);
        setSelectedDept(incData.department);
        setSelectedTeamId(incData.assigned_team_id || (teamList.length > 0 ? teamList[0].id : ''));
        setSelectedStatus(incData.status);
      }
    } catch (e: any) {
      console.error('Failed to load incident detail', e);
      setError(e.message || 'Failed to fetch incident detail from backend.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id, isGuestMode]);

  const showFeedback = (msg: string) => {
    const text = isGuestMode ? `${msg} (Demo — changes aren't saved)` : msg;
    setActionSuccess(text);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleVerify = async () => {
    if (!id) return;
    try {
      if (isGuestMode) {
        const updated = guestStore.verifyIncident(id);
        setIncident({ ...updated });
        setSelectedStatus(updated.status);
      } else {
        const updated = await verifyIncidentApi(id);
        setIncident(updated);
        setSelectedStatus(updated.status);
      }
      showFeedback('Incident verified successfully.');
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Failed to verify incident.');
    }
  };

  const handleReject = async () => {
    if (!id) return;
    try {
      if (isGuestMode) {
        const updated = guestStore.rejectIncident(id, 'Flagged as duplicate or non-actionable.');
        setIncident({ ...updated });
        setSelectedStatus(updated.status);
      } else {
        const updated = await rejectIncidentApi(id);
        setIncident(updated);
        setSelectedStatus(updated.status);
      }
      showFeedback('Incident marked as REJECTED.');
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Failed to reject incident.');
    }
  };

  const handleAssignDept = async () => {
    if (!id || !selectedDept) return;
    try {
      if (isGuestMode) {
        const updated = guestStore.assignDepartment(id, selectedDept);
        setIncident({ ...updated });
      } else {
        const updated = await assignDepartmentApi(id, selectedDept);
        setIncident(updated);
      }
      showFeedback(`Jurisdiction reassigned to ${selectedDept}.`);
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Failed to reassign department.');
    }
  };

  const handleDispatch = async () => {
    if (!id || !selectedTeamId) return;
    const team = teams.find((t) => t.id === selectedTeamId);
    const teamName = team ? team.name : 'Emergency Unit';
    try {
      if (isGuestMode) {
        const updated = guestStore.dispatchTeam(id, selectedTeamId, teamName);
        setIncident({ ...updated });
        setSelectedStatus(updated.status);
      } else {
        const updated = await dispatchTeamApi(id, selectedTeamId);
        setIncident(updated);
        setSelectedStatus(updated.status);
      }
      showFeedback(`${teamName} dispatched to incident site.`);
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Failed to dispatch team.');
    }
  };

  const handleStatusChange = async (newStatus: IncidentStatus) => {
    if (!id) return;
    try {
      if (isGuestMode) {
        const updated = guestStore.updateIncidentStatus(id, newStatus);
        setIncident({ ...updated });
        setSelectedStatus(updated.status);
      } else {
        const updated = await updateIncidentStatusApi(id, newStatus);
        setIncident(updated);
        setSelectedStatus(updated.status);
      }
      showFeedback(`Status updated to ${newStatus}.`);
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Failed to update status.');
    }
  };


  if (isLoading || !incident) {
    return (
      <div className="p-12 text-center text-muted">
        <span>Loading incident details...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Top Back Nav & Quick Feedback */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate('/governmentdashboard/incidents')}
          className="inline-flex items-center gap-2 text-body hover:text-ink font-medium text-[14px] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Incidents List</span>
        </button>

        {actionSuccess && (
          <div className="p-2.5 px-4 bg-semantic-up/10 border border-semantic-up/30 rounded-pill text-semantic-up text-[13px] font-semibold flex items-center gap-2 shadow-soft animate-fade-in">
            <Check className="w-4 h-4" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {error && (
          <div className="p-2.5 px-4 bg-semantic-down/10 border border-semantic-down/30 rounded-pill text-semantic-down text-[13px] font-semibold flex items-center gap-2 shadow-soft animate-fade-in">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
      </div>


      {/* Main Two-Column Incident Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Visual Telemetry, AI Diagnosis & Map (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Incident Header Card */}
          <div className="bg-canvas border border-hairline rounded-xl p-6 shadow-soft">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <BadgePill severity={incident.severity} label={incident.severity} dot />
                <BadgePill status={incident.status} label={incident.status} />
                <BadgePill label={incident.category.replace(/_/g, ' ')} variant="outline" />
              </div>
              <span className="font-mono text-[13px] text-muted">{incident.id}</span>
            </div>

            <h1 className="type-title-lg text-ink font-bold mb-2">{incident.title}</h1>

            <div className="flex items-center gap-2 text-muted text-[13px] mb-4">
              <MapPin className="w-4 h-4 shrink-0 text-primary" />
              <span>{incident.location.address}</span>
              <span>•</span>
              <span className="font-mono">{incident.location.ward}</span>
            </div>

            <p className="type-body-md text-body">{incident.description}</p>
          </div>

          {/* Photo & AI Detection Bounding Card */}
          <div className="bg-canvas border border-hairline rounded-xl p-6 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h3 className="type-title-md text-ink">Vision AI Telemetry</h3>
              </div>
              <span className="type-number-display text-primary font-bold">
                {incident.ai_confidence}% Confidence
              </span>
            </div>

            <div className="relative rounded-lg overflow-hidden border border-hairline aspect-video bg-surface-dark mb-4">
              <img
                src={incident.image_url}
                alt={incident.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-4 border-2 border-primary/90 rounded-md bg-primary/10 flex items-start justify-between p-3 pointer-events-none">
                <span className="bg-primary text-on-primary font-mono text-[11px] font-bold px-2 py-0.5 rounded">
                  DETECTED: {incident.category}
                </span>
                <span className="bg-black/70 text-white font-mono text-[11px] px-2 py-0.5 rounded">
                  {incident.report_count} CITIZEN REPORTS
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[13px]">
              <div className="p-3 rounded-lg bg-surface-strong">
                <span className="text-muted block text-[11px] uppercase">First Reported</span>
                <span className="font-mono font-medium text-ink">
                  {new Date(incident.reported_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-surface-strong">
                <span className="text-muted block text-[11px] uppercase">Report Density</span>
                <span className="font-mono font-medium text-ink">{incident.report_count} submissions</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-strong col-span-2 sm:col-span-1">
                <span className="text-muted block text-[11px] uppercase">Assigned Team</span>
                <span className="font-medium text-ink truncate block">
                  {incident.assigned_team_name || 'Unassigned'}
                </span>
              </div>
            </div>
          </div>

          {/* Incident Map Pin */}
          <div className="bg-canvas border border-hairline rounded-xl p-6 shadow-soft">
            <h3 className="type-title-md text-ink mb-4">Geographic Pin Location</h3>
            <IncidentMap
              incidents={[incident]}
              selectedIncident={incident}
              height="300px"
              zoom={16}
            />
          </div>
        </div>

        {/* Right Column: Actions, Dispatch & Audit Trail (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Action Box: Triage Decision */}
          <div className="bg-canvas border border-hairline rounded-xl p-6 shadow-soft">
            <h3 className="type-title-md text-ink mb-2">Triage & Verification</h3>
            <p className="type-body-sm text-muted mb-5">
              Confirm hazard validity or dismiss false/duplicate reports.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="primary"
                onClick={handleVerify}
                icon={<CheckCircle2 className="w-4 h-4" />}
                className="w-full text-[14px]"
              >
                Verify Report
              </Button>
              <Button
                variant="secondary-light"
                onClick={handleReject}
                icon={<XCircle className="w-4 h-4" />}
                className="w-full text-[14px]"
              >
                Reject / Duplicate
              </Button>
            </div>
          </div>

          {/* Action Box: Department Transfer & Team Dispatch */}
          <div className="bg-canvas border border-hairline rounded-xl p-6 shadow-soft flex flex-col gap-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-primary" />
                <h3 className="type-title-md text-ink">Department Jurisdiction</h3>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <SelectInput
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  options={DEPARTMENTS.map((d) => ({ label: d, value: d }))}
                />
                <Button variant="secondary-light" onClick={handleAssignDept} className="shrink-0 text-[13px]">
                  Reassign
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t border-hairline">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="w-4 h-4 text-primary" />
                <h3 className="type-title-md text-ink">Field Team Dispatch</h3>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <SelectInput
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  options={teams.map((t) => ({
                    label: `${t.name} (${t.status})`,
                    value: t.id,
                  }))}
                />
                <Button variant="primary" onClick={handleDispatch} className="shrink-0 text-[13px]">
                  Dispatch
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t border-hairline">
              <span className="text-[14px] font-semibold text-ink block mb-2">Status Lifecycle:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleStatusChange(opt.value)}
                    className={`px-3 py-1.5 rounded-pill text-[12px] font-medium transition-all cursor-pointer ${
                      selectedStatus === opt.value
                        ? 'bg-ink text-canvas font-bold'
                        : 'bg-surface-strong text-body hover:text-ink'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Activity Audit Timeline */}
          <div className="bg-canvas border border-hairline rounded-xl p-6 shadow-soft">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-muted" />
              <h3 className="type-title-md text-ink">Audit Trail & Timeline</h3>
            </div>

            <div className="relative pl-6 border-l-2 border-hairline flex flex-col gap-4">
              {(incident.timeline || []).map((t, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-primary ring-4 ring-canvas" />
                  <div className="flex items-center justify-between text-[12px] text-muted mb-0.5">
                    <span className="font-mono font-semibold text-ink">{t.time}</span>
                    <BadgePill status={t.status} label={t.status} className="text-[9px]" />
                  </div>
                  <p className="text-[13px] text-body">{t.note}</p>
                  <span className="text-[11px] text-muted-soft block mt-0.5">By: {t.actor}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
