import React from 'react';
import { IncidentSeverity, IncidentStatus, UserRole } from '../../types';

export interface BadgePillProps {
  label: string;
  severity?: IncidentSeverity;
  status?: IncidentStatus;
  role?: UserRole;
  variant?: 'neutral' | 'dark' | 'outline';
  dot?: boolean;
  className?: string;
}

export const BadgePill: React.FC<BadgePillProps> = ({
  label,
  severity,
  status,
  role,
  variant = 'neutral',
  dot = false,
  className = '',
}) => {
  let textColorClass = 'text-ink';
  let dotColorClass = 'bg-muted';
  let bgClass = 'bg-surface-strong';

  if (severity) {
    const sev = severity.toUpperCase();
    switch (sev) {
      case 'CRITICAL':
        textColorClass = 'text-severity-critical font-bold';
        dotColorClass = 'bg-severity-critical';
        break;
      case 'HIGH':
        textColorClass = 'text-severity-high font-bold';
        dotColorClass = 'bg-severity-high';
        break;
      case 'MEDIUM':
        textColorClass = 'text-severity-medium font-bold';
        dotColorClass = 'bg-severity-medium';
        break;
      case 'LOW':
        textColorClass = 'text-muted font-bold';
        dotColorClass = 'bg-muted';
        break;
    }
  } else if (status) {
    const st = status.toUpperCase();
    switch (st) {
      case 'REPORTED':
      case 'UNDER_REVIEW':
      case 'SUBMITTED':
        textColorClass = 'text-severity-high font-semibold';
        dotColorClass = 'bg-severity-high';
        break;
      case 'VERIFIED':
      case 'CONFIRMED':
      case 'ASSIGNED':
        textColorClass = 'text-primary font-semibold';
        dotColorClass = 'bg-primary';
        break;
      case 'IN_PROGRESS':
      case 'DISPATCHED':
      case 'EN_ROUTE':
        textColorClass = 'text-severity-medium font-semibold';
        dotColorClass = 'bg-severity-medium';
        break;
      case 'RESOLVED':
        textColorClass = 'text-severity-resolved font-semibold';
        dotColorClass = 'bg-severity-resolved';
        break;
      case 'REJECTED':
        textColorClass = 'text-muted font-semibold line-through';
        dotColorClass = 'bg-muted';
        break;
    }
  } else if (role) {
    switch (role) {
      case 'admin':
        textColorClass = 'text-primary font-semibold';
        dotColorClass = 'bg-primary';
        break;
      case 'control_room':
        textColorClass = 'text-severity-high font-semibold';
        dotColorClass = 'bg-severity-high';
        break;
      case 'department_officer':
        textColorClass = 'text-ink font-semibold';
        dotColorClass = 'bg-ink';
        break;
      case 'field_team':
        textColorClass = 'text-severity-resolved font-semibold';
        dotColorClass = 'bg-severity-resolved';
        break;
    }
  }

  if (variant === 'dark') {
    bgClass = 'bg-surface-dark-elevated text-on-dark';
    if (!severity && !status && !role) {
      textColorClass = 'text-on-dark';
    }
  } else if (variant === 'outline') {
    bgClass = 'bg-transparent border border-hairline';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-pill ${bgClass} ${textColorClass} type-caption-strong tracking-wider uppercase select-none ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColorClass}`} />}
      {label}
    </span>
  );
};
