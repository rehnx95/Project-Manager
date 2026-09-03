requireAuth();
renderNav("tasks");

const state = { page: 1, limit: 10, totalPages: 1 };

async function loadTasks() {
  const list = document.getElementById("myTaskList");
  list.innerHTML = '<div class="empty">Loading tasks…</div>';
  let data;
  try {
    data = await api("/tasks?page=" + state.page + "&limit=" + state.limit);
  } catch (err) {
    list.innerHTML = '<div class="empty">Could not load tasks.</div>';
    return;
  }
  const tasks = data.value || [];
  state.totalPages = data.total_pages || 1;
  document.getElementById("pageInfo").textContent =
    "Page " + (data.page || state.page) + " of " + state.totalPages + " · " + (data.total || 0) + " total";
  document.getElementById("prevPage").disabled = state.page <= 1;
  document.getElementById("nextPage").disabled = state.page >= state.totalPages;

  if (tasks.length === 0) {
    list.innerHTML = '<div class="empty">No tasks to show.</div>';
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
        '<a class="btn btn-sm" href="project.html?id=' + esc(t.project_id) + '">Project</a>' +
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

document.getElementById("prevPage").addEventListener("click", () => {
  if (state.page > 1) { state.page--; loadTasks(); }
});
document.getElementById("nextPage").addEventListener("click", () => {
  if (state.page < state.totalPages) { state.page++; loadTasks(); }
});

loadTasks();
