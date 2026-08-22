import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  highlight?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  trend,
  trendType = 'neutral',
  icon,
  highlight = false,
}) => {
  return (
    <div
      className={`bg-canvas border rounded-xl p-6 transition-all ${
        highlight ? 'border-primary/40 bg-primary/[0.02]' : 'border-hairline hover:border-hairline/80'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="type-caption text-muted uppercase font-medium tracking-wider">{label}</span>
        {icon && <div className="text-muted p-1.5 bg-surface-strong rounded-full">{icon}</div>}
      </div>

      <div className="flex items-baseline gap-3">
        <span className="font-mono text-[32px] font-semibold text-ink leading-tight tracking-tight">
          {value}
        </span>
        {trend && (
          <span
            className={`font-mono text-[13px] font-medium ${
              trendType === 'positive'
                ? 'text-semantic-up'
                : trendType === 'negative'
                ? 'text-semantic-down'
                : 'text-muted'
            }`}
          >
            {trend}
          </span>
        )}
      </div>

      {subtext && <p className="text-muted text-[13px] mt-1.5">{subtext}</p>}
    </div>
  );
};
