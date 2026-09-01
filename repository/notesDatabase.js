const pool = require("../db");

async function createNotes(new_note) {
  const result = await pool.query(
    "INSERT INTO notes(user_id,title,body) VALUES ($1,$2,$3) RETURNING *",
    [new_note.user_id, new_note.new_title, new_note.new_body],
  );
  return result.rows[0];
}

async function listNotes(user_id) {
  const result = await pool.query("SELECT * FROM notes WHERE user_id=$1", [
    user_id,
  ]);
  return result.rows;
}

async function getOneNote(id) {
  const result = await pool.query("SELECT * FROM notes WHERE id=$1", [id]);
  return result.rows[0];
}

async function updateNote(id, new_title, new_body) {
  const result = await pool.query(
    "UPDATE notes SET title=COALESCE($2,title),body=COALESCE($3,body) WHERE id =$1 RETURNING *",
    [id, new_title, new_body],
  );
  return result.rows[0];
}

async function deleteNote(id) {
  const result = await pool.query("DELETE FROM notes WHERE id=$1 RETURNING *", [
    id,
  ]);
  return result.rows[0];
}

async function deleteAllNotes(user_id) {
  const result = await pool.query(
    "DELETE FROM notes WHERE user_id=$1 RETURNING *",
    [user_id],
  );
  return result.rows;
}

module.exports = {
  createNotes,
  listNotes,
  getOneNote,
  updateNote,
  deleteAllNotes,
  deleteNote,
};
