requireAuth();
renderNav("admin");

const me = currentUser();
if (!me || me.role !== "admin") {
  document.getElementById("adminContent").innerHTML =
    '<div class="forbidden-note">This page is for admins only. Your account doesn\'t have the admin role, so the server would reject these requests anyway.</div>';
} else {
  loadUsers();
}

let currentLookupId = null; // new: remember who we're editing

async function loadUsers() {
  const body = document.getElementById("usersTableBody");
  body.innerHTML = '<tr><td colspan="3">Loading…</td></tr>';
  try {
    const data = await api("/users");
    const users = data.value || [];
    if (users.length === 0) {
      body.innerHTML = '<tr><td colspan="3">No users found.</td></tr>';
      return;
    }
    body.innerHTML = "";
    users.forEach((u) => {
      const tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" + esc(u.email) + "</td>" +
        '<td><span class="stamp stamp--' + esc(u.role) + '">' + esc(u.role) + "</span></td>" +
        '<td class="mono id-badge">' + esc(u.id) + "</td>";
      tr.addEventListener("click", () => {
        document.getElementById("lookupId").value = u.id;
        lookupUser(u.id);
      });
      body.appendChild(tr);
    });
  } catch (err) {
    body.innerHTML = '<tr><td colspan="3">' + esc(err.message) + "</td></tr>";
  }
}

async function lookupUser(id) {
  const errEl = document.getElementById("lookupError");
  const resultEl = document.getElementById("lookupResult");
  const editRow = document.getElementById("editEmailRow");
  const editErrEl = document.getElementById("editEmailError");
  errEl.textContent = "";
  editErrEl.textContent = "";
  try {
    const data = await api("/users/" + id);
    const u = data.value;
    resultEl.innerHTML =
      '<div class="kv-grid" style="margin-top:1rem">' +
      '<div class="kv-item"><div class="k">Email</div><div class="v">' + esc(u.email) + "</div></div>" +
      '<div class="kv-item"><div class="k">Role</div><div class="v">' + esc(u.role) + "</div></div>" +
      '<div class="kv-item"><div class="k">ID</div><div class="v mono">' + esc(u.id) + "</div></div>" +
      "</div>";

    // new: reveal the edit-email form for this user
    currentLookupId = u.id;
    document.getElementById("editEmailInput").value = u.email;
    editRow.hidden = false;
  } catch (err) {
    resultEl.innerHTML = "";
    errEl.textContent = err.message;
    currentLookupId = null;
    editRow.hidden = true;
  }
}

document.getElementById("lookupBtn").addEventListener("click", () => {
  const id = document.getElementById("lookupId").value.trim();
  if (id) lookupUser(id);
});

// new: submit the admin-only update-other-email request
document.getElementById("updateEmailBtn").addEventListener("click", async () => {
  const errEl = document.getElementById("editEmailError");
  errEl.textContent = "";
  if (!currentLookupId) return;
  const newEmail = document.getElementById("editEmailInput").value.trim();
  if (!newEmail) {
    errEl.textContent = "Enter an email.";
    return;
  }
  try {
    await api("/users/" + currentLookupId, {
      method: "PATCH",
      body: JSON.stringify({ email: newEmail }),
    });
    toast("Email updated.");
    lookupUser(currentLookupId); // refresh the displayed row
    loadUsers(); // refresh the table too
  } catch (err) {
    errEl.textContent = err.message;
  }
});