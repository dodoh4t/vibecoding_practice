const DEFAULT_JWT_EXPIRES_IN = '1h';
const DEFAULT_PORT = 3000;
const DEFAULT_AUTH_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const DEFAULT_AUTH_RATE_LIMIT_MAX = 10;

function getConfig(env = process.env) {
  return {
    databaseUrl: env.DATABASE_URL,
    jwtSecret: env.JWT_SECRET,
    jwtExpiresIn: env.JWT_EXPIRES_IN || DEFAULT_JWT_EXPIRES_IN,
    clientOrigin: env.CLIENT_ORIGIN || 'http://localhost:5173',
    authRateLimitWindowMs: Number(env.AUTH_RATE_LIMIT_WINDOW_MS || DEFAULT_AUTH_RATE_LIMIT_WINDOW_MS),
    authRateLimitMax: Number(env.AUTH_RATE_LIMIT_MAX || DEFAULT_AUTH_RATE_LIMIT_MAX),
    port: Number(env.PORT || DEFAULT_PORT),
    nodeEnv: env.NODE_ENV || 'development'
  };
}

function assertRuntimeConfig(config) {
  const missing = [];

  if (!config.databaseUrl) missing.push('DATABASE_URL');
  if (!config.jwtSecret) missing.push('JWT_SECRET');

  if (missing.length > 0) {
    throw new Error(`Missing required environment variable(s): ${missing.join(', ')}`);
  }
}

module.exports = {
  getConfig,
  assertRuntimeConfig
};
