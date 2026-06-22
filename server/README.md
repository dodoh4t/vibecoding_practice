# dodoTodoList Backend

Express backend for the dodoTodoList MVP. It uses Supabase PostgreSQL through `pg` and implements backend-managed JWT authentication.

## Setup

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

Required environment variables:

- `DATABASE_URL`: Supabase PostgreSQL connection string
- `JWT_SECRET`: long random signing secret
- `JWT_EXPIRES_IN`: JWT lifetime, for example `1h`
- `CLIENT_ORIGIN`: frontend origin for CORS
- `PORT`: local API port

## API

All application routes are mounted under `/api`.

- `GET /api/health`
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/todos`
- `POST /api/todos`
- `PATCH /api/todos/:todoId`
- `DELETE /api/todos/:todoId`

The live Supabase schema uses `BIGSERIAL` IDs, so API IDs are returned as strings but validated as positive integer strings.
