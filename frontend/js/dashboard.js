requireAuth();
renderNav("dashboard");

document.getElementById("newProjectBtn").addEventListener("click", () => {
  document.getElementById("newProjectForm").hidden = false;
});
document.getElementById("cancelNewProject").addEventListener("click", () => {
  document.getElementById("newProjectForm").hidden = true;
  document.getElementById("newProjectForm").reset();
});

document.getElementById("newProjectForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const errEl = document.getElementById("newProjectError");
  errEl.textContent = "";
  const name = document.getElementById("npName").value;
  const description = document.getElementById("npDescription").value;
  const status = document.getElementById("npStatus").value;
  try {
    const data = await api("/projects", { method: "POST", body: JSON.stringify({ name, description, status }) });
    document.getElementById("newProjectForm").reset();
    document.getElementById("newProjectForm").hidden = true;
    showResponseMessage(data);
    loadProjects();
  } catch (err) {
    errEl.textContent = err.message;
  }
});

async function loadProjects() {
  const grid = document.getElementById("projectsGrid");
  grid.innerHTML = '<div class="empty">Loading projects…</div>';
  let projects = [];
  try {
    const data = await api("/projects");
    projects = data.value || [];
  } catch (err) {
    grid.innerHTML = '<div class="empty">' + esc(err.message) + "</div>";
    return;
  }
  if (projects.length === 0) {
    grid.innerHTML = '<div class="empty">No projects yet — create your first one to get moving.</div>';
    return;
  }
  grid.innerHTML = '<div class="grid"></div>';
  const gridInner = grid.querySelector(".grid");
  projects.forEach((p) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML =
      '<div class="card-foot"><h4>' + esc(p.project_name) + '</h4>' +
      '<span class="stamp stamp--' + esc(p.status) + '">' + esc(p.status) + '</span></div>' +
      '<p>' + esc(p.description) + '</p>' +
      '<div class="card-foot"><span class="id-badge mono">Created ' + formatDate(p.created_at) + '</span>' +
      '<a class="btn btn-sm" href="project.html?id=' + esc(p.id) + '">Open</a></div>';
    gridInner.appendChild(card);
  });
}

async function loadSummary() {
  try {
    const data = await api("/dashboard/summary");
    const summary = data.value || {};
    document.getElementById("projectCount").textContent = summary.project_count ?? 0;
    document.getElementById("openTaskCount").textContent = summary.pending_task_count ?? 0;
    document.getElementById("completedTaskCount").textContent = summary.completed_task_count ?? 0;
    document.getElementById("taskCount").textContent = summary.task_count ?? 0;
  } catch (err) {
    document.getElementById("dashboardSummary").setAttribute("aria-label", err.message);
  }
}

loadSummary();
loadProjects();
