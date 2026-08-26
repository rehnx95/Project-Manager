const pool = require("../db");

async function createTag(tagName) {
  const result = await pool.query(
    "INSERT INTO tags (tags) VALUES ($1) RETURNING *",
    [tagName]
  );
  return result.rows[0];
}

async function getAllTags() {
  const result = await pool.query("SELECT * FROM tags");
  return result.rows;
}

async function addTagToTask(taskId, tagId) {
  const result = await pool.query(
    `INSERT INTO tasks_tags (task_id, tags_id) 
     VALUES ($1, $2) 
     ON CONFLICT (task_id, tags_id) DO NOTHING 
     RETURNING *`,
    [taskId, tagId]
  );
  return result.rows[0];
}

async function getTaskTags(taskId) {
  const result = await pool.query(
    `SELECT * 
     FROM tags
     JOIN tasks_tags ON tags.id = tasks_tags.tags_id
     WHERE tasks_tags.task_id = $1`,
    [taskId]
  );
  return result.rows;
}

async function removeTagFromTask(taskId, tagId) {
  const result = await pool.query(
    "DELETE FROM tasks_tags WHERE task_id = $1 AND tags_id = $2 RETURNING *",
    [taskId, tagId]
  );
  return result.rowCount > 0;
}

module.exports = {
  createTag,
  getAllTags,
  addTagToTask,
  getTaskTags,
  removeTagFromTask,
};
