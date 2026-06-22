export type User = {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export type Todo = {
  id: string;
  userId: string;
  content: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'EMAIL_ALREADY_EXISTS'
  | 'INVALID_CREDENTIALS'
  | 'UNAUTHORIZED'
  | 'TOKEN_EXPIRED'
  | 'TODO_NOT_FOUND'
  | 'INTERNAL_SERVER_ERROR';

export type ApiErrorBody = {
  error: {
    code: ApiErrorCode;
    message: string;
  };
};

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}
