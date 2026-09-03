requireAuth();
renderNav("notes");

document.getElementById("newNoteBtn").addEventListener("click", () => {
  document.getElementById("newNoteForm").hidden = false;
});
document.getElementById("cancelNewNote").addEventListener("click", () => {
  document.getElementById("newNoteForm").hidden = true;
  document.getElementById("newNoteForm").reset();
});

document.getElementById("newNoteForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const errEl = document.getElementById("newNoteError");
  errEl.textContent = "";
  const title = document.getElementById("nnTitle").value;
  const body = document.getElementById("nnBody").value;
  try {
    await api("/users/notes", { method: "POST", body: JSON.stringify({ title, body }) });
    document.getElementById("newNoteForm").reset();
    document.getElementById("newNoteForm").hidden = true;
    toast("Note created.");
    loadNotes();
  } catch (err) {
    errEl.textContent = err.message;
  }
});

document.getElementById("clearNotesBtn").addEventListener("click", async () => {
  if (!confirm("Delete every note? This cannot be undone.")) return;
  try {
    await api("/users/notes", { method: "DELETE" });
    toast("Notes cleared.");
    loadNotes();
  } catch (err) {
    toast(err.message, true);
  }
});

async function loadNotes() {
  const list = document.getElementById("noteList");
  list.innerHTML = '<div class="empty">Loading notes…</div>';
  let notes = [];
  try {
    const data = await api("/users/notes");
    notes = data.value || [];
  } catch (err) {
    list.innerHTML = '<div class="empty">Could not load notes.</div>';
    return;
  }
  if (notes.length === 0) {
    list.innerHTML = '<div class="empty">No notes yet — create your first one above.</div>';
    return;
  }
  list.innerHTML = "";
  notes.forEach((n) => {
    const card = document.createElement("div");
    card.className = "panel";
    card.innerHTML =
      '<div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.6rem; flex-wrap:wrap; gap:0.5rem">' +
        '<h3 style="margin:0; color:var(--text)" data-view-title>' + esc(n.title) + '</h3>' +
        '<div style="display:flex; gap:0.4rem">' +
          '<button class="btn btn-ghost btn-sm" data-edit-btn>Edit</button>' +
          '<button class="btn btn-danger btn-sm" data-delete-btn>Delete</button>' +
        '</div>' +
      '</div>' +
      '<p data-view-body style="color:var(--text-dim); white-space:pre-wrap; line-height:1.5">' + esc(n.body) + '</p>' +
      '<div class="field" data-edit-title-wrap hidden><label>Title</label><input value="' + esc(n.title) + '" /></div>' +
      '<div class="field" data-edit-body-wrap hidden><label>Body</label><textarea>' + esc(n.body) + '</textarea></div>' +
      '<div class="error-text" data-edit-error hidden></div>' +
      '<div style="display:none; gap:0.6rem" data-edit-actions>' +
        '<button class="btn btn-primary btn-sm" data-save-btn>Save</button>' +
        '<button class="btn btn-ghost btn-sm" data-cancel-btn>Cancel</button>' +
      '</div>';
    list.appendChild(card);

    const viewTitle = card.querySelector("[data-view-title]");
    const viewBody = card.querySelector("[data-view-body]");
    const editTitleWrap = card.querySelector("[data-edit-title-wrap]");
    const editBodyWrap = card.querySelector("[data-edit-body-wrap]");
    const editActions = card.querySelector("[data-edit-actions]");
    const errEl = card.querySelector("[data-edit-error]");
    const titleInput = editTitleWrap.querySelector("input");
    const bodyInput = editBodyWrap.querySelector("textarea");
    const editBtn = card.querySelector("[data-edit-btn]");

    function enterEdit() {
      viewTitle.hidden = true;
      viewBody.hidden = true;
      editTitleWrap.hidden = false;
      editBodyWrap.hidden = false;
      editActions.style.display = "flex";
      editBtn.hidden = true;
    }
    function exitEdit() {
      viewTitle.hidden = false;
      viewBody.hidden = false;
      editTitleWrap.hidden = true;
      editBodyWrap.hidden = true;
      editActions.style.display = "none";
      editBtn.hidden = false;
      errEl.hidden = true;
    }

    editBtn.addEventListener("click", enterEdit);
    card.querySelector("[data-cancel-btn]").addEventListener("click", () => {
      titleInput.value = n.title;
      bodyInput.value = n.body;
      exitEdit();
    });
    card.querySelector("[data-save-btn]").addEventListener("click", async () => {
      errEl.hidden = true;
      errEl.textContent = "";
      try {
        await api("/users/notes/" + n.id, {
          method: "PATCH",
          body: JSON.stringify({ title: titleInput.value, body: bodyInput.value }),
        });
        toast("Note updated.");
        loadNotes();
      } catch (err) {
        errEl.textContent = err.message;
        errEl.hidden = false;
      }
    });
    card.querySelector("[data-delete-btn]").addEventListener("click", async () => {
      if (!confirm("Delete this note?")) return;
      try {
        await api("/users/notes/" + n.id, { method: "DELETE" });
        toast("Note deleted.");
        loadNotes();
      } catch (err) {
        toast(err.message, true);
      }
    });
  });
}

loadNotes();