const pool = require("../db");

async function getMembership(project_id, user_id) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[projectMembersDatabase] getMembership");
  const result = await pool.query(
    "SELECT * FROM project_members WHERE project_id=$1 AND user_id=$2",
    [project_id, user_id],
  );
  return result.rows[0];
}

async function addMemberToProject(project_id, user_id, new_role, client = pool) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[projectMembersDatabase] addMemberToProject");
  const result = await client.query(
    "INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3) RETURNING *",
    [project_id, user_id, new_role],
  );
  return result.rows[0];
}

async function getAllMembersOfProject(project_id) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[projectMembersDatabase] getAllMembersOfProject");
  const result = await pool.query(
    "SELECT * FROM project_members WHERE project_id = $1",
    [project_id],
  );
  return result.rows;
}

async function getAllProjectsOfUser(user_id) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[projectMembersDatabase] getAllProjectsOfUser");
  const result = await pool.query(
    "SELECT * FROM project_members WHERE user_id = $1",
    [user_id],
  );
  return result.rows;
}

async function removeMemberFromProject(project_id, user_id) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[projectMembersDatabase] removeMemberFromProject");
  const result = await pool.query(
    "DELETE FROM project_members WHERE project_id = $1 AND user_id = $2 RETURNING *",
    [project_id, user_id],
  );
  return result.rows[0];
}

async function changeMemberRole(project_id, user_id, new_role) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[projectMembersDatabase] changeMemberRole");
  const result = await pool.query(
    "UPDATE project_members SET role = $3 WHERE project_id = $1 AND user_id = $2 RETURNING *",
    [project_id, user_id, new_role],
  );
  return result.rows[0];
}

async function removeMemberWithOwnerProtection(project_id, target_user_id) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT id FROM projects WHERE id=$1 FOR UPDATE", [project_id]);
    const target = await client.query(
      "SELECT role FROM project_members WHERE project_id=$1 AND user_id=$2 FOR UPDATE",
      [project_id, target_user_id],
    );
    if (target.rowCount === 0) {
      await client.query("ROLLBACK");
      return { error: "Forbidden Not Member Of That Project" };
    }
    if (target.rows[0].role === "owner") {
      const owners = await client.query(
        "SELECT COUNT(*)::int AS count FROM project_members WHERE project_id=$1 AND role='owner'",
        [project_id],
      );
      if (owners.rows[0].count <= 1) {
        await client.query("ROLLBACK");
        return { error: "Forbidden Cannot Change The Role Of The Last Owner" };
      }
    }
    const result = await client.query(
      "DELETE FROM project_members WHERE project_id=$1 AND user_id=$2 RETURNING *",
      [project_id, target_user_id],
    );
    await client.query("COMMIT");
    return { value: result.rows[0] };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function changeMemberRoleWithOwnerProtection(project_id, target_user_id, new_role) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT id FROM projects WHERE id=$1 FOR UPDATE", [project_id]);
    const target = await client.query(
      "SELECT role FROM project_members WHERE project_id=$1 AND user_id=$2 FOR UPDATE",
      [project_id, target_user_id],
    );
    if (target.rowCount === 0) {
      await client.query("ROLLBACK");
      return { error: "Forbidden Not Member Of That Project" };
    }
    if (target.rows[0].role === "owner" && new_role !== "owner") {
      const owners = await client.query(
        "SELECT COUNT(*)::int AS count FROM project_members WHERE project_id=$1 AND role='owner'",
        [project_id],
      );
      if (owners.rows[0].count <= 1) {
        await client.query("ROLLBACK");
        return { error: "Forbidden Cannot Change The Role Of The Last Owner" };
      }
    }
    const result = await client.query(
      "UPDATE project_members SET role=$3 WHERE project_id=$1 AND user_id=$2 RETURNING *",
      [project_id, target_user_id, new_role],
    );
    await client.query("COMMIT");
    return { value: result.rows[0] };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  addMemberToProject,
  changeMemberRole,
  getAllMembersOfProject,
  removeMemberFromProject,
  getAllProjectsOfUser,
  getMembership,
  removeMemberWithOwnerProtection,
  changeMemberRoleWithOwnerProtection,
};