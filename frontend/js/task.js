requireAuth();
renderNav("tasks");

const taskId = qs("id");
if (!taskId) window.location.href = "tasks.html";

const state = { task: null, myRole: null, me: currentUser() };

async function loadTask() {
  try {
    const data = await api("/tasks/" + taskId);
    state.task = data.value;
    renderTask();
  } catch (err) {
    toast(err.message, true);
    window.location.href = "tasks.html";
    return;
  }
  try {
    const mem = await api("/projects/" + state.task.project_id + "/membership");
    state.myRole = mem.value.role;
  } catch (err) {
    state.myRole = null;
  }
  applyRolePermissions();
  loadTags();
  loadComments();
}

function renderTask() {
  const t = state.task;
  document.getElementById("tTitle").textContent = t.title;
  document.getElementById("tMeta").textContent = "Task #" + t.id;
  document.getElementById("backLink").href = "project.html?id=" + t.project_id;

  const pStamp = document.getElementById("tPriorityStamp");
  pStamp.textContent = t.priority;
  pStamp.className = "stamp stamp--" + t.priority;

  const dStamp = document.getElementById("tDoneStamp");
  dStamp.textContent = t.completed ? "completed" : "open";
  dStamp.className = "stamp " + (t.completed ? "stamp--completed" : "stamp--active");

  document.getElementById("etTitle").value = t.title;
  document.getElementById("etPriority").value = t.priority;
  document.getElementById("etDueDate").value = toLocalInputValue(t.due_date);
}

function applyRolePermissions() {
  const isOwner = state.myRole === "owner";
  document.getElementById("deleteTaskBtn").hidden = !isOwner;
  document.getElementById("clearCommentsBtn").hidden = !isOwner;
}

// ---------- edit / complete / delete ----------
document.getElementById("saveTaskBtn").addEventListener("click", async () => {
  const errEl = document.getElementById("editTaskError");
  errEl.textContent = "";
  const title = document.getElementById("etTitle").value;
  const priority = document.getElementById("etPriority").value;
  const dueLocal = document.getElementById("etDueDate").value;
  try {
    const due_date = toISODateTime(dueLocal);
    const data = await api("/tasks/" + taskId, { method: "PATCH", body: JSON.stringify({ title, priority, due_date }) });
    state.task = data.value;
    renderTask();
    toast("Task updated.");
  } catch (err) {
    errEl.textContent = err.message;
  }
});

document.getElementById("toggleCompleteBtn").addEventListener("click", async () => {
  try {
    const data = await api("/tasks/" + taskId + "/complete", { method: "PATCH" });
    state.task = data.value;
    renderTask();
  } catch (err) {
    toast(err.message, true);
  }
});

document.getElementById("deleteTaskBtn").addEventListener("click", async () => {
  if (!confirm("Delete this task? This cannot be undone.")) return;
  try {
    const projectId = state.task.project_id;
    await api("/tasks/" + taskId, { method: "DELETE" });
    toast("Task deleted.");
    window.location.href = "project.html?id=" + projectId;
  } catch (err) {
    toast(err.message, true);
  }
});

// ---------- tags ----------
async function loadTags() {
  const chips = document.getElementById("tagChips");
  chips.innerHTML = '<span class="row-meta">Loading tags…</span>';
  let taskTags = [];
  try {
    const data = await api("/tasks/" + taskId + "/tags");
    taskTags = data.value || [];
  } catch (err) {
    taskTags = [];
  }
  if (taskTags.length === 0) {
    chips.innerHTML = '<span class="row-meta">No tags on this task yet.</span>';
  } else {
    chips.innerHTML = "";
    taskTags.forEach((tag) => {
      const chip = document.createElement("span");
      chip.className = "tag-chip";
      chip.innerHTML = esc(tag.tag_name) + ' <button data-detach="' + tag.id + '" title="Remove tag">&times;</button>';
      chips.appendChild(chip);
    });
    chips.querySelectorAll("[data-detach]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        try {
          await api("/tasks/" + taskId + "/tags/" + btn.dataset.detach, { method: "DELETE" });
          loadTags();
        } catch (err) {
          toast(err.message, true);
        }
      });
    });
  }

  // refresh the "attach existing tag" dropdown against the full tag list
  const select = document.getElementById("tagSelect");
  try {
    const all = await api("/tags");
    const attachedIds = new Set(taskTags.map((t) => t.id));
    const available = (all.value || []).filter((t) => !attachedIds.has(t.id));
    select.innerHTML = available.length
      ? available.map((t) => '<option value="' + t.id + '">' + esc(t.tag_name) + "</option>").join("")
      : '<option value="">No available tags</option>';
  } catch (err) {
    select.innerHTML = '<option value="">Could not load tags</option>';
  }
}

document.getElementById("attachTagBtn").addEventListener("click", async () => {
  const errEl = document.getElementById("tagError");
  errEl.textContent = "";
  const tagId = document.getElementById("tagSelect").value;
  if (!tagId) return;
  try {
    await api("/tasks/" + taskId + "/tags/" + tagId, { method: "POST" });
    toast("Tag attached.");
    loadTags();
  } catch (err) {
    errEl.textContent = err.message;
  }
});

document.getElementById("createTagBtn").addEventListener("click", async () => {
  const errEl = document.getElementById("tagError");
  errEl.textContent = "";
  const nameEl = document.getElementById("newTagName");
  const tag_name = nameEl.value.trim();
  if (!tag_name) return;
  try {
    const created = await api("/tags", { method: "POST", body: JSON.stringify({ tag_name }) });
    await api("/tasks/" + taskId + "/tags/" + created.value.id, { method: "POST" });
    nameEl.value = "";
    toast("Tag created and attached.");
    loadTags();
  } catch (err) {
    errEl.textContent = err.message;
  }
});

// ---------- comments ----------
async function loadComments() {
  const list = document.getElementById("commentList");
  list.innerHTML = '<div class="empty">Loading comments…</div>';
  let comments = [];
  try {
    const data = await api("/tasks/" + taskId + "/comments");
    comments = data.value || [];
  } catch (err) {
    comments = [];
  }
  if (comments.length === 0) {
    list.innerHTML = '<div class="empty">No comments yet — be the first.</div>';
    return;
  }
  list.innerHTML = "";
  comments.forEach((c) => {
    const row = document.createElement("div");
    row.className = "comment-row";
    const isMine = state.me && c.user_id === state.me.id;
    row.innerHTML =
      '<div class="comment-meta"><span>' + formatDateTime(c.created_at) + '</span>' +
      (isMine ? '<button class="btn btn-ghost btn-sm" data-delete-comment="' + c.id + '">Delete</button>' : "") +
      '</div><p>' + esc(c.body) + '</p>';
    list.appendChild(row);
  });
  list.querySelectorAll("[data-delete-comment]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        await api("/users/comments/" + btn.dataset.deleteComment, { method: "DELETE" });
        loadComments();
      } catch (err) {
        toast(err.message, true);
      }
    });
  });
}

document.getElementById("newCommentForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const errEl = document.getElementById("newCommentError");
  errEl.textContent = "";
  const bodyEl = document.getElementById("ncBody");
  const new_body = bodyEl.value;
  try {
    await api("/tasks/" + taskId + "/comments", { method: "POST", body: JSON.stringify({ new_body }) });
    bodyEl.value = "";
    loadComments();
  } catch (err) {
    errEl.textContent = err.message;
  }
});

document.getElementById("clearCommentsBtn").addEventListener("click", async () => {
  if (!confirm("Delete every comment on this task?")) return;
  try {
    await api("/tasks/" + taskId + "/comments", { method: "DELETE" });
    toast("Comments cleared.");
    loadComments();
  } catch (err) {
    toast(err.message, true);
  }
});

loadTask();
