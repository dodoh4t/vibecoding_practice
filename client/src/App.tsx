import {
  FormEvent,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  AlertCircle,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  List,
  ListTodo,
  LogOut,
  Plus,
  Trash2,
} from 'lucide-react';
import { api } from './api';
import { AuthProvider } from './auth';
import { useAuth } from './auth-context';
import { ApiError, type Todo } from './types';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordPolicyMessage = 'Password must be at least 12 characters and include uppercase, lowercase, number, and symbol.';

function isStrongPassword(password: string) {
  return password.length >= 12
    && /[a-z]/.test(password)
    && /[A-Z]/.test(password)
    && /\d/.test(password)
    && /[^A-Za-z0-9]/.test(password)
    && !['12345678', '123456789', 'password123', 'Password123!'].includes(password);
}

function isAuthError(error: unknown) {
  return error instanceof ApiError && ['UNAUTHORIZED', 'TOKEN_EXPIRED'].includes(error.code);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

function toDateOnly(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function getMonthRange(date: Date) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return {
    from: toDateOnly(first),
    to: toDateOnly(last),
  };
}

function getCalendarCells(date: Date) {
  const firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const start = new Date(firstOfMonth);
  start.setDate(firstOfMonth.getDate() - firstOfMonth.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const cell = new Date(start);
    cell.setDate(start.getDate() + index);
    return cell;
  });
}

type RoutePath = '/login' | '/signup' | '/todos';

function normalizePath(pathname: string): RoutePath {
  if (pathname === '/login' || pathname === '/signup' || pathname === '/todos') {
    return pathname;
  }
  return '/todos';
}

function useRouter() {
  const [path, setPath] = useState<RoutePath>(() => normalizePath(window.location.pathname));
  const [routeState, setRouteState] = useState<unknown>(() => window.history.state?.usr);

  useEffect(() => {
    const handlePopState = () => {
      setPath(normalizePath(window.location.pathname));
      setRouteState(window.history.state?.usr);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((to: RoutePath, options: { replace?: boolean; state?: unknown } = {}) => {
    const historyState = { usr: options.state };
    if (options.replace) {
      window.history.replaceState(historyState, '', to);
    } else {
      window.history.pushState(historyState, '', to);
    }
    setPath(to);
    setRouteState(options.state);
  }, []);

  return { path, routeState, navigate };
}

function TextLink({
  to,
  navigate,
  children,
}: {
  to: RoutePath;
  navigate: (to: RoutePath) => void;
  children: ReactNode;
}) {
  return (
    <button
      className="font-semibold text-brand-600 hover:text-brand-700"
      type="button"
      onClick={() => navigate(to)}
    >
      {children}
    </button>
  );
}

function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-app-bg px-4 py-10">
      <section className="w-full max-w-[400px] rounded-2xl border border-line bg-surface p-6 shadow-soft sm:p-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-ui bg-brand-50 text-brand-600">
            <ListTodo aria-hidden="true" size={24} />
          </div>
          <div>
            <p className="text-xl font-bold leading-6 text-ink-900">dodoTodoList</p>
            <p className="text-sm font-medium text-ink-500">Personal tasks</p>
          </div>
        </div>
        {children}
      </section>
    </main>
  );
}

function FieldError({ id, message }: { id: string; message: string | null }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-2 text-sm font-medium text-error-600">
      {message}
    </p>
  );
}

function LoginPage() {
  const auth = useAuth();
  const { routeState, navigate } = useRouterContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const signupMessage = routeState && typeof routeState === 'object'
    ? (routeState as { message?: string }).message
    : undefined;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.login({ email, password });
      auth.setSession(response.accessToken, response.user);
      navigate('/todos', { replace: true });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to log in.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <h1 className="mb-6 text-2xl font-bold leading-tight text-ink-900">Log in</h1>
      {auth.notice ? (
        <div className="mb-4 rounded-ui border border-error-100 bg-error-50 p-3 text-sm font-medium text-error-600">
          {auth.notice}
        </div>
      ) : null}
      {signupMessage ? (
        <div className="mb-4 rounded-ui border border-green-100 bg-success-50 p-3 text-sm font-medium text-success-700">
          {signupMessage}
        </div>
      ) : null}
      <form className="grid gap-5" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-semibold text-ink-800" htmlFor="login-email">
            Email
          </label>
          <input
            id="login-email"
            className="auth-input"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="user@example.com"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-ink-800" htmlFor="login-password">
            Password
          </label>
          <input
            id="login-password"
            className="auth-input"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
          />
        </div>
        <button className="primary-button w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in...' : 'Log in'}
        </button>
        <FieldError id="login-error" message={error} />
      </form>
      <p className="mt-6 text-center text-sm font-medium text-ink-500">
        Do not have an account?{' '}
        <TextLink navigate={navigate} to="/signup">
          Sign up
        </TextLink>
      </p>
    </AuthLayout>
  );
}

function SignupPage() {
  const { navigate } = useRouterContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();
    if (!emailPattern.test(normalizedEmail)) {
      setError('Enter a valid email address.');
      return;
    }
    if (!isStrongPassword(password)) {
      setError(passwordPolicyMessage);
      return;
    }

    setIsSubmitting(true);
    try {
      await api.signup({ email: normalizedEmail, password });
      navigate('/login', {
        replace: true,
        state: { message: 'Account request accepted. Log in to continue.' },
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to create account.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <h1 className="mb-6 text-2xl font-bold leading-tight text-ink-900">Create account</h1>
      <form className="grid gap-5" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-semibold text-ink-800" htmlFor="signup-email">
            Email
          </label>
          <input
            id="signup-email"
            className="auth-input"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="user@example.com"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-ink-800" htmlFor="signup-password">
            Password
          </label>
          <input
            id="signup-password"
            className="auth-input"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 12 characters"
          />
          <p className="mt-2 text-sm font-medium text-ink-500">{passwordPolicyMessage}</p>
        </div>
        <button className="primary-button w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create account'}
        </button>
        <FieldError id="signup-error" message={error} />
      </form>
      <p className="mt-6 text-center text-sm font-medium text-ink-500">
        Already have an account?{' '}
        <TextLink navigate={navigate} to="/login">
          Log in
        </TextLink>
      </p>
    </AuthLayout>
  );
}

type FilterValue = 'all' | 'active' | 'completed';
type SortValue = 'createdAtDesc' | 'createdAtAsc';
type ViewMode = 'list' | 'month';

function TodoPage() {
  const auth = useAuth();
  const { navigate } = useRouterContext();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [content, setContent] = useState('');
  const [dueDate, setDueDate] = useState(() => toDateOnly(new Date()));
  const [filter, setFilter] = useState<FilterValue>('all');
  const [sort, setSort] = useState<SortValue>('createdAtDesc');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const completedCount = useMemo(
    () => todos.filter((todo) => todo.isCompleted).length,
    [todos],
  );

  const completedQuery = filter === 'all' ? undefined : String(filter === 'completed');
  const monthRange = getMonthRange(visibleMonth);
  const calendarCells = getCalendarCells(visibleMonth);
  const monthTitle = new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(visibleMonth);
  const todosByDate = useMemo(() => {
    return todos.reduce<Record<string, Todo[]>>((groups, todo) => {
      groups[todo.dueDate] = groups[todo.dueDate] || [];
      groups[todo.dueDate].push(todo);
      return groups;
    }, {});
  }, [todos]);

  const handleAuthFailure = useCallback((error: unknown) => {
    if (isAuthError(error)) {
      auth.clearSession(
        error instanceof ApiError && error.code === 'TOKEN_EXPIRED'
          ? 'Your session has expired. Please log in again.'
          : 'Authentication is required.',
      );
      navigate('/login', { replace: true });
      return true;
    }
    return false;
  }, [auth, navigate]);

  const loadTodos = useCallback(async () => {
    if (!auth.token) return;
    setIsLoading(true);
    setGlobalError(null);
    try {
      const response = await api.listTodos(auth.token, {
        completed: completedQuery,
        sort,
        from: viewMode === 'month' ? monthRange.from : undefined,
        to: viewMode === 'month' ? monthRange.to : undefined,
      });
      setTodos(response.todos);
    } catch (caught) {
      if (!handleAuthFailure(caught)) {
        setGlobalError(caught instanceof Error ? caught.message : 'Unable to load todos.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [auth.token, completedQuery, handleAuthFailure, monthRange.from, monthRange.to, sort, viewMode]);

  useEffect(() => {
    void loadTodos();
  }, [loadTodos]);

  async function handleAddTodo(event: FormEvent) {
    event.preventDefault();
    if (!auth.token) return;

    const trimmed = content.trim();
    setInputError(null);
    if (!trimmed) {
      setInputError('Todo content must not be empty.');
      return;
    }

    setIsAdding(true);
    try {
      await api.createTodo(auth.token, trimmed, dueDate);
      setContent('');
      await loadTodos();
    } catch (caught) {
      if (!handleAuthFailure(caught)) {
        setInputError(caught instanceof Error ? caught.message : 'Unable to add todo.');
      }
    } finally {
      setIsAdding(false);
    }
  }

  async function handleToggle(todo: Todo) {
    if (!auth.token) return;
    setPendingId(todo.id);
    setGlobalError(null);
    try {
      const response = await api.updateTodo(auth.token, todo.id, !todo.isCompleted);
      setTodos((current) => current.map((item) => (item.id === todo.id ? response.todo : item)));
      if (filter !== 'all') {
        await loadTodos();
      }
    } catch (caught) {
      if (!handleAuthFailure(caught)) {
        setGlobalError(caught instanceof Error ? caught.message : 'Unable to update todo.');
      }
    } finally {
      setPendingId(null);
    }
  }

  async function handleDelete(todo: Todo) {
    if (!auth.token) return;
    setPendingId(todo.id);
    setGlobalError(null);
    try {
      await api.deleteTodo(auth.token, todo.id);
      setTodos((current) => current.filter((item) => item.id !== todo.id));
    } catch (caught) {
      if (!handleAuthFailure(caught)) {
        setGlobalError(caught instanceof Error ? caught.message : 'Unable to delete todo.');
      }
    } finally {
      setPendingId(null);
    }
  }

  async function handleLogout() {
    if (auth.token) {
      await api.logout(auth.token).catch(() => undefined);
    }
    auth.clearSession();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-app-bg">
      <header className="sticky top-0 z-20 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-ui bg-brand-50 text-brand-600">
              <ListTodo aria-hidden="true" size={22} />
            </div>
            <p className="text-lg font-bold text-ink-900">dodoTodoList</p>
          </div>
          <div className="flex flex-col gap-2 text-sm font-medium text-ink-500 sm:flex-row sm:items-center">
            <span className="max-w-full break-all text-ink-700">{auth.user?.email}</span>
            <button className="secondary-button w-full sm:w-auto" type="button" onClick={handleLogout}>
              <LogOut aria-hidden="true" size={16} />
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-4xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-6">
          <h1 className="text-xl font-bold text-ink-900 sm:text-2xl">All todos</h1>
          <form className="mt-5 grid gap-3 sm:grid-cols-[1fr_11rem_auto]" onSubmit={handleAddTodo}>
            <div>
              <label className="sr-only" htmlFor="todo-content">
                Add a todo
              </label>
              <input
                id="todo-content"
                className={`auth-input ${inputError ? 'auth-input-error' : ''}`}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Write a new todo..."
                disabled={isAdding}
                aria-describedby={inputError ? 'todo-content-error' : undefined}
              />
              <FieldError id="todo-content-error" message={inputError} />
            </div>
            <label className="grid gap-2 text-sm font-semibold text-ink-800 sm:w-44">
              <span className="sr-only">Todo date</span>
              <input
                className="auth-input"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                disabled={isAdding}
              />
            </label>
            <button className="primary-button w-full sm:w-auto" type="submit" disabled={isAdding}>
              <Plus aria-hidden="true" size={18} />
              {isAdding ? 'Adding...' : 'Add'}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto_auto] lg:items-end">
            <div>
              <p className="text-sm font-semibold text-ink-500">Summary</p>
              <p className="mt-1 text-base font-bold text-ink-900">
                {todos.length} total / {completedCount} completed
              </p>
            </div>
            <div className="grid gap-2 text-sm font-semibold text-ink-800">
              View
              <div className="grid grid-cols-2 rounded-ui border border-line bg-slate-50 p-1">
                <button
                  className={`inline-flex h-9 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold transition-colors ${
                    viewMode === 'list' ? 'bg-surface text-brand-600 shadow-card' : 'text-ink-500 hover:text-ink-700'
                  }`}
                  type="button"
                  onClick={() => setViewMode('list')}
                >
                  <List aria-hidden="true" size={15} />
                  List
                </button>
                <button
                  className={`inline-flex h-9 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold transition-colors ${
                    viewMode === 'month' ? 'bg-surface text-brand-600 shadow-card' : 'text-ink-500 hover:text-ink-700'
                  }`}
                  type="button"
                  onClick={() => setViewMode('month')}
                >
                  <CalendarDays aria-hidden="true" size={15} />
                  Month
                </button>
              </div>
            </div>
            <label className="grid gap-2 text-sm font-semibold text-ink-800">
              Show
              <span className="relative">
                <select
                  className="h-11 w-full appearance-none rounded-ui border border-line bg-surface px-3 pr-9 text-sm font-semibold text-ink-700 focus:border-brand-500 focus:outline-none focus:shadow-input md:w-36"
                  value={filter}
                  onChange={(event) => setFilter(event.target.value as FilterValue)}
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-3 text-ink-500" size={16} />
              </span>
            </label>
            <label className="grid gap-2 text-sm font-semibold text-ink-800">
              Sort
              <span className="relative">
                <select
                  className="h-11 w-full appearance-none rounded-ui border border-line bg-surface px-3 pr-9 text-sm font-semibold text-ink-700 focus:border-brand-500 focus:outline-none focus:shadow-input md:w-40"
                  value={sort}
                  onChange={(event) => setSort(event.target.value as SortValue)}
                >
                  <option value="createdAtDesc">Newest first</option>
                  <option value="createdAtAsc">Oldest first</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-3 text-ink-500" size={16} />
              </span>
            </label>
          </div>

          {globalError ? (
            <div className="mt-5 flex gap-2 rounded-ui border border-error-100 bg-error-50 p-3 text-sm font-medium text-error-600">
              <AlertCircle aria-hidden="true" size={18} />
              <p>{globalError}</p>
            </div>
          ) : null}

          <div className="mt-6" aria-live="polite">
            {isLoading ? (
              <div className="rounded-ui border border-dashed border-line bg-slate-50 p-8 text-center text-sm font-medium text-ink-500">
                Loading todos...
              </div>
            ) : viewMode === 'month' ? (
              <CalendarMonth
                cells={calendarCells}
                monthDate={visibleMonth}
                monthTitle={monthTitle}
                todosByDate={todosByDate}
                onPrevious={() => setVisibleMonth((current) => addMonths(current, -1))}
                onNext={() => setVisibleMonth((current) => addMonths(current, 1))}
                onToday={() => setVisibleMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}
              />
            ) : todos.length === 0 ? (
              <div className="rounded-ui border border-dashed border-line bg-slate-50 p-8 text-center">
                <p className="text-base font-bold text-ink-900">No todos yet.</p>
                <p className="mt-2 text-sm font-medium text-ink-500">Add your first todo above.</p>
              </div>
            ) : (
              <ul className="grid gap-3">
                {todos.map((todo) => (
                  <li
                    className={`flex gap-3 rounded-ui border border-line bg-surface p-4 transition-colors hover:border-brand-200 hover:bg-brand-50/30 ${
                      todo.isCompleted ? 'bg-slate-50' : ''
                    }`}
                    key={todo.id}
                  >
                    <button
                      className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded border border-line text-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-100 disabled:opacity-50"
                      type="button"
                      aria-label={`${todo.isCompleted ? 'Mark incomplete' : 'Mark complete'}: ${todo.content}`}
                      aria-pressed={todo.isCompleted}
                      disabled={pendingId === todo.id}
                      onClick={() => void handleToggle(todo)}
                    >
                      {todo.isCompleted ? <Check aria-hidden="true" size={16} /> : null}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`break-words text-base font-semibold leading-6 sm:text-lg ${
                          todo.isCompleted ? 'text-ink-500 line-through' : 'text-ink-800'
                        }`}
                      >
                        {todo.content}
                      </p>
                      <p className="mt-1 text-sm leading-5 text-ink-500">
                        Created {formatDate(todo.createdAt)}
                        {todo.isCompleted ? ' · Completed' : ''}
                      </p>
                    </div>
                    <button
                      className="danger-button shrink-0"
                      type="button"
                      aria-label={`Delete todo: ${todo.content}`}
                      disabled={pendingId === todo.id}
                      onClick={() => void handleDelete(todo)}
                    >
                      <Trash2 aria-hidden="true" size={16} />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function CalendarMonth({
  cells,
  monthDate,
  monthTitle,
  todosByDate,
  onPrevious,
  onNext,
  onToday,
}: {
  cells: Date[];
  monthDate: Date;
  monthTitle: string;
  todosByDate: Record<string, Todo[]>;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}) {
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = toDateOnly(new Date());

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold text-ink-900">{monthTitle}</h2>
        <div className="flex items-center gap-2">
          <button className="secondary-button h-9 px-3" type="button" onClick={onPrevious} aria-label="Previous month">
            <ChevronLeft aria-hidden="true" size={16} />
          </button>
          <button className="secondary-button h-9 px-3" type="button" onClick={onToday}>
            Today
          </button>
          <button className="secondary-button h-9 px-3" type="button" onClick={onNext} aria-label="Next month">
            <ChevronRight aria-hidden="true" size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 overflow-hidden rounded-ui border border-line bg-surface">
        {weekdays.map((day) => (
          <div className="border-b border-line bg-slate-50 px-2 py-2 text-center text-xs font-bold text-ink-500" key={day}>
            {day}
          </div>
        ))}
        {cells.map((cell) => {
          const dateKey = toDateOnly(cell);
          const dayTodos = todosByDate[dateKey] || [];
          const isCurrentMonth = cell.getMonth() === monthDate.getMonth();
          const isToday = dateKey === today;

          return (
            <div
              className={`min-h-28 border-b border-r border-line p-2 last:border-r-0 ${
                isCurrentMonth ? 'bg-surface' : 'bg-slate-50/70'
              }`}
              key={dateKey}
            >
              <div
                className={`mb-2 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                  isToday
                    ? 'bg-brand-600 text-white'
                    : isCurrentMonth
                      ? 'text-ink-800'
                      : 'text-ink-300'
                }`}
              >
                {cell.getDate()}
              </div>
              <div className="grid gap-1">
                {dayTodos.slice(0, 3).map((todo) => (
                  <div
                    className={`truncate rounded-md px-2 py-1 text-xs font-semibold ${
                      todo.isCompleted
                        ? 'bg-slate-100 text-ink-500 line-through'
                        : 'bg-brand-50 text-brand-700'
                    }`}
                    key={todo.id}
                    title={todo.content}
                  >
                    {todo.content}
                  </div>
                ))}
                {dayTodos.length > 3 ? (
                  <p className="px-2 text-xs font-semibold text-ink-500">+{dayTodos.length - 3} more</p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const { navigate } = useRouterContext();

  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [auth.isAuthenticated, navigate]);

  if (!auth.isAuthenticated) {
    return null;
  }
  return <>{children}</>;
}

function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const { navigate } = useRouterContext();

  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate('/todos', { replace: true });
    }
  }, [auth.isAuthenticated, navigate]);

  if (auth.isAuthenticated) {
    return null;
  }
  return <>{children}</>;
}

type RouterContextValue = ReturnType<typeof useRouter>;
const RouterContext = createContext<RouterContextValue | null>(null);

function useRouterContext() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouterContext must be used within RouterContext.');
  }
  return context;
}

function AppRoutes() {
  const router = useRouter();

  useEffect(() => {
    const normalized = normalizePath(window.location.pathname);
    if (window.location.pathname !== normalized) {
      router.navigate(normalized, { replace: true });
    }
  }, [router]);

  let page: ReactNode;

  if (router.path === '/login') {
    page = (
      <PublicOnlyRoute>
        <LoginPage />
      </PublicOnlyRoute>
    );
  } else if (router.path === '/signup') {
    page = (
      <PublicOnlyRoute>
        <SignupPage />
      </PublicOnlyRoute>
    );
  } else {
    page = (
      <ProtectedRoute>
        <TodoPage />
      </ProtectedRoute>
    );
  }

  return (
    <RouterContext.Provider value={router}>
      {page}
    </RouterContext.Provider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
