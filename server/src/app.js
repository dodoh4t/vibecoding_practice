const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/authRoutes');
const todoRoutes = require('./routes/todoRoutes');
const { docsRoutes, openApiYamlHandler } = require('./routes/docsRoutes');
const { getConfig } = require('./config');
const { sendError } = require('./errors');

function createApp(options = {}) {
  const config = options.config || getConfig();
  const app = express();
  app.disable('x-powered-by');

  const allowedOrigins = new Set([
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    ...String(config.clientOrigin || '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean)
  ]);

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        imgSrc: ["'self'", 'data:'],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'"]
      }
    },
    crossOriginEmbedderPolicy: false
  }));
  app.use(cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  }));
  app.use(express.json({ limit: '1mb' }));

  if (config.authRateLimitMax > 0) {
    const authRateLimiter = rateLimit({
      windowMs: config.authRateLimitWindowMs,
      limit: config.authRateLimitMax,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
      handler(_req, res) {
        return res.status(429).json({
          error: {
            code: 'RATE_LIMITED',
            message: 'Too many authentication attempts. Try again later.'
          }
        });
      }
    });

    app.use('/api/auth/login', authRateLimiter);
    app.use('/api/auth/signup', authRateLimiter);
  }

  app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.get('/api/openapi.yaml', openApiYamlHandler);
  app.use(...docsRoutes());
  app.use('/api/auth', authRoutes);
  app.use('/api/todos', todoRoutes);

  app.use((_req, res) => {
    res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: 'Route was not found.'
      }
    });
  });

  app.use((error, _req, res, _next) => {
    if (config.nodeEnv !== 'test') {
      console.error(error);
    }

    if (error.message === 'Not allowed by CORS') {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Origin is not allowed.'
        }
      });
    }

    return sendError(res, error);
  });

  return app;
}

module.exports = createApp;
