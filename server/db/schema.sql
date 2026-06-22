CREATE TABLE IF NOT EXISTS public.users (
    id BIGSERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT users_email_format_chk
        CHECK (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'),
    CONSTRAINT users_email_lowercase_chk
        CHECK (email = lower(email))
);

CREATE SCHEMA IF NOT EXISTS private;

REVOKE ALL ON SCHEMA private FROM anon, authenticated;

CREATE TABLE IF NOT EXISTS public.todos (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    due_date DATE NOT NULL DEFAULT CURRENT_DATE,
    CONSTRAINT todos_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES public.users(id)
        ON DELETE CASCADE,
    CONSTRAINT todos_content_not_blank_chk
        CHECK (length(btrim(content)) > 0)
);

CREATE TABLE IF NOT EXISTS private.revoked_tokens (
    id BIGSERIAL PRIMARY KEY,
    token_jti TEXT NOT NULL,
    user_id BIGINT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT revoked_tokens_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES public.users(id)
        ON DELETE CASCADE,
    CONSTRAINT revoked_tokens_token_jti_not_blank_chk
        CHECK (length(btrim(token_jti)) > 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_idx
    ON public.users (email);

CREATE INDEX IF NOT EXISTS todos_user_id_created_at_idx
    ON public.todos (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS todos_user_id_is_completed_idx
    ON public.todos (user_id, is_completed);

CREATE INDEX IF NOT EXISTS todos_user_id_due_date_idx
    ON public.todos (user_id, due_date);

CREATE INDEX IF NOT EXISTS todos_created_at_idx
    ON public.todos (created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS revoked_tokens_token_jti_unique_idx
    ON private.revoked_tokens (token_jti);

CREATE INDEX IF NOT EXISTS revoked_tokens_user_id_idx
    ON private.revoked_tokens (user_id);

CREATE INDEX IF NOT EXISTS revoked_tokens_expires_at_idx
    ON private.revoked_tokens (expires_at);

REVOKE ALL ON ALL TABLES IN SCHEMA private FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA private FROM anon, authenticated;
