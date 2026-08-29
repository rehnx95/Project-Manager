// ---------------------------------------------------------------
// Point this at wherever your Express server is running.
// app.js falls back to PORT 7000 if .env doesn't set PORT — change
// this if your .env sets a different value.
// ---------------------------------------------------------------
const API_BASE = "http://localhost:7000";
const TOKEN_KEY = "depot_token";

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}
function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
}

// The JWT payload (id/email/role) is already visible to the browser the
// moment the server issues it, so decoding it client-side just reads
// data we already have — it doesn't expose anything new.
function decodeToken(token) {
  try {
    const payload = token.split(".")[1];
    const json = decodeURIComponent(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

function currentUser() {
  const token = getToken();
  if (!token) return null;
  return decodeToken(token);
}

function requireAuth() {
  if (!getToken()) {
    window.location.href = "index.html";
  }
}

async function api(path, opts = {}) {
  const headers = { "Content-Type": "application/json", ...(opts.headers || {}) };
  const token = getToken();
  if (token) headers["Authorization"] = "Bearer " + token;

  let res;
  try {
    res = await fetch(API_BASE + path, { ...opts, headers });
  } catch (networkErr) {
    throw new Error("Could not reach the server. Is it running on " + API_BASE + "?");
  }

  if (res.status === 401) {
    clearSession();
    window.location.href = "index.html";
    throw new Error("Session expired — please sign in again.");
  }

  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    /* e.g. 204 No Content */
  }

  if (!res.ok) {
    const raw = data && data.error;
    const msg = Array.isArray(raw) ? raw.join(", ") : raw || "Request failed (" + res.status + ")";
    throw new Error(msg);
  }
  return data;
}

function esc(str) {
  const d = document.createElement("div");
  d.textContent = str == null ? "" : String(str);
  return d.innerHTML;
}

function toast(message, isError) {
  let box = document.getElementById("toast");
  if (!box) {
    box = document.createElement("div");
    box.id = "toast";
    document.body.appendChild(box);
  }
  const el = document.createElement("div");
  el.className = "toast-msg" + (isError ? " is-error" : "");
  el.textContent = message;
  box.appendChild(el);
  setTimeout(() => el.remove(), 3800);
}

function toISODateTime(localValue) {
  return new Date(localValue).toISOString();
}

function toLocalInputValue(iso) {
  if (!iso) return "";
  const d = new Date(String(iso).replace(" ", "T"));
  if (isNaN(d)) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return (
    d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) +
    "T" + pad(d.getHours()) + ":" + pad(d.getMinutes())
  );
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(String(iso).replace(" ", "T"));
  if (isNaN(d)) return iso;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(String(iso).replace(" ", "T"));
  if (isNaN(d)) return iso;
  return d.toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function qs(name) {
  return new URLSearchParams(window.location.search).get(name);
}
