const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const todoRoutes = require('./routes/todoRoutes');
const { getConfig } = require('./config');
const { sendError } = require('./errors');

function createApp(options = {}) {
  const config = options.config || getConfig();
  const app = express();
  const allowedOrigins = new Set([
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    ...String(config.clientOrigin || '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean)
  ]);

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

  app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

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
