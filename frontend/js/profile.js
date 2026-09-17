requireAuth();
renderNav("profile");

const me = currentUser();
let hasProfile = false;

document.getElementById("acEmail").value = me ? me.email : "";

async function loadProfile() {
  const display = document.getElementById("profileDisplay");
  const form = document.getElementById("profileForm");
  document.getElementById("profileError").textContent = "";
  try {
    const data = await api("/users/profile");
    hasProfile = true;
    document.getElementById("profileName").textContent = data.value.name;
    document.getElementById("profileBio").textContent = data.value.bio;
    document.getElementById("pfName").value = data.value.name;
    document.getElementById("pfBio").value = data.value.bio;
    display.hidden = false;
    form.hidden = true;
    document.getElementById("profileSubmitBtn").textContent = "Save profile";
  } catch (err) {
    // "Profile Not Exist" -> no profile yet, show the create form directly.
    hasProfile = false;
    display.hidden = true;
    form.hidden = false;
    document.getElementById("pfName").value = "";
    document.getElementById("pfBio").value = "";
    document.getElementById("profileSubmitBtn").textContent = "Create profile";
  }
}

document.getElementById("editProfileBtn").addEventListener("click", () => {
  document.getElementById("profileDisplay").hidden = true;
  document.getElementById("profileForm").hidden = false;
});

document.getElementById("profileForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const errEl = document.getElementById("profileError");
  errEl.textContent = "";
  const name = document.getElementById("pfName").value;
  const bio = document.getElementById("pfBio").value;
  try {
    if (hasProfile) {
      const data = await api("/users/profile", { method: "PATCH", body: JSON.stringify({ name, bio }) });
      showResponseMessage(data);
    } else {
      const data = await api("/users/profile", { method: "POST", body: JSON.stringify({ name, bio }) });
      showResponseMessage(data);
    }
    loadProfile();
  } catch (err) {
    errEl.textContent = err.message;
  }
});

document.getElementById("emailForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const errEl = document.getElementById("emailError");
  errEl.textContent = "";
  const email = document.getElementById("acEmail").value;
  try {
    const data = await api("/users/", { method: "PATCH", body: JSON.stringify({ email }) });
    showResponseMessage(data);
  } catch (err) {
    errEl.textContent = err.message;
  }
});

document.getElementById("deleteAccountBtn").addEventListener("click", async () => {
  if (!confirm("Delete your account permanently? This cannot be undone.")) return;
  try {
    const data = await api("/users", { method: "DELETE" });
    clearSession();
    showResponseMessage(data);
    window.location.href = "index.html";
  } catch (err) {
    toast(err.message, true);
  }
});

async function loadMyComments() {
  const list = document.getElementById("myCommentList");
  list.innerHTML = '<div class="empty">Loading…</div>';
  let comments = [];
  try {
    const data = await api("/users/comments");
    comments = data.value || [];
  } catch (err) {
    comments = [];
  }
  if (comments.length === 0) {
    list.innerHTML = '<div class="empty">You haven\'t left any comments yet.</div>';
    return;
  }
  list.innerHTML = "";
  comments.forEach((c) => {
    const row = document.createElement("div");
    row.className = "comment-row";
    row.innerHTML =
      '<div class="comment-meta"><a href="task.html?id=' + c.task_id + '">Task #' + c.task_id + '</a>' +
      '<button class="btn btn-ghost btn-sm" data-delete="' + c.id + '">Delete</button></div>' +
      '<p>' + esc(c.body) + '</p>';
    list.appendChild(row);
  });
  list.querySelectorAll("[data-delete]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        await api("/users/comments/" + btn.dataset.delete, { method: "DELETE" });
        loadMyComments();
      } catch (err) {
        toast(err.message, true);
      }
    });
  });
}

loadProfile();
loadMyComments();
