# RouteShare — AI-Based Empty-Return Truck Sharing and Freight Optimization System

A full-stack web platform that matches shippers needing freight capacity with truck
providers' unused empty-return journeys — reducing wasted road capacity and freight cost.

Built to satisfy the accompanying Software Requirements Specification, using the stack
explicitly specified there: **FastAPI + PostgreSQL** on the backend, **React (Vite) +
Tailwind CSS** on the frontend.

---

## 1. Features

- **Four roles**: Truck Provider, Shipper, Driver, Administrator — each with a dedicated dashboard.
- **Route registration**: providers publish return routes with source/destination, intermediate
  hubs, capacity, and rate per kg.
- **AI route-matching engine**: shippers search by pickup/delivery city and cargo weight; the
  engine matches requests against route corridors (source → hubs → destination) and available
  capacity, returning only viable, non-overbooked matches, sorted by estimated cost.
- **Booking & capacity allocation**: booking a route atomically deducts weight from available
  capacity; capacity can never go negative or exceed total capacity; cancelling a booking restores it.
- **Driver workflow**: view assigned trips, confirm cargo pickup and delivery, mark trips complete.
- **Admin console**: manage users (deactivate/delete), monitor all routes and bookings, and view
  a reporting dashboard (utilization %, revenue, booking counts).
- **Security**: JWT authentication, bcrypt password hashing, account lockout after repeated failed
  logins, role-based access control (RBAC) on every endpoint, security headers, rate limiting,
  input validation on both frontend and backend.

---

## 2. Folder structure

```
freight-system/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app, middleware, router registration
│   │   ├── config.py          # environment-driven settings
│   │   ├── database.py        # SQLAlchemy engine/session
│   │   ├── models.py          # ORM models (User, TruckRoute, Booking, AuditLog)
│   │   ├── schemas.py         # Pydantic request/response schemas + validation
│   │   ├── security.py        # password hashing, JWT
│   │   ├── deps.py            # auth dependency, RBAC dependency factory
│   │   └── routers/
│   │       ├── auth.py        # register, login, /me
│   │       ├── routes.py      # truck route CRUD (Provider)
│   │       ├── search.py      # freight search / AI matching engine (Shipper)
│   │       ├── bookings.py    # booking creation, history, cancellation
│   │       ├── drivers.py     # assigned trips, pickup/delivery confirmation
│   │       └── admin.py       # user management, reports
│   ├── requirements.txt
│   ├── .env.example
│   └── seed_data.py           # sample test data
├── database/
│   └── schema.sql             # reference PostgreSQL DDL + ER diagram (text)
├── frontend/
│   ├── src/
│   │   ├── pages/             # Login, Register, 4 dashboards, Landing, NotFound
│   │   ├── components/        # Navbar, ProtectedRoute, shared UI primitives
│   │   ├── context/           # AuthContext, ToastContext
│   │   └── services/api.js    # axios client + endpoint helpers
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── API_DOCUMENTATION.md
├── TESTING.md
└── README.md
```

---

## 3. Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+ (a local server, or a free hosted instance such as Neon/Supabase)

---

## 4. Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

# create the database first, e.g.:
#   psql -U postgres -c "CREATE DATABASE freight_db;"
#   psql -U postgres -c "CREATE USER freight_user WITH PASSWORD 'freight_pass';"
#   psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE freight_db TO freight_user;"

cp .env.example .env            # then edit DATABASE_URL / SECRET_KEY as needed

# Tables are created automatically on first run via SQLAlchemy.
# Alternatively, apply database/schema.sql directly with psql.

uvicorn app.main:app --reload --port 8000
```

Optional — populate sample accounts and one sample route for manual testing:

```bash
python seed_data.py
```

The API is now live at `http://localhost:8000`, with interactive docs at
`http://localhost:8000/docs`.

---

## 5. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173` and proxies `/api` requests to
`http://localhost:8000` (see `vite.config.js`).

For production: `npm run build` outputs static files to `frontend/dist/`, which can be
served by any static host or reverse-proxied by the FastAPI server / nginx.

---

## 6. Environment variables (backend/.env)

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://freight_user:freight_pass@localhost:5432/freight_db` |
| `SECRET_KEY` | JWT signing secret — generate a strong random value in production | `openssl rand -hex 32` |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime | `1440` |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins | `http://localhost:5173` |
| `RATE_LIMIT_PER_MINUTE` | Requests allowed per IP per minute | `60` |

---

## 7. Sample accounts (after running `seed_data.py`)

| Role | Email | Password |
|---|---|---|
| Administrator | admin@freight.test | Admin@1234 |
| Truck Provider | provider@freight.test | Provider@123 |
| Shipper | shipper@freight.test | Shipper@123 |
| Driver | driver@freight.test | Driver@1234 |

A sample active route (Coimbatore → Chennai via Salem, Vellore) is created and assigned to
the sample driver.

---

## 8. API documentation

See [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md) for the complete endpoint reference, or
browse the live interactive docs at `/docs` once the backend is running.

## 9. Testing

See [`TESTING.md`](./TESTING.md) for sample test data, a manual testing checklist, curl-based
API testing examples, and edge cases.

---

## 10. Design & architecture notes / assumptions

- **Corridor matching**: the "AI route-matching engine" is implemented as a deterministic
  corridor + capacity + date algorithm (source → intermediate hubs → destination, directional
  order check, active status, sufficient available capacity, non-expired return date). This is
  documented as a reasonable interpretation of the SRS's AI-matching requirement for a system
  without access to a live ML training pipeline; the matching function (`route_corridor_matches`
  in `backend/app/routers/search.py`) is isolated so it can be swapped for a trained model later
  without touching the API contract.
- **Booking IDs**: human-readable, unique, randomly generated (`BK-XXXXXXXX`); route codes use
  `RT-XXXXXXXX`.
- **Capacity integrity**: enforced with a `CHECK` constraint at the database level
  (`available_capacity_kg BETWEEN 0 AND total_capacity_kg`) in addition to application-level
  checks, and row-level locking (`SELECT ... FOR UPDATE`) on the booking path to prevent race
  conditions between concurrent bookings.
- **Admin accounts** cannot be created through public registration — they must be provisioned
  directly in the database or by another administrator, to prevent privilege escalation.
- **One active trip per driver**: a driver cannot begin a new pickup while another booking on a
  different trip is already in the `picked_up` state, matching typical single-vehicle operation.
