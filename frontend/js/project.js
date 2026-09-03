requireAuth();
renderNav("dashboard");

const projectId = qs("id");
if (!projectId) window.location.href = "dashboard.html";

const state = { project: null, myRole: null };

// ---------- tabs ----------
document.querySelectorAll(".pagetab").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".pagetab").forEach((b) => b.classList.remove("is-active"));
    document.querySelectorAll(".tabpanel").forEach((p) => p.classList.remove("is-active"));
    btn.classList.add("is-active");
    document.getElementById("tab-" + btn.dataset.tab).classList.add("is-active");
  });
});

// ---------- load project + my membership ----------
async function loadProject() {
  try {
    const data = await api("/projects/" + projectId);
    state.project = data.value;
    renderProject();
  } catch (err) {
    toast(err.message, true);
    window.location.href = "dashboard.html";
    return;
  }

  try {
    const mem = await api("/projects/" + projectId + "/membership");
    state.myRole = mem.value.role;
  } catch (err) {
    state.myRole = null;
  }
  applyRolePermissions();
  loadTasks();
  loadMembers();
}

function renderProject() {
  const p = state.project;
  document.getElementById("pName").textContent = p.project_name;
  document.getElementById("pDescription").textContent = p.description;
  const stamp = document.getElementById("pStatusStamp");
  stamp.textContent = p.status;
  stamp.className = "stamp stamp--" + p.status;
  document.getElementById("projectEditPanel").hidden = true;
}

function applyRolePermissions() {
  const isOwner = state.myRole === "owner";
  document.getElementById("editProjectBtn").hidden = !isOwner;
  document.getElementById("deleteProjectBtn").hidden = !isOwner;
  document.getElementById("showAddMemberBtn").hidden = !isOwner;
  const roleStamp = document.getElementById("pRoleStamp");
  if (state.myRole) {
    roleStamp.textContent = "you: " + state.myRole;
    roleStamp.className = "stamp stamp--" + state.myRole;
  }
}

// ---------- edit / delete project ----------
document.getElementById("editProjectBtn").addEventListener("click", () => {
  const p = state.project;
  document.getElementById("epName").value = p.project_name;
  document.getElementById("epDescription").value = p.description;
  document.getElementById("epStatus").value = p.status;
  document.getElementById("editProjectError").textContent = "";
  document.getElementById("projectEditPanel").hidden = false;
});
document.getElementById("cancelProjectEdit").addEventListener("click", () => {
  document.getElementById("projectEditPanel").hidden = true;
});
document.getElementById("saveProjectEdit").addEventListener("click", async () => {
  const errEl = document.getElementById("editProjectError");
  errEl.textContent = "";
  const name = document.getElementById("epName").value;
  const description = document.getElementById("epDescription").value;
  const status = document.getElementById("epStatus").value;
  try {
    const data = await api("/projects/" + projectId, { method: "PATCH", body: JSON.stringify({ name, description, status }) });
    state.project = data.value;
    renderProject();
    toast("Project updated.");
  } catch (err) {
    errEl.textContent = err.message;
  }
});
document.getElementById("deleteProjectBtn").addEventListener("click", async () => {
  if (!confirm("Delete this project? This cannot be undone.")) return;
  try {
    await api("/projects/" + projectId, { method: "DELETE" });
    toast("Project deleted.");
    window.location.href = "dashboard.html";
  } catch (err) {
    toast(err.message, true);
  }
});

// ---------- tasks ----------
document.getElementById("newTaskBtn").addEventListener("click", () => {
  document.getElementById("newTaskForm").hidden = false;
});
document.getElementById("cancelNewTask").addEventListener("click", () => {
  document.getElementById("newTaskForm").hidden = true;
  document.getElementById("newTaskForm").reset();
});
document.getElementById("newTaskForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const errEl = document.getElementById("newTaskError");
  errEl.textContent = "";
  const title = document.getElementById("ntTitle").value;
  const priority = document.getElementById("ntPriority").value;
  const dueLocal = document.getElementById("ntDueDate").value;
  try {
    const due_date = toISODateTime(dueLocal);
    await api("/projects/" + projectId + "/tasks", { method: "POST", body: JSON.stringify({ title, priority, due_date }) });
    document.getElementById("newTaskForm").reset();
    document.getElementById("newTaskForm").hidden = true;
    toast("Task added.");
    loadTasks();
  } catch (err) {
    errEl.textContent = err.message;
  }
});

async function loadTasks() {
  const list = document.getElementById("taskList");
  list.innerHTML = '<div class="empty">Loading tasks…</div>';
  let tasks = [];
  try {
    const data = await api("/projects/" + projectId + "/tasks");
    tasks = data.value || [];
  } catch (err) {
    toast(err.message, true);
    tasks = [];
  }
  if (tasks.length === 0) {
    list.innerHTML = '<div class="empty">No tasks in this project yet.</div>';
    return;
  }
  list.innerHTML = "";
  tasks.forEach((t) => {
    const row = document.createElement("div");
    row.className = "list-row priority-" + t.priority + (t.completed ? " is-done" : "");
    row.innerHTML =
      '<button class="task-check" data-complete="' + t.id + '" title="Toggle complete"></button>' +
      '<a class="row-title" href="task.html?id=' + t.id + '">' + esc(t.title) + '</a>' +
      '<span class="stamp stamp--' + t.priority + '">' + t.priority + '</span>' +
      '<span class="row-meta mono">Due ' + formatDate(t.due_date) + '</span>' +
      '<div class="row-actions">' +
        '<a class="btn btn-sm" href="task.html?id=' + t.id + '">Open</a>' +
      '</div>';
    list.appendChild(row);
  });
  list.querySelectorAll("[data-complete]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        await api("/tasks/" + btn.dataset.complete + "/complete", { method: "PATCH" });
        loadTasks();
      } catch (err) {
        toast(err.message, true);
      }
    });
  });
}

// ---------- crew / members ----------
document.getElementById("showAddMemberBtn").addEventListener("click", () => {
  document.getElementById("addMemberPanel").hidden = false;
});
document.getElementById("submitAddMember").addEventListener("click", async () => {
  const errEl = document.getElementById("addMemberError");
  errEl.textContent = "";
  const targetUserId = document.getElementById("amUserId").value.trim();
  const role = document.getElementById("amRole").value;
  try {
    await api("/projects/" + projectId + "/users/" + targetUserId, { method: "POST", body: JSON.stringify({ role }) });
    document.getElementById("amUserId").value = "";
    toast("Member added.");
    loadMembers();
  } catch (err) {
    errEl.textContent = err.message;
  }
});

async function loadMembers() {
  const list = document.getElementById("memberList");
  list.innerHTML = '<div class="empty">Loading crew…</div>';
  let members = [];
  try {
    const data = await api("/projects/" + projectId + "/members");
    members = data.value || [];
  } catch (err) {
    list.innerHTML = '<div class="empty">Could not load members.</div>';
    return;
  }
  if (members.length === 0) {
    list.innerHTML = '<div class="empty">No members yet.</div>';
    return;
  }
  const isOwner = state.myRole === "owner";
  list.innerHTML = "";
  members.forEach((m) => {
    const row = document.createElement("div");
    row.className = "list-row";
    row.style.borderLeftColor = "var(--line)";
    row.innerHTML =
      '<span class="row-title mono" title="' + esc(m.user_id) + '">' + esc(m.user_id) + '</span>' +
      '<span class="stamp stamp--' + esc(m.role) + '">' + esc(m.role) + '</span>' +
      (isOwner
        ? '<div class="row-actions">' +
            '<select class="btn btn-sm" data-role-for="' + esc(m.user_id) + '">' +
              '<option value="member"' + (m.role === "member" ? " selected" : "") + '>member</option>' +
              '<option value="owner"' + (m.role === "owner" ? " selected" : "") + '>owner</option>' +
            '</select>' +
            '<button class="btn btn-danger btn-sm" data-remove="' + esc(m.user_id) + '">Remove</button>' +
          '</div>'
        : "");
    list.appendChild(row);
  });

  if (isOwner) {
    list.querySelectorAll("[data-role-for]").forEach((sel) => {
      sel.addEventListener("change", async () => {
        try {
          await api("/projects/" + projectId + "/users/" + sel.dataset.roleFor, {
            method: "PATCH",
            body: JSON.stringify({ role: sel.value }),
          });
          toast("Role updated.");
          loadMembers();
        } catch (err) {
          toast(err.message, true);
          loadMembers();
        }
      });
    });
    list.querySelectorAll("[data-remove]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!confirm("Remove this member from the project?")) return;
        try {
          await api("/projects/" + projectId + "/users/" + btn.dataset.remove, { method: "DELETE" });
          toast("Member removed.");
          loadMembers();
        } catch (err) {
          toast(err.message, true);
        }
      });
    });
  }
}

loadProject();
