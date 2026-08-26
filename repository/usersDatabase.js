const pool = require("../db");
const crypto = require("crypto");
// Strips the password hash before logging a user row, so bcrypt hashes
// never end up in server logs even though they're not plaintext.
function safeForLog(row) {
  if (!row) return row;
  const { password, ...rest } = row;
  return rest;
}

async function createUsers(user) {
  const id = crypto.randomUUID();
  const result = await pool.query(
    "INSERT INTO users (id,email,password) VALUES ($1,$2,$3) RETURNING id,email",
    [id, user.email, user.password],
  );
  return result.rows[0];
}

async function findByEmail(email) {
  const result = await pool.query(
    "SELECT id,email,password FROM users WHERE email=$1",
    [email],
  );
  return result.rows[0];
}

async function updateUser(id, email) {
  const result = await pool.query(
    "UPDATE users SET email=$2 WHERE id=$1 RETURNING id,email,role",
    [id, email],
  );
  return result.rows[0];
}

async function deleteUser(email) {
  const result = await pool.query(
    "DELETE FROM users WHERE email=$1 returning *",
    [email],
  );
  return result.rows[0];
}

async function getUser(id) {
  const result = await pool.query(
    "SELECT id,email,role FROM users WHERE id=$1",
    [id],
  );
  return result.rows[0];
}

async function getall() {
  const result = await pool.query("SELECT id,email,role FROM users");
  return result.rows;
}

async function createProfile(profile) {
  const result = await pool.query(
    "INSERT INTO  profile (user_id,name,bio) VALUES ($1,$2,$3) RETURNING *",
    [profile.user_id, profile.name, profile.bio],
  );
  return result.rows[0];
}

async function updateProfile(userID, name, bio) {
  const result = await pool.query(
    "UPDATE profile SET name=COALESCE($2,name), bio=COALESCE($3,bio) WHERE user_id=$1 RETURNING *",
    [userID, name, bio],
  );
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
  safeForLog,
};
