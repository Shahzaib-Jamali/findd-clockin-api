import mongoose, { Schema } from 'mongoose';

// Stores registered workers and their credentials/site assignments
const WorkerSchema = new Schema(
  {
    workerId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    siteId: { type: String, required: true },
    credentialed: { type: Boolean, default: false },
    language: { type: String, default: 'en' },
  },
  { timestamps: true }
);

// Stores individual clock-in/clock-out punch events with GPS verification data
const PunchSchema = new Schema(
  {
    workerId: { type: String, required: true },
    type: { type: String, enum: ['clock-in', 'clock-out'], required: true },
    timestamp: { type: Number, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    verified: { type: Boolean, default: false },
    flagged: { type: Boolean, default: false },
    siteId: { type: String, required: true },
  },
  { timestamps: true }
);

// Stores job site locations with GPS coordinates and valid punch radius
const SiteSchema = new Schema(
  {
    siteId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    radiusMeters: { type: Number, default: 500 },
  },
  { timestamps: true }
);

export const WorkerModel = mongoose.model('Worker', WorkerSchema);
export const PunchModel = mongoose.model('Punch', PunchSchema);
export const SiteModel = mongoose.model('Site', SiteSchema);
