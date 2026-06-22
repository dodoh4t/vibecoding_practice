import { ApiError, type ApiErrorBody, type Todo, type User } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

type RequestOptions = {
  method?: string;
  token?: string | null;
  body?: unknown;
  query?: Record<string, string | undefined>;
};

function buildUrl(path: string, query?: Record<string, string | undefined>) {
  const url = new URL(`${API_BASE_URL}${path}`);

  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(buildUrl(path, options.query), {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = data as ApiErrorBody | null;
    throw new ApiError(
      response.status,
      error?.error?.code || 'INTERNAL_SERVER_ERROR',
      error?.error?.message || 'An unexpected error occurred.',
    );
  }

  return data as T;
}

export const api = {
  signup(payload: { email: string; password: string }) {
    return request<{ message: string }>('/auth/signup', {
      method: 'POST',
      body: payload,
    });
  },
  login(payload: { email: string; password: string }) {
    return request<{ accessToken: string; tokenType: 'Bearer'; expiresIn: number; user: User }>(
      '/auth/login',
      {
        method: 'POST',
        body: payload,
      },
    );
  },
  logout(token: string) {
    return request<void>('/auth/logout', {
      method: 'POST',
      token,
    });
  },
  listTodos(
    token: string,
    params: {
      completed?: string;
      sort: 'createdAtDesc' | 'createdAtAsc';
      from?: string;
      to?: string;
    },
  ) {
    return request<{ todos: Todo[] }>('/todos', {
      token,
      query: {
        completed: params.completed,
        sort: params.sort,
        from: params.from,
        to: params.to,
      },
    });
  },
  createTodo(token: string, content: string, dueDate: string) {
    return request<{ todo: Todo }>('/todos', {
      method: 'POST',
      token,
      body: { content, dueDate },
    });
  },
  updateTodo(token: string, todoId: string, isCompleted: boolean) {
    return request<{ todo: Todo }>(`/todos/${todoId}`, {
      method: 'PATCH',
      token,
      body: { isCompleted },
    });
  },
  deleteTodo(token: string, todoId: string) {
    return request<void>(`/todos/${todoId}`, {
      method: 'DELETE',
      token,
    });
  },
};
