function renderNav(active) {
  const host = document.getElementById("navHost");
  if (!host) return;
  const user = currentUser();
  const isAdmin = user && user.role === "admin";

  host.innerHTML =
    '<aside class="sidebar">' +
    "<div>" +
    '<div class="wordmark">Depot<span class="dot">.</span></div>' +
    '<div class="tagline">Ops dispatch</div>' +
    "</div>" +
    '<nav class="nav">' +
    '<a class="navbtn' +
    (active === "dashboard" ? " is-active" : "") +
    '" href="dashboard.html"><span class="ico">&#9635;</span> Projects</a>' +
    '<a class="navbtn' +
    (active === "tasks" ? " is-active" : "") +
    '" href="tasks.html"><span class="ico">&#10003;</span> My Tasks</a>' +
    '<a class="navbtn' +
    (active === "profile" ? " is-active" : "") +
    '" href="profile.html"><span class="ico">&#9673;</span> Profile</a>' +
    '<a class="navbtn' +
    (active === "notes" ? " is-active" : "") +
    '" href="notes.html"><span class="ico">&#9998;</span> Notes</a>' +
    (isAdmin
      ? '<a class="navbtn' +
        (active === "admin" ? " is-active" : "") +
        '" href="admin.html"><span class="ico">&#9873;</span> Admin</a>'
      : "") +
    "</nav>" +
    '<div class="sidebar-foot">' +
    '<div class="who mono">' +
    (user ? esc(user.email) : "") +
    "</div>" +
    '<button class="btn btn-ghost btn-sm" style="width:100%" id="navLogout">Sign out</button>' +
    '<div class="clock mono" id="navClock"></div>' +
    "</div>" +
    "</aside>";

  const logoutBtn = document.getElementById("navLogout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      clearSession();
      window.location.href = "index.html";
    });
  }

  function tick() {
    const el = document.getElementById("navClock");
    if (el)
      el.textContent = new Date().toLocaleTimeString(undefined, {
        hour12: false,
      });
  }
  tick();
  setInterval(tick, 1000);
}
