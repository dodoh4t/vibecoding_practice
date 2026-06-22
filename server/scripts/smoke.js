require('dotenv').config();

const createApp = require('../src/app');
const { getConfig, assertRuntimeConfig } = require('../src/config');
const { closePool, query } = require('../src/db/pool');

function ensureReady(config) {
  assertRuntimeConfig(config);

  if (/YOUR_PASSWORD|PROJECT_REF|POOLER_HOST/.test(config.databaseUrl)) {
    throw new Error('DATABASE_URL still contains a placeholder. Set the real Supabase DB password first.');
  }
}

async function requestJson(baseUrl, path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = body && body.error
      ? `${body.error.code}: ${body.error.message}`
      : text;
    throw new Error(`${options.method || 'GET'} ${path} failed with ${response.status}: ${message}`);
  }

  return { response, body };
}

async function main() {
  const config = {
    ...getConfig(),
    nodeEnv: 'test'
  };
  ensureReady(config);

  const app = createApp({ config });
  const server = app.listen(0);
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}/api`;
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const firstEmail = `smoke-${suffix}@example.com`;
  const secondEmail = `smoke-other-${suffix}@example.com`;
  const password = 'securepass123';

  try {
    await requestJson(baseUrl, '/health');

    await requestJson(baseUrl, '/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email: firstEmail, password })
    });

    const firstLogin = await requestJson(baseUrl, '/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: firstEmail, password })
    });
    const firstToken = firstLogin.body.accessToken;

    await requestJson(baseUrl, '/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email: secondEmail, password })
    });

    const secondLogin = await requestJson(baseUrl, '/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: secondEmail, password })
    });
    const secondToken = secondLogin.body.accessToken;

    const created = await requestJson(baseUrl, '/todos', {
      method: 'POST',
      headers: { Authorization: `Bearer ${firstToken}` },
      body: JSON.stringify({ content: 'Smoke test todo' })
    });
    const todoId = created.body.todo.id;

    await requestJson(baseUrl, '/todos?sort=createdAtDesc', {
      headers: { Authorization: `Bearer ${firstToken}` }
    });

    await requestJson(baseUrl, `/todos/${todoId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${firstToken}` },
      body: JSON.stringify({ isCompleted: true })
    });

    const unauthorizedDelete = await fetch(`${baseUrl}/todos/${todoId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${secondToken}` }
    });

    if (unauthorizedDelete.status !== 404) {
      throw new Error(`Expected cross-user delete to return 404, got ${unauthorizedDelete.status}.`);
    }

    await requestJson(baseUrl, `/todos/${todoId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${firstToken}` }
    });

    await fetch(`${baseUrl}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${firstToken}` }
    });

    console.log('Smoke test passed.');
  } finally {
    await query('DELETE FROM public.users WHERE email = ANY($1::text[])', [[firstEmail, secondEmail]])
      .catch(() => undefined);
    server.close();
    await closePool();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
