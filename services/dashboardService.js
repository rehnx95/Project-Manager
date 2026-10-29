const pool = require("../db");

async function getDashboardSummary(user_id) {
  const result = await pool.query(
    `SELECT
       COUNT(DISTINCT pm.project_id)::int AS project_count,
       COUNT(t.id)::int AS task_count,
       COUNT(t.id) FILTER (WHERE t.completed)::int AS completed_task_count,
       COUNT(t.id) FILTER (WHERE NOT t.completed)::int AS pending_task_count
     FROM project_members pm
     LEFT JOIN tasks t ON t.project_id = pm.project_id
     WHERE pm.user_id = $1`,
    [user_id],
  );
  return result.rows[0] || {
    project_count: 0, task_count: 0, completed_task_count: 0, pending_task_count: 0,
  };
}

module.exports = { getDashboardSummary };
