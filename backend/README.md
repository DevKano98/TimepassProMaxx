# CivicGuard

A civic-issue reporting platform: citizens report hazards (potholes, flooded
roads, garbage piles, damaged roads) with a photo and location; a YOLO11
object detector classifies the hazard; nearby reports cluster into
incidents; officials verify, assign, and dispatch field teams; an LLM drafts
work tickets.

This repo is a monorepo containing **two independently deployable
services**:

- **`api/`** — FastAPI backend (auth, reports, incidents, alerts, admin
  dashboard data, field-team data). Talks to Postgres/PostGIS.
- **`ml-service/`** — FastAPI microservice wrapping a pre-trained YOLO11
  object detector. Nothing else.

These are deployed as **two separate Render web services from one repo** -
not merged into a single app. `api/` calls `ml-service/` over plain HTTP,
synchronously, when a report is submitted (no job queue in this version).

## Repository layout

```
civicguard/
├── api/            FastAPI backend
├── ml-service/     FastAPI YOLO microservice
├── migrations/     Alembic migrations (schema lives in api/app/models.py)
├── tests/          pytest suite for both services
├── .github/        CI (pytest + migration check) and a deploy placeholder
└── render.yaml      Render infra-as-code for both services
```

## Local setup

### 1. Clone and create env files

```bash
git clone <this-repo>
cd civicguard
cp api/.env.example api/.env
cp ml-service/.env.example ml-service/.env
```

Fill in real values in both `.env` files (Neon Postgres connection string,
Cloudinary, Resend, Firebase, VAPID keys, Hugging Face token, Groq key,
OpenRouteService key, JWT secret, internal API key, CORS origins).

### 2. Install dependencies

```bash
# api/
python -m venv api/.venv && source api/.venv/bin/activate
pip install -r api/requirements.txt
pip install alembic  # for running migrations from the repo root
deactivate

# ml-service/
python -m venv ml-service/.venv && source ml-service/.venv/bin/activate
pip install -r ml-service/requirements.txt
deactivate
```

### 3. Run database migrations

From the repo root (so Alembic can find `migrations/` and `alembic.ini`):

```bash
source api/.venv/bin/activate
alembic upgrade head
```

This enables the `postgis` and `pgcrypto` Postgres extensions and creates
every table, including GiST indexes on all Geography columns and the btree
index backing the anonymous rate limit.

### 4. Place the YOLO weights file

The trained `best.pt` (YOLO11s, ~19MB, 4 classes) is **not committed to
git**. Place it at:

```
ml-service/models/best.pt
```

`YOLO_WEIGHTS_PATH` in `ml-service/.env` defaults to `./models/best.pt` - if
you place the file elsewhere, update that variable.

### 5. Run each service locally

```bash
# Terminal 1 - api/
cd api
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Terminal 2 - ml-service/
cd ml-service
source .venv/bin/activate
uvicorn app.main:app --reload --port 8001
```

Set `ML_SERVICE_URL=http://localhost:8001` in `api/.env` for local
development.

### 6. Run tests

Tests require a real Postgres instance with PostGIS (SQLite can't represent
Geography columns or run ST_DWithin/ST_Distance). The easiest way locally is
Docker:

```bash
docker run -d --name civicguard-test-db -p 5432:5432 \
  -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=civicguard_test \
  postgis/postgis:16-3.4

export TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/civicguard_test
pytest tests/ -v
```

`ml_client` and other third-party calls are mocked in the test suite, so
these tests never require a live `ml-service`, Cloudinary, Resend, Groq, or
Hugging Face account.

## Deployment: two Render services from one repo

`render.yaml` defines both services:

- **`civicguard-api`** — Docker build from `api/Dockerfile`, health check at
  `/health`, free plan.
- **`civicguard-ml`** — Docker build from `ml-service/Dockerfile`, health
  check at `/health`, free plan.

All environment variables are marked `sync: false`, meaning you set the real
values manually in Render's dashboard - they are never committed to the
repo. For `ml-service`, since `best.pt` isn't in git, either:

- attach a Render persistent disk and upload the weights file to it, or
- add a small startup step that downloads it from a private storage URL
  given via an env var.

Auto-deploy on push to `main` is configured in Render's dashboard (via
Render's GitHub integration), not in this repo - `.github/workflows/deploy.yml`
is an intentional no-op placeholder.

### Free-tier keep-warm caveat

Render's free tier spins down a service after ~15 minutes of inactivity, so
the *next* request pays a cold-start cost. Because `api/` calls `ml-service/`
synchronously and waits for the response, a cold `ml-service` can make a
citizen's report submission noticeably slow (see `ml_client.py`'s 15s
timeout and `pending_ai_review` fallback for how this is handled
gracefully).

To reduce how often this happens, set up an external uptime pinger (e.g. a
free UptimeRobot or cron-job.org monitor) to hit `GET /health` on **both**
services every 10 minutes. This is a mitigation, not a guarantee - a request
can still land during a cold start, which is exactly why `ml_client.py`
never lets that hang the citizen's report submission indefinitely.

## Architecture decisions worth knowing about

These are deliberate, not oversights - see the original spec for full
reasoning:

- **No Redis/RQ job queue.** `api/` calls `ml-service/` directly over HTTP
  and waits for the response before replying to the citizen.
- **CLIP (duplicate detection), NSFW moderation, and face/plate blur are not
  self-hosted.** They call the free Hugging Face Inference API instead, so
  `ml-service/` only ever has YOLO's memory footprint to manage.
- **No trained severity model.** `priority_service.py` uses a fixed formula;
  a learned model is a separate future task.
