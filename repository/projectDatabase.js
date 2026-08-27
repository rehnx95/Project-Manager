const pool = require("../db");
const crypto = require("crypto");

async function createProject(project) {
  const id = crypto.randomUUID();
  const result = await pool.query(
    "INSERT INTO projects (id,user_id,project_name,description,status) VALUES ($1,$2,$3,$4,$5) RETURNING *",
    [
      id,
      project.user_id,
      project.project_name,
      project.description,
      project.status,
    ],
  );
  return result.rows[0];
}

async function getoneProject(project_id) {
  const result = await pool.query("SELECT * FROM projects WHERE id=$1", [
    project_id,
  ]);
  return result.rows[0];
}

async function getProject(user_id) {
  const result = await pool.query("SELECT * FROM projects WHERE user_id =$1", [
    user_id,
  ]);
  return result.rows;
}

async function getTaskByProject(project_id) {
  const result = await pool.query("SELECT * FROM tasks WHERE project_id=$1", [
    project_id,
  ]);
  return result.rows;
}

async function updateProject(id, newProjectName, newDescription, newStatus) {
  const result = await pool.query(
    "UPDATE projects SET project_name=COALESCE($2,project_name),description=COALESCE($3,description),status=COALESCE($4,status) WHERE id=$1 RETURNING *",
    [id, newProjectName, newDescription, newStatus],
  );
  return result.rows[0];
}

async function deleteProject(id) {
  const result = await pool.query(
    "DELETE FROM projects WHERE id=$1 RETURNING * ",
    [id],
  );
  return result.rows[0];
}

module.exports = {
  createProject,
  getoneProject,
  getProject,
  getTaskByProject,
  updateProject,
  deleteProject,
};
