import React, { useState, useEffect } from 'react';
import { AnalyticsSummary } from '../../types';
import { getAnalyticsSummaryApi } from '../../api/endpoints';
import { StatCard } from '../../components/common/StatCard';
import { BadgePill } from '../../components/common/BadgePill';
import { Button } from '../../components/common/Button';
import {
  BarChart3,
  Clock,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Building,
  Calendar,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { guestStore } from '../../api/seedData';

export const AnalyticsPage: React.FC = () => {
  const { isGuestMode } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (isGuestMode) {
        setAnalytics(guestStore.analytics);
      } else {
        const data = await getAnalyticsSummaryApi();
        setAnalytics(data);
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Failed to load analytics summary from backend.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [isGuestMode]);

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="type-title-lg text-ink font-semibold">Operational Analytics & Performance</h1>
            <BadgePill label="30-DAY WINDOW" variant="neutral" />
          </div>
          <p className="type-body-sm text-muted mt-1">
            Service level benchmarks, triage turnaround latencies, and cross-department resolution metrics
          </p>
        </div>

        <Button
          variant="secondary-light"
          onClick={loadAnalytics}
          icon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
          className="h-10 text-[13px]"
        >
          Recalculate Metrics
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-semantic-down/10 border border-semantic-down/30 rounded-xl text-semantic-down text-[13px] flex items-center justify-between gap-3">
          <span>{error}</span>
          <Button variant="secondary-light" onClick={loadAnalytics} className="h-8 text-[12px]">
            Retry
          </Button>
        </div>
      )}


      {/* Primary KPI Grid (Stat cards with mono numbers) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Incidents (Month)"
          value={analytics?.total_incidents ?? 142}
          subtext="Citizen & automated reports"
          icon={<AlertCircle className="w-4 h-4 text-primary" />}
          trend="+12% vs last mo"
          trendType="neutral"
        />
        <StatCard
          label="Resolution Rate"
          value={`${analytics?.resolution_rate_percent ?? 94.2}%`}
          subtext="Verified complete repairs"
          icon={<CheckCircle2 className="w-4 h-4 text-semantic-up" />}
          trend="+3.4% efficiency"
          trendType="positive"
        />
        <StatCard
          label="Avg Response Time"
          value={`${analytics?.avg_response_minutes ?? 26.4}m`}
          subtext="From report to crew on site"
          icon={<Clock className="w-4 h-4 text-primary" />}
          trend="-8.2m faster"
          trendType="positive"
        />
        <StatCard
          label="Critical Resolved"
          value={analytics?.resolved_today ?? 18}
          subtext="Within standard SLA window"
          icon={<TrendingUp className="w-4 h-4 text-semantic-up" />}
          trend="100% SLA"
          trendType="positive"
        />
      </div>

      {/* Two Columns: Department Breakdown & Severity Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Department Resolution Table (7 cols) */}
        <div className="lg:col-span-7 bg-canvas border border-hairline rounded-xl p-6 shadow-soft">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-hairline">
            <Building className="w-5 h-5 text-primary" />
            <h3 className="type-title-md text-ink">Department Workload & Performance</h3>
          </div>

          <div className="divide-y divide-hairline">
            {analytics?.department_breakdown.map((dept) => {
              const total = dept.active + dept.resolved;
              const percent = Math.round((dept.resolved / (total || 1)) * 100);
              return (
                <div key={dept.department} className="py-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-ink text-[14px]">{dept.department}</span>
                    <span className="font-mono text-[13px] font-bold text-primary">{percent}% resolved</span>
                  </div>

                  <div className="w-full bg-surface-strong h-2 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${percent}%` }}
                      className="bg-primary h-full rounded-full transition-all duration-500"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[12px] text-muted">
                    <span>Active: <strong className="text-ink font-mono">{dept.active}</strong></span>
                    <span>Resolved: <strong className="text-ink font-mono">{dept.resolved}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Severity Distribution & Weekly Trend (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-canvas border border-hairline rounded-xl p-6 shadow-soft">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-hairline">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h3 className="type-title-md text-ink">Severity Breakdown</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {analytics?.severity_distribution.map((s) => (
                <div key={s.severity} className="p-4 rounded-lg bg-surface-soft border border-hairline flex flex-col">
                  <BadgePill severity={s.severity} label={s.severity} dot className="w-fit text-[10px] mb-2" />
                  <span className="font-mono text-[24px] font-bold text-ink">{s.count}</span>
                  <span className="text-[12px] text-muted">Active Work Orders</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-canvas border border-hairline rounded-xl p-6 shadow-soft">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-hairline">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="type-title-md text-ink">7-Day Incident Velocity</h3>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center">
              {analytics?.weekly_trend.map((w) => (
                <div key={w.day} className="p-2 rounded bg-surface-soft flex flex-col items-center">
                  <span className="text-[11px] text-muted font-medium mb-1">{w.day}</span>
                  <span className="font-mono text-[14px] font-bold text-ink">{w.reported}</span>
                  <span className="font-mono text-[11px] text-semantic-up mt-0.5">✓{w.resolved}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
