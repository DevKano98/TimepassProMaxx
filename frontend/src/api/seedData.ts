import {
  Incident,
  Team,
  User,
  Alert,
  RiskPrediction,
  AnalyticsSummary,
  FieldAssignment,
} from '../types';

export const SEED_USERS: User[] = [
  {
    id: 'usr_001',
    email: 'admin@civicguard.gov',
    name: 'Director Eleanor Vance',
    role: 'admin',
    department: 'Executive Administration',
    created_at: '2026-01-10T08:00:00Z',
  },
  {
    id: 'usr_002',
    email: 'control@civicguard.gov',
    name: 'Marcus Chen',
    role: 'control_room',
    department: 'Central Dispatch Command',
    created_at: '2026-01-15T09:30:00Z',
  },
  {
    id: 'usr_003',
    email: 'roads.officer@civicguard.gov',
    name: 'Sgt. Priya Sharma',
    role: 'department_officer',
    department: 'Roads & Infrastructure',
    created_at: '2026-01-20T11:15:00Z',
  },
  {
    id: 'usr_004',
    email: 'water.officer@civicguard.gov',
    name: 'Tariq Al-Mansoor',
    role: 'department_officer',
    department: 'Water & Sanitation',
    created_at: '2026-01-22T14:00:00Z',
  },
  {
    id: 'usr_005',
    email: 'electrical.officer@civicguard.gov',
    name: 'Vikram Sethi',
    role: 'department_officer',
    department: 'Electrical & Lighting',
    created_at: '2026-02-01T10:00:00Z',
  },
  {
    id: 'usr_006',
    email: 'field1@civicguard.gov',
    name: 'Carlos Mendez (Unit Alpha-1)',
    role: 'field_team',
    department: 'Roads & Infrastructure',
    created_at: '2026-02-05T07:45:00Z',
  },
  {
    id: 'usr_007',
    email: 'field2@civicguard.gov',
    name: 'Amina Diallo (Hydraulic Unit)',
    role: 'field_team',
    department: 'Water & Sanitation',
    created_at: '2026-02-08T08:30:00Z',
  },
];

export const SEED_TEAMS: Team[] = [
  {
    id: 'team_001',
    name: 'Rapid Asphalt Unit 04',
    department: 'Roads & Infrastructure',
    lead_name: 'Foreman Rajesh Verma',
    contact_phone: '+91 98110 44210',
    status: 'DISPATCHED',
    active_ticket_id: 'INC-2026-1001',
    active_ticket_title: 'Dangerous Crater Pothole on Express Lane',
    members_count: 5,
    last_location: {
      lat: 28.6142,
      lng: 77.2088,
      address: 'Connaught Central Ring Road, Ward 12',
      updated_at: '4 mins ago',
    },
  },
  {
    id: 'team_002',
    name: 'Hydro Emergency Squad 02',
    department: 'Water & Sanitation',
    lead_name: 'Eng. Sarah Jenkins',
    contact_phone: '+91 98110 55102',
    status: 'DISPATCHED',
    active_ticket_id: 'INC-2026-1002',
    active_ticket_title: 'Severe Stormwater Inundation Underpass',
    members_count: 6,
    last_location: {
      lat: 28.6291,
      lng: 77.2181,
      address: 'Barakhamba Subway, Ward 04',
      updated_at: '2 mins ago',
    },
  },
  {
    id: 'team_003',
    name: 'Sanitation Taskforce 09',
    department: 'Water & Sanitation',
    lead_name: 'Vikram Seth',
    contact_phone: '+91 98110 33890',
    status: 'AVAILABLE',
    members_count: 8,
    last_location: {
      lat: 28.6450,
      lng: 77.2410,
      address: 'Central Depot Base 3, Ward 02',
      updated_at: '10 mins ago',
    },
  },
  {
    id: 'team_004',
    name: 'Civil Pavement Repair Squad 03',
    department: 'Roads & Infrastructure',
    lead_name: 'Deepak Nair',
    contact_phone: '+91 98110 77621',
    status: 'AVAILABLE',
    members_count: 4,
    last_location: {
      lat: 28.5825,
      lng: 77.2345,
      address: 'Lajpat Nagar Sector 2, Ward 22',
      updated_at: '15 mins ago',
    },
  },
  {
    id: 'team_005',
    name: 'Heavy Flood Mitigation Unit',
    department: 'Disaster Management',
    lead_name: 'Capt. Anita Roy',
    contact_phone: '+91 98110 88299',
    status: 'DISPATCHED',
    active_ticket_id: 'INC-2026-1008',
    active_ticket_title: 'Arterial Road Surcharging & Flooding',
    members_count: 7,
    last_location: {
      lat: 28.5950,
      lng: 77.2280,
      address: 'South Regional Staging Yard, Ward 08',
      updated_at: 'Just now',
    },
  },
  {
    id: 'team_006',
    name: 'Emergency Debris Clearing Crew',
    department: 'Water & Sanitation',
    lead_name: 'Harpreet Singh',
    contact_phone: '+91 98110 99401',
    status: 'AVAILABLE',
    members_count: 5,
    last_location: {
      lat: 28.6620,
      lng: 77.2100,
      address: 'Civil Lines Workshop, Ward 01',
      updated_at: '25 mins ago',
    },
  },
];

export const SEED_INCIDENTS: Incident[] = [
  {
    id: 'INC-2026-1001',
    title: 'Dangerous Crater Pothole on Express Lane',
    description: 'Deep road crater with broken edges causing high-speed vehicular swerving near metro bridge pillar.',
    category: 'POTHOLE',
    severity: 'CRITICAL',
    status: 'IN_PROGRESS',
    location: {
      lat: 28.6139,
      lng: 77.2090,
      address: 'Outer Ring Road, Connaught Central, Ward 12',
      ward: 'Ward 12',
    },
    department: 'Roads & Infrastructure',
    ai_confidence: 97.5,
    report_count: 16,
    image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    reported_at: '2026-08-22T07:45:00Z',
    updated_at: '2026-08-22T09:10:00Z',
    assigned_team_id: 'team_001',
    assigned_team_name: 'Rapid Asphalt Unit 04',
    timeline: [
      { time: '07:45', status: 'REPORTED', note: 'Multiple citizen mobile telemetry reports received.', actor: 'Citizen App #9102' },
      { time: '07:48', status: 'REPORTED', note: 'AI Hazard Model diagnosed POTHOLE with 97.5% confidence.', actor: 'YOLO11s Triage' },
      { time: '08:15', status: 'VERIFIED', note: 'Officer confirmed high-speed corridor risk.', actor: 'Sgt. Priya Sharma' },
      { time: '08:45', status: 'IN_PROGRESS', note: 'Dispatched Rapid Asphalt Unit 04 with hot-mix patch crew.', actor: 'Marcus Chen' },
    ],
  },
  {
    id: 'INC-2026-1002',
    title: 'Severe Stormwater Inundation Underpass',
    description: 'Barakhamba underpass flooded with 35cm standing rainwater blocking two automotive lanes.',
    category: 'FLOODED_ROAD',
    severity: 'CRITICAL',
    status: 'IN_PROGRESS',
    location: {
      lat: 28.6289,
      lng: 77.2185,
      address: 'Barakhamba Subway Underpass, Ward 04',
      ward: 'Ward 04',
    },
    department: 'Water & Sanitation',
    ai_confidence: 98.4,
    report_count: 31,
    image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    reported_at: '2026-08-22T06:30:00Z',
    updated_at: '2026-08-22T08:20:00Z',
    assigned_team_id: 'team_002',
    assigned_team_name: 'Hydro Emergency Squad 02',
    timeline: [
      { time: '06:30', status: 'REPORTED', note: 'Severe street flooding reported by morning commuters.', actor: 'Citizen App #4418' },
      { time: '06:40', status: 'VERIFIED', note: 'Subway water levels classified as CRITICAL public hazard.', actor: 'Tariq Al-Mansoor' },
      { time: '07:10', status: 'IN_PROGRESS', note: 'Dewatering submersible pump team deployed.', actor: 'Marcus Chen' },
    ],
  },
  {
    id: 'INC-2026-1003',
    title: 'Heavy Illegal Garbage & Plastic Dump Blocking Drain',
    description: 'Commercial waste and packaging materials dumped along stormwater canal bed.',
    category: 'GARBAGE_DUMP',
    severity: 'HIGH',
    status: 'VERIFIED',
    location: {
      lat: 28.6450,
      lng: 77.2410,
      address: 'Daryaganj Service Lane, Ward 02',
      ward: 'Ward 02',
    },
    department: 'Water & Sanitation',
    ai_confidence: 94.2,
    report_count: 9,
    image_url: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
    reported_at: '2026-08-22T08:15:00Z',
    updated_at: '2026-08-22T09:30:00Z',
    timeline: [
      { time: '08:15', status: 'REPORTED', note: 'Citizen photo report submitted.', actor: 'Citizen App #6620' },
      { time: '09:00', status: 'VERIFIED', note: 'Validated sanitation violation and drainage choke hazard.', actor: 'Tariq Al-Mansoor' },
    ],
  },
  {
    id: 'INC-2026-1004',
    title: 'Major Longitudinal Asphalt Fracture & Subsidence',
    description: 'Sub-base settling created 8-meter longitudinal crack and uneven pavement height.',
    category: 'DAMAGED_ROAD',
    severity: 'HIGH',
    status: 'VERIFIED',
    location: {
      lat: 28.5820,
      lng: 77.2340,
      address: 'Lajpat Flyover Southbound Ramp, Ward 22',
      ward: 'Ward 22',
    },
    department: 'Roads & Infrastructure',
    ai_confidence: 92.8,
    report_count: 7,
    image_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
    reported_at: '2026-08-22T09:00:00Z',
    updated_at: '2026-08-22T09:40:00Z',
  },
  {
    id: 'INC-2026-1005',
    title: 'Multi-Cluster Potholes near School Crosswalk',
    description: 'Three consecutive potholes in pedestrian crossing area causing cyclists to fall.',
    category: 'POTHOLE',
    severity: 'HIGH',
    status: 'REPORTED',
    location: {
      lat: 28.5980,
      lng: 77.2250,
      address: 'Lodhi Colony Sector 3 Avenue B, Ward 08',
      ward: 'Ward 08',
    },
    department: 'Roads & Infrastructure',
    ai_confidence: 95.1,
    report_count: 11,
    image_url: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80',
    reported_at: '2026-08-22T10:15:00Z',
    updated_at: '2026-08-22T10:15:00Z',
  },
  {
    id: 'INC-2026-1006',
    title: 'Waterlogged Residential Street Intersection',
    description: 'Storm sewer backflow causing 20cm standing water across residential intersection.',
    category: 'FLOODED_ROAD',
    severity: 'MEDIUM',
    status: 'REPORTED',
    location: {
      lat: 28.6350,
      lng: 77.2010,
      address: 'Panchkuian Marg, Ward 15',
      ward: 'Ward 15',
    },
    department: 'Water & Sanitation',
    ai_confidence: 91.6,
    report_count: 5,
    image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    reported_at: '2026-08-22T10:30:00Z',
    updated_at: '2026-08-22T10:30:00Z',
  },
  {
    id: 'INC-2026-1007',
    title: 'Commercial Construction Waste Dumped on Footpath',
    description: 'Concrete slabs and wire mesh obstructing pedestrian pathway and cycle corridor.',
    category: 'GARBAGE_DUMP',
    severity: 'MEDIUM',
    status: 'REPORTED',
    location: {
      lat: 28.6210,
      lng: 77.2120,
      address: 'Janpath & Tolstoy Junction, Ward 11',
      ward: 'Ward 11',
    },
    department: 'Water & Sanitation',
    ai_confidence: 93.4,
    report_count: 4,
    image_url: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
    reported_at: '2026-08-22T08:50:00Z',
    updated_at: '2026-08-22T08:50:00Z',
  },
  {
    id: 'INC-2026-1008',
    title: 'Arterial Road Surcharging & Flooding',
    description: 'Heavy runoff from ridge area inundating four-lane corridor; traffic diversion active.',
    category: 'FLOODED_ROAD',
    severity: 'CRITICAL',
    status: 'IN_PROGRESS',
    location: {
      lat: 28.5950,
      lng: 77.2280,
      address: 'Lodhi Estate South Gateway, Ward 08',
      ward: 'Ward 08',
    },
    department: 'Disaster Management',
    ai_confidence: 98.9,
    report_count: 24,
    image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    reported_at: '2026-08-22T06:00:00Z',
    updated_at: '2026-08-22T07:30:00Z',
    assigned_team_id: 'team_005',
    assigned_team_name: 'Heavy Flood Mitigation Unit',
  },
  {
    id: 'INC-2026-1009',
    title: 'Cracked Road Surface Over Metro Tunnel',
    description: 'Structural inspection requested due to surface alligator cracking on deck joint.',
    category: 'DAMAGED_ROAD',
    severity: 'HIGH',
    status: 'VERIFIED',
    location: {
      lat: 28.6500,
      lng: 77.2300,
      address: 'Chandni Chowk Red Fort Access, Ward 03',
      ward: 'Ward 03',
    },
    department: 'Roads & Infrastructure',
    ai_confidence: 96.0,
    report_count: 8,
    image_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
    reported_at: '2026-08-22T05:30:00Z',
    updated_at: '2026-08-22T07:00:00Z',
  },
  {
    id: 'INC-2026-1010',
    title: 'Deep Edge Pothole on Bus Rapid Transit Lane',
    description: 'Pothole located in bus deceleration pocket, causing heavy buses to scrape undercarriage.',
    category: 'POTHOLE',
    severity: 'MEDIUM',
    status: 'RESOLVED',
    location: {
      lat: 28.5600,
      lng: 77.2100,
      address: 'AIIMS Flyover Loop, Ward 18',
      ward: 'Ward 18',
    },
    department: 'Roads & Infrastructure',
    ai_confidence: 94.7,
    report_count: 14,
    image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    reported_at: '2026-08-21T14:00:00Z',
    updated_at: '2026-08-22T06:30:00Z',
    timeline: [
      { time: '14:00', status: 'REPORTED', note: 'Reported by bus transit marshal.', actor: 'Transit Officer' },
      { time: '15:20', status: 'VERIFIED', note: 'Approved for night-shift emergency repair.', actor: 'Sgt. Priya Sharma' },
      { time: '22:00', status: 'IN_PROGRESS', note: 'Asphalt cold patch rolled and compacted.', actor: 'Rapid Asphalt Unit 04' },
      { time: '06:30', status: 'RESOLVED', note: 'Post-repair compaction inspected and signed off.', actor: 'Director Vance' },
    ],
  },
  {
    id: 'INC-2026-1011',
    title: 'Overflowing Municipal Dumpster Bin',
    description: 'Secondary collection container overflowed onto adjacent pedestrian pavement.',
    category: 'GARBAGE_DUMP',
    severity: 'LOW',
    status: 'RESOLVED',
    location: {
      lat: 28.5700,
      lng: 77.2400,
      address: 'Kailash Colony Market, Ward 20',
      ward: 'Ward 20',
    },
    department: 'Water & Sanitation',
    ai_confidence: 90.2,
    report_count: 3,
    image_url: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
    reported_at: '2026-08-21T18:00:00Z',
    updated_at: '2026-08-22T05:00:00Z',
  },
  {
    id: 'INC-2026-1012',
    title: 'Reported Pothole Flagged as Spurious / Private Driveway',
    description: 'Citizen report pinpointed inside private gated parking garage, outside municipal jurisdiction.',
    category: 'POTHOLE',
    severity: 'LOW',
    status: 'REJECTED',
    location: {
      lat: 28.6050,
      lng: 77.2150,
      address: 'Khan Market Private Car Park, Ward 10',
      ward: 'Ward 10',
    },
    department: 'Roads & Infrastructure',
    ai_confidence: 88.0,
    report_count: 1,
    image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    reported_at: '2026-08-22T09:10:00Z',
    updated_at: '2026-08-22T09:25:00Z',
  },
  {
    id: 'INC-2026-1013',
    title: 'Severe Road Surface Buckling from Heat & Axle Stress',
    description: 'Pavement heaving creating dangerous 10cm crest in lane center.',
    category: 'DAMAGED_ROAD',
    severity: 'HIGH',
    status: 'REPORTED',
    location: {
      lat: 28.6400,
      lng: 77.2200,
      address: 'Ajmeri Gate Commercial Corridor, Ward 07',
      ward: 'Ward 07',
    },
    department: 'Roads & Infrastructure',
    ai_confidence: 93.8,
    report_count: 6,
    image_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
    reported_at: '2026-08-22T10:45:00Z',
    updated_at: '2026-08-22T10:45:00Z',
  },
  {
    id: 'INC-2026-1014',
    title: 'Submerged Road Junction with Hidden Curb Obstacle',
    description: 'Water standing at 25cm concealing concrete traffic divider end.',
    category: 'FLOODED_ROAD',
    severity: 'HIGH',
    status: 'VERIFIED',
    location: {
      lat: 28.6180,
      lng: 77.2050,
      address: 'Mandir Marg Crossing, Ward 14',
      ward: 'Ward 14',
    },
    department: 'Water & Sanitation',
    ai_confidence: 95.7,
    report_count: 12,
    image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    reported_at: '2026-08-22T07:10:00Z',
    updated_at: '2026-08-22T08:00:00Z',
  },
  {
    id: 'INC-2026-1015',
    title: 'Asphalt Edge Collapse on Canal Embankment Road',
    description: 'Shoulder erosion caused 2 meters of asphalt edge to cave into drainage easement.',
    category: 'DAMAGED_ROAD',
    severity: 'CRITICAL',
    status: 'VERIFIED',
    location: {
      lat: 28.5880,
      lng: 77.2480,
      address: 'Nizamuddin Bypass Canal Road, Ward 19',
      ward: 'Ward 19',
    },
    department: 'Roads & Infrastructure',
    ai_confidence: 96.9,
    report_count: 19,
    image_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
    reported_at: '2026-08-22T06:15:00Z',
    updated_at: '2026-08-22T07:40:00Z',
  },
  {
    id: 'INC-2026-1016',
    title: 'Multiple Potholes near Metro Station Feeder Stop',
    description: 'Pothole chain creating bus suspension shocks and pedestrian splashing.',
    category: 'POTHOLE',
    severity: 'MEDIUM',
    status: 'REPORTED',
    location: {
      lat: 28.6320,
      lng: 77.2220,
      address: 'Mandi House Metro Exit 2, Ward 09',
      ward: 'Ward 09',
    },
    department: 'Roads & Infrastructure',
    ai_confidence: 92.1,
    report_count: 8,
    image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    reported_at: '2026-08-22T10:00:00Z',
    updated_at: '2026-08-22T10:00:00Z',
  },
];

export const SEED_ALERTS: Alert[] = [
  {
    id: 'ALT-201',
    title: 'Flash Flood & Subway Inundation Advisory',
    message: 'Barakhamba and Minto underpasses experiencing heavy standing water. Diversion routes active.',
    severity: 'CRITICAL',
    area: 'Central Zone (Ward 04, Ward 12)',
    ward: 'Ward 04',
    created_by: 'Marcus Chen (Control Room)',
    created_at: '2026-08-22T07:30:00Z',
    expires_at: '2026-08-22T19:30:00Z',
    active: true,
  },
  {
    id: 'ALT-202',
    title: 'Emergency Pothole Patching & Single-Lane Cordon',
    message: 'Outer Ring Road near Connaught Central experiencing single-lane closure for emergency asphalt compaction.',
    severity: 'HIGH',
    area: 'Connaught Arterial (Ward 12)',
    ward: 'Ward 12',
    created_by: 'Sgt. Priya Sharma (Roads Officer)',
    created_at: '2026-08-22T08:45:00Z',
    expires_at: '2026-08-22T14:45:00Z',
    active: true,
  },
  {
    id: 'ALT-203',
    title: 'Stormwater Interceptor Dredging & Canal Cleaning',
    message: 'Heavy sanitation vehicles deployed along Daryaganj Service Corridor. Slow traffic expected.',
    severity: 'MEDIUM',
    area: 'Daryaganj (Ward 02)',
    ward: 'Ward 02',
    created_by: 'Tariq Al-Mansoor (Sanitation Officer)',
    created_at: '2026-08-22T09:15:00Z',
    expires_at: '2026-08-22T17:15:00Z',
    active: true,
  },
  {
    id: 'ALT-204',
    title: 'Pre-Monsoon Embankment Safety Inspection Advisory',
    message: 'Engineers conducting geotechnical scans of Nizammudin Canal roadway shoulder.',
    severity: 'MEDIUM',
    area: 'Ward 19',
    ward: 'Ward 19',
    created_by: 'Director Eleanor Vance',
    created_at: '2026-08-22T06:00:00Z',
    expires_at: '2026-08-22T22:00:00Z',
    active: true,
  },
];

export const SEED_PREDICTIONS: RiskPrediction[] = [
  {
    id: 'PRED-501',
    ward: 'Ward 04',
    area_name: 'Barakhamba Lowland Subway Basin',
    risk_type: 'Severe Drainage Surcharging & Flood Risk',
    risk_score: 94,
    risk_level: 'CRITICAL',
    forecast_time: '+2 Hours (14:00 IST)',
    weather_factor: 'Precipitation 44mm/h exceeding stormwater interceptor design limits',
    recommended_action: 'Pre-position 2x high-volume trailer dewatering pumps.',
  },
  {
    id: 'PRED-502',
    ward: 'Ward 12',
    area_name: 'Connaught Outer Arterial Loop',
    risk_type: 'High-Velocity Asphalt Pothole Formation',
    risk_score: 88,
    risk_level: 'HIGH',
    forecast_time: '+4 Hours (16:00 IST)',
    weather_factor: 'Heavy commercial axle load + water ingress degrading binder cohesion',
    recommended_action: 'Alert Rapid Asphalt Unit 04 for immediate standby.',
  },
  {
    id: 'PRED-503',
    ward: 'Ward 19',
    area_name: 'Nizamuddin Embankment Sector',
    risk_type: 'Canal Road Pavement Edge Subsidence',
    risk_score: 82,
    risk_level: 'HIGH',
    forecast_time: '+8 Hours (20:00 IST)',
    weather_factor: 'Soil saturation weakening embankment stability by 32%',
    recommended_action: 'Erect concrete jersey barriers along un-reinforced shoulder.',
  },
  {
    id: 'PRED-504',
    ward: 'Ward 02',
    area_name: 'Daryaganj Drainage Corridor',
    risk_type: 'Solid Waste Debris Siphon Choke',
    risk_score: 75,
    risk_level: 'MEDIUM',
    forecast_time: 'Next 24 Hours',
    weather_factor: 'Runoff carrying loose packaging waste into primary grate screen',
    recommended_action: 'Dispatch mechanical trash skimmer truck.',
  },
  {
    id: 'PRED-505',
    ward: 'Ward 15',
    area_name: 'Panchkuian Commercial Transit Hub',
    risk_type: 'Pedestrian Surface Fracture Propagation',
    risk_score: 69,
    risk_level: 'MEDIUM',
    forecast_time: '+12 Hours',
    weather_factor: 'Pavement thermal expansion cycle',
    recommended_action: 'Schedule non-disruptive early morning asphalt cold patch.',
  },
];

export const SEED_ANALYTICS: AnalyticsSummary = {
  active_incidents: 16,
  critical_count: 4,
  critical_incidents: 4,
  teams_available: 3,
  resolved_today: 14,

  total_incidents: 128,
  delayed_incidents: 2,
  average_resolution_hours: 3.4,
  avg_response_minutes: 24.8,
  resolution_rate_percent: 95.2,
  department_breakdown: [
    { department: 'Roads & Infrastructure', active: 8, resolved: 7 },
    { department: 'Water & Sanitation', active: 6, resolved: 5 },
    { department: 'Disaster Management', active: 2, resolved: 2 },
  ],
  severity_distribution: [
    { severity: 'CRITICAL', count: 4 },
    { severity: 'HIGH', count: 6 },
    { severity: 'MEDIUM', count: 5 },
    { severity: 'LOW', count: 1 },
  ],
  weekly_trend: [
    { day: 'Mon', reported: 16, resolved: 15 },
    { day: 'Tue', reported: 22, resolved: 20 },
    { day: 'Wed', reported: 18, resolved: 18 },
    { day: 'Thu', reported: 29, resolved: 27 },
    { day: 'Fri', reported: 25, resolved: 24 },
    { day: 'Sat', reported: 12, resolved: 14 },
    { day: 'Sun', reported: 8, resolved: 10 },
  ],
};

export const SEED_FIELD_ASSIGNMENTS: FieldAssignment[] = [
  {
    ticket_id: 'TKT-1001',
    incident_id: 'INC-2026-1001',
    title: 'Dangerous Crater Pothole on Express Lane',
    category: 'POTHOLE',
    priority: 'CRITICAL',
    status: 'ON_SITE',
    assigned_at: '2026-08-22T08:45:00Z',
    location: {
      lat: 28.6139,
      lng: 77.2090,
      address: 'Outer Ring Road, Connaught Central, Ward 12',
      ward: 'Ward 12',
    },
    image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    description: 'Vehicle swerving danger on express lane. Hot-mix applicator crew on site setting safety cones.',
    notes: 'Traffic police assisted with lane cordon. Surface excavation underway.',
  },
  {
    ticket_id: 'TKT-1002',
    incident_id: 'INC-2026-1002',
    title: 'Severe Stormwater Inundation Underpass',
    category: 'FLOODED_ROAD',
    priority: 'CRITICAL',
    status: 'EN_ROUTE',
    assigned_at: '2026-08-22T07:10:00Z',
    location: {
      lat: 28.6289,
      lng: 77.2185,
      address: 'Barakhamba Subway Underpass, Ward 04',
      ward: 'Ward 04',
    },
    image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    description: 'Subway water levels high. Unit carrying 2x submersible dewatering pumps.',
  },
];

// --- In-Memory State Manager for Guest Mode ---
// Clones initial seed data so modifications stay in memory without making network calls or persisting across page reload
class GuestStore {
  incidents: Incident[] = JSON.parse(JSON.stringify(SEED_INCIDENTS));
  teams: Team[] = JSON.parse(JSON.stringify(SEED_TEAMS));
  users: User[] = JSON.parse(JSON.stringify(SEED_USERS));
  alerts: Alert[] = JSON.parse(JSON.stringify(SEED_ALERTS));
  predictions: RiskPrediction[] = JSON.parse(JSON.stringify(SEED_PREDICTIONS));
  analytics: AnalyticsSummary = JSON.parse(JSON.stringify(SEED_ANALYTICS));
  fieldAssignments: FieldAssignment[] = JSON.parse(JSON.stringify(SEED_FIELD_ASSIGNMENTS));

  reset() {
    this.incidents = JSON.parse(JSON.stringify(SEED_INCIDENTS));
    this.teams = JSON.parse(JSON.stringify(SEED_TEAMS));
    this.users = JSON.parse(JSON.stringify(SEED_USERS));
    this.alerts = JSON.parse(JSON.stringify(SEED_ALERTS));
    this.predictions = JSON.parse(JSON.stringify(SEED_PREDICTIONS));
    this.analytics = JSON.parse(JSON.stringify(SEED_ANALYTICS));
    this.fieldAssignments = JSON.parse(JSON.stringify(SEED_FIELD_ASSIGNMENTS));
  }

  getIncidents(params?: any): Incident[] {
    let list = [...this.incidents];
    if (params) {
      if (params.search) {
        const q = params.search.toLowerCase();
        list = list.filter(
          (i) =>
            i.title.toLowerCase().includes(q) ||
            i.id.toLowerCase().includes(q) ||
            i.location.address.toLowerCase().includes(q) ||
            i.category.toLowerCase().includes(q)
        );
      }
      if (params.status && params.status !== 'ALL') {
        list = list.filter((i) => i.status.toUpperCase() === params.status.toUpperCase());
      }
      if (params.severity && params.severity !== 'ALL') {
        list = list.filter((i) => i.severity.toUpperCase() === params.severity.toUpperCase());
      }
      if (params.category && params.category !== 'ALL') {
        list = list.filter((i) => i.category.toUpperCase() === params.category.toUpperCase());
      }
      if (params.department && params.department !== 'ALL') {
        list = list.filter((i) => i.department === params.department);
      }
    }
    return list;
  }

  getIncidentById(id: string): Incident | undefined {
    return this.incidents.find((i) => i.id === id);
  }

  verifyIncident(id: string): Incident {
    const inc = this.incidents.find((i) => i.id === id);
    if (!inc) throw new Error('Incident not found');
    inc.status = 'VERIFIED';
    inc.timeline = inc.timeline || [];
    inc.timeline.unshift({
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'VERIFIED',
      note: 'Incident verified by triage officer (Guest Demo).',
      actor: 'Guest Admin',
    });
    return inc;
  }

  rejectIncident(id: string, reason?: string): Incident {
    const inc = this.incidents.find((i) => i.id === id);
    if (!inc) throw new Error('Incident not found');
    inc.status = 'REJECTED';
    inc.timeline = inc.timeline || [];
    inc.timeline.unshift({
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'REJECTED',
      note: reason || 'Incident rejected by triage officer (Guest Demo).',
      actor: 'Guest Admin',
    });
    return inc;
  }

  assignDepartment(id: string, department: string): Incident {
    const inc = this.incidents.find((i) => i.id === id);
    if (!inc) throw new Error('Incident not found');
    inc.department = department;
    inc.timeline = inc.timeline || [];
    inc.timeline.unshift({
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: inc.status,
      note: `Jurisdiction assigned to ${department} (Guest Demo).`,
      actor: 'Guest Admin',
    });
    return inc;
  }

  dispatchTeam(id: string, teamId: string, teamName: string): Incident {
    const inc = this.incidents.find((i) => i.id === id);
    if (!inc) throw new Error('Incident not found');
    inc.status = 'IN_PROGRESS';
    inc.assigned_team_id = teamId;
    inc.assigned_team_name = teamName;
    inc.timeline = inc.timeline || [];
    inc.timeline.unshift({
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'IN_PROGRESS',
      note: `Dispatched ${teamName} to incident site (Guest Demo).`,
      actor: 'Guest Admin',
    });
    return inc;
  }

  updateIncidentStatus(id: string, status: Incident['status']): Incident {
    const inc = this.incidents.find((i) => i.id === id);
    if (!inc) throw new Error('Incident not found');
    inc.status = status;
    inc.timeline = inc.timeline || [];
    inc.timeline.unshift({
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status,
      note: `Status updated to ${status} (Guest Demo).`,
      actor: 'Guest Admin',
    });
    return inc;
  }

  createUser(userData: Omit<User, 'id' | 'created_at'>): User {
    const newUser: User = {
      ...userData,
      id: `usr_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.users.unshift(newUser);
    return newUser;
  }

  createAlert(alertData: {
    title: string;
    message: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
    area: string;
    duration_hours?: number;
  }): Alert {
    const newAlert: Alert = {
      id: `ALT-${Date.now().toString().slice(-4)}`,
      title: alertData.title,
      message: alertData.message,
      severity: alertData.severity,
      area: alertData.area,
      created_by: 'Guest Broadcast',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + (alertData.duration_hours || 12) * 3600000).toISOString(),
      active: true,
    };
    this.alerts.unshift(newAlert);
    return newAlert;
  }

  updateFieldAssignmentStatus(ticketId: string, status: FieldAssignment['status'], notes?: string): FieldAssignment {
    const assignment = this.fieldAssignments.find((a) => a.ticket_id === ticketId);
    if (!assignment) throw new Error('Assignment not found');
    assignment.status = status;
    if (notes) assignment.notes = notes;
    return assignment;
  }
}

export const guestStore = new GuestStore();
