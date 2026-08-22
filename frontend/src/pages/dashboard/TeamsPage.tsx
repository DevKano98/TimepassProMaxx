import React, { useState, useEffect } from 'react';
import { Team } from '../../types';
import { getTeamsApi } from '../../api/endpoints';
import { BadgePill } from '../../components/common/BadgePill';
import { Button } from '../../components/common/Button';
import { Users2, Phone, MapPin, RefreshCw, Truck, Shield } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { guestStore } from '../../api/seedData';

export const TeamsPage: React.FC = () => {
  const { isGuestMode } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTeams = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (isGuestMode) {
        setTeams(guestStore.teams);
      } else {
        const data = await getTeamsApi();
        setTeams(data);
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Failed to load teams from live backend.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, [isGuestMode]);


  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="type-title-lg text-ink font-semibold">Response Teams & Fleet Roster</h1>
          <p className="type-body-sm text-muted mt-1">
            Real-time status, crew allocations, and last recorded geo-coordinates of municipal field units
          </p>
        </div>

        <Button
          variant="secondary-light"
          onClick={loadTeams}
          icon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
          className="h-10 text-[13px]"
        >
          Refresh Roster
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-semantic-down/10 border border-semantic-down/30 rounded-xl text-semantic-down text-[13px] flex items-center justify-between gap-3">
          <span>{error}</span>
          <Button variant="secondary-light" onClick={loadTeams} className="h-8 text-[12px]">
            Retry
          </Button>
        </div>
      )}

      {/* Teams Roster List */}

      <div className="bg-canvas border border-hairline rounded-xl overflow-hidden shadow-soft">
        <div className="bg-surface-soft px-6 py-3 border-b border-hairline flex items-center justify-between text-[12px] font-semibold text-muted uppercase tracking-wider">
          <span>Unit Name & Department</span>
          <div className="flex items-center gap-12">
            <span className="hidden md:inline">Crew & Lead</span>
            <span>Deployment Status</span>
          </div>
        </div>

        <div className="divide-y divide-hairline">
          {teams.map((team) => (
            <div
              key={team.id}
              className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-surface-soft/60 transition-colors"
            >
              {/* Left: Unit Identity */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-surface-strong flex items-center justify-center text-primary shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-ink text-[16px]">{team.name}</h3>
                    <BadgePill label={team.department} variant="outline" className="text-[11px]" />
                  </div>
                  <div className="flex items-center gap-2 text-muted text-[13px] mt-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{team.last_location.address}</span>
                    <span className="text-muted-soft">•</span>
                    <span className="font-mono text-[12px]">{team.last_location.updated_at}</span>
                  </div>
                  {team.active_ticket_title && (
                    <div className="mt-2 text-[13px] text-body bg-surface-strong/80 px-3 py-1.5 rounded-md inline-block">
                      Active Ticket: <strong className="text-ink">{team.active_ticket_id}</strong> — {team.active_ticket_title}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Contact & Status */}
              <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-hairline-soft">
                <div className="text-left md:text-right text-[13px]">
                  <p className="font-semibold text-ink">{team.lead_name}</p>
                  <p className="text-muted font-mono flex items-center gap-1 md:justify-end">
                    <Phone className="w-3 h-3" />
                    <span>{team.contact_phone}</span>
                  </p>
                  <span className="text-[12px] text-muted-soft">{team.members_count} active crew members</span>
                </div>

                <BadgePill
                  label={team.status}
                  severity={team.status === 'AVAILABLE' ? 'LOW' : team.status === 'DISPATCHED' ? 'HIGH' : 'MEDIUM'}
                  dot
                  className="text-[12px] px-3 py-1"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
