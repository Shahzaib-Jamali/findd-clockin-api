// Main entry point — connects to MongoDB and starts the Express server
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import router from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || '';

app.use(cors());
app.use(express.json());

// Root route
app.get('/', (_req, res) => {
  res.json({
    name: 'Findd Clock-In API',
    description: 'GPS-verified workforce clock-in/clock-out system with fraud detection',
    endpoints: {
      health: 'GET /health',
      workers: 'GET /api/workers',
      createWorker: 'POST /api/workers',
      sites: 'GET /api/sites',
      createSite: 'POST /api/sites',
      clockIn: 'POST /api/clock-in',
      clockOut: 'POST /api/clock-out',
      punchHistory: 'GET /api/punches/:workerId',
      hoursReport: 'GET /api/report/hours',
      flagsReport: 'GET /api/report/flags',
    },
  });
});

// Mount all API routes under /api
app.use('/api', router);

// Health check endpoint — lets Railway know the server is alive
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function start() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

start();
