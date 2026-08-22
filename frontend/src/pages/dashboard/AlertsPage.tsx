import React, { useState, useEffect } from 'react';
import { Alert } from '../../types';
import { getAlertsApi, createAlertApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import { TextInput, SelectInput } from '../../components/common/TextInput';
import { Button } from '../../components/common/Button';
import { BadgePill } from '../../components/common/BadgePill';
import { BellRing, Radio, AlertTriangle, Check, Clock, MapPin, Send } from 'lucide-react';

const SEVERITY_OPTIONS: { label: string; value: 'CRITICAL' | 'HIGH' | 'MEDIUM' }[] = [
  { label: 'CRITICAL (Immediate Public Safety Danger)', value: 'CRITICAL' },
  { label: 'HIGH (Significant Traffic/Infrastructure Impairment)', value: 'HIGH' },
  { label: 'MEDIUM (Advisory & Planned Maintenance)', value: 'MEDIUM' },
];

import { guestStore } from '../../api/seedData';

export const AlertsPage: React.FC = () => {
  const { user, isGuestMode } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [area, setArea] = useState('');
  const [severity, setSeverity] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM'>('HIGH');
  const [durationHours, setDurationHours] = useState('12');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canBroadcast = user?.role === 'admin' || user?.role === 'control_room';

  const loadAlerts = async () => {
    setError(null);
    try {
      if (isGuestMode) {
        setAlerts(guestStore.alerts);
      } else {
        const data = await getAlertsApi();
        setAlerts(data);
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Failed to load alerts from backend.');
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [isGuestMode]);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message || !area) return;

    setIsSubmitting(true);
    setError(null);
    try {
      let created: Alert;
      if (isGuestMode) {
        created = guestStore.createAlert({
          title,
          message,
          area,
          severity,
          duration_hours: parseInt(durationHours, 10),
        });
      } else {
        created = await createAlertApi({
          title,
          message,
          area,
          severity,
          duration_hours: parseInt(durationHours, 10),
        });
      }
      setAlerts([created, ...alerts]);
      setTitle('');
      setMessage('');
      setArea('');
      const note = isGuestMode
        ? 'Emergency safety alert broadcast in demo mode. (Demo — changes aren\'t saved)'
        : 'Emergency safety alert successfully broadcast to citizen apps & digital signage.';
      setSuccessMsg(note);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Failed to broadcast alert.');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="type-title-lg text-ink font-semibold">Public Safety Broadcast Center</h1>
          <BadgePill label="GEO-FENCED ALERTS" variant="neutral" dot />
        </div>
        <p className="type-body-sm text-muted mt-1">
          Issue immediate push notifications and traffic advisories to citizens within target wards and geographic corridors
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-semantic-up/10 border border-semantic-up/30 rounded-lg text-semantic-up text-[14px] font-medium flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-semantic-down/10 border border-semantic-down/30 rounded-lg text-semantic-down text-[14px] font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}


      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Broadcast Form (if authorized) */}
        {canBroadcast && (
          <div className="lg:col-span-5 bg-canvas border border-hairline rounded-xl p-6 shadow-soft">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-hairline">
              <Radio className="w-5 h-5 text-severity-critical animate-pulse" />
              <h3 className="type-title-md text-ink">Broadcast New Public Alert</h3>
            </div>

            <form onSubmit={handleBroadcast} className="flex flex-col gap-4">
              <TextInput
                label="Alert Headline"
                placeholder="e.g. Flash Flood Advisory — Barakhamba Subway"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-body font-medium text-[14px]">Advisory Message</label>
                <textarea
                  rows={3}
                  className="w-full bg-canvas text-ink placeholder:text-muted rounded-md p-3.5 border border-hairline transition-all duration-150 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary type-body-md"
                  placeholder="Provide precise detour guidance and caution advisory..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>

              <TextInput
                label="Target Area / Ward Boundary"
                placeholder="e.g. Central Zone (Ward 04, Ward 12)"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                required
              />

              <SelectInput
                label="Severity Level"
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                options={SEVERITY_OPTIONS}
              />

              <SelectInput
                label="Active Duration"
                value={durationHours}
                onChange={(e) => setDurationHours(e.target.value)}
                options={[
                  { label: '4 Hours', value: '4' },
                  { label: '8 Hours', value: '8' },
                  { label: '12 Hours', value: '12' },
                  { label: '24 Hours', value: '24' },
                  { label: '48 Hours', value: '48' },
                ]}
              />

              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                icon={<Send className="w-4 h-4" />}
                className="w-full mt-2 h-12 text-[15px]"
              >
                {isSubmitting ? 'Transmitting Broadcast...' : 'Broadcast Push Alert'}
              </Button>
            </form>
          </div>
        )}

        {/* Right Column: Active Alert Feed */}
        <div className={`${canBroadcast ? 'lg:col-span-7' : 'lg:col-span-12'} flex flex-col gap-4`}>
          <div className="bg-canvas border border-hairline rounded-xl p-6 shadow-soft">
            <div className="flex items-center justify-between pb-4 border-b border-hairline mb-4">
              <div className="flex items-center gap-2">
                <BellRing className="w-5 h-5 text-primary" />
                <h3 className="type-title-md text-ink">Active Alert Feed</h3>
              </div>
              <span className="font-mono text-[12px] text-muted">{alerts.length} active advisories</span>
            </div>

            <div className="flex flex-col gap-4">
              {alerts.map((alt) => (
                <div
                  key={alt.id}
                  className="p-5 rounded-lg border border-hairline bg-surface-soft hover:bg-canvas transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <BadgePill severity={alt.severity} label={alt.severity} dot />
                      <span className="font-mono text-[12px] text-muted">{alt.id}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted text-[12px] font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Expires in 8h</span>
                    </div>
                  </div>

                  <h4 className="font-semibold text-[16px] text-ink mb-1.5">{alt.title}</h4>
                  <p className="type-body-sm text-body mb-3">{alt.message}</p>

                  <div className="pt-3 border-t border-hairline flex items-center justify-between text-[12px] text-muted">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      <strong>{alt.area}</strong>
                    </span>
                    <span>Issued by: {alt.created_by}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
