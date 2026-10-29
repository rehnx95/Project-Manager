const pool = require("../db");

async function createTokenSession(jti, user_id, expires_at) {
  await pool.query(
    "INSERT INTO token_sessions (jti, user_id, expires_at) VALUES ($1, $2, $3)",
    [jti, user_id, expires_at],
  );
}

async function isTokenActive(jti, user_id) {
  const result = await pool.query(
    "SELECT 1 FROM token_sessions WHERE jti=$1 AND user_id=$2 AND revoked_at IS NULL AND expires_at > NOW()",
    [jti, user_id],
  );
  return result.rowCount > 0;
}

async function revokeToken(jti) {
  await pool.query("UPDATE token_sessions SET revoked_at=NOW() WHERE jti=$1", [jti]);
}

async function createAuditLog(actor_user_id, action, target_type, target_id, metadata = {}) {
  await pool.query(
    "INSERT INTO audit_logs (actor_user_id, action, target_type, target_id, metadata) VALUES ($1, $2, $3, $4, $5)",
    [actor_user_id, action, target_type, target_id, metadata],
  );
}

module.exports = {
  createTokenSession,
  isTokenActive,
  revokeToken,
  createAuditLog,
};
