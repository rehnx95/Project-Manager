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
    await api("/projects", { method: "POST", body: JSON.stringify({ name, description, status }) });
    document.getElementById("newProjectForm").reset();
    document.getElementById("newProjectForm").hidden = true;
    toast("Project created.");
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
    // Backend reports "Project Not Exist" when the user has none yet — treat as empty state.
    projects = [];
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

loadProjects();
