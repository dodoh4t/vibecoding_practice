const db = require('../db/pool');

async function createUser({ email, passwordHash }) {
  const result = await db.query(
    `INSERT INTO public.users (email, password_hash)
     VALUES ($1, $2)
     RETURNING id, email, created_at, updated_at`,
    [email, passwordHash]
  );

  return result.rows[0];
}

async function findUserByEmail(email) {
  const result = await db.query(
    `SELECT id, email, password_hash, created_at, updated_at
     FROM public.users
     WHERE email = $1`,
    [email]
  );

  return result.rows[0] || null;
}

async function findUserById(id) {
  const result = await db.query(
    `SELECT id, email, created_at, updated_at
     FROM public.users
     WHERE id = $1`,
    [id]
  );

  return result.rows[0] || null;
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById
};
