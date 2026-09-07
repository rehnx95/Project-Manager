# Depot — Project & Task Management API

A full-stack project and task management application built with **Node.js**, **Express**, **PostgreSQL**, JWT authentication, and a vanilla JavaScript frontend. The application combines a practical project workspace with an owner-only API/testing console.

**Live demo:** https://project-manager-owgl.onrender.com/

The frontend and API are served from the same Express application, so the application works locally and on Render without a separate frontend build or API base URL.

---

## Features

- **Authentication and sessions** — signup/login with `bcrypt` password hashing, JWT access tokens, persisted token sessions, and server-side logout/revocation
- **Users & Profiles** — account management, profile create/update, admin-only user listing
- **Email management** — users update their own email (`PATCH /users`); admins can update any user's email from the admin panel (`PATCH /users/:target_id`, admin-only)
- **Projects** — create, read, update, delete, with ownership rules, and a clear split between projects you **created** and projects you're **involved in** as a member
- **Project Members** — invite/remove members, role management (`owner` / `member`), last-owner protection
- **Tasks** — full CRUD, priority level, optional due dates, completion toggling, pagination, and permission-aware editing
- **Tags** — project-scoped tags that members can attach/detach to tasks (many-to-many)
- **Task assignments** — project owners assign tasks to project members
- **Comments** — per-task comments with owner-only bulk delete
- **Notes** — private, per-user notes with full CRUD (create, list, view, update, delete one, delete all)
- **Role-based & resource-based authorization** — every mutating route checks both "is logged in" and "is allowed to touch this resource"
- **Auditability** — security-sensitive changes are recorded in an `audit_logs` table
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
│   ├── securityDatabase.js          # Token sessions, revocation, and audit logs
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
│   ├── tagRoutes.js             # Project-scoped tag CRUD + attach/detach on tasks
│   ├── taskRoutes.js            # Task CRUD, completion, pagination, assignments
│   └── userRoutes.js            # Auth, profile, admin user management
│
├── middleware/
│   ├── authenticateToken.js        # JWT verification, re-checks user still exists in DB
│   ├── authenticateRole.js         # Role-gated routes (e.g. admin-only)
│   └── authenticateOwner.js        # Short-lived HttpOnly owner-console cookie
│
├── utils/
│   ├── asyncHandler.js              # Wraps async route handlers, forwards errors to Express
│   └── permissions.js               # Shared task, membership, and admin permission predicates
│
├── test/
│   └── permissions.test.js           # Permission behavior tests
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
        ├── testing.js              # API console endpoint catalog, request builder, SQL picker
        └── testingWindow.js        # Exchanges SECRET_KEY for owner-console access
```

The app follows a **controller → service → repository** layering:

- **Controllers** parse/validate requests (via `zod`) and shape HTTP responses
- **Services** hold business rules and authorization checks
- **Repositories** are the only layer that talks to the database

`mistakes.js` isn't part of the running app — it's a personal log of bug patterns (missing `await`, schema/column name drift, Zod v4's `.issues` vs `.errors`, empty-result-as-error, etc.) reviewed before writing new code and after finishing a feature.

---

## Database Schema

The database uses custom Postgres ENUMs, UUID project/user identifiers, BIGSERIAL task identifiers, foreign-key cascades, indexes, and `updated_at` triggers.

```
users ──< profiles
users ──< projects ──< project_members >── users
projects ──< tasks ──< tasks_tags >── tags
tasks ──< task_assignees >── users
users ──< token_sessions
users ──< audit_logs
tasks ──< comments >── users
users ──< notes
```

- **users** — `id (uuid)`, `email`, `password`, `role (user|admin)`
- **profiles** — 1:1 with users, `name`, `bio`
- **projects** — `status (active|archived|completed)`, owned by the user who created it (`projects.user_id`)
- **project_members** — many-to-many join between users and projects, with `role (owner|member)`; includes the creator (auto-added as `owner`) plus anyone added later
- **tasks** — belongs to a project and creator, with `priority (low|medium|high)`, optional `due_date`, and `completed`
- **tags** / **tasks_tags** — project-scoped many-to-many tagging on tasks; tag names are unique per project
- **task_assignees** — many-to-many assignment of project members to tasks
- **comments** — belongs to a task and a user
- **notes** — private notes belonging to a single user, `title`, `body`
- **queries** — `label`, `query` pairs used only by the `/testing` console's SQL query picker (see [`demoQueries.sql`](./demoQueries.sql))
- **token_sessions** — active/revoked JWT session identifiers and expiry times
- **audit_logs** — actor, action, target, metadata, and timestamp for security-relevant changes

Because `projects` and `project_members` are separate tables, "projects I created" and "projects I'm involved in" are genuinely different questions — see the Projects row in the API table below.

See [`mydb_p1qi.sql`](./mydb_p1qi.sql) for the full DDL and [`demoQueries.sql`](./demoQueries.sql) for example queries (joins, aggregation, `RANK()`, CTEs, `UNION ALL`, anti-joins, window functions).

---

## Architecture and permission model

The application is organized as **routes → controllers → services → repositories**. Routes apply authentication middleware, controllers validate input with Zod, services enforce business and resource permissions, and repositories execute parameterized PostgreSQL queries.

- A signed-in user can access only projects where they are a member.
- Project owners manage project settings, members, roles, task assignments, tags, and destructive project actions.
- Members can collaborate through tasks and comments according to task-level permissions.
- Task creators, assignees, and project owners can edit or complete tasks.
- Only project owners can delete tasks, assign users, create project tags, manage members, or delete projects.
- The last project owner cannot be removed or demoted.
- Account deletion is refused while the user belongs to any project; the user must leave all memberships first.
- Admin-only routes manage users, while admins cannot modify another admin's email.
- JWT sessions are stored server-side and logout revokes the current session.

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
| **Tags**                              | `POST/GET /projects/:projectId/tags`, `POST/GET/DELETE /tasks/:taskId/tags/:tagId`                                                                                                 |
| **Assignments**                       | `GET /tasks/:taskId/assignees`, `POST/DELETE /tasks/:taskId/assignees/:userId`                                                                                                     |
| **Comments**                          | `POST/GET/DELETE /tasks/:taskId/comments`, `GET /users/comments`, `DELETE /users/comments/:id`                                                                                      |
| **Notes**                             | `POST/GET/DELETE /users/notes`, `GET/PATCH/DELETE /users/notes/:noteId`                                                                                                             |
| **Sessions**                          | `POST /users/logout` (revokes the current JWT session)                                                                                                                              |
| **Owner console access**              | `POST /testing/access` (exchanges `SECRET_KEY` for a short-lived HttpOnly cookie), `GET /testing`                                                                                   |
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

For an existing database, create a `pg_dump` backup first and apply an incremental migration. Do not run the full schema over production data.

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
- `testing.html` — interactive API console (owner-key gated through `POST /testing/access`), including a raw SQL runner with a dropdown of saved example queries

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
- Owner-console access is exchanged for a short-lived HttpOnly cookie through `POST /testing/access`, preventing the secret from remaining in the page URL.
- Account deletion is blocked while a user belongs to any project, and project/task ownership relationships use cascading foreign keys.
- Audit-log actor references use `SET NULL` so audit history can survive account removal.

---

## License

This project is currently unlicensed — all rights reserved by the author unless a license is added.
