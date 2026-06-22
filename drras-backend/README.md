# 🚨 D-RRAS — AI-Powered Disaster Response & Resource Allocation System

![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

> A full-stack disaster operations platform combining graph routing (Dijkstra + A*),
> constrained 0/1 Knapsack DP resource allocation, greedy volunteer matching, and
> LLM-grounded situational intelligence — served through a production-style REST API
> and a dark ops-center dashboard built in Next.js 15.

**24 REST endpoints · 6 normalized tables · 4 algorithmic engines · JWT + RBAC · Leaflet maps · AI intelligence · Dockerized**

---

## 🗂️ Project Structure

```
D-RRAS/
├── drras-backend/          FastAPI + PostgreSQL backend
│   ├── app/
│   │   ├── core/           JWT auth, bcrypt, FastAPI dependencies
│   │   ├── models/         6 SQLAlchemy ORM tables
│   │   ├── schemas/        Pydantic request/response contracts
│   │   ├── services/       Dijkstra, A*, Knapsack, Greedy Match, AI
│   │   └── routers/        24 REST endpoints
│   ├── seed.py             Idempotent demo data loader
│   ├── Dockerfile
│   └── docker-compose.yml
│
└── drras-frontend/         Next.js 15 + TypeScript + TailwindCSS
    ├── app/dashboard/      8 module pages
    ├── components/         Layout, charts, tables, maps, dialogs
    ├── hooks/              React Query hooks (one per backend resource)
    ├── store/              Zustand (auth, UI)
    └── lib/                API client, types, city coordinates, chart theme
```

---

## 🏗️ Architecture

```
Browser (Next.js 15)
  └─ React Query hooks ──→ Axios (JWT attached) ──→ FastAPI Routers
                                                        │
                                    ┌───────────────────┴────────────────────┐
                                    │              Service Layer              │
                                    │  Dijkstra │ A* │ Knapsack │ Greedy    │
                                    │  AI Summary │ AI Assistant (OpenRouter)│
                                    └───────────────────┬────────────────────┘
                                                        │
                                               SQLAlchemy ORM
                                                        │
                                                  PostgreSQL
```

---

## 🧠 Algorithms

| Engine | Algorithm | Complexity | Where |
|---|---|---|---|
| Route optimization | **Dijkstra** (binary heap) | O((V+E) log V) | `services/graph_service.py` |
| Route optimization | **A\*** (haversine heuristic) | O((V+E) log V), ~18% fewer nodes explored | `services/graph_service.py` |
| Resource allocation | **0/1 Knapsack** (bottom-up DP) | O(n × capacity) | `services/knapsack_service.py` |
| Volunteer dispatch | **Greedy matching** (priority-sorted) | O(n × m) | `services/matching_service.py` |

---

## 🎛️ Frontend Modules

| Module | What it shows |
|---|---|
| **Overview** | Stat cards, 4 Recharts charts, critical disaster + priority request lists |
| **Disaster Management** | Full CRUD table, severity indicators, timeline sheet |
| **Emergency Requests** | Priority-ranked table, filter chips, inline status updates |
| **Resource Allocation** | Stock grid, inline edits, Knapsack optimizer panel |
| **Volunteer Management** | Skill-grouped grid, availability toggles, Greedy matching panel |
| **Route Optimization** | Leaflet map + animated route, 3-algorithm selector, live road-block toggles |
| **AI Intelligence** | Situation summary generator + chat assistant (grounded in live DB) |
| **Admin Control Center** | Consolidated read-only system view (admin-only) |

---

## 🗄️ Database Schema

```
users               identity + role (admin/user)
disasters           event — type, severity, city, status
emergency_requests  help request — resource needs, computed priority score
resources           stock levels — food/water/medicine/ambulances per city
volunteers          people — skill type, city, availability
road_blocks         city-graph edge list AND dynamic block/traffic control
```

---

## 🤖 AI Features

- **Situation Summary** — aggregates unmet demand + blocked roads for a disaster, generates a 3-5 sentence brief + 1 recommendation
- **Operations Assistant** — serializes full DB state into the prompt context, answers free-text questions from live data only (no hallucination)
- Both use OpenRouter (OpenAI-compatible) — swap model by changing `OPENROUTER_MODEL` in `.env`

---

## 🚀 How to Run

### Option 1: Docker (recommended, zero setup)

```bash
# 1. Clone
git clone <your-repo-url>
cd D-RRAS

# 2. Backend
cd drras-backend
cp .env.example .env          # SECRET_KEY is pre-filled for local dev
docker compose up --build     # starts Postgres + API + auto-seeds

# 3. Frontend (new terminal)
cd drras-frontend
cp .env.local.example .env.local
npm install
npm run dev
```

- Backend: http://localhost:8000/docs
- Frontend: http://localhost:3000
- Login: `admin` / `Admin@123`

### Option 2: Without Docker

```bash
# Backend
cd drras-backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL="sqlite:///./drras.db"   # or set Postgres URL
python seed.py
uvicorn app.main:app --reload --port 8000

# Frontend
cd drras-frontend
npm install
npm run dev
```

---

## ☁️ Production Deployment

### Backend → Railway (2 minutes)
1. Push `drras-backend/` to a GitHub repo
2. railway.app → New Project → Deploy from repo → it auto-detects `Dockerfile`
3. `+ New → Database → PostgreSQL` in the same project
4. Add env vars: `DATABASE_URL=${{Postgres.DATABASE_URL}}`, fresh `SECRET_KEY`, `OPENROUTER_API_KEY`
5. `railway run python seed.py` once to seed

### Frontend → Vercel (1 minute)
1. Push `drras-frontend/` to GitHub
2. vercel.com → New Project → Import repo
3. Add env var: `NEXT_PUBLIC_API_URL=https://your-railway-app.up.railway.app`
4. Deploy

### Database → Neon (free tier)
Replace `DATABASE_URL` with your Neon connection string — it works out of the box with `psycopg2-binary`.

---

## 🔐 Environment Variables

**Backend (`.env`)**
```env
DATABASE_URL=postgresql+psycopg2://drras_user:drras_pass@db:5432/drras_db
SECRET_KEY=<generate: python3 -c "import secrets; print(secrets.token_hex(32))">
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
OPENROUTER_API_KEY=<your key — AI endpoints return 503 without this>
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=openai/gpt-4o-mini
```

**Frontend (`.env.local`)**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 👨‍💻 Author

**Aditya Chaturvedi** — B.Tech CSE, Jaypee Institute of Information Technology  
GitHub: [@Aditya-dev2005](https://github.com/Aditya-dev2005)
