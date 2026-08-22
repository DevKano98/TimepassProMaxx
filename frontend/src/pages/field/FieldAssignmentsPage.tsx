import React, { useState, useEffect } from 'react';
import { FieldAssignment } from '../../types';
import { getFieldAssignmentsApi, updateFieldAssignmentStatusApi } from '../../api/endpoints';
import { BadgePill } from '../../components/common/BadgePill';
import { Button } from '../../components/common/Button';
import {
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  Navigation,
  ChevronRight,
  AlertTriangle,
  Camera,
  X,
  FileCheck,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { guestStore } from '../../api/seedData';

const STATUS_STEPS: FieldAssignment['status'][] = ['ACKNOWLEDGED', 'EN_ROUTE', 'ON_SITE', 'RESOLVED'];

export const FieldAssignmentsPage: React.FC = () => {
  const { isGuestMode } = useAuth();
  const [assignments, setAssignments] = useState<FieldAssignment[]>([]);
  const [activeTicket, setActiveTicket] = useState<FieldAssignment | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateFeedback, setUpdateFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadAssignments = async () => {
    setError(null);
    try {
      if (isGuestMode) {
        setAssignments(guestStore.fieldAssignments);
        if (guestStore.fieldAssignments.length > 0 && !activeTicket) {
          setActiveTicket(guestStore.fieldAssignments[0]);
        }
      } else {
        const data = await getFieldAssignmentsApi();
        setAssignments(data);
        if (data.length > 0 && !activeTicket) {
          setActiveTicket(data[0]);
        }
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Failed to load field assignments from backend.');
    }
  };

  useEffect(() => {
    loadAssignments();
  }, [isGuestMode]);

  const handleStatusAdvance = async (newStatus: FieldAssignment['status']) => {
    if (!activeTicket) return;
    setIsUpdating(true);
    try {
      let updated: FieldAssignment;
      if (isGuestMode) {
        updated = guestStore.updateFieldAssignmentStatus(
          activeTicket.ticket_id,
          newStatus,
          resolutionNotes || activeTicket.notes
        );
      } else {
        updated = await updateFieldAssignmentStatusApi(
          activeTicket.ticket_id,
          newStatus,
          resolutionNotes || activeTicket.notes
        );
      }
      setActiveTicket(updated);
      setAssignments(assignments.map((a) => (a.ticket_id === updated.ticket_id ? updated : a)));
      const note = isGuestMode
        ? `Status advanced to ${newStatus} (Demo — changes aren't saved)`
        : `Status advanced to ${newStatus}`;
      setUpdateFeedback(note);
      setTimeout(() => setUpdateFeedback(null), 3000);
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Failed to update ticket status.');
    } finally {
      setIsUpdating(false);
    }
  };


  const getNextStatus = (current: FieldAssignment['status']): FieldAssignment['status'] | null => {
    const currentIndex = STATUS_STEPS.indexOf(current);
    if (currentIndex >= 0 && currentIndex < STATUS_STEPS.length - 1) {
      return STATUS_STEPS[currentIndex + 1];
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-4 pb-12">
      {/* Field Queue Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-[18px] text-ink">Assigned Work Queue</h1>
          <p className="text-[12px] text-muted font-mono">{assignments.length} ACTIVE DISPATCH TICKETS</p>
        </div>
      </div>

      {updateFeedback && (
        <div className="p-3 bg-semantic-up/10 border border-semantic-up/30 rounded-lg text-semantic-up text-[13px] font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{updateFeedback}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-semantic-down/10 border border-semantic-down/30 rounded-lg text-semantic-down text-[13px] font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}


      {/* Ticket List Cards (Mobile-first single-column cards) */}
      <div className="flex flex-col gap-3">
        {assignments.map((ticket) => {
          const isSelected = activeTicket?.ticket_id === ticket.ticket_id;
          return (
            <div
              key={ticket.ticket_id}
              onClick={() => setActiveTicket(ticket)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-canvas border-primary shadow-soft ring-1 ring-primary/20'
                  : 'bg-canvas border-hairline hover:border-hairline/80'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <BadgePill severity={ticket.priority} label={ticket.priority} dot className="text-[10px]" />
                  <span className="font-mono text-[11px] text-muted">{ticket.ticket_id}</span>
                </div>
                <BadgePill status={ticket.status === 'RESOLVED' ? 'RESOLVED' : 'IN_PROGRESS'} label={ticket.status} className="text-[10px]" />
              </div>

              <h3 className="font-semibold text-[15px] text-ink line-clamp-1">{ticket.title}</h3>

              <div className="flex items-center gap-1.5 text-muted text-[12px] mt-1.5">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-primary" />
                <span className="truncate">{ticket.location.address}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expanded Active Ticket Work Surface */}
      {activeTicket && (
        <div className="mt-2 bg-canvas border border-hairline rounded-xl p-5 shadow-soft flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-hairline">
            <span className="font-mono text-[13px] font-bold text-primary">
              WORK TICKET: {activeTicket.ticket_id}
            </span>
            <BadgePill severity={activeTicket.priority} label={activeTicket.priority} dot />
          </div>

          {/* Photo */}
          <div className="relative rounded-lg overflow-hidden border border-hairline aspect-video bg-surface-dark">
            <img
              src={activeTicket.image_url}
              alt={activeTicket.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black/75 text-white px-2 py-1 rounded text-[11px] font-mono flex items-center gap-1">
              <Navigation className="w-3 h-3 text-primary" />
              <span>{activeTicket.location.ward}</span>
            </div>
          </div>

          <div>
            <h2 className="font-bold text-[17px] text-ink">{activeTicket.title}</h2>
            <p className="text-[13px] text-body mt-1 leading-relaxed">{activeTicket.description}</p>
          </div>

          {/* Status Progress Bar */}
          <div className="pt-3 border-t border-hairline">
            <span className="text-[12px] font-semibold text-muted uppercase tracking-wider block mb-2">
              Dispatch Progression:
            </span>
            <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-mono mb-3">
              {STATUS_STEPS.map((st, i) => {
                const isPassed = STATUS_STEPS.indexOf(activeTicket.status) >= i;
                const isCurrent = activeTicket.status === st;
                return (
                  <div
                    key={st}
                    className={`py-1.5 rounded-md font-semibold ${
                      isCurrent
                        ? 'bg-primary text-on-primary'
                        : isPassed
                        ? 'bg-semantic-up/10 text-semantic-up border border-semantic-up/20'
                        : 'bg-surface-strong text-muted'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </div>
                );
              })}
            </div>

            {/* Next Status Action Button */}
            {getNextStatus(activeTicket.status) ? (
              <Button
                variant="primary"
                disabled={isUpdating}
                onClick={() => handleStatusAdvance(getNextStatus(activeTicket.status)!)}
                className="w-full h-12 text-[15px] font-bold"
              >
                {isUpdating
                  ? 'Updating Ticket...'
                  : `Advance Status: Mark as ${getNextStatus(activeTicket.status)}`}
              </Button>
            ) : (
              <div className="p-3 bg-semantic-up/10 border border-semantic-up/30 rounded-lg text-center text-semantic-up text-[13px] font-bold">
                ✓ Hazard Work Completed & Verified
              </div>
            )}
          </div>

          {/* Field Notes Input */}
          <div className="pt-3 border-t border-hairline flex flex-col gap-2">
            <label className="text-[13px] font-medium text-body">Field Crew Action Log</label>
            <textarea
              rows={2}
              className="w-full bg-surface-soft text-ink rounded-md p-2.5 text-[13px] border border-hairline focus:outline-none focus:border-primary"
              placeholder="Record repairs conducted, asphalt batch used, or site remarks..."
              value={resolutionNotes || activeTicket.notes || ''}
              onChange={(e) => setResolutionNotes(e.target.value)}
            />
            <button
              onClick={() => handleStatusAdvance(activeTicket.status)}
              className="self-end text-[12px] text-primary font-semibold hover:underline cursor-pointer"
            >
              Save Site Log
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
