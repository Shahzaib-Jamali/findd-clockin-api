import { Router, Request, Response } from 'express';
import { WorkerModel, PunchModel, SiteModel } from './models';
import { ClockInRequest } from './types';
import { isSuspiciousPunch } from './utils';

const router = Router();

// --- Worker Routes ---

// Create a new worker
router.post('/workers', async (req: Request, res: Response) => {
  try {
    const worker = await WorkerModel.create(req.body);
    res.status(201).json(worker);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to create worker' });
  }
});

// List all workers
router.get('/workers', async (_req: Request, res: Response) => {
  try {
    const workers = await WorkerModel.find();
    res.json(workers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch workers' });
  }
});

// --- Site Routes ---

// Create a new site
router.post('/sites', async (req: Request, res: Response) => {
  try {
    const site = await SiteModel.create(req.body);
    res.status(201).json(site);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to create site' });
  }
});

// List all sites
router.get('/sites', async (_req: Request, res: Response) => {
  try {
    const sites = await SiteModel.find();
    res.json(sites);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch sites' });
  }
});

// --- Clock-In / Clock-Out Routes ---

// Clock in a worker with GPS verification and fraud detection
router.post('/clock-in', async (req: Request, res: Response) => {
  try {
    const { workerId, siteId, latitude, longitude } = req.body as ClockInRequest;

    const worker = await WorkerModel.findOne({ workerId });
    if (!worker) {
      res.status(404).json({ error: 'Worker not found' });
      return;
    }

    if (!worker.credentialed) {
      res.status(403).json({ error: 'Worker not credentialed' });
      return;
    }

    const site = await SiteModel.findOne({ siteId });
    if (!site) {
      res.status(404).json({ error: 'Site not found' });
      return;
    }

    const flagged = isSuspiciousPunch(
      latitude,
      longitude,
      site.latitude,
      site.longitude,
      site.radiusMeters
    );

    const punch = await PunchModel.create({
      workerId,
      type: 'clock-in',
      timestamp: Date.now(),
      latitude,
      longitude,
      verified: !flagged,
      flagged,
      siteId,
    });

    const message = flagged
      ? 'Clock-in recorded but flagged — location outside site boundary'
      : 'Clock-in verified';

    res.status(201).json({ punch, message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to clock in' });
  }
});

// Clock out a worker with GPS verification
router.post('/clock-out', async (req: Request, res: Response) => {
  try {
    const { workerId, siteId, latitude, longitude } = req.body as ClockInRequest;

    const worker = await WorkerModel.findOne({ workerId });
    if (!worker) {
      res.status(404).json({ error: 'Worker not found' });
      return;
    }

    const site = await SiteModel.findOne({ siteId });
    if (!site) {
      res.status(404).json({ error: 'Site not found' });
      return;
    }

    const flagged = isSuspiciousPunch(
      latitude,
      longitude,
      site.latitude,
      site.longitude,
      site.radiusMeters
    );

    const punch = await PunchModel.create({
      workerId,
      type: 'clock-out',
      timestamp: Date.now(),
      latitude,
      longitude,
      verified: !flagged,
      flagged,
      siteId,
    });

    const message = flagged
      ? 'Clock-out recorded but flagged — location outside site boundary'
      : 'Clock-out verified';

    res.status(201).json({ punch, message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to clock out' });
  }
});

// --- Punch History & Report Routes ---

// Get all punches for a specific worker, most recent first
router.get('/punches/:workerId', async (req: Request, res: Response) => {
  try {
    const punches = await PunchModel.find({ workerId: req.params.workerId }).sort({
      timestamp: -1,
    });
    res.json(punches);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch punches' });
  }
});

// Aggregate verified punches per worker — equivalent of SQL GROUP BY
router.get('/report/hours', async (_req: Request, res: Response) => {
  try {
    const report = await PunchModel.aggregate([
      { $match: { verified: true } },
      { $group: { _id: '$workerId', totalPunches: { $sum: 1 } } },
      { $project: { workerId: '$_id', totalPunches: 1, _id: 0 } },
      { $sort: { totalPunches: -1 } },
    ]);
    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// Get all suspicious/flagged punches
router.get('/report/flags', async (_req: Request, res: Response) => {
  try {
    const flagged = await PunchModel.find({ flagged: true }).sort({ timestamp: -1 });
    res.json({ count: flagged.length, punches: flagged });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch flagged punches' });
  }
});

export default router;
