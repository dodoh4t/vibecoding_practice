const jwt = require('jsonwebtoken');
const { getConfig } = require('../config');
const { unauthorized, tokenExpired } = require('../errors');

function authenticate(req, _res, next) {
  const authHeader = req.get('authorization') || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(unauthorized());
  }

  try {
    const payload = jwt.verify(token, getConfig().jwtSecret);

    if (!payload.sub) {
      return next(unauthorized('Invalid authentication token.'));
    }

    req.user = {
      id: String(payload.sub),
      email: payload.email
    };

    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(tokenExpired());
    }

    return next(unauthorized('Invalid authentication token.'));
  }
}

module.exports = authenticate;
