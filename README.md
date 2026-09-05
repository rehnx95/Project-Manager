# Depot — Project & Task Management API

A backend-focused project management API built with **Node.js**, **Express**, and **PostgreSQL**, with JWT-based authentication and a lightweight vanilla JS frontend to exercise every route.

**Live demo:** https://project-manager-owgl.onrender.com/

> This project was built with a backend-first mindset — the frontend exists to showcase and test the API, not as the main focus.

---

## Features

- **Auth** — signup/login with `bcrypt` password hashing and `jsonwebtoken` sessions
- **Users & Profiles** — account management, profile create/update, admin-only user listing
- **Email management** — users update their own email (`PATCH /users`); admins can update any user's email from the admin panel (`PATCH /users/:target_id`, admin-only)
- **Projects** — create, read, update, delete, with ownership rules, and a clear split between projects you **created** and projects you're **involved in** as a member
- **Project Members** — invite/remove members, role management (`owner` / `member`), last-owner protection
- **Tasks** — full CRUD, priority levels, due dates, completion toggling, pagination
- **Tags** — create tags and attach/detach them to tasks (many-to-many)
- **Comments** — per-task comments with owner-only bulk delete
- **Notes** — private, per-user notes with full CRUD (create, list, view, update, delete one, delete all)
- **Role-based & resource-based authorization** — every mutating route checks both "is logged in" and "is allowed to touch this resource"
- **Built-in API console** (`/testing`, owner-key gated) — a self-contained page for exercising every endpoint without Postman, including a raw SQL query runner with a picker of saved example queries

---

## Tech Stack

| Layer      | Tech                                                         |
| ---------- | ------------------------------------------------------------ |
| Runtime    | Node.js + Express                                            |
| Database   | PostgreSQL (via `pg`)                                        |
| Auth       | `jsonwebtoken`, `bcrypt`                                     |
| Validation | `zod`                                                        |
| Frontend   | Plain HTML / CSS / vanilla JS (no build step, no frameworks) |
| Hosting    | Render.com (web service + managed Postgres)                  |

---

## Project Structure

```
.
├── app.js                          # Express app + all route registration
├── db.js                           # PostgreSQL pool (pg, with SSL config for Render)
├── mydb_p1qi.sql                   # Full schema: tables, enums, indexes, triggers
├── demoQueries.sql                 # Optional: seeds the `queries` table (testing console dropdown)
├── mistakes.js                     # Personal bug/mistake log, reviewed before writing new code
├── package.json
├── package-lock.json
│
├── controllers/                    # Request parsing (zod), calls services, shapes HTTP responses
│   ├── userControllers.js
│   ├── projectControllers.js
│   ├── projectMemberControllers.js
│   ├── taskControllers.js
│   ├── tagControllers.js
│   ├── commentControllers.js
│   ├── noteControllers.js
│   └── databaseControllers.js      # Owner-only raw SQL console
│
├── services/                       # Business logic & authorization rules
│   ├── userService.js
│   ├── projectService.js
│   ├── projectMemberService.js
│   ├── taskService.js
│   ├── tagService.js
│   ├── commentService.js
│   ├── noteService.js
│   └── databaseService.js
│
├── repository/                     # Only layer that talks to the database (raw pg queries)
│   ├── usersDatabase.js
│   ├── projectsDatabase.js
│   ├── projectMembersDatabase.js
│   ├── tasksDatabase.js
│   ├── tagsDatabase.js
│   ├── commentsDatabase.js
│   ├── notesDatabase.js
│   └── database.js                 # Executes arbitrary SQL + lists saved `queries` rows
│
├── route/
│   ├── commentRoutes.js         # Comment CRUD, nested under /tasks/:task_id/comments
│   ├── databaseRoutes.js        # Owner-gated raw SQL console endpoints (/database, /database/queries)
│   ├── noteRoutes.js            # Private per-user notes, nested under /users/notes
│   ├── projectMemberRoutes.js   # Project membership: invite/remove/role-change
│   ├── projectRoutes.js         # Project CRUD
│   ├── tagRoutes.js             # Tag CRUD + attach/detach on tasks
│   ├── taskRoutes.js            # Task CRUD, complete-toggle, pagination
│   └── userRoutes.js            # Auth, profile, admin user management
│
├── middleware/
│   ├── authenticateToken.js        # JWT verification, re-checks user still exists in DB
│   ├── authenticateRole.js         # Role-gated routes (e.g. admin-only)
│   └── siteOwner.js                # Secret-key gate for /testing and /database
│
├── utils/
│   └── asyncHandler.js             # Wraps async route handlers, forwards errors to Express
│
└── frontend/                       # Static HTML/CSS/JS client + API console (no build step)
    ├── index.html                  # Sign in / register
    ├── dashboard.html              # Project list + create
    ├── project.html                # Project detail, tasks, crew/member management
    ├── task.html                   # Task detail, tags, comments
    ├── tasks.html                  # Paginated view of all your tasks across projects
    ├── profile.html                # Profile, account settings, self-service email updates
    ├── notes.html                  # Private per-user notes
    ├── admin.html                  # Admin-only user directory
    ├── testing.html                # Owner-key gated API console
    ├── css/
    │   ├── style.css                # Design system for the main app (dispatch-board theme)
    │   └── testing.css              # Separate design system for the API console
    └── js/
        ├── api.js                  # Shared api() fetch helper, token storage, toast(), formatters
        ├── nav.js                  # Renders the sidebar nav on every authenticated page
        ├── auth.js                 # Sign in / register form handling
        ├── dashboard.js
        ├── project.js
        ├── tasks.js
        ├── task.js
        ├── profile.js
        ├── notes.js
        ├── admin.js
        ├── testing.js              # API console logic — endpoint catalog, request builder, SQL picker
        └── testingWindow.js        # "Testing" button on index.html, prompts for the owner key
```

The app follows a **controller → service → repository** layering:

- **Controllers** parse/validate requests (via `zod`) and shape HTTP responses
- **Services** hold business rules and authorization checks
- **Repositories** are the only layer that talks to the database

`mistakes.js` isn't part of the running app — it's a personal log of bug patterns (missing `await`, schema/column name drift, Zod v4's `.issues` vs `.errors`, empty-result-as-error, etc.) reviewed before writing new code and after finishing a feature.

---

## Database Schema

10 tables, custom Postgres ENUMs, UUID primary keys, and `updated_at` triggers.

```
users ──< profiles
users ──< projects ──< project_members >── users
projects ──< tasks ──< tasks_tags >── tags
tasks ──< comments >── users
users ──< notes
```

- **users** — `id (uuid)`, `email`, `password`, `role (user|admin)`
- **profiles** — 1:1 with users, `name`, `bio`
- **projects** — `status (active|archived|completed)`, owned by the user who created it (`projects.user_id`)
- **project_members** — many-to-many join between users and projects, with `role (owner|member)`; includes the creator (auto-added as `owner`) plus anyone added later
- **tasks** — belongs to a project, `priority (low|medium|high)`, `due_date`, `completed`
- **tags** / **tasks_tags** — many-to-many tagging on tasks
- **comments** — belongs to a task and a user
- **notes** — private notes belonging to a single user, `title`, `body`
- **queries** — `label`, `query` pairs used only by the `/testing` console's SQL query picker (see [`demoQueries.sql`](./demoQueries.sql))

Because `projects` and `project_members` are separate tables, "projects I created" and "projects I'm involved in" are genuinely different questions — see the Projects row in the API table below.

See [`mydb_p1qi.sql`](./mydb_p1qi.sql) for the full DDL and [`demoQueries.sql`](./demoQueries.sql) for example queries (joins, aggregation, `RANK()`, CTEs, `UNION ALL`, anti-joins, window functions).

---

## API Overview

All routes are prefixed at the app root. Protected routes require `Authorization: Bearer <token>`.

| Resource                              | Routes                                                                                                                                                                              |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Auth**                              | `POST /users/signup`, `POST /users/login`                                                                                                                                           |
| **Users**                             | `GET/POST/PATCH /users/profile`, `DELETE /users`, `GET /users` (admin)                                                                                                              |
| **Email**                             | `PATCH /users` (update your own email), `PATCH /users/:target_id` (admin updates any user's email), `GET /users/:target_id` (admin lookup)                                          |
| **Projects**                          | `POST /projects`, `GET /projects` (projects you're involved in), `GET /projects/created` (projects you created), `GET /projects/:id`, `PATCH /projects/:id`, `DELETE /projects/:id` |
| **Project Members**                   | `GET /projects/:id/membership`, `GET /projects/:id/members`, `POST/PATCH/DELETE /projects/:id/users/:userId`                                                                        |
| **Tasks**                             | `POST /projects/:id/tasks`, `GET /tasks`, `GET/PATCH/DELETE /tasks/:id`, `PATCH /tasks/:id/complete`                                                                                |
| **Tags**                              | `POST/GET /tags`, `POST/GET/DELETE /tasks/:taskId/tags/:tagId`                                                                                                                      |
| **Comments**                          | `POST/GET/DELETE /tasks/:taskId/comments`, `GET /users/comments`, `DELETE /users/comments/:id`                                                                                      |
| **Notes**                             | `POST/GET/DELETE /users/notes`, `GET/PATCH/DELETE /users/notes/:noteId`                                                                                                             |
| **Database console** (owner-key only) | `POST /database` (run raw SQL), `GET /database/queries` (list saved example queries)                                                                                                |

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
psql "$DATABASE_URL" -f mydb_p1qi.sql
```

Optionally, seed the demo SQL queries used by the `/testing` console's query picker:

```bash
psql "$DATABASE_URL" -f demoQueries.sql
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

# Optional — gates the /testing console and the /database SQL runner
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
- `profile.html` — profile, account settings, and self-service email updates
- `notes.html` — private per-user notes
- `admin.html` — admin-only user directory, with lookup-by-ID and the ability to update any user's email
- `testing.html` — interactive API console (owner-key gated via `/testing?key=...`), including a raw SQL runner with a dropdown of saved example queries

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
- Self-service and admin-driven email updates are handled by separate routes (`PATCH /users` vs `PATCH /users/:target_id`), so a regular user's request always goes through their own route rather than the admin-gated one
- The `/testing` console and the `/database` raw SQL endpoint are both gated behind a constant-time comparison against a server-side secret key (`SECRET_KEY`), not a regular user JWT — a normal logged-in user cannot reach either, even with a valid token
- `POST /database` executes arbitrary SQL against the live database with no statement-type restrictions; it's intended purely as an owner-only debugging tool, not a feature exposed to end users

---

## License

This project is currently unlicensed — all rights reserved by the author unless a license is added.
