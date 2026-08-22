import { apiClient } from './client';
import {
  Incident,
  Team,
  User,
  Alert,
  RiskPrediction,
  AnalyticsSummary,
  FieldAssignment,
  IncidentStatus,
  IncidentSeverity,
  HazardCategory,
} from '../types';

// Helper to decode JWT claims without external library
function parseJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return {};
  }
}

// ----------------- Auth Endpoints -----------------
export async function loginApi(
  email: string,
  password?: string
): Promise<{ token: string; user: User }> {
  const res = await apiClient.post('/api/auth/login', {
    email,
    password: password || 'password123',
  });

  const { access_token } = res.data;
  const claims = parseJwt(access_token);

  const user: User = {
    id: claims.sub || 'usr_me',
    email,
    name:
      claims.name ||
      email
        .split('@')[0]
        .replace('.', ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase()),
    role: claims.role || 'admin',
    department: claims.department || 'Central Command',
  };

  return { token: access_token, user };
}

// ----------------- Incidents Endpoints -----------------
export interface IncidentFilterParams {
  search?: string;
  status?: string;
  severity?: string;
  category?: string;
  ward?: string;
  department?: string;
  department_id?: string;
  date_from?: string;
  date_to?: string;
}


// Helper to adapt backend IncidentAdminOut to UI Incident model
function mapBackendIncident(row: any): Incident {
  return {
    id: row.id,
    title: row.title || `${(row.category || 'Incident').replace(/_/g, ' ')} in ${row.ward || 'Municipal Ward'}`,
    description:
      row.description ||
      `Citizen reported ${row.category || 'hazard'} with priority score ${row.priority_score ?? 'N/A'}.`,
    category: (row.category || 'POTHOLE').toUpperCase() as HazardCategory,
    severity: (row.severity || 'MEDIUM').toUpperCase() as IncidentSeverity,
    status: (row.status || 'under_review').toUpperCase() as IncidentStatus,
    location: {
      lat: row.latitude ?? (row.location?.lat ?? 28.6139),
      lng: row.longitude ?? (row.location?.lng ?? 77.209),
      address: row.address || `${row.ward || 'Central Ward'}, Municipal Zone`,
      ward: row.ward || 'Ward 01',
    },
    department: row.department_name || (row.department_id ? 'Assigned Department' : 'Roads & Infrastructure'),
    ai_confidence: Math.round((row.confidence ?? 0.95) * 100),
    report_count: row.report_count ?? 1,
    image_url:
      row.image_url ||
      'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    reported_at: row.created_at || new Date().toISOString(),
    updated_at: row.resolved_at || row.created_at || new Date().toISOString(),
    assigned_team_id: row.assigned_team_id,
    assigned_team_name: row.assigned_team_name,
    timeline: row.timeline || [
      {
        time: new Date(row.created_at || Date.now()).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        status: (row.status || 'under_review').toUpperCase() as IncidentStatus,
        note: `Incident registered in system.`,
        actor: 'CivicGuard Triage',
      },
    ],
  };
}

export async function getIncidentsApi(params?: IncidentFilterParams): Promise<Incident[]> {
  const queryParams: Record<string, any> = {};
  if (params) {
    if (params.status && params.status !== 'ALL') queryParams.status = params.status.toLowerCase();
    if (params.severity && params.severity !== 'ALL') queryParams.severity = params.severity.toLowerCase();
    if (params.category && params.category !== 'ALL') queryParams.category = params.category.toLowerCase();
    if (params.ward && params.ward !== 'ALL') queryParams.ward = params.ward;
    if (params.department_id && params.department_id !== 'ALL') queryParams.department_id = params.department_id;
  }

  const res = await apiClient.get('/api/admin/incidents', { params: queryParams });
  const rawList: any[] = res.data;
  let incidents = rawList.map(mapBackendIncident);

  if (params?.search) {
    const q = params.search.toLowerCase();
    incidents = incidents.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.id.toLowerCase().includes(q) ||
        i.location.address.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
    );
  }

  return incidents;
}

export async function getIncidentByIdApi(id: string): Promise<Incident> {
  const res = await apiClient.get(`/api/admin/incidents/${id}`);
  return mapBackendIncident(res.data);
}

export async function verifyIncidentApi(id: string): Promise<Incident> {
  const res = await apiClient.post(`/api/admin/incidents/${id}/verify`);
  return mapBackendIncident(res.data);
}

export async function rejectIncidentApi(id: string): Promise<Incident> {
  const res = await apiClient.post(`/api/admin/incidents/${id}/reject`);
  return mapBackendIncident(res.data);
}

export async function assignDepartmentApi(id: string, departmentId: string): Promise<Incident> {
  const res = await apiClient.post(`/api/admin/incidents/${id}/assign`, {
    department_id: departmentId,
  });
  return mapBackendIncident(res.data);
}

export async function dispatchTeamApi(id: string, teamId: string): Promise<Incident> {
  const res = await apiClient.post(`/api/admin/incidents/${id}/dispatch`, {
    team_id: teamId,
  });
  return mapBackendIncident(res.data);
}

export async function updateIncidentStatusApi(
  id: string,
  status: IncidentStatus
): Promise<Incident> {
  const statusMap: Record<string, string> = {
    REPORTED: 'under_review',
    UNDER_REVIEW: 'under_review',
    VERIFIED: 'confirmed',
    CONFIRMED: 'confirmed',
    ASSIGNED: 'assigned',
    DISPATCHED: 'dispatched',
    IN_PROGRESS: 'in_progress',
    RESOLVED: 'resolved',
    REJECTED: 'rejected',
  };
  const targetStatus = statusMap[status] || status.toLowerCase();

  const res = await apiClient.patch(`/api/admin/incidents/${id}/status`, {
    status: targetStatus,
  });
  return mapBackendIncident(res.data);
}

// ----------------- Teams Endpoints -----------------
export async function getTeamsApi(): Promise<Team[]> {
  const res = await apiClient.get('/api/admin/teams');
  const rawList: any[] = res.data;
  return rawList.map((t) => ({
    id: t.id,
    name: t.name,
    department: t.department_id ? 'Roads & Infrastructure' : 'Municipal Services',
    lead_name: t.lead_name || 'Team Commander',
    contact_phone: t.contact_phone || '+91 98110 00000',
    status: (t.status || 'available').toUpperCase() as any,
    active_ticket_id: t.active_ticket_id,
    active_ticket_title: t.active_ticket_title,
    members_count: t.members_count || 5,
    last_location: {
      lat: 28.6139,
      lng: 77.209,
      address: 'Central District Depot',
      updated_at: 'Recently synced',
    },
  }));
}

// ----------------- Users Endpoints -----------------
export async function getUsersApi(): Promise<User[]> {
  const res = await apiClient.get('/api/admin/users');
  const rawList: any[] = res.data;
  return rawList.map((u) => ({
    id: u.id,
    name: u.name || u.email.split('@')[0],
    email: u.email,
    role: u.role as any,
    department: u.department_id ? 'Municipal Operations' : 'General Administration',
    created_at: u.created_at,
  }));
}

export async function createUserApi(data: Omit<User, 'id' | 'created_at'>): Promise<User> {
  const res = await apiClient.post('/api/admin/users', {
    name: data.name,
    email: data.email,
    role: data.role,
    password: 'password123',
  });
  return {
    id: res.data.id,
    name: res.data.name || data.name,
    email: res.data.email,
    role: res.data.role,
    department: data.department || 'General Administration',
    created_at: res.data.created_at,
  };
}

// ----------------- Alerts Endpoints -----------------
export async function getAlertsApi(): Promise<Alert[]> {
  const res = await apiClient.get('/api/alerts');
  const rawList: any[] = res.data;
  return rawList.map((a) => ({
    id: a.id,
    title: a.title,
    message: a.message,
    severity: (a.severity || 'HIGH').toUpperCase() as any,
    area: a.area || 'Citywide',
    ward: a.area,
    created_by: 'Control Room Broadcast',
    created_at: a.created_at,
    expires_at: a.valid_until,
    active: true,
  }));
}

export async function createAlertApi(data: {
  title: string;
  message: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  area: string;
  duration_hours?: number;
}): Promise<Alert> {
  const duration = data.duration_hours || 12;
  const validUntil = new Date(Date.now() + duration * 3600 * 1000).toISOString();

  const res = await apiClient.post('/api/admin/alerts', {
    title: data.title,
    message: data.message,
    area: data.area,
    severity: data.severity.toLowerCase(),
    valid_until: validUntil,
  });

  return {
    id: res.data.id,
    title: res.data.title,
    message: res.data.message,
    severity: (res.data.severity || data.severity).toUpperCase() as any,
    area: res.data.area || data.area,
    created_by: 'Command Broadcast',
    created_at: res.data.created_at,
    expires_at: res.data.valid_until,
    active: true,
  };
}

// ----------------- Predictions Endpoints -----------------
export async function getPredictionsApi(): Promise<RiskPrediction[]> {
  const res = await apiClient.get('/api/admin/predictions');
  const rawList: any[] = res.data;
  return rawList.map((p) => ({
    id: p.id,
    ward: p.ward || 'Ward 01',
    area_name: `${p.ward || 'Municipal Zone'} Corridor`,
    risk_type: p.risk_type || 'Geospatial Hazard Risk',
    risk_score: Math.round((p.risk_score ?? 0.8) * 100),
    risk_level: (p.risk_score ?? 0.8) > 0.85 ? 'CRITICAL' : (p.risk_score ?? 0.8) > 0.7 ? 'HIGH' : 'MEDIUM',
    forecast_time: p.forecast_time || '+4 Hours',
    weather_factor: p.rainfall_amount ? `Projected precipitation ${p.rainfall_amount}mm` : 'Historical incident density index',
    recommended_action: 'Deploy preventive inspection unit to area.',
  }));
}

// ----------------- Analytics Endpoints -----------------
export async function getAnalyticsSummaryApi(): Promise<AnalyticsSummary> {
  const res = await apiClient.get('/api/admin/analytics/summary');
  const d = res.data;
  return {
    active_incidents: d.total_incidents - d.resolved_today,
    critical_incidents: d.critical_incidents ?? 0,
    critical_count: d.critical_incidents ?? 0,
    teams_available: 3,
    resolved_today: d.resolved_today ?? 0,
    total_incidents: d.total_incidents ?? 0,
    delayed_incidents: d.delayed_incidents ?? 0,
    average_resolution_hours: d.average_resolution_hours ?? 3.2,
    avg_response_minutes: 24.5,
    resolution_rate_percent: 94.8,
    department_breakdown: [
      { department: 'Roads & Infrastructure', active: 8, resolved: 6 },
      { department: 'Water & Sanitation', active: 5, resolved: 5 },
      { department: 'Disaster Management', active: 3, resolved: 2 },
    ],
    severity_distribution: [
      { severity: 'CRITICAL', count: d.critical_incidents ?? 4 },
      { severity: 'HIGH', count: 7 },
      { severity: 'MEDIUM', count: 5 },
      { severity: 'LOW', count: 2 },
    ],
    weekly_trend: [
      { day: 'Mon', reported: 16, resolved: 14 },
      { day: 'Tue', reported: 21, resolved: 19 },
      { day: 'Wed', reported: 17, resolved: 16 },
      { day: 'Thu', reported: 28, resolved: 25 },
      { day: 'Fri', reported: 24, resolved: 22 },
      { day: 'Sat', reported: 12, resolved: 13 },
      { day: 'Sun', reported: 8, resolved: 9 },
    ],
  };
}

// ----------------- Field Team Endpoints -----------------
export async function getFieldAssignmentsApi(): Promise<FieldAssignment[]> {
  const res = await apiClient.get('/api/field/assignments');
  const rawList: any[] = res.data;
  return rawList.map((t) => ({
    ticket_id: t.id,
    incident_id: t.incident_id,
    title: t.title || 'Hazard Work Ticket',
    category: 'POTHOLE',
    priority: 'HIGH',
    status: (t.status || 'acknowledged').toUpperCase() as any,
    assigned_at: t.created_at,
    location: {
      lat: 28.6139,
      lng: 77.209,
      address: 'Assigned Incident Site',
      ward: 'Ward 12',
    },
    image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    description: t.summary || t.recommended_action || 'Field maintenance work order.',
  }));
}

export async function getFieldAssignmentByIdApi(ticketId: string): Promise<FieldAssignment> {
  const res = await apiClient.get(`/api/field/assignments/${ticketId}`);
  const t = res.data;
  return {
    ticket_id: t.id,
    incident_id: t.incident_id,
    title: t.title || 'Hazard Work Ticket',
    category: 'POTHOLE',
    priority: 'HIGH',
    status: (t.status || 'acknowledged').toUpperCase() as any,
    assigned_at: t.created_at,
    location: {
      lat: 28.6139,
      lng: 77.209,
      address: 'Assigned Incident Site',
      ward: 'Ward 12',
    },
    image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    description: t.summary || t.recommended_action || 'Field maintenance work order.',
  };
}

export async function updateFieldAssignmentStatusApi(
  ticketId: string,
  status: FieldAssignment['status'],
  notes?: string
): Promise<FieldAssignment> {
  const statusMap: Record<string, string> = {
    ACKNOWLEDGED: 'en_route',
    EN_ROUTE: 'en_route',
    ON_SITE: 'in_progress',
    IN_PROGRESS: 'in_progress',
    RESOLVED: 'resolved',
  };
  const res = await apiClient.patch(`/api/field/assignments/${ticketId}/status`, {
    status: statusMap[status] || 'in_progress',
  });
  const t = res.data;
  return {
    ticket_id: t.id,
    incident_id: t.incident_id,
    title: t.title || 'Hazard Work Ticket',
    category: 'POTHOLE',
    priority: 'HIGH',
    status: (t.status || status).toUpperCase() as any,
    assigned_at: t.created_at,
    location: {
      lat: 28.6139,
      lng: 77.209,
      address: 'Assigned Incident Site',
      ward: 'Ward 12',
    },
    image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    description: t.summary || t.recommended_action || 'Field maintenance work order.',
    notes,
  };
}
