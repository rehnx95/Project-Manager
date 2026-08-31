Working Url - https://project-manager-owgl.onrender.com/

# Depot — Project & Task Management API

A backend-focused project management API built with **Node.js**, **Express**, and **PostgreSQL**, with JWT-based authentication and a lightweight vanilla JS frontend to exercise every route.

**Live demo:** https://project-manager-owgl.onrender.com/

> This project was built with a backend-first mindset — the frontend exists to showcase and test the API, not as the main focus.

---

## Features

- **Auth** — signup/login with `bcrypt` password hashing and `jsonwebtoken` sessions
- **Users & Profiles** — account management, profile create/update, admin-only user listing
- **Projects** — create, read, update, delete, with ownership rules
- **Project Members** — invite/remove members, role management (`owner` / `member`), last-owner protection
- **Tasks** — full CRUD, priority levels, due dates, completion toggling, pagination
- **Tags** — create tags and attach/detach them to tasks (many-to-many)
- **Comments** — per-task comments with owner-only bulk delete
- **Role-based & resource-based authorization** — every mutating route checks both "is logged in" and "is allowed to touch this resource"
- **Built-in API console** (`/testing`, owner-key gated) — a self-contained page for exercising every endpoint without Postman

---

## Tech Stack

| Layer          | Tech                                      |
|----------------|--------------------------------------------|
| Runtime        | Node.js + Express                          |
| Database       | PostgreSQL (via `pg`)                      |
| Auth           | `jsonwebtoken`, `bcrypt`                   |
| Validation     | `zod`                                      |
| Frontend       | Plain HTML / CSS / vanilla JS (no build step, no frameworks) |
| Hosting        | Render.com (web service + managed Postgres) |

---

## Project Structure

```
.
├── app.js                     # Express app + route registration
├── db.js                      # PostgreSQL pool (with SSL config for Render)
├── mydb.sql                   # Full schema: tables, enums, indexes, triggers
├── demoQueries.sql            # Example SQL — joins, window functions, CTEs
├── controllers/                # Request parsing, validation, response shaping
├── services/                   # Business logic & authorization rules
├── repository/                  # Raw SQL queries (data access layer)
├── middleware/
│   ├── authenticateToken.js    # JWT verification
│   ├── authenticateRole.js     # Role-gated routes (e.g. admin)
│   └── siteOwner.js            # Secret-key gate for /testing
├── utils/
│   └── asyncHandler.js         # Wraps async route handlers for error forwarding
└── frontend/                    # Static HTML/CSS/JS client + API console
```

The app follows a **controller → service → repository** layering:
- **Controllers** parse/validate requests (via `zod`) and shape HTTP responses
- **Services** hold business rules and authorization checks
- **Repositories** are the only layer that talks to the database

---

## Database Schema

8 tables, custom Postgres ENUMs, UUID primary keys, and `updated_at` triggers.

```
users ──< profiles
users ──< projects ──< project_members >── users
projects ──< tasks ──< tasks_tags >── tags
tasks ──< comments >── users
```

- **users** — `id (uuid)`, `email`, `password`, `role (user|admin)`
- **profiles** — 1:1 with users, `name`, `bio`
- **projects** — `status (active|archived|completed)`, owned by a user
- **project_members** — many-to-many join between users and projects, with `role (owner|member)`
- **tasks** — belongs to a project, `priority (low|medium|high)`, `due_date`, `completed`
- **tags** / **tasks_tags** — many-to-many tagging on tasks
- **comments** — belongs to a task and a user

See [`mydb.sql`](./mydb.sql) for the full DDL and [`demoQueries.sql`](./demoQueries.sql) for example queries (joins, aggregation, `RANK()`, CTEs, `UNION ALL`).

---

## API Overview

All routes are prefixed at the app root. Protected routes require `Authorization: Bearer <token>`.

| Resource | Routes |
|---|---|
| **Auth** | `POST /users/signup`, `POST /users/login` |
| **Users** | `GET/POST/PATCH /users/profile`, `PATCH /users/:id`, `DELETE /users`, `GET /users` (admin), `GET /users/:id` (admin) |
| **Projects** | `POST /projects`, `GET /projects`, `GET /projects/:id`, `PATCH /projects/:id`, `DELETE /projects/:id` |
| **Project Members** | `GET /projects/:id/membership`, `GET /projects/:id/members`, `POST/PATCH/DELETE /projects/:id/users/:userId` |
| **Tasks** | `POST /projects/:id/tasks`, `GET /tasks`, `GET/PATCH/DELETE /tasks/:id`, `PATCH /tasks/:id/complete` |
| **Tags** | `POST/GET /tags`, `POST/GET/DELETE /tasks/:taskId/tags/:tagId` |
| **Comments** | `POST/GET/DELETE /tasks/:taskId/comments`, `GET /users/comments`, `DELETE /users/comments/:id` |

For the full endpoint catalog with example bodies, run the app locally (or hit the live demo) and open **`/testing`** — a built-in API console that mirrors `app.js` exactly.

---

## Getting Started

### Prerequisites
- Node.js 18+
- A PostgreSQL database (local or managed)

### 1. Clone & install
```bash
git clone https://github.com/rehnx95/Project-Manager.git
cd Project-Manager
npm install
```

### 2. Set up the database
Run the schema against your Postgres instance:
```bash
psql "$DATABASE_URL" -f mydb.sql
```

### 3. Configure environment variables
Create a `.env` file in the project root:

```env
PORT=7000

DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=your_db_host
DB_PORT=5432
DB_NAME=your_db_name

JWT_SECRET=your_jwt_secret

# Optional — gates the /testing API console
SECRET_KEY=your_testing_key
```

> **Note:** If you're connecting to a managed Postgres instance (e.g. Render, Supabase, Neon), SSL is required. `db.js` is already configured with `ssl: { rejectUnauthorized: false }` for this.

### 4. Run it
```bash
npm start
```

The server starts on `http://localhost:7000` (or whatever `PORT` is set to), serving both the API and the static frontend from the same origin.

---

## Frontend

A small multi-page vanilla JS client lives in `frontend/`, built to exercise the API rather than as a polished product:

- `index.html` — sign in / register
- `dashboard.html` — project list + create
- `project.html` — project detail, tasks, crew/member management
- `task.html` — task detail, tags, comments
- `tasks.html` — paginated view of all your tasks across projects
- `profile.html` — profile + account settings
- `admin.html` — admin-only user directory
- `testing.html` — interactive API console (owner-key gated via `/testing?key=...`)

The frontend talks to the API using `location.origin`, so it works unmodified whether served locally or from the deployed URL — no config needed.

---

## Deployment

Deployed on **Render.com**:
- Web service auto-deploys on push to `main`
- Managed PostgreSQL instance, connected via environment variables
- Static frontend served directly by Express (`express.static`)

---

## Security Notes

- Passwords are hashed with `bcrypt` before storage
- JWTs are verified on every protected request, and the associated user is re-checked against the database (so deleted users can't use a stale token)
- Every mutating route enforces **resource-level** authorization (e.g. only a project's `owner` can delete it or change member roles), not just "is logged in"
- The `/testing` console is gated behind a constant-time comparison against a server-side secret key

---

## License

This project is currently unlicensed — all rights reserved by the author unless a license is added.
