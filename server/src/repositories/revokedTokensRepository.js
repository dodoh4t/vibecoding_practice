const db = require('../db/pool');

async function revokeToken({ tokenJti, userId, expiresAt }) {
  await db.query(
    `INSERT INTO private.revoked_tokens (token_jti, user_id, expires_at)
     VALUES ($1, $2, $3)
     ON CONFLICT (token_jti) DO NOTHING`,
    [tokenJti, userId, expiresAt]
  );
}

async function isTokenRevoked(tokenJti) {
  const result = await db.query(
    `SELECT 1
     FROM private.revoked_tokens
     WHERE token_jti = $1
       AND expires_at > NOW()
     LIMIT 1`,
    [tokenJti]
  );

  return result.rowCount > 0;
}

async function deleteExpiredTokens() {
  await db.query(
    `DELETE FROM private.revoked_tokens
     WHERE expires_at <= NOW()`
  );
}

module.exports = {
  revokeToken,
  isTokenRevoked,
  deleteExpiredTokens
};
