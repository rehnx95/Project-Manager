const pool = require("../db");

async function createTag(project_id, tag_name) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[tagsDatabase] createTag");
  const result = await pool.query(
    "INSERT INTO tags (project_id, tag_name) VALUES ($1, $2) RETURNING *",
    [project_id, tag_name],
  );
  return result.rows[0];
}

async function getAllTags(project_id) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[tagsDatabase] getAllTags");
  const result = await pool.query("SELECT * FROM tags WHERE project_id=$1 ORDER BY tag_name", [project_id]);
  return result.rows;
}

async function getOneTag(tag_id) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[tagsDatabase] getOneTag");
  const result = await pool.query("SELECT * FROM tags WHERE id=$1", [tag_id]);
  return result.rows[0];
}

async function addTagToTask(task_id, tag_id) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[tagsDatabase] addTagToTask");
  const result = await pool.query(
    `INSERT INTO tasks_tags (task_id, tags_id) 
     VALUES ($1, $2) 
     ON CONFLICT (task_id, tags_id) DO NOTHING 
     RETURNING *`,
    [task_id, tag_id],
  );
  return result.rows[0];
}

async function getTaskTags(task_id) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[tagsDatabase] getTaskTags");
  const result = await pool.query(
    `SELECT * 
     FROM tags
     JOIN tasks_tags ON tags.id = tasks_tags.tags_id
     WHERE tasks_tags.task_id = $1`,
    [task_id],
  );
  return result.rows;
}

async function removeTagFromTask(task_id, tag_id) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[tagsDatabase] removeTagFromTask");
  const result = await pool.query(
    "DELETE FROM tasks_tags WHERE task_id = $1 AND tags_id = $2 RETURNING *",
    [task_id, tag_id],
  );
  return result.rowCount > 0;
}

module.exports = {
  createTag,
  getAllTags,
  addTagToTask,
  getTaskTags,
  removeTagFromTask,
  getOneTag
};