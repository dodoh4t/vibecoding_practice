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

CREATE TABLE IF NOT EXISTS public.todos (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT todos_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES public.users(id)
        ON DELETE CASCADE,
    CONSTRAINT todos_content_not_blank_chk
        CHECK (length(btrim(content)) > 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_idx
    ON public.users (email);

CREATE INDEX IF NOT EXISTS todos_user_id_created_at_idx
    ON public.todos (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS todos_user_id_is_completed_idx
    ON public.todos (user_id, is_completed);

CREATE INDEX IF NOT EXISTS todos_created_at_idx
    ON public.todos (created_at DESC);
