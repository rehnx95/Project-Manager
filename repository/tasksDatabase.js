const pool = require("../db");

async function createTask(new_task) {
  const result = await pool.query(
    "INSERT INTO tasks (user_id,project_id,title,priority,due_date) VALUES ($1,$2,$3,$4,$5) RETURNING *",
    [new_task.user_id, new_task.project_id, new_task.new_title, new_task.new_priority, new_task.new_due_date],
  );
  return result.rows[0];
}

async function getOneTask(id) {
  const result = await pool.query("SELECT * FROM tasks WHERE id=$1", [id]);
  return result.rows[0];
}

async function getTaskByUser(user_id) {
  const result = await pool.query("SELECT * FROM tasks WHERE user_id=$1", [
    user_id,
  ]);
  return result.rows;
}

async function updateTask(id, new_title, new_priority, new_due_date) {
  const result = await pool.query(
    "UPDATE tasks SET title=COALESCE($2,title),priority=COALESCE($3,priority),due_date=COALESCE($4,due_date) WHERE id=$1 RETURNING *",
    [id, new_title, new_priority, new_due_date],
  );
  return result.rows[0];
}

async function completeTask(id, completed_value) {
  const result = await pool.query(
    "UPDATE tasks SET completed=$2 WHERE id=$1 RETURNING *",
    [id, completed_value],
  );
  return result.rows[0];
}

async function deleteTask(id) {
  const result = await pool.query("DELETE FROM tasks WHERE id=$1 returning *", [
    id,
  ]);

  return result.rows[0];
}

module.exports = {
  createTask,
  getOneTask,
  getTaskByUser,
  updateTask,
  deleteTask,
  completeTask,
};
