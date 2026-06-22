const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const authenticate = require('../middleware/authenticate');
const usersRepository = require('../repositories/usersRepository');
const { getConfig } = require('../config');
const { AppError, validationError } = require('../errors');
const { formatUser } = require('../utils/formatters');
const { normalizeEmail, isValidEmail, isValidPassword } = require('../utils/validators');

const router = express.Router();
const SALT_ROUNDS = 12;
const DEFAULT_EXPIRES_IN_SECONDS = 3600;

function parseExpiresInSeconds(expiresIn) {
  if (typeof expiresIn === 'number') return expiresIn;
  if (/^\d+$/.test(expiresIn)) return Number(expiresIn);

  const match = /^(\d+)([smhd])$/.exec(expiresIn);
  if (!match) return DEFAULT_EXPIRES_IN_SECONDS;

  const amount = Number(match[1]);
  const unit = match[2];
  const multiplier = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400
  }[unit];

  return amount * multiplier;
}

router.post('/signup', asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const { password } = req.body;

  if (!isValidEmail(email)) {
    throw validationError('Enter a valid email address.');
  }

  if (!isValidPassword(password)) {
    throw validationError('Password must be at least 8 characters.');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  try {
    const user = await usersRepository.createUser({ email, passwordHash });
    return res.status(201).json({ user: formatUser(user) });
  } catch (error) {
    if (error.code === '23505') {
      throw new AppError(409, 'EMAIL_ALREADY_EXISTS', 'This email is already registered.');
    }

    throw error;
  }
}));

router.post('/login', asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const { password } = req.body;

  if (!email || typeof password !== 'string') {
    throw validationError('Email and password are required.');
  }

  const user = await usersRepository.findUserByEmail(email);
  const isPasswordValid = user
    ? await bcrypt.compare(password, user.password_hash)
    : false;

  if (!user || !isPasswordValid) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.');
  }

  const config = getConfig();
  const accessToken = jwt.sign(
    {
      email: user.email
    },
    config.jwtSecret,
    {
      subject: String(user.id),
      expiresIn: config.jwtExpiresIn
    }
  );

  return res.status(200).json({
    accessToken,
    tokenType: 'Bearer',
    expiresIn: parseExpiresInSeconds(config.jwtExpiresIn),
    user: formatUser(user)
  });
}));

router.post('/logout', authenticate, (_req, res) => {
  return res.status(204).send();
});

module.exports = router;
