# Findd Clock-In API

A workforce clock-in/clock-out API with GPS-based fraud detection, built as part of FDE internship preparation for [Findd.ai](https://findd.ai). Findd's platform handles biometric time tracking, GPS verification, and fraud prevention for frontline workers — this project implements the core GPS verification and credential-checking logic that powers features like buddy-punching prevention and site boundary enforcement.

## Tech Stack

- **TypeScript** + **Node.js** + **Express** — type-safe API server
- **MongoDB Atlas** + **Mongoose** — document storage for punch records
- **Railway** — cloud deployment

## Run Locally

```bash
git clone https://github.com/YOUR_USERNAME/findd-clockin-api.git
cd findd-clockin-api
npm install
```

Create a `.env` file:

```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/findd?retryWrites=true&w=majority
PORT=3000
```

Seed the database and start the server:

```bash
npm run seed
npm run dev
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/workers` | Register a new worker |
| GET | `/api/workers` | List all workers |
| POST | `/api/sites` | Register a new site |
| GET | `/api/sites` | List all sites |
| POST | `/api/clock-in` | Clock in with GPS verification |
| POST | `/api/clock-out` | Clock out with GPS verification |
| GET | `/api/punches/:workerId` | Get punch history for a worker |
| GET | `/api/report/hours` | Verified punches per worker |
| GET | `/api/report/flags` | All flagged/suspicious punches |
| GET | `/health` | Server health check |

## Example Requests

**Valid clock-in (within site radius):**

```bash
curl -X POST http://localhost:3000/api/clock-in \
  -H "Content-Type: application/json" \
  -d '{"workerId": "w-001", "siteId": "site-001", "latitude": 41.8781, "longitude": -87.6298}'
```

Response:

```json
{
  "punch": { "workerId": "w-001", "type": "clock-in", "verified": true, "flagged": false, "..." : "..." },
  "message": "Clock-in verified"
}
```

**Flagged clock-in (outside site radius — fraud detection triggered):**

```bash
curl -X POST http://localhost:3000/api/clock-in \
  -H "Content-Type: application/json" \
  -d '{"workerId": "w-002", "siteId": "site-001", "latitude": 41.9500, "longitude": -87.9000}'
```

Response:

```json
{
  "punch": { "workerId": "w-002", "type": "clock-in", "verified": false, "flagged": true, "..." : "..." },
  "message": "Clock-in recorded but flagged — location outside site boundary"
}
```

## Why This Project

**Why MongoDB?** Punch records are write-heavy, time-series data with variable fields — a document store handles this naturally without rigid schemas. The aggregation pipeline makes reporting (GROUP BY equivalent) straightforward.

**Why GPS radius for fraud detection?** The Haversine formula calculates real-world distance between two GPS coordinates accounting for Earth's curvature. By defining a radius around each job site, the system catches workers clocking in from outside the boundary — whether it's buddy punching (a coworker clocking in for someone else from home) or GPS spoofing. This mirrors how Findd's real product validates worker presence on-site.
