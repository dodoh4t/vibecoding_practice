class AppError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
  }
}

function validationError(message) {
  return new AppError(400, 'VALIDATION_ERROR', message);
}

function unauthorized(message = 'Authentication is required.') {
  return new AppError(401, 'UNAUTHORIZED', message);
}

function tokenExpired() {
  return new AppError(401, 'TOKEN_EXPIRED', 'Your session has expired. Please log in again.');
}

function todoNotFound() {
  return new AppError(404, 'TODO_NOT_FOUND', 'Todo was not found.');
}

function sendError(res, error) {
  const status = error.status || 500;
  const code = error.code || 'INTERNAL_SERVER_ERROR';
  const message = error.status
    ? error.message
    : 'An unexpected error occurred.';

  return res.status(status).json({
    error: {
      code,
      message
    }
  });
}

module.exports = {
  AppError,
  validationError,
  unauthorized,
  tokenExpired,
  todoNotFound,
  sendError
};
