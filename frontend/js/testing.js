// ---------------------------------------------------------------------
// Endpoint catalog — mirrors app.js exactly, including its route order
// (literal /users/profile, /users/projects, /users/comments registered
// before the dynamic /users/:requested_id routes).
//
// This console is served BY the same Express app as the rest of
// frontend/ (app.use(express.static(path.join(__dirname, "frontend")))),
// so every request below uses a relative path — exactly like auth.js
// does with fetch("/users/signup"). Whatever origin loaded this page
// (localhost while developing, the Render URL once deployed) is
// automatically where requests go. No base URL to configure or get
// wrong.
// ---------------------------------------------------------------------
const ENDPOINTS = [
  {
    group: "Users",
    name: "Signup",
    method: "POST",
    path: "/users/signup",
    auth: false,
    body: { email: "test@example.com", password: "secret123" },
  },
  {
    group: "Users",
    name: "Login",
    method: "POST",
    path: "/users/login",
    auth: false,
    body: { email: "test@example.com", password: "secret123" },
  },
  {
    group: "Users",
    name: "Create profile",
    method: "POST",
    path: "/users/profile",
    auth: true,
    body: { name: "Rehan", bio: "Backend dev" },
  },
  {
    group: "Users",
    name: "Update profile",
    method: "PATCH",
    path: "/users/profile",
    auth: true,
    body: { name: "Rehan", bio: "Updated bio" },
  },
  {
    group: "Users",
    name: "Get my profile",
    method: "GET",
    path: "/users/profile",
    auth: true,
  },
  {
    group: "Users",
    name: "Get my projects",
    method: "GET",
    path: "/users/projects",
    auth: true,
  },
  {
    group: "Users",
    name: "Get my comments",
    method: "GET",
    path: "/users/comments",
    auth: true,
  },
  {
    group: "Users",
    name: "Delete my comment",
    method: "DELETE",
    path: "/users/comments/:comment_id",
    auth: true,
    params: [{ name: "comment_id", type: "number" }],
  },
  {
    group: "Users",
    name: "Delete my account",
    method: "DELETE",
    path: "/users",
    auth: true,
  },
  {
    group: "Users",
    name: "Update email",
    method: "PATCH",
    path: "/users/:requested_id",
    auth: true,
    params: [
      { name: "requested_id", type: "uuid", placeholder: "your own user id" },
    ],
    body: { email: "new@example.com" },
  },
  {
    group: "Users",
    name: "Get all users (admin)",
    method: "GET",
    path: "/users",
    auth: true,
  },
  {
    group: "Users",
    name: "Get user by id (admin)",
    method: "GET",
    path: "/users/:requested_id",
    auth: true,
    params: [{ name: "requested_id", type: "uuid" }],
  },

  {
    group: "Projects",
    name: "Create project",
    method: "POST",
    path: "/projects",
    auth: true,
    body: {
      name: "New Project",
      description: "A test project",
      status: "active",
    },
  },
  {
    group: "Projects",
    name: "Get one project",
    method: "GET",
    path: "/projects/:project_id",
    auth: true,
    params: [{ name: "project_id", type: "uuid" }],
  },
  {
    group: "Projects",
    name: "Get my project list",
    method: "GET",
    path: "/projects",
    auth: true,
  },
  {
    group: "Projects",
    name: "Get tasks by project",
    method: "GET",
    path: "/projects/:project_id/tasks",
    auth: true,
    params: [{ name: "project_id", type: "uuid" }],
  },
  {
    group: "Projects",
    name: "Update project",
    method: "PATCH",
    path: "/projects/:project_id",
    auth: true,
    params: [{ name: "project_id", type: "uuid" }],
    body: {
      name: "Renamed Project",
      description: "Updated desc",
      status: "active",
    },
  },
  {
    group: "Projects",
    name: "Delete project",
    method: "DELETE",
    path: "/projects/:project_id",
    auth: true,
    params: [{ name: "project_id", type: "uuid" }],
  },

  {
    group: "Project Members",
    name: "Get my membership",
    method: "GET",
    path: "/projects/:project_id/membership",
    auth: true,
    params: [{ name: "project_id", type: "uuid" }],
  },
  {
    group: "Project Members",
    name: "Add member",
    method: "POST",
    path: "/projects/:project_id/users/:target_user_id",
    auth: true,
    params: [
      { name: "project_id", type: "uuid" },
      { name: "target_user_id", type: "uuid" },
    ],
    body: { role: "member" },
  },
  {
    group: "Project Members",
    name: "Get all members",
    method: "GET",
    path: "/projects/:project_id/members",
    auth: true,
    params: [{ name: "project_id", type: "uuid" }],
  },
  {
    group: "Project Members",
    name: "Remove member",
    method: "DELETE",
    path: "/projects/:project_id/users/:target_user_id",
    auth: true,
    params: [
      { name: "project_id", type: "uuid" },
      { name: "target_user_id", type: "uuid" },
    ],
  },
  {
    group: "Project Members",
    name: "Change member role",
    method: "PATCH",
    path: "/projects/:project_id/users/:target_user_id",
    auth: true,
    params: [
      { name: "project_id", type: "uuid" },
      { name: "target_user_id", type: "uuid" },
    ],
    body: { role: "owner" },
  },

  {
    group: "Tasks",
    name: "Create task",
    method: "POST",
    path: "/projects/:project_id/tasks",
    auth: true,
    params: [{ name: "project_id", type: "uuid" }],
    body: {
      title: "New task",
      priority: "medium",
      due_date: "2026-09-15T00:00:00.000Z",
    },
  },
  {
    group: "Tasks",
    name: "Get my tasks (paginated)",
    method: "GET",
    path: "/tasks",
    auth: true,
    query: [
      { name: "page", value: "1" },
      { name: "limit", value: "10" },
    ],
  },
  {
    group: "Tasks",
    name: "Get one task",
    method: "GET",
    path: "/tasks/:task_id",
    auth: true,
    params: [{ name: "task_id", type: "number" }],
  },
  {
    group: "Tasks",
    name: "Update task",
    method: "PATCH",
    path: "/tasks/:task_id",
    auth: true,
    params: [{ name: "task_id", type: "number" }],
    body: {
      title: "Updated task",
      priority: "high",
      due_date: "2026-09-20T00:00:00.000Z",
    },
  },
  {
    group: "Tasks",
    name: "Toggle complete",
    method: "PATCH",
    path: "/tasks/:task_id/complete",
    auth: true,
    params: [{ name: "task_id", type: "number" }],
  },
  {
    group: "Tasks",
    name: "Delete task (owner only)",
    method: "DELETE",
    path: "/tasks/:task_id",
    auth: true,
    params: [{ name: "task_id", type: "number" }],
  },

  {
    group: "Tags",
    name: "Create tag",
    method: "POST",
    path: "/tags",
    auth: true,
    body: { tag_name: "urgent" },
  },
  {
    group: "Tags",
    name: "Get all tags",
    method: "GET",
    path: "/tags",
    auth: true,
  },
  {
    group: "Tags",
    name: "Add tag to task",
    method: "POST",
    path: "/tasks/:task_id/tags/:tag_id",
    auth: true,
    params: [
      { name: "task_id", type: "number" },
      { name: "tag_id", type: "number" },
    ],
  },
  {
    group: "Tags",
    name: "Get tags on task",
    method: "GET",
    path: "/tasks/:task_id/tags",
    auth: true,
    params: [{ name: "task_id", type: "number" }],
  },
  {
    group: "Tags",
    name: "Remove tag from task",
    method: "DELETE",
    path: "/tasks/:task_id/tags/:tag_id",
    auth: true,
    params: [
      { name: "task_id", type: "number" },
      { name: "tag_id", type: "number" },
    ],
  },

  {
    group: "Comments",
    name: "Create comment",
    method: "POST",
    path: "/tasks/:task_id/comments",
    auth: true,
    params: [{ name: "task_id", type: "number" }],
    body: { new_body: "This is a comment" },
  },
  {
    group: "Comments",
    name: "Get comments on task",
    method: "GET",
    path: "/tasks/:task_id/comments",
    auth: true,
    params: [{ name: "task_id", type: "number" }],
  },
  {
    group: "Comments",
    name: "Delete all comments on task (owner only)",
    method: "DELETE",
    path: "/tasks/:task_id/comments",
    auth: true,
    params: [{ name: "task_id", type: "number" }],
  },

  {
    group: "Testing",
    name: "Owner test page",
    method: "GET",
    path: "/testing",
    auth: false,
    query: [{ name: "key", value: "" }],
  },
  {
    group: "Notes",
    name: "Create note",
    method: "POST",
    path: "/users/notes",
    auth: true,
    body: { title: "New note", body: "Note contents" },
  },
  {
    group: "Notes",
    name: "Get my notes",
    method: "GET",
    path: "/users/notes",
    auth: true,
  },
  {
    group: "Notes",
    name: "Get one note",
    method: "GET",
    path: "/users/notes/:note_id",
    auth: true,
    params: [{ name: "note_id", type: "number" }],
  },
  {
    group: "Notes",
    name: "Update note",
    method: "PATCH",
    path: "/users/notes/:note_id",
    auth: true,
    params: [{ name: "note_id", type: "number" }],
    body: { title: "Updated note", body: "Updated contents" },
  },
  {
    group: "Notes",
    name: "Delete note",
    method: "DELETE",
    path: "/users/notes/:note_id",
    auth: true,
    params: [{ name: "note_id", type: "number" }],
  },
  {
    group: "Notes",
    name: "Delete all my notes",
    method: "DELETE",
    path: "/users/notes",
    auth: true,
  },
];

let activeIndex = null;
let historyLog = [];
let searchTerm = "";
let mobileTab = "request";

const sidebar = document.getElementById("sidebar");
const sidebarList = document.getElementById("sidebarList");
const requestPanel = document.getElementById("requestPanel");
const responsePanel = document.getElementById("responsePanel");
const tokenInput = document.getElementById("tokenInput");
const tokenDot = document.getElementById("tokenDot");
const scrim = document.getElementById("scrim");
const menuBtn = document.getElementById("menuBtn");
const endpointSearch = document.getElementById("endpointSearch");
const mobileTabs = document.getElementById("mobileTabs");
const originNote = document.getElementById("originNote");

// Show where requests are actually going, for sanity — no input needed,
// it's always wherever this page itself was loaded from.
originNote.textContent = window.location.origin;

// ---------------------------------------------------------------------
// Persistence — only the token needs to survive a reload now.
// ---------------------------------------------------------------------
function loadPersisted() {
  try {
    const savedToken = localStorage.getItem("apiconsole.token");
    if (savedToken) {
      tokenInput.value = savedToken;
      tokenDot.classList.add("on");
    }
  } catch (e) {
    /* storage unavailable, ignore */
  }
}
function persistToken() {
  try {
    localStorage.setItem("apiconsole.token", tokenInput.value);
  } catch (e) {}
}

// ---------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------
function matchesSearch(ep, term) {
  if (!term) return true;
  const hay = (
    ep.name +
    " " +
    ep.method +
    " " +
    ep.path +
    " " +
    ep.group
  ).toLowerCase();
  return hay.includes(term.toLowerCase());
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildSidebar() {
  const groups = {};
  ENDPOINTS.forEach((ep, i) => {
    if (!matchesSearch(ep, searchTerm)) return;
    groups[ep.group] = groups[ep.group] || [];
    groups[ep.group].push(i);
  });

  sidebarList.innerHTML = "";
  const groupNames = Object.keys(groups);

  if (!groupNames.length) {
    sidebarList.innerHTML = `<div class="sidebar-empty">No endpoints match "${escapeHtml(searchTerm)}".</div>`;
    return;
  }

  groupNames.forEach((groupName) => {
    const title = document.createElement("div");
    title.className = "group-title";
    title.innerHTML = `<span>${escapeHtml(groupName)}</span><span class="group-count">${groups[groupName].length}</span>`;
    sidebarList.appendChild(title);
    groups[groupName].forEach((i) => {
      const ep = ENDPOINTS[i];
      const row = document.createElement("div");
      row.className = "endpoint" + (ep.notWired ? " disabled" : "");
      row.dataset.index = i;
      row.setAttribute("role", "button");
      row.tabIndex = 0;
      row.innerHTML = `<span class="method-tag m-${ep.method}">${ep.method}</span><span class="endpoint-name">${escapeHtml(ep.name)}</span>${ep.notWired ? '<span class="not-wired-badge">no route</span>' : ""}`;
      row.addEventListener("click", () => {
        selectEndpoint(i);
        closeDrawer();
      });
      row.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectEndpoint(i);
          closeDrawer();
        }
      });
      sidebarList.appendChild(row);
    });
  });
}

function selectEndpoint(i) {
  activeIndex = i;
  document.querySelectorAll(".endpoint").forEach((el) => {
    el.classList.toggle("active", Number(el.dataset.index) === i);
  });
  renderRequestPanel(ENDPOINTS[i]);
  setMobileTab("request");
}

// ---------------------------------------------------------------------
// Mobile drawer + tabs
// ---------------------------------------------------------------------
function openDrawer() {
  sidebar.classList.add("open");
  scrim.classList.add("show");
}
function closeDrawer() {
  sidebar.classList.remove("open");
  scrim.classList.remove("show");
}
menuBtn.addEventListener("click", () => {
  sidebar.classList.contains("open") ? closeDrawer() : openDrawer();
});
scrim.addEventListener("click", closeDrawer);

function setMobileTab(tab) {
  mobileTab = tab;
  requestPanel.classList.toggle("mobile-active", tab === "request");
  responsePanel.classList.toggle("mobile-active", tab === "response");
  document.querySelectorAll(".mobile-tabs button").forEach((b) => {
    b.classList.toggle("active", b.dataset.tab === tab);
  });
}
mobileTabs.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-tab]");
  if (btn) setMobileTab(btn.dataset.tab);
});

// ---------------------------------------------------------------------
// Request panel rendering
// ---------------------------------------------------------------------
function renderRequestPanel(ep) {
  let html = `
    <div class="req-head">
      <span class="method-tag m-${ep.method}">${ep.method}</span>
      <span class="req-path">${escapeHtml(ep.path)}</span>
    </div>
    <p class="req-desc">${ep.auth ? "Requires <code>Authorization: Bearer &lt;token&gt;</code>." : "No auth required."}</p>
  `;

  if (ep.notWired) {
    html += `<div class="warn-banner">This controller/service exists in code, but no route is registered for it in <code>app.js</code> yet. Sending this will return <code>404 Route not found</code>.</div>`;
  }

  if (ep.params && ep.params.length) {
    html += `<div class="section-label">Path params</div>`;
    ep.params.forEach((p) => {
      html += `
        <div class="param-row">
          <span class="param-name">${escapeHtml(p.name)}</span>
          <input data-param="${escapeHtml(p.name)}" placeholder="${escapeHtml(p.placeholder || (p.type === "uuid" ? "uuid…" : "numeric id…"))}" spellcheck="false" autocapitalize="off">
        </div>`;
    });
  }

  if (ep.query && ep.query.length) {
    html += `<div class="section-label">Query params</div>`;
    ep.query.forEach((q) => {
      html += `
        <div class="param-row">
          <span class="param-name">${escapeHtml(q.name)}</span>
          <input data-query="${escapeHtml(q.name)}" value="${escapeHtml(q.value || "")}" spellcheck="false" autocapitalize="off">
        </div>`;
    });
  }

  const bodyLabel = ep.body
    ? `<div class="section-label">Body <button type="button" class="format-btn" id="formatBtn">format</button></div>`
    : `<div class="section-label">Body (none)</div>`;
  html += bodyLabel;

  if (ep.body) {
    html += `<textarea class="body-editor" id="bodyEditor" spellcheck="false">${escapeHtml(JSON.stringify(ep.body, null, 2))}</textarea>`;
    html += `<div class="json-error" id="jsonError"></div>`;
  } else {
    html += `<div class="empty-note">This request has no body.</div>`;
  }

  html += `
    <div class="send-row">
      <button class="send-btn" id="sendBtn">Send request</button>
      ${ep.auth ? '<span class="auth-note"><span class="lock-icon">🔒</span> uses token above</span>' : ""}
      <span class="shortcut-hint">⌘/Ctrl + Enter to send</span>
    </div>
  `;

  requestPanel.innerHTML = html;
  document
    .getElementById("sendBtn")
    .addEventListener("click", () => sendRequest(ep));

  const editor = document.getElementById("bodyEditor");
  if (editor) {
    editor.addEventListener("input", () => validateJsonLive());
    editor.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        sendRequest(ep);
      }
      if (e.key === "Tab") {
        e.preventDefault();
        const start = editor.selectionStart,
          end = editor.selectionEnd;
        editor.value =
          editor.value.slice(0, start) + "  " + editor.value.slice(end);
        editor.selectionStart = editor.selectionEnd = start + 2;
      }
    });
  }
  const formatBtn = document.getElementById("formatBtn");
  if (formatBtn) {
    formatBtn.addEventListener("click", () => {
      try {
        const parsed = JSON.parse(editor.value);
        editor.value = JSON.stringify(parsed, null, 2);
        validateJsonLive();
      } catch (e) {
        /* leave as-is, error already shown */
      }
    });
  }

  requestPanel.querySelectorAll("[data-param], [data-query]").forEach((inp) => {
    inp.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        sendRequest(ep);
      }
    });
  });
}

function validateJsonLive() {
  const editor = document.getElementById("bodyEditor");
  const errEl = document.getElementById("jsonError");
  if (!editor || !errEl) return;
  try {
    JSON.parse(editor.value);
    errEl.textContent = "";
  } catch (e) {
    errEl.textContent = "Invalid JSON — " + e.message;
  }
}

// ---------------------------------------------------------------------
// JSON syntax highlight
// ---------------------------------------------------------------------
function highlightJson(obj) {
  const json = JSON.stringify(obj, null, 2);
  return json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
      (match) => {
        let cls = "json-num";
        if (/^"/.test(match)) {
          cls = /:$/.test(match) ? "json-key" : "json-str";
        } else if (/true|false/.test(match)) {
          cls = "json-bool";
        } else if (/null/.test(match)) {
          cls = "json-null";
        }
        return `<span class="${cls}">${match}</span>`;
      },
    );
}

// ---------------------------------------------------------------------
// Sending requests — always relative, always same-origin as this page.
// Works unmodified on localhost during development and on Render (or
// anywhere else) once deployed, because it's served by the same
// Express app that owns the API routes.
// ---------------------------------------------------------------------
async function sendRequest(ep) {
  let path = ep.path;
  let missingParam = false;

  if (ep.params) {
    for (const p of ep.params) {
      const el = document.querySelector(`[data-param="${cssEscape(p.name)}"]`);
      const val = el ? el.value.trim() : "";
      if (!val) {
        missingParam = true;
        if (el) el.style.borderColor = "var(--err)";
      }
      path = path.replace(
        `:${p.name}`,
        encodeURIComponent(val || `:${p.name}`),
      );
    }
  }

  if (missingParam) {
    renderResponse({
      error: true,
      status: null,
      statusText: "Missing required path param(s)",
      body: "Fill in every path param highlighted in red before sending.",
      ms: 0,
      method: ep.method,
      path,
    });
    setMobileTab("response");
    return;
  }

  let query = "";
  if (ep.query) {
    const parts = [];
    ep.query.forEach((q) => {
      const el = document.querySelector(`[data-query="${cssEscape(q.name)}"]`);
      const val = el ? el.value.trim() : "";
      if (val)
        parts.push(`${encodeURIComponent(q.name)}=${encodeURIComponent(val)}`);
    });
    if (parts.length) query = "?" + parts.join("&");
  }

  const url = path + query; // relative — resolves against window.location.origin automatically

  const headers = { "Content-Type": "application/json" };
  const token = tokenInput.value.trim();
  if (ep.auth && token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let bodyStr = undefined;
  if (ep.body) {
    const editor = document.getElementById("bodyEditor");
    try {
      const parsed = JSON.parse(editor.value);
      bodyStr = JSON.stringify(parsed);
    } catch (e) {
      renderResponse({
        error: true,
        status: null,
        statusText: "Invalid JSON in request body",
        body: e.message,
        ms: 0,
        method: ep.method,
        path,
      });
      setMobileTab("response");
      return;
    }
  }

  const sendBtn = document.getElementById("sendBtn");
  if (sendBtn) {
    sendBtn.disabled = true;
    sendBtn.textContent = "Sending…";
  }
  renderPending();
  setMobileTab("response");

  const started = performance.now();
  try {
    const res = await fetch(url, {
      method: ep.method,
      headers,
      body: ep.method !== "GET" && bodyStr !== undefined ? bodyStr : undefined,
    });
    const ms = Math.round(performance.now() - started);
    const text = await res.text();
    let parsedBody = text;
    let contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json") && text) {
      try {
        parsedBody = JSON.parse(text);
      } catch (e) {
        /* leave as text */
      }
    }
    const result = {
      error: false,
      status: res.status,
      statusText: res.statusText,
      body: parsedBody,
      ms,
      method: ep.method,
      path,
    };
    renderResponse(result);
    logHistory(result);
  } catch (err) {
    const ms = Math.round(performance.now() - started);
    const result = {
      error: true,
      status: null,
      statusText: "Network error",
      body: err.message,
      ms,
      method: ep.method,
      path,
    };
    renderResponse(result);
    logHistory(result);
  } finally {
    const btn = document.getElementById("sendBtn");
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Send request";
    }
  }
}

function cssEscape(str) {
  return String(str).replace(/(["\\])/g, "\\$1");
}

function statusClass(status, isError) {
  if (isError || status === null) return "status-err";
  if (status >= 200 && status < 300) return "status-2xx";
  if (status >= 400 && status < 500) return "status-4xx";
  return "status-5xx";
}

function renderPending() {
  responsePanel.innerHTML = `
    <div class="section-label">Response</div>
    <div class="resp-meta">
      <span class="status-badge status-pending">…</span>
    </div>
    <pre class="resp-body">waiting…</pre>
  `;
}

let lastResultRaw = "";

function renderResponse(result) {
  const cls = statusClass(result.status, result.error);
  const label = result.error ? result.status || "ERR" : result.status;
  let bodyHtml;
  if (typeof result.body === "object" && result.body !== null) {
    bodyHtml = highlightJson(result.body);
    lastResultRaw = JSON.stringify(result.body, null, 2);
  } else {
    const raw = String(result.body ?? "(empty response)");
    lastResultRaw = raw;
    bodyHtml = raw
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  responsePanel.innerHTML = `
    <div class="section-label">Response</div>
    <div class="resp-meta">
      <span class="status-badge ${cls}">${label} ${result.statusText || ""}</span>
      <span class="timing">${result.ms}ms</span>
      <button class="copy-btn" id="copyRespBtn">Copy</button>
    </div>
    <pre class="resp-body">${bodyHtml}</pre>
    <div class="history" id="historyWrap" style="${historyLog.length ? "" : "display:none;"}">
      <div class="history-head">
        <div class="section-label" style="margin:0;">History (this session)</div>
        <button class="history-clear" id="historyClearBtn">clear</button>
      </div>
      <div id="historyList"></div>
    </div>
  `;
  renderHistoryList();

  const copyBtn = document.getElementById("copyRespBtn");
  if (copyBtn) {
    copyBtn.addEventListener("click", () =>
      copyToClipboard(lastResultRaw, copyBtn),
    );
  }
  const clearBtn = document.getElementById("historyClearBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      historyLog = [];
      renderHistoryList();
    });
  }
}

function copyToClipboard(text, btn) {
  const done = () => {
    const original = btn.textContent;
    btn.textContent = "Copied";
    btn.classList.add("copied");
    setTimeout(() => {
      btn.textContent = original;
      btn.classList.remove("copied");
    }, 1200);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(text)
      .then(done)
      .catch(() => fallbackCopy(text, done));
  } else {
    fallbackCopy(text, done);
  }
}
function fallbackCopy(text, done) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
    done();
  } catch (e) {}
  document.body.removeChild(ta);
}

function logHistory(result) {
  historyLog.unshift(result);
  if (historyLog.length > 25) historyLog.pop();
}

function renderHistoryList() {
  const wrap = document.getElementById("historyWrap");
  const list = document.getElementById("historyList");
  if (!wrap || !list) return;
  if (!historyLog.length) {
    wrap.style.display = "none";
    return;
  }
  wrap.style.display = "";
  list.innerHTML = historyLog
    .map((h, idx) => {
      const ok = !h.error && h.status >= 200 && h.status < 400;
      return `<div class="history-item" data-hist-index="${idx}">
      <span class="hist-status ${ok ? "ok" : "bad"}">${h.error ? "ERR" : h.status}</span>
      <span>${escapeHtml(h.method)}</span>
      <span class="hist-path">${escapeHtml(h.path)}</span>
      <span style="margin-left:auto;flex-shrink:0;">${h.ms}ms</span>
    </div>`;
    })
    .join("");
  list.querySelectorAll(".history-item").forEach((el) => {
    el.addEventListener("click", () => {
      const idx = Number(el.dataset.histIndex);
      renderResponse(historyLog[idx]);
      setMobileTab("response");
    });
  });
}

// ---------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------
endpointSearch.addEventListener("input", (e) => {
  searchTerm = e.target.value;
  buildSidebar();
});

// ---------------------------------------------------------------------
// Token
// ---------------------------------------------------------------------
tokenInput.addEventListener("input", () => {
  tokenDot.classList.toggle("on", tokenInput.value.trim().length > 0);
  persistToken();
});
document.getElementById("clearTokenBtn").addEventListener("click", () => {
  tokenInput.value = "";
  tokenDot.classList.remove("on");
  persistToken();
});

function tryAutoFillToken(body) {
  if (body && typeof body === "object" && typeof body.token === "string") {
    tokenInput.value = body.token;
    tokenDot.classList.add("on");
    persistToken();
  }
}
const originalRenderResponse = renderResponse;
renderResponse = function (result) {
  originalRenderResponse(result);
  tryAutoFillToken(result.body);
};

// ---------------------------------------------------------------------
// Keyboard shortcuts: "/" focuses search (unless already typing)
// ---------------------------------------------------------------------
document.addEventListener("keydown", (e) => {
  if (
    e.key === "/" &&
    document.activeElement.tagName !== "INPUT" &&
    document.activeElement.tagName !== "TEXTAREA"
  ) {
    e.preventDefault();
    if (window.innerWidth <= 980) openDrawer();
    endpointSearch.focus();
  }
  if (e.key === "Escape") {
    closeDrawer();
  }
});

// ---------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------
loadPersisted();
buildSidebar();
selectEndpoint(0);
