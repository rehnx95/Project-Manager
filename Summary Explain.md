# Depot — Full Project Walkthrough (How It Actually Executes)

This is the story to tell if someone says "walk me through your project." It follows real execution order — not a feature list, but *what actually happens, in sequence*, from the moment the server starts to a request completing and the UI updating. Once you can narrate this without looking, you can handle almost any follow-up question, because every follow-up is really "tell me more about one step in this chain."

The one sentence to lead with:

> "It's a layered REST API — Express on Node, Postgres for storage — with a vanilla JS frontend served from the same origin. Every request flows through auth middleware, into a controller that validates input, a service that enforces business rules, and a repository that's the only layer that touches SQL."

Everything below is the detail behind that sentence.

---

## Part 1 — What Happens When the Server Starts

This is `npm start` → `node app.js`. In order:

1. **`require("dotenv").config()`** runs first — loads `.env` into `process.env`. Everything downstream (DB credentials, `JWT_SECRET`) depends on this having already happened.
2. **Every controller and middleware file gets `require`'d** — `userControllers`, `taskControllers`, `authenticateToken`, etc. Because you're using CommonJS, each `require` runs that file's top-level code *once*, synchronously, and caches the result. This is also the moment `db.js` runs and creates the connection **pool** (not individual connections yet — just the pool object, ready to hand out connections on demand).
3. **`express()` creates the app**, then middleware gets registered in order with `app.use(...)`:
   - `cors()` — allow cross-origin requests
   - `express.json()` — parse JSON request bodies into `req.body`
   - `express.static(path.join(__dirname, "frontend"))` — serve the entire `frontend/` folder as static files. This is *why* going to `/` in a browser returns `index.html` with no route explicitly written for it.
4. **Every route gets registered** — each `app.get/post/patch/delete(path, ...middleware, handler)` call just adds an entry to Express's internal routing table. Nothing executes yet — this is just building the map of "if a request matches this method + path, run this chain of functions."
5. **The 404 handler and error handler get registered last** — deliberately, since Express matches middleware/routes top-to-bottom, and these are meant to be the fallback for anything nothing else matched.
6. **`app.listen(port, ...)`** — this is the line that actually opens a TCP socket and starts accepting connections. Everything before this point was just *configuration*; nothing could serve a request until this line ran.

Say it like this: *"Startup is really just building a routing table and opening the DB pool — no request handling happens until `listen()` is called at the very end."*

---

## Part 2 — Tracing an Unauthenticated Request: Signup → Login

This is the entry point a user actually hits first, so it's the natural place to start a walkthrough.

**Signup.** Browser loads `index.html`, which loads `js/api.js`, `js/auth.js`. User fills the register form, submits:

1. `auth.js`'s submit handler calls `api("/users/signup", { method: "POST", body: JSON.stringify({ email, password }) })`.
2. `api()` (in `api.js`) does a `fetch()` to `API_BASE + path` — `API_BASE` is `location.origin`, so this always hits whatever server actually served the page, no hardcoded URL to get wrong.
3. Server side: the request hits Express's router. `POST /users/signup` matches — this route has **no auth middleware** (correctly — you can't require a login token to create the very first account), so it goes straight to `asyncHandler(userControllers.signup)`.
4. `asyncHandler` wraps the whole thing in a `Promise.resolve(...).catch(next)` — meaning if anything inside `signup` throws, including a rejected promise from an `await`, it gets forwarded to Express's error-handling middleware instead of crashing the server silently.
5. Inside `signup`: `signup_schema.safeParse(req.body)` validates and transforms (`.toLowerCase()` on email) in one step. If invalid, respond `400` immediately and stop — the service/repository never get touched.
6. If valid: `UserService.signup(email, password)` — checks `findByEmail` first (duplicate check), hashes the password with `bcrypt.hash` (never store plaintext), then `usersDatabase.createUsers` runs the actual `INSERT`.
7. Response bubbles back up: repository returns the new row → service wraps it `{ success: true, value }` → controller sends `res.status(201).json(...)`.
8. Frontend: `auth.js`'s `.then` fires, shows a toast, switches to the login tab.

**Login.** Same shape, different destination at the end:

1. `UserService.login` — `findByEmail`, then `bcrypt.compare(password, hash)`. Notice the deliberate detail: if the user doesn't exist, it still runs `bcrypt.compare` against a dummy hash (`"$2b$10$invalidsalt..."`) instead of returning early — this is a timing-attack defense, so "wrong password" and "no such user" take the same amount of time to respond, and an attacker can't use response timing to enumerate valid emails.
2. If it matches: `jwt.sign({ id, email, role }, JWT_SECRET, { expiresIn: "1h" })` creates the token.
3. Controller returns `{ success: true, value: "Login Successful", token }`.
4. Frontend: `setToken(data.token)` stores it in `localStorage`, then redirects to `dashboard.html`.

Say it like this: *"Signup and login share the same shape — validate, hit the service, hit the repository — but login's whole job is really just password comparison and issuing a signed token if it matches. Nothing in the token is encrypted, just signed, so the client can decode its own payload — that's how `currentUser()` on the frontend reads the role without another API call."*

---

## Part 3 — Tracing an Authenticated Read: Loading the Dashboard

This is the "now prove you understand auth" part of the walkthrough.

1. `dashboard.html` loads, `dashboard.js` runs `requireAuth()` first — if there's no token in `localStorage`, redirect straight to the sign-in page before anything else executes. This is a **frontend-side convenience check only** — it makes the UX better (no flash of content that immediately 401s), but it is *not* real security. Real security is entirely server-side.
2. `renderNav("dashboard")` builds the sidebar, reading the decoded token (`currentUser()`) just to display the email and conditionally show the Admin link if `role === "admin"` — again, purely cosmetic; the server independently re-checks role on every admin route regardless of what the sidebar shows.
3. `loadProjects()` calls `api("/projects")`. `api()` reads the token from `localStorage` and attaches `Authorization: Bearer <token>` to the request headers.
4. Server side: `GET /projects` is registered with `authenticateToken` as middleware *before* the controller. This is where the real security check happens:
   - Extract the token from the `Authorization` header
   - `jwt.verify(token, JWT_SECRET)` — throws if the signature doesn't match or the token's expired
   - **Crucially**, it then does `userRepository.getUser(decoded.id)` — an actual DB lookup, not just trusting the token's contents. This is what makes deleted-user tokens fail even before expiry: the token itself would still verify fine, but the user no longer exists in the DB, so this fails with `401 User no longer exists`.
   - If it passes, `req.user` is set, and `next()` hands off to the actual route handler.
5. `projectControllers.getProjects` → `projectService.getProjects(req.user.id)` → this queries `project_members` for every project this user belongs to, then fetches each of those projects — notice this is *not* "all projects in the DB," it's scoped to only what this specific user is a member of. That scoping is the authorization logic living in the service layer.
6. Response flows back up, `dashboard.js` renders one card per project.

Say it like this: *"Every protected route has `authenticateToken` in front of it. That middleware doesn't just check the signature — it re-fetches the user from the database on every single request, so a token for a deleted account stops working immediately rather than staying valid until it expires. Once that passes, the service layer scopes the actual query to what that specific user is allowed to see."*

---

## Part 4 — Tracing an Authenticated Write: Creating a Task

This is the deepest chain in the app, and the one that shows off the layering most clearly — worth having memorized end to end.

1. On `project.html`, user fills the "new task" form, submits. `project.js`'s handler converts the local datetime input to ISO (`toISODateTime`), then calls `api("/projects/" + projectId + "/tasks", { method: "POST", body: ... })`.
2. Server: `POST /projects/:project_id/tasks` → `authenticateToken` (identity check) → `asyncHandler(taskControllers.createTask)`.
3. Controller: `parseUUIDParam` validates `:project_id` is actually a UUID shape *before* anything hits the DB — cheap, fast rejection of garbage input. Then `task_schema.safeParse(req.body)` validates title/priority/due_date.
4. Only once both pass does `taskService.createTask(user_id, project_id, title, priority, due_date)` get called. This is where authorization lives:
   - `projectsDatabase.getOneProject(project_id)` — does the project even exist? (`404` if not)
   - `projectMembersDatabase.getMembership(project_id, user_id)` — is *this specific user* actually a member of *this specific project*? (`403` if not)
   - Only after both checks pass: `tasksDatabase.createTask(new_task)` runs the `INSERT`.
5. Repository is the dumbest layer on purpose — it has zero opinions about who's allowed to do this, it just runs the parameterized query and returns the new row.
6. Response bubbles back: `201` with the new task. Frontend hides the form, shows a toast, calls `loadTasks()` again to refresh the list from the server (not just appending the new task locally) — so the UI reflects the actual DB state, not an assumption.

Say it like this: *"Creating a task touches four layers before a single row gets written: auth middleware confirms identity, the controller validates shape, the service confirms this user is actually a member of this project, and only then does the repository run the insert. Each layer is a gate — bad data or an unauthorized request gets stopped as early as possible, never reaching the database."*

---

## Part 5 — What Happens When Something Goes Wrong

Worth walking through once, since it's a common follow-up ("what if the DB call fails?").

- **Validation failure** (bad body shape) — caught in the controller by `zod`'s `safeParse`, responds `400` immediately, service/repository never run.
- **Business rule failure** (not a member, not the owner) — caught in the service, returned as `{ success: false, error: "..." }`, *not thrown*. The controller checks `outcome.success === false` and maps the error string to the right HTTP status via `handleServiceError`.
- **Unexpected failure** (DB connection drops, a bug throws) — this is what `asyncHandler` exists for. A raw `async` Express route handler that throws does *not* automatically get caught by Express — the promise just rejects into the void, and the request hangs. `asyncHandler` wraps every handler so any thrown error or rejected promise gets forwarded via `next(err)`, which skips straight past all remaining middleware/routes to the final four-argument error handler in `app.js`, which logs it and responds `500`.

Say it like this: *"There are really two different kinds of failure in this app, handled two different ways. Expected failures — bad input, not authorized — are values, returned as `{ success: false, error }` and turned into the right status code deliberately. Unexpected failures — something actually throwing — get caught by `asyncHandler` and routed to a generic error middleware so the process never crashes and the client always gets *some* response instead of a hung connection."*

---

## Part 6 — The One-Breath Version

If you only get 30 seconds, this is the compressed version:

> "Express app, Postgres backend, layered as controller-service-repository. A request comes in, hits auth middleware that verifies the JWT and re-checks the user still exists in the DB, then the controller validates the request shape with Zod, the service enforces business rules like project membership, and the repository is the only layer that runs SQL. Errors are either expected — returned as values and mapped to status codes — or unexpected, caught by an async wrapper and routed to a generic error handler. The frontend is plain JS served from the same Express app, so there's no CORS to configure in practice, and it just calls this API with `fetch`, storing the JWT in localStorage and attaching it as a bearer token on every request."

---

## Practice drill — narrate these cold

Pick one and talk through it out loud, start to finish, without looking:

1. What happens between typing a password on the login form and landing on the dashboard?
2. Walk me through every check that happens before a task actually gets inserted into the database.
3. What's different about how a validation error vs. an authorization error vs. a server crash gets handled?
4. Why does `authenticateToken` hit the database on every request instead of trusting the JWT payload alone?
5. If you added a "add comment" feature right now, which three files would you touch, in what order, and why those three?