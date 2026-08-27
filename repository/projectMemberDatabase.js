const pool = require("../db");

async function getMembership(project_id, user_id) {
  const result = await pool.query(
    "SELECT * FROM project_members WHERE project_id=$1 AND user_id=$2",
    [project_id, user_id],
  );
  return result.rows[0];
}

async function addMemberToProject(project_id, user_id, role) {
  const result = await pool.query(
    "INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3) RETURNING *",
    [project_id, user_id, role],
  );
  return result.rows[0];
}

async function getAllMembersOfProject(project_id) {
  const result = await pool.query(
    "SELECT * FROM project_members WHERE project_id = $1",
    [project_id],
  );
  return result.rows;
}

async function getAllProjectsOfUser(user_id) {
  const result = await pool.query(
    "SELECT * FROM project_members WHERE user_id = $1",
    [user_id],
  );
  return result.rows;
}

async function removeMemberFromProject(project_id, user_id) {
  const result = await pool.query(
    "DELETE FROM project_members WHERE project_id = $1 AND user_id = $2 RETURNING *",
    [project_id, user_id],
  );
  return result.rows[0];
}

async function changeMemberRole(project_id, user_id, new_role) {
  const result = await pool.query(
    "UPDATE project_members SET role = $3 WHERE project_id = $1 AND user_id = $2 RETURNING *",
    [project_id, user_id, new_role],
  );
  return result.rows[0];
}

module.exports = {
  addMemberToProject,
  changeMemberRole,
  getAllMembersOfProject,
  removeMemberFromProject,
  getAllProjectsOfUser,
  getMembership,
};
