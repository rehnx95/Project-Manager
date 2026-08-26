const pool = require("../db");

async function createComment(task_id, user_id, body) {
  const result = await pool.query(
    "INSERT INTO comments (task_id, user_id, body) VALUES ($1, $2, $3) RETURNING *",
    [task_id, user_id, body],
  );
  return result.rows[0];
}

async function getCommentByTask(task_id) {
  const result = await pool.query("SELECT * FROM comments WHERE task_id = $1", [
    task_id,
  ]);
  return result.rows;
}

async function getCommentByUser(user_id) {
  const result = await pool.query("SELECT * FROM comments WHERE user_id = $1", [
    user_id,
  ]);
  return result.rows;
}

async function deleteCommentById(comment_id) {
  const result = await pool.query(
    "DELETE FROM comments WHERE id = $1 RETURNING *",
    [comment_id],
  );
  return result.rows[0];
}

async function deleteCommentByUserAndId(comment_id, user_id) {
  const result = await pool.query(
    "DELETE FROM comments WHERE id = $1 AND user_id = $2 RETURNING *",
    [comment_id, user_id],
  );
  return result.rows[0];
}

async function deleteAllCommentFromTask(task_id) {
  const result = await pool.query(
    "DELETE FROM comments WHERE task_id = $1 RETURNING *",
    [task_id],
  );
  return result.rows;
}

module.exports = {
  getCommentByTask,
  getCommentByUser,
  deleteCommentById,
  deleteCommentByUserAndId,
  createComment,
  deleteAllCommentFromTask,
};
