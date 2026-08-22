const pool = require("../db");

async function findByEmail(email) {
  console.log(new Date().toLocaleTimeString("en-GB"),"[repo:users] findByEmail called with email:", email);
  const result = await pool.query("SELECT * FROM users WHERE email=$1", [
    email,
  ]);
  console.log(new Date().toLocaleTimeString("en-GB"),"[repo:users] findByEmail result:", result.rows[0]);
  return result.rows[0];
}

async function create(user) {
  console.log(new Date().toLocaleTimeString("en-GB"),"[repo:users] create called with email:", user.email);
  const result = await pool.query(
    "INSERT INTO users (email,password) VALUES ($1,$2) RETURNING *",
    [user.email, user.password],
  );
  console.log(new Date().toLocaleTimeString("en-GB"),"[repo:users] create inserted row:", result.rows[0]);
  return result.rows[0];
}

async function getall() {
  console.log(new Date().toLocaleTimeString("en-GB"),"[repo:users] getall called");
  const result = await pool.query("SELECT id,email FROM users");
  console.log(new Date().toLocaleTimeString("en-GB"),"[repo:users] getall found", result.rows.length, "rows");
  return result.rows;
}

async function deleteUser(email) {
  console.log(new Date().toLocaleTimeString("en-GB"),"[repo:users] deleteUser called with email:", email);
  const result = await pool.query(
    "DELETE FROM users WHERE email=$1 returning *",
    [email],
  );
  console.log(new Date().toLocaleTimeString("en-GB"),"[repo:users] deleteUser deleted row:", result.rows[0]);
  return result.rows[0];
}

async function updateUser(id, email) {
  console.log(new Date().toLocaleTimeString("en-GB"),"[repo:users] updateUser called with id:", id, "email:", email);
  const result = await pool.query(
    "UPDATE users SET email=$1 WHERE id=$2 RETURNING *",
    [email, id],
  );
  console.log(new Date().toLocaleTimeString("en-GB"),"[repo:users] updateUser updated row:", result.rows[0]);
  return result.rows[0];
}

async function getUser(id) {
  console.log(new Date().toLocaleTimeString("en-GB"),"[repo:users] getUser called with id:", id);
  const result = await pool.query("SELECT id,email FROM users WHERE id=$1", [
    id,
  ]);
  console.log(new Date().toLocaleTimeString("en-GB"),"[repo:users] getUser result:", result.rows[0]);
  return result.rows[0];
}

module.exports = {
  findByEmail,
  create,
  getall,
  deleteUser,
  getUser,
  updateUser,
};