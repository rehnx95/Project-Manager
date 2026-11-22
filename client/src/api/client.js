const TOKEN_KEY = "depot_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function decodeToken(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    return JSON.parse(decodeURIComponent(Array.from(atob(padded), (char) =>
      "%" + char.charCodeAt(0).toString(16).padStart(2, "0")).join("")));
  } catch {
    return null;
  }
}

function messageFromError(raw, status) {
  if (Array.isArray(raw)) return raw.join(", ");
  if (raw && typeof raw === "object") return raw.message || "Request failed";
  return raw || `Request failed (${status})`;
}

export async function request(path, { method = "GET", body, headers = {}, ...options } = {}) {
  const token = getToken();
  let response;
  try {
    response = await fetch(path, {
      ...options,
      method,
      headers: {
        Accept: "application/json",
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  } catch {
    throw new Error("Could not reach the Depot server.");
  }
  if (response.status === 401) {
    clearToken();
    if (window.location.pathname !== "/login") {
      const returnTo = window.location.pathname + window.location.search;
      window.location.assign(`/login?returnTo=${encodeURIComponent(returnTo)}`);
    }
    throw new Error("Your session expired. Please sign in again.");
  }
  let data = null;
  if (response.status !== 204) {
    try {
      data = await response.json();
    } catch {
      if (response.ok) throw new Error("The server returned an invalid response.");
    }
  }
  if (!response.ok) {
    const raw = data?.error;
    const error = new Error(messageFromError(raw, response.status));
    error.status = response.status;
    error.fields = raw && typeof raw === "object" ? raw.fields : undefined;
    error.response = data;
    throw error;
  }
  if (data && (Object.prototype.hasOwnProperty.call(data, "token") || Object.prototype.hasOwnProperty.call(data, "total_pages"))) return data;
  return data?.value ?? data?.data ?? data;
}

const queryString = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") query.set(key, value);
  });
  const serialized = query.toString();
  return serialized ? `?${serialized}` : "";
};
const id = (value) => encodeURIComponent(value);
const json = (method, body) => ({ method, body });

export const authApi = {
  login: (body) => request("/users/login", json("POST", body)),
  signup: (body) => request("/users/signup", json("POST", body)),
  logout: () => request("/users/logout", { method: "POST" }),
};
export const usersApi = {
  profile: () => request("/users/profile"),
  createProfile: (body) => request("/users/profile", json("POST", body)),
  updateProfile: (body) => request("/users/profile", json("PATCH", body)),
  updateEmail: (body) => request("/users", json("PATCH", body)),
  deleteAccount: () => request("/users", { method: "DELETE" }),
  list: () => request("/users"),
  get: (userId) => request(`/users/${id(userId)}`),
  updateOtherEmail: (userId, body) => request(`/users/${id(userId)}`, json("PATCH", body)),
};
export const projectsApi = {
  list: () => request("/projects"),
  get: (projectId) => request(`/projects/${id(projectId)}`),
  create: (body) => request("/projects", json("POST", body)),
  update: (projectId, body) => request(`/projects/${id(projectId)}`, json("PATCH", body)),
  delete: (projectId) => request(`/projects/${id(projectId)}`, { method: "DELETE" }),
  tasks: (projectId) => request(`/projects/${id(projectId)}/tasks`),
  activity: (projectId, limit = 50) => request(`/projects/${id(projectId)}/activity${queryString({ limit })}`),
};
export const tasksApi = {
  list: (params) => request(`/tasks${queryString(params)}`),
  get: (taskId) => request(`/tasks/${id(taskId)}`),
  create: (projectId, body) => request(`/projects/${id(projectId)}/tasks`, json("POST", body)),
  update: (taskId, body) => request(`/tasks/${id(taskId)}`, json("PATCH", body)),
  complete: (taskId) => request(`/tasks/${id(taskId)}/complete`, { method: "PATCH" }),
  delete: (taskId) => request(`/tasks/${id(taskId)}`, { method: "DELETE" }),
};
export const membersApi = {
  list: (projectId) => request(`/projects/${id(projectId)}/members`),
  add: (projectId, userId, body) => request(`/projects/${id(projectId)}/users/${id(userId)}`, json("POST", body)),
  update: (projectId, userId, body) => request(`/projects/${id(projectId)}/users/${id(userId)}`, json("PATCH", body)),
  remove: (projectId, userId) => request(`/projects/${id(projectId)}/users/${id(userId)}`, { method: "DELETE" }),
  assignees: (taskId) => request(`/tasks/${id(taskId)}/assignees`),
  assign: (taskId, userId) => request(`/tasks/${id(taskId)}/assignees/${id(userId)}`, { method: "POST" }),
  unassign: (taskId, userId) => request(`/tasks/${id(taskId)}/assignees/${id(userId)}`, { method: "DELETE" }),
};
export const tagsApi = {
  listForProject: (projectId) => request(`/projects/${id(projectId)}/tags`),
  createForProject: (projectId, body) => request(`/projects/${id(projectId)}/tags`, json("POST", body)),
  listForTask: (taskId) => request(`/tasks/${id(taskId)}/tags`),
  addToTask: (taskId, tagId) => request(`/tasks/${id(taskId)}/tags/${id(tagId)}`, { method: "POST" }),
  removeFromTask: (taskId, tagId) => request(`/tasks/${id(taskId)}/tags/${id(tagId)}`, { method: "DELETE" }),
};
export const commentsApi = {
  listForTask: (taskId) => request(`/tasks/${id(taskId)}/comments`),
  addToTask: (taskId, body) => request(`/tasks/${id(taskId)}/comments`, json("POST", body)),
  clearForTask: (taskId) => request(`/tasks/${id(taskId)}/comments`, { method: "DELETE" }),
  listForUser: () => request("/users/comments"),
  deleteForUser: (commentId) => request(`/users/comments/${id(commentId)}`, { method: "DELETE" }),
};
export const notesApi = {
  list: () => request("/users/notes"),
  create: (body) => request("/users/notes", json("POST", body)),
  update: (noteId, body) => request(`/users/notes/${id(noteId)}`, json("PATCH", body)),
  delete: (noteId) => request(`/users/notes/${id(noteId)}`, { method: "DELETE" }),
  clear: () => request("/users/notes", { method: "DELETE" }),
};
export const dashboardApi = {
  summary: () => request("/dashboard/summary"),
};
