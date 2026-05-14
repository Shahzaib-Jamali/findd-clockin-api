// Represents a frontline worker registered in the system
export interface Worker {
  workerId: string;
  name: string;
  siteId: string;
  credentialed: boolean;
  language: string;
}

// A single clock-in or clock-out event with GPS coordinates
export interface PunchRecord {
  workerId: string;
  type: 'clock-in' | 'clock-out';
  timestamp: number;
  latitude: number;
  longitude: number;
  verified: boolean;
  flagged: boolean;
  siteId: string;
}

// A physical job site with a GPS center point and valid radius
export interface Site {
  siteId: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
}

// The request body for the POST /clock-in endpoint
export interface ClockInRequest {
  workerId: string;
  siteId: string;
  latitude: number;
  longitude: number;
}

// The response shape for the hours report aggregation
export interface HoursReport {
  workerId: string;
  totalHours: number;
  totalPunches: number;
}
