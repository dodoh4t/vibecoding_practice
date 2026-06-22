const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const bcrypt = require('bcrypt');
const { types } = require('pg');
const createApp = require('../src/app');
const db = require('../src/db/pool');

const config = {
  databaseUrl: 'postgresql://example.test/postgres',
  jwtSecret: 'test-secret-with-enough-length',
  jwtExpiresIn: '1h',
  clientOrigin: 'http://localhost:5173',
  authRateLimitWindowMs: 60000,
  authRateLimitMax: 0,
  port: 3000,
  nodeEnv: 'test'
};
const TEST_PASSWORD = 'BetterPass123!';

process.env.DATABASE_URL = config.databaseUrl;
process.env.JWT_SECRET = config.jwtSecret;
process.env.JWT_EXPIRES_IN = config.jwtExpiresIn;
process.env.CLIENT_ORIGIN = config.clientOrigin;
process.env.NODE_ENV = config.nodeEnv;

function createRow(overrides = {}) {
  const now = new Date('2026-06-22T06:00:00.000Z');
  return {
    created_at: now,
    updated_at: now,
    due_date: '2026-06-22',
    ...overrides
  };
}

function installMockDb() {
  const state = {
    users: [],
    todos: [],
    revokedTokens: [],
    nextUserId: 1,
    nextTodoId: 1
  };

  db.query = async (sql, params = []) => {
    const normalized = sql.replace(/\s+/g, ' ').trim();

    if (normalized.startsWith('INSERT INTO public.users')) {
      const [email, passwordHash] = params;
      if (state.users.some((user) => user.email === email)) {
        const error = new Error('duplicate key value violates unique constraint');
        error.code = '23505';
        throw error;
      }

      const user = createRow({
        id: state.nextUserId++,
        email,
        password_hash: passwordHash
      });
      state.users.push(user);
      return { rows: [user], rowCount: 1 };
    }

    if (normalized.startsWith('SELECT id, email, password_hash')) {
      const [email] = params;
      return { rows: state.users.filter((user) => user.email === email), rowCount: 1 };
    }

    if (normalized.startsWith('SELECT id, email, created_at')) {
      const [id] = params;
      const user = state.users.find((item) => String(item.id) === String(id));
      return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
    }

    if (normalized.startsWith('INSERT INTO private.revoked_tokens')) {
      const [tokenJti, userId, expiresAt] = params;
      if (!state.revokedTokens.some((item) => item.token_jti === tokenJti)) {
        state.revokedTokens.push({
          token_jti: tokenJti,
          user_id: userId,
          expires_at: expiresAt
        });
      }
      return { rows: [], rowCount: 1 };
    }

    if (normalized.startsWith('SELECT 1 FROM private.revoked_tokens')) {
      const [tokenJti] = params;
      const revoked = state.revokedTokens.find((item) => item.token_jti === tokenJti);
      return { rows: revoked ? [{ '?column?': 1 }] : [], rowCount: revoked ? 1 : 0 };
    }

    if (normalized.startsWith('DELETE FROM private.revoked_tokens')) {
      state.revokedTokens = [];
      return { rows: [], rowCount: 1 };
    }

    if (normalized.startsWith('INSERT INTO public.todos')) {
      const [userId, content, dueDate] = params;
      const todo = createRow({
        id: state.nextTodoId++,
        user_id: Number(userId),
        content,
        due_date: dueDate,
        is_completed: false
      });
      state.todos.push(todo);
      return { rows: [todo], rowCount: 1 };
    }

    if (normalized.startsWith('SELECT id, user_id, content')) {
      const [userId, completed] = params;
      let rows = state.todos.filter((todo) => String(todo.user_id) === String(userId));

      if (params.length > 1) {
        rows = rows.filter((todo) => todo.is_completed === completed);
      }

      if (normalized.includes('ORDER BY created_at ASC')) {
        rows = rows.sort((a, b) => a.id - b.id);
      } else {
        rows = rows.sort((a, b) => b.id - a.id);
      }

      return { rows, rowCount: rows.length };
    }

    if (normalized.startsWith('UPDATE public.todos')) {
      const [isCompleted, todoId, userId] = params;
      const todo = state.todos.find(
        (item) => String(item.id) === String(todoId) && String(item.user_id) === String(userId)
      );

      if (!todo) return { rows: [], rowCount: 0 };

      todo.is_completed = isCompleted;
      todo.updated_at = new Date('2026-06-22T06:10:00.000Z');
      return { rows: [todo], rowCount: 1 };
    }

    if (normalized.startsWith('DELETE FROM public.todos')) {
      const [todoId, userId] = params;
      const index = state.todos.findIndex(
        (item) => String(item.id) === String(todoId) && String(item.user_id) === String(userId)
      );

      if (index === -1) return { rows: [], rowCount: 0 };

      state.todos.splice(index, 1);
      return { rows: [], rowCount: 1 };
    }

    throw new Error(`Unhandled SQL in test: ${normalized}`);
  };

  return state;
}

async function signupAndLogin(app, email = 'user@example.com') {
  await request(app)
    .post('/api/auth/signup')
    .send({ email, password: TEST_PASSWORD })
    .expect(201);

  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({ email, password: TEST_PASSWORD })
    .expect(200);

  return loginResponse.body.accessToken;
}

test('health endpoint returns ok', async () => {
  const app = createApp({ config });

  const response = await request(app).get('/api/health').expect(200);
  assert.deepEqual(response.body, { status: 'ok' });
  assert.equal(response.headers['x-powered-by'], undefined);
  assert.equal(response.headers['x-content-type-options'], 'nosniff');
  assert.equal(response.headers['x-frame-options'], 'SAMEORIGIN');
  assert.match(response.headers['content-security-policy'], /default-src 'self'/);
});

test('OpenAPI docs are served', async () => {
  const app = createApp({ config });

  const specResponse = await request(app).get('/api/openapi.yaml').expect(200);
  assert.match(specResponse.text, /openapi: 3\.0\.0/);

  const docsResponse = await request(app).get('/api/docs/').expect(200);
  assert.match(docsResponse.text, /dodoTodoList API Docs/);
  assert.match(docsResponse.text, /swagger-ui/);
});

test('PostgreSQL DATE values are parsed without timezone conversion', () => {
  const parseDate = types.getTypeParser(1082, 'text');

  assert.equal(parseDate('2026-06-22'), '2026-06-22');
});

test('signup normalizes email and rejects duplicate accounts', async () => {
  const state = installMockDb();
  const app = createApp({ config });

  const response = await request(app)
    .post('/api/auth/signup')
    .send({ email: 'USER@Example.com', password: TEST_PASSWORD })
    .expect(201);

  assert.equal(response.body.message, 'If the account can be created, continue to login.');
  assert.equal(state.users[0].email, 'user@example.com');

  const duplicate = await request(app)
    .post('/api/auth/signup')
    .send({ email: 'user@example.com', password: TEST_PASSWORD })
    .expect(201);

  assert.equal(duplicate.body.message, response.body.message);
  assert.equal(state.users.length, 1);
});

test('signup rejects weak or common passwords', async () => {
  installMockDb();
  const app = createApp({ config });

  const weak = await request(app)
    .post('/api/auth/signup')
    .send({ email: 'weak@example.com', password: '12345678' })
    .expect(400);

  assert.equal(weak.body.error.code, 'VALIDATION_ERROR');

  const common = await request(app)
    .post('/api/auth/signup')
    .send({ email: 'common@example.com', password: 'Password123!' })
    .expect(400);

  assert.equal(common.body.error.code, 'VALIDATION_ERROR');
});

test('login returns a bearer token and rejects bad credentials', async () => {
  installMockDb();
  const app = createApp({ config });

  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 4);
  await db.query('INSERT INTO public.users (email, password_hash) VALUES ($1, $2)', [
    'user@example.com',
    passwordHash
  ]);

  const response = await request(app)
    .post('/api/auth/login')
    .send({ email: 'user@example.com', password: TEST_PASSWORD })
    .expect(200);

  assert.equal(response.body.tokenType, 'Bearer');
  assert.equal(response.body.expiresIn, 3600);
  assert.ok(response.body.accessToken);

  const invalid = await request(app)
    .post('/api/auth/login')
    .send({ email: 'user@example.com', password: 'wrong-password' })
    .expect(401);

  assert.equal(invalid.body.error.code, 'INVALID_CREDENTIALS');
});

test('auth endpoints are rate limited when configured', async () => {
  installMockDb();
  const app = createApp({
    config: {
      ...config,
      authRateLimitMax: 2
    }
  });

  await request(app)
    .post('/api/auth/login')
    .send({ email: 'missing@example.com', password: 'wrong' })
    .expect(401);

  await request(app)
    .post('/api/auth/login')
    .send({ email: 'missing@example.com', password: 'wrong' })
    .expect(401);

  const limited = await request(app)
    .post('/api/auth/login')
    .send({ email: 'missing@example.com', password: 'wrong' })
    .expect(429);

  assert.equal(limited.body.error.code, 'RATE_LIMITED');
});

test('todo APIs require auth and enforce owner-scoped updates', async () => {
  installMockDb();
  const app = createApp({ config });

  await request(app).get('/api/todos').expect(401);

  const firstToken = await signupAndLogin(app, 'first@example.com');
  const secondToken = await signupAndLogin(app, 'second@example.com');

  const createResponse = await request(app)
    .post('/api/todos')
    .set('Authorization', `Bearer ${firstToken}`)
    .send({ content: '  Write backend  ' })
    .expect(201);

    assert.equal(createResponse.body.todo.content, 'Write backend');
    assert.equal(createResponse.body.todo.dueDate, '2026-06-22');

  const listResponse = await request(app)
    .get('/api/todos?sort=createdAtDesc')
    .set('Authorization', `Bearer ${firstToken}`)
    .expect(200);

  assert.equal(listResponse.body.todos.length, 1);

  await request(app)
    .patch(`/api/todos/${createResponse.body.todo.id}`)
    .set('Authorization', `Bearer ${secondToken}`)
    .send({ isCompleted: true })
    .expect(404);

  const updateResponse = await request(app)
    .patch(`/api/todos/${createResponse.body.todo.id}`)
    .set('Authorization', `Bearer ${firstToken}`)
    .send({ isCompleted: true })
    .expect(200);

  assert.equal(updateResponse.body.todo.isCompleted, true);

  await request(app)
    .delete(`/api/todos/${createResponse.body.todo.id}`)
    .set('Authorization', `Bearer ${secondToken}`)
    .expect(404);

  await request(app)
    .delete(`/api/todos/${createResponse.body.todo.id}`)
    .set('Authorization', `Bearer ${firstToken}`)
    .expect(204);

  await request(app)
    .post('/api/auth/logout')
    .set('Authorization', `Bearer ${firstToken}`)
    .expect(204);

  await request(app)
    .get('/api/todos')
    .set('Authorization', `Bearer ${firstToken}`)
    .expect(401);
});

test('todo validation returns API error format', async () => {
  installMockDb();
  const app = createApp({ config });
  const token = await signupAndLogin(app);

  const blank = await request(app)
    .post('/api/todos')
    .set('Authorization', `Bearer ${token}`)
    .send({ content: '   ', dueDate: '2026-06-22' })
    .expect(400);

  assert.equal(blank.body.error.code, 'VALIDATION_ERROR');

  const invalidSort = await request(app)
    .get('/api/todos?sort=invalid')
    .set('Authorization', `Bearer ${token}`)
    .expect(400);

  assert.equal(invalidSort.body.error.code, 'VALIDATION_ERROR');

  const invalidDate = await request(app)
    .post('/api/todos')
    .set('Authorization', `Bearer ${token}`)
    .send({ content: 'Date test', dueDate: '2026-13-40' })
    .expect(400);

  assert.equal(invalidDate.body.error.code, 'VALIDATION_ERROR');
});
