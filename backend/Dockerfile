# syntax=docker/dockerfile:1

# Shared base: uv, system libs, and the resolved virtualenv.
FROM python:3.13-slim AS base
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential curl libmagic1 \
    && rm -rf /var/lib/apt/lists/*
ENV UV_LINK_MODE=copy \
    UV_COMPILE_BYTECODE=1 \
    PYTHONUNBUFFERED=1
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-install-project
ENV PATH="/app/.venv/bin:$PATH"

# Dev: source is bind-mounted at runtime, auto-reload on change.
FROM base AS dev
EXPOSE 8001
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload"]

# Prod: code baked in, secrets injected at runtime via Infisical, gunicorn.
FROM base AS prod
RUN curl -1sLf 'https://artifacts-cli.infisical.com/setup.deb.sh' | bash \
    && apt-get install -y --no-install-recommends infisical \
    && rm -rf /var/lib/apt/lists/*
COPY . .
RUN chmod +x docker-entrypoint.sh
EXPOSE 8001
CMD ["./docker-entrypoint.sh"]
