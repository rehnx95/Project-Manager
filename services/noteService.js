const notesDatabase = require("../repository/notesDatabase");

async function createNotes(user_id, new_title, new_body) {
  const new_note = {
    new_title,
    new_body,
    user_id,
  };
  const result = await notesDatabase.createNotes(new_note);
  return { success: true, value: result };
}

async function listNotes(user_id) {
  const notes = await notesDatabase.listNotes(user_id);
  return { success: true, value: notes };
}

async function getOneNote(user_id, id) {
  const notes = await notesDatabase.getOneNote(id);
  if (!notes) {
    return { success: false, error: "Notes Not Exist" };
  }
  if (notes.user_id !== user_id) {
    return { success: false, error: "Notes Not Exist" };
  }
  return { success: true, value: notes };
}

async function updateNote(user_id, id, new_title, new_body) {
  const notes = await notesDatabase.getOneNote(id);
  if (!notes) {
    return { success: false, error: "Notes Not Exist" };
  }
  if (notes.user_id !== user_id) {
    return { success: false, error: "Notes Not Exist" };
  }
  const updated_note = await notesDatabase.updateNote(id, new_title, new_body);
  return { success: true, value: updated_note };
}

async function deleteNote(user_id, id) {
  const notes = await notesDatabase.getOneNote(id);
  if (!notes) {
    return { success: false, error: "Notes Not Exist" };
  }
  if (notes.user_id !== user_id) {
    return { success: false, error: "Notes Not Exist" };
  }
  const deleted = await notesDatabase.deleteNote(id);
  return { success: true, value: deleted };
}

async function deleteAllNotes(user_id) {
  const deleted = await notesDatabase.deleteAllNotes(user_id);
  return { success: true, value: deleted };
}

module.exports = {
  createNotes,
  listNotes,
  getOneNote,
  updateNote,
  deleteAllNotes,
  deleteNote,
};
