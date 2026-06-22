const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const bcrypt = require('bcrypt');
const createApp = require('../src/app');
const db = require('../src/db/pool');

const config = {
  databaseUrl: 'postgresql://example.test/postgres',
  jwtSecret: 'test-secret-with-enough-length',
  jwtExpiresIn: '1h',
  clientOrigin: 'http://localhost:5173',
  port: 3000,
  nodeEnv: 'test'
};

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
    ...overrides
  };
}

function installMockDb() {
  const state = {
    users: [],
    todos: [],
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

    if (normalized.startsWith('INSERT INTO public.todos')) {
      const [userId, content] = params;
      const todo = createRow({
        id: state.nextTodoId++,
        user_id: Number(userId),
        content,
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
    .send({ email, password: 'securepass123' })
    .expect(201);

  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({ email, password: 'securepass123' })
    .expect(200);

  return loginResponse.body.accessToken;
}

test('health endpoint returns ok', async () => {
  const app = createApp({ config });

  const response = await request(app).get('/api/health').expect(200);
  assert.deepEqual(response.body, { status: 'ok' });
});

test('signup normalizes email and rejects duplicate accounts', async () => {
  installMockDb();
  const app = createApp({ config });

  const response = await request(app)
    .post('/api/auth/signup')
    .send({ email: 'USER@Example.com', password: 'securepass123' })
    .expect(201);

  assert.equal(response.body.user.email, 'user@example.com');

  const duplicate = await request(app)
    .post('/api/auth/signup')
    .send({ email: 'user@example.com', password: 'securepass123' })
    .expect(409);

  assert.equal(duplicate.body.error.code, 'EMAIL_ALREADY_EXISTS');
});

test('login returns a bearer token and rejects bad credentials', async () => {
  installMockDb();
  const app = createApp({ config });

  const passwordHash = await bcrypt.hash('securepass123', 4);
  await db.query('INSERT INTO public.users (email, password_hash) VALUES ($1, $2)', [
    'user@example.com',
    passwordHash
  ]);

  const response = await request(app)
    .post('/api/auth/login')
    .send({ email: 'user@example.com', password: 'securepass123' })
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
});

test('todo validation returns API error format', async () => {
  installMockDb();
  const app = createApp({ config });
  const token = await signupAndLogin(app);

  const blank = await request(app)
    .post('/api/todos')
    .set('Authorization', `Bearer ${token}`)
    .send({ content: '   ' })
    .expect(400);

  assert.equal(blank.body.error.code, 'VALIDATION_ERROR');

  const invalidSort = await request(app)
    .get('/api/todos?sort=invalid')
    .set('Authorization', `Bearer ${token}`)
    .expect(400);

  assert.equal(invalidSort.body.error.code, 'VALIDATION_ERROR');
});
