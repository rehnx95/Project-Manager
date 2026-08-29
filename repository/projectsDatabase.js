const pool = require("../db");
const crypto = require("crypto");

async function createProject(new_project) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[projectsDatabase] createProject");
  const id = crypto.randomUUID();
  const result = await pool.query(
    "INSERT INTO projects (id,user_id,project_name,description,status) VALUES ($1,$2,$3,$4,$5) RETURNING *",
    [
      id,
      new_project.user_id,
      new_project.new_project_name,
      new_project.new_description,
      new_project.new_status,
    ],
  );
  return result.rows[0];
}

async function getOneProject(project_id) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[projectsDatabase] getOneProject");
  const result = await pool.query("SELECT * FROM projects WHERE id=$1", [
    project_id,
  ]);
  return result.rows[0];
}

async function getProject(user_id) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[projectsDatabase] getProject");
  const result = await pool.query("SELECT * FROM projects WHERE user_id =$1", [
    user_id,
  ]);
  return result.rows;
}

async function getTaskByProject(project_id) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[projectsDatabase] getTaskByProject");
  const result = await pool.query("SELECT * FROM tasks WHERE project_id=$1", [
    project_id,
  ]);
  return result.rows;
}

async function updateProject(id, new_project_name, new_description, new_status) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[projectsDatabase] updateProject");
  const result = await pool.query(
    "UPDATE projects SET project_name=COALESCE($2,project_name),description=COALESCE($3,description),status=COALESCE($4,status) WHERE id=$1 RETURNING *",
    [id, new_project_name, new_description, new_status],
  );
  return result.rows[0];
}

async function deleteProject(id) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[projectsDatabase] deleteProject");
  const result = await pool.query(
    "DELETE FROM projects WHERE id=$1 RETURNING * ",
    [id],
  );
  return result.rows[0];
}

module.exports = {
  createProject,
  getOneProject,
  getProject,
  getTaskByProject,
  updateProject,
  deleteProject,
};