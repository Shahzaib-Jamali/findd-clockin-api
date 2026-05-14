import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { WorkerModel, PunchModel, SiteModel } from './models';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await WorkerModel.deleteMany({});
    await SiteModel.deleteMany({});
    await PunchModel.deleteMany({});
    console.log('Cleared existing data');

    // Create site
    const site = await SiteModel.create({
      siteId: 'site-001',
      name: 'Chicago Loop Tower',
      latitude: 41.8781,
      longitude: -87.6298,
      radiusMeters: 200,
    });
    console.log(`Created site: ${site.name}`);

    // Create workers
    const workers = await WorkerModel.insertMany([
      {
        workerId: 'w-001',
        name: 'Maria Garcia',
        siteId: 'site-001',
        credentialed: true,
        language: 'es',
      },
      {
        workerId: 'w-002',
        name: 'James Kim',
        siteId: 'site-001',
        credentialed: true,
        language: 'en',
      },
      {
        workerId: 'w-003',
        name: 'Aisha Johnson',
        siteId: 'site-001',
        credentialed: false,
      },
    ]);
    console.log(`Created ${workers.length} workers`);

    await mongoose.disconnect();
    console.log('Seed complete — disconnected from MongoDB');
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
