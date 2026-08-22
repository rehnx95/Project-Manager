const pool = require("../db");

async function completed(id, value) {
  const result = await pool.query(
    "UPDATE tasks SET completed=$1 WHERE id=$2 RETURNING *",
    [value, id],
  );
  return result.rows[0];
}

async function getoneTask(id) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[repo:tasks] getoneTask called with id:",
    id,
  );
  const result = await pool.query("SELECT * FROM tasks WHERE id=$1", [id]);
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[repo:tasks] getoneTask result:",
    result.rows[0],
  );
  return result.rows[0];
}

async function deleteTask(id) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[repo:tasks] deleteTask called with id:",
    id,
  );
  const result = await pool.query("DELETE FROM tasks WHERE id=$1 returning *", [
    id,
  ]);
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[repo:tasks] deleteTask deleted row:",
    result.rows[0],
  );
  return result.rows[0];
}

async function getTask(userID) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[repo:tasks] getTask called with userID:",
    userID,
  );
  const result = await pool.query("SELECT * FROM tasks WHERE user_id=$1", [
    userID,
  ]);
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[repo:tasks] getTask found",
    result.rows.length,
    "rows",
  );
  return result.rows;
}

async function create(task) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[repo:tasks] create called with task:",
    task,
  );
  const result = await pool.query(
    "INSERT INTO tasks (user_id,title) VALUES ($1,$2) RETURNING *",
    [task.user_id, task.title],
  );
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[repo:tasks] create inserted row:",
    result.rows[0],
  );
  return result.rows[0];
}

async function updateTask(id, newtitle) {
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[repo:tasks] updateTask called with id:",
    id,
    "newtitle:",
    newtitle,
  );
  const result = await pool.query(
    "UPDATE tasks SET title=$1 WHERE id=$2 RETURNING *",
    [newtitle, id],
  );
  console.log(
    new Date().toLocaleTimeString("en-GB"),
    "[repo:tasks] updateTask updated row:",
    result.rows[0],
  );
  return result.rows[0];
}
module.exports = {
  getoneTask,
  deleteTask,
  getTask,
  create,
  updateTask,
  completed,
};
