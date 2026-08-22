import React from 'react';
import { Incident } from '../../types';
import { BadgePill } from './BadgePill';
import { AlertCircle, ChevronRight, MapPin } from 'lucide-react';

interface AssetRowProps {
  incident: Incident;
  onClick?: () => void;
}

export const IncidentRow: React.FC<AssetRowProps> = ({ incident, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="group flex flex-col md:flex-row md:items-center justify-between py-4 px-3 md:px-4 border-b border-hairline hover:bg-surface-soft transition-colors cursor-pointer rounded-sm"
    >
      {/* Left side: Icon + Category + Address */}
      <div className="flex items-start md:items-center gap-3.5 min-w-0 flex-1">
        <div className="w-8 h-8 rounded-full bg-surface-strong flex items-center justify-center text-ink shrink-0 mt-0.5 md:mt-0">
          <AlertCircle className="w-4 h-4 text-primary" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-ink text-[15px] group-hover:text-primary transition-colors">
              {incident.title}
            </span>
            <BadgePill label={incident.category.replace(/_/g, ' ')} variant="outline" className="text-[11px]" />
          </div>
          <div className="flex items-center gap-2 text-muted text-[13px] mt-0.5">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{incident.location.address}</span>
            <span className="text-muted-soft">•</span>
            <span>{incident.location.ward}</span>
          </div>
        </div>
      </div>

      {/* Right side: Reports + Confidence in Mono + Severity Badge */}
      <div className="flex items-center justify-between md:justify-end gap-6 mt-3 md:mt-0 pt-2 md:pt-0 border-t md:border-t-0 border-hairline-soft">
        <div className="flex items-center gap-4 text-right">
          <div className="flex flex-col items-start md:items-end">
            <span className="type-number-display text-ink font-semibold">
              {incident.report_count}
              <span className="text-muted text-[12px] font-normal ml-1 font-sans">reports</span>
            </span>
            <span className="type-caption text-muted text-[11px]">
              AI: <span className="font-mono text-ink font-medium">{incident.ai_confidence}%</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <BadgePill severity={incident.severity} label={incident.severity} dot />
          <BadgePill status={incident.status} label={incident.status.replace(/_/g, ' ')} />
          <ChevronRight className="w-4 h-4 text-muted group-hover:text-ink transition-colors" />
        </div>
      </div>
    </div>
  );
};
