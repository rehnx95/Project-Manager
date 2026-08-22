/**
 * test-api.js
 * -----------
 * End-to-end test for the Users/Tasks API.
 * Creates 7 users, 16 tasks, and exercises every route including
 * auth failures, ownership checks, and pagination.
 *
 * Requirements:
 *   - Node.js 18+ (uses the built-in global `fetch` — no npm install needed,
 *     no `require("node-fetch")`. This is new-ish: Node only shipped fetch
 *     globally without a flag from v18 onward.)
 *   - Your server running (npm run start / node index.js) before you run this.
 *
 * Run:
 *   node test-api.js
 */

const BASE_URL = "http://localhost:7000";

// ---------- tiny test-runner helpers ----------

const results = { passed: 0, failed: 0, failures: [] };

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function test(name, fn) {
  try {
    await fn();
    results.passed++;
    console.log(`✅ ${name}`);
  } catch (err) {
    results.failed++;
    results.failures.push(name);
    console.log(`❌ ${name} — ${err.message}`);
  }
}

// Thin wrapper around fetch: sends JSON, attaches bearer token, parses JSON
// response (falls back to null for empty bodies like 204 No Content).
async function apiRequest(method, path, { body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let json = null;
  try {
    json = await res.json();
  } catch {
    // empty body (e.g. 204 from DELETE) — leave json as null
  }
  return { status: res.status, json };
}

// ---------- test data ----------

const USERS = [
  { email: "alice@test.com", password: "password123" },
  { email: "bob@test.com", password: "password123" },
  { email: "carol@test.com", password: "password123" },
  { email: "dave@test.com", password: "password123" },
  { email: "eve@test.com", password: "password123" },
  { email: "frank@test.com", password: "password123" },
  { email: "grace@test.com", password: "password123" },
];

// how many tasks each user (by index) gets created — sums to 16
const TASK_COUNTS = [3, 3, 2, 2, 2, 2, 2];

// filled in as the script runs
const state = {
  users: [], // { email, password, id, token }
  tasks: [], // { id, title, ownerIndex }
};

// ---------- main ----------

(async () => {
  console.log(`\nRunning against ${BASE_URL}\n`);

  // 1. SIGNUP all users
  for (const u of USERS) {
    await test(`signup ${u.email}`, async () => {
      const { status, json } = await apiRequest("POST", "/users/signup", { body: u });
      assert(status === 200, `expected 200, got ${status}`);
      assert(json.success === true, "expected success:true");
      assert(json.value.includes(u.email), "response should echo the email back");
    });
  }

  // 2. Duplicate signup should fail (409)
  await test("duplicate signup is rejected", async () => {
    const { status, json } = await apiRequest("POST", "/users/signup", { body: USERS[0] });
    assert(status === 409, `expected 409, got ${status}`);
    assert(json.success === false, "expected success:false");
  });

  // 3. Signup validation — bad email / short password
  await test("signup rejects invalid email", async () => {
    const { status } = await apiRequest("POST", "/users/signup", {
      body: { email: "not-an-email", password: "password123" },
    });
    assert(status === 400, `expected 400, got ${status}`);
  });

  await test("signup rejects short password", async () => {
    const { status } = await apiRequest("POST", "/users/signup", {
      body: { email: "shortpw@test.com", password: "123" },
    });
    assert(status === 400, `expected 400, got ${status}`);
  });

  // 4. LOGIN all users, store their tokens
  for (const u of USERS) {
    await test(`login ${u.email}`, async () => {
      const { status, json } = await apiRequest("POST", "/users/login", { body: u });
      assert(status === 200, `expected 200, got ${status}`);
      assert(json.success === true, "expected success:true");
      assert(typeof json.value === "string" && json.value.includes("Token"), "expected a token in the response");
      // token itself is embedded in the string "Login Successful With Token <jwt>"
      const token = json.value.replace("Login Successful With Token ", "").trim();
      assert(token.split(".").length === 3, "doesn't look like a JWT (expected 3 dot-separated parts)");
      state.users.push({ ...u, token });
    });
  }

  // 5. Wrong password should fail
  await test("login rejects wrong password", async () => {
    const { status, json } = await apiRequest("POST", "/users/login", {
      body: { email: USERS[0].email, password: "wrongpassword" },
    });
    assert(status === 401, `expected 401, got ${status}`);
    assert(json.success === false, "expected success:false");
  });

  // 6. Login for a nonexistent user should fail the same way (no user enumeration)
  await test("login rejects unknown email with same error shape", async () => {
    const { status, json } = await apiRequest("POST", "/users/login", {
      body: { email: "nobody@test.com", password: "password123" },
    });
    assert(status === 401, `expected 401, got ${status}`);
    assert(json.error === "Unauthorize", "expected the generic 'Unauthorize' error");
  });

  // 7. GET /profile for each logged-in user
  for (const u of state.users) {
    await test(`GET /profile as ${u.email}`, async () => {
      const res = await fetch(`${BASE_URL}/profile`, {
        headers: { Authorization: `Bearer ${u.token}` },
      });
      const text = await res.text();
      assert(res.status === 200, `expected 200, got ${res.status}`);
      assert(text.includes(u.email), "profile response should include the user's email");
    });
  }

  // 8. Protected route with no token → 401
  await test("GET /profile with no token is rejected", async () => {
    const res = await fetch(`${BASE_URL}/profile`);
    assert(res.status === 401, `expected 401, got ${res.status}`);
  });

  // 9. Protected route with garbage token → 401
  await test("GET /profile with invalid token is rejected", async () => {
    const res = await fetch(`${BASE_URL}/profile`, {
      headers: { Authorization: "Bearer not.a.realtoken" },
    });
    assert(res.status === 401, `expected 401, got ${res.status}`);
  });

  // 10. We need each user's numeric id for later ownership checks.
  //     GET /users lists everyone (id, email) — use it to map email -> id.
  await test("GET /users returns all users with ids", async () => {
    const { status, json } = await apiRequest("GET", "/users", { token: state.users[0].token });
    assert(status === 200, `expected 200, got ${status}`);
    assert(json.success === true, "expected success:true");
    assert(Array.isArray(json.value), "expected value to be an array");
    assert(json.value.length >= USERS.length, "expected at least all signed-up users in the list");

    for (const u of state.users) {
      const match = json.value.find((row) => row.email === u.email);
      assert(match, `couldn't find ${u.email} in user list`);
      u.id = match.id;
    }
  });

  // 11. CREATE 16 tasks distributed across users per TASK_COUNTS
  let taskTitleCounter = 1;
  for (let i = 0; i < state.users.length; i++) {
    const u = state.users[i];
    const count = TASK_COUNTS[i] ?? 0;
    for (let n = 0; n < count; n++) {
      const title = `Task #${taskTitleCounter++} (${u.email})`;
      await test(`create task "${title}"`, async () => {
        const { status, json } = await apiRequest("POST", "/tasks", {
          body: { title },
          token: u.token,
        });
        assert(status === 201, `expected 201, got ${status}`);
        assert(json.success === true, "expected success:true");
        assert(json.value.includes(title), "response should echo the task title");
      });
    }
  }

  const totalTasksCreated = TASK_COUNTS.reduce((a, b) => a + b, 0);
  console.log(`\n(created ${totalTasksCreated} tasks total)\n`);

  // 12. Task creation validation — empty title
  await test("create task rejects empty title", async () => {
    const { status } = await apiRequest("POST", "/tasks", {
      body: { title: "" },
      token: state.users[0].token,
    });
    assert(status === 400, `expected 400, got ${status}`);
  });

  // 13. GET /tasks for user 0 — should only see their own tasks
  await test("GET /tasks returns only the caller's own tasks", async () => {
    const { status, json } = await apiRequest("GET", "/tasks", { token: state.users[0].token });
    assert(status === 200, `expected 200, got ${status}`);
    assert(json.value.length === Math.min(TASK_COUNTS[0], 10), "expected user 0's own task count (page size 10)");
    assert(json.total === TASK_COUNTS[0], `expected total ${TASK_COUNTS[0]}, got ${json.total}`);
    for (const t of json.value) {
      state.tasks.push({ id: t.id, title: t.title, ownerIndex: 0 });
    }
  });

  // 14. Pagination — limit=2 should give exactly 2 results and correct totalPages
  await test("GET /tasks respects limit/page params", async () => {
    const { status, json } = await apiRequest("GET", "/tasks?limit=2&page=1", {
      token: state.users[0].token,
    });
    assert(status === 200, `expected 200, got ${status}`);
    assert(json.value.length === Math.min(2, TASK_COUNTS[0]), "expected page size of 2");
    assert(json.totalPages === Math.ceil(TASK_COUNTS[0] / 2), "totalPages didn't match expected calculation");
  });

  // Grab one task id belonging to user 1, for cross-user checks below.
  let userOneTaskId = null;
  await test("GET /tasks for user 1 to capture a task id", async () => {
    const { json } = await apiRequest("GET", "/tasks", { token: state.users[1].token });
    assert(json.value.length > 0, "user 1 should have at least one task");
    userOneTaskId = json.value[0].id;
  });

  // 15. GET /tasks/:id — owner can fetch their own task
  await test("GET /tasks/:id succeeds for the owner", async () => {
    const { status, json } = await apiRequest("GET", `/tasks/${userOneTaskId}`, {
      token: state.users[1].token,
    });
    assert(status === 200, `expected 200, got ${status}`);
    assert(json.value.id === userOneTaskId, "returned task id should match requested id");
  });

  // 16. GET /tasks/:id — a DIFFERENT user must NOT be able to read it
  await test("GET /tasks/:id is blocked for a non-owner", async () => {
    const { status } = await apiRequest("GET", `/tasks/${userOneTaskId}`, {
      token: state.users[2].token, // carol trying to read bob's task
    });
    assert(status === 404, `expected 404, got ${status}`);
  });

  // 17. PATCH /tasks/:id — owner can update
  await test("PATCH /tasks/:id succeeds for the owner", async () => {
    const { status, json } = await apiRequest("PATCH", `/tasks/${userOneTaskId}`, {
      body: { title: "Updated by owner" },
      token: state.users[1].token,
    });
    assert(status === 200, `expected 200, got ${status}`);
    assert(json.value.title === "Updated by owner", "title should reflect the update");
  });

  // 18. PATCH /tasks/:id — a different user must NOT be able to update it
  await test("PATCH /tasks/:id is blocked for a non-owner", async () => {
    const { status } = await apiRequest("PATCH", `/tasks/${userOneTaskId}`, {
      body: { title: "Hijacked!" },
      token: state.users[2].token,
    });
    assert(status === 404, `expected 404, got ${status}`);
  });

  // 19. DELETE /tasks/:id — a different user must NOT be able to delete it
  await test("DELETE /tasks/:id is blocked for a non-owner", async () => {
    const { status } = await apiRequest("DELETE", `/tasks/${userOneTaskId}`, {
      token: state.users[2].token,
    });
    assert(status === 404, `expected 404, got ${status}`);
  });

  // 20. DELETE /tasks/:id — owner CAN delete it, and it's really gone after
  await test("DELETE /tasks/:id succeeds for the owner and removes it", async () => {
    const { status } = await apiRequest("DELETE", `/tasks/${userOneTaskId}`, {
      token: state.users[1].token,
    });
    assert(status === 204, `expected 204, got ${status}`);

    const followUp = await apiRequest("GET", `/tasks/${userOneTaskId}`, {
      token: state.users[1].token,
    });
    assert(followUp.status === 404, "task should be gone after deletion");
  });

  // 21. PATCH /users/:id — user can update their own email
  await test("PATCH /users/:id succeeds for own account", async () => {
    const self = state.users[3]; // dave
    const newEmail = "dave-updated@test.com";
    const { status, json } = await apiRequest("PATCH", `/users/${self.id}`, {
      body: { email: newEmail },
      token: self.token,
    });
    assert(status === 200, `expected 200, got ${status}`);
    assert(json.success === true, "expected success:true");
    assert(json.updatedUser.email === newEmail, "email should be updated");
    self.email = newEmail; // keep local state in sync
  });

  // 22. PATCH /users/:id — cannot update someone ELSE's account
  await test("PATCH /users/:id is blocked for a different account", async () => {
    const attacker = state.users[4]; // eve
    const victim = state.users[5]; // frank
    const { status, json } = await apiRequest("PATCH", `/users/${victim.id}`, {
      body: { email: "hijacked@test.com" },
      token: attacker.token,
    });
    assert(status === 403, `expected 403, got ${status}`);
    assert(json.success === false, "expected success:false");
  });

  // 23. GET /users/:id — currently open to any authenticated user (by design, per your note)
  await test("GET /users/:id works for any authenticated caller", async () => {
    const requester = state.users[0];
    const target = state.users[1];
    const { status, json } = await apiRequest("GET", `/users/${target.id}`, {
      token: requester.token,
    });
    assert(status === 200, `expected 200, got ${status}`);
    assert(json.user.email === target.email, "should return the target user's email");
  });

  // 24. Protected routes reject requests with no token at all
  await test("POST /tasks with no token is rejected", async () => {
    const { status } = await apiRequest("POST", "/tasks", { body: { title: "no auth" } });
    assert(status === 401, `expected 401, got ${status}`);
  });

  // ---------- summary ----------
  console.log("\n----------------------------------------");
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  if (results.failures.length) {
    console.log("\nFailed tests:");
    for (const name of results.failures) console.log(`  - ${name}`);
  }
  console.log("----------------------------------------\n");

  process.exit(results.failed > 0 ? 1 : 0);
})();