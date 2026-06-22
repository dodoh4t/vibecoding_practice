const jwt = require('jsonwebtoken');
const { getConfig } = require('../config');
const revokedTokensRepository = require('../repositories/revokedTokensRepository');
const { unauthorized, tokenExpired } = require('../errors');

async function authenticate(req, _res, next) {
  const authHeader = req.get('authorization') || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(unauthorized());
  }

  try {
    const payload = jwt.verify(token, getConfig().jwtSecret);

    if (!payload.sub || !payload.jti || !payload.exp) {
      return next(unauthorized('Invalid authentication token.'));
    }

    const revoked = await revokedTokensRepository.isTokenRevoked(payload.jti);
    if (revoked) {
      return next(unauthorized('Invalid authentication token.'));
    }

    req.user = {
      id: String(payload.sub),
      email: payload.email
    };
    req.auth = {
      token,
      jti: payload.jti,
      expiresAt: new Date(payload.exp * 1000).toISOString()
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
