const pool = require("../db");
const crypto = require("crypto");
// Strips the password hash before logging a user row, so bcrypt hashes
// never end up in server logs even though they're not plaintext.
function safeForLog(row) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[usersDatabase] safeForLog");
  if (!row) return row;
  const { password, ...rest } = row;
  return rest;
}

async function createUsers(new_user) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[usersDatabase] createUsers");
  const id = crypto.randomUUID();
  const result = await pool.query(
    "INSERT INTO users (id,email,password) VALUES ($1,$2,$3) RETURNING id,role,email",
    [id, new_user.email, new_user.password],
  );
  return result.rows[0];
}

async function findByEmail(email) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[usersDatabase] findByEmail");
  const result = await pool.query(
    "SELECT id,email,password FROM users WHERE email=$1",
    [email],
  );
  return result.rows[0];
}

async function updateUser(id, new_email) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[usersDatabase] updateUser");
  const result = await pool.query(
    "UPDATE users SET email=$2, updated_at=now() WHERE id=$1 RETURNING id,email,role",
    [id, new_email],
  );
  return result.rows[0];
}

async function deleteUser(email) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[usersDatabase] deleteUser");
  const result = await pool.query(
    "DELETE FROM users WHERE email=$1 RETURNING *",
    [email],
  );
  return result.rows[0];
}

async function getUser(id) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[usersDatabase] getUser");
  const result = await pool.query(
    "SELECT id,email,role FROM users WHERE id=$1",
    [id],
  );
  return result.rows[0];
}

async function getall() {
  console.log(new Date().toLocaleTimeString("en-GB"), "[usersDatabase] getall");
  const result = await pool.query("SELECT id,email,role FROM users");
  return result.rows;
}

async function createProfile(new_profile) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[usersDatabase] createProfile");
  const result = await pool.query(
    "INSERT INTO profiles (user_id,name,bio) VALUES ($1,$2,$3) RETURNING *",
    [new_profile.user_id, new_profile.new_name, new_profile.new_bio],
  );
  return result.rows[0];
}

async function updateProfile(user_id, updated_name, updated_bio) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[usersDatabase] updateProfile");
  const result = await pool.query(
    "UPDATE profiles SET name=COALESCE($2,name), bio=COALESCE($3,bio) WHERE user_id=$1 RETURNING *",
    [user_id, updated_name, updated_bio],
  );
  return result.rows[0];
}

async function getProfile(user_id) {
  console.log(new Date().toLocaleTimeString("en-GB"), "[usersDatabase] getProfile");
  const result = await pool.query("SELECT * FROM profiles WHERE user_id=$1", [
    user_id,
  ]);
  return result.rows[0];
}

module.exports = {
  createUsers,
  findByEmail,
  getUser,
  getall,
  deleteUser,
  updateUser,
  createProfile,
  updateProfile,
  getProfile,
  safeForLog,
};