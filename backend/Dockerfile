# Dev image for the FastAPI backend — uses uv, runs uvicorn with --reload.
# The source is bind-mounted in docker-compose, so code changes are live.
FROM python:3.13-slim

# Install uv (single static binary) from the official image.
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# System deps occasionally needed by Python wheels (kept minimal).
# build-essential: for wheels that compile · libmagic1: python-magic file sniffing · curl: healthchecks
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential curl libmagic1 \
    && rm -rf /var/lib/apt/lists/*

ENV UV_LINK_MODE=copy \
    UV_COMPILE_BYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install dependencies first (cached layer). Only the lock + manifest are
# needed here; the app code arrives via the bind mount at runtime.
COPY pyproject.toml uv.lock ./
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-install-project

# Make the venv the default interpreter.
ENV PATH="/app/.venv/bin:$PATH"

EXPOSE 8001

# Run migrations, then start the dev server with auto-reload.
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload"]
