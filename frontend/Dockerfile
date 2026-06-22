# syntax=docker/dockerfile:1

# Shared base: dependencies installed once.
FROM oven/bun:1 AS base
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Dev: source is bind-mounted at runtime, hot-reload via next dev.
FROM base AS dev
EXPOSE 3000
CMD ["bun", "run", "dev"]

# Prod: source baked in, built once. NEXT_PUBLIC_API_URL is relative (/api),
# so one image serves both staging and production behind Nginx.
FROM base AS prod
ARG NEXT_PUBLIC_API_URL=/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY . .
RUN bun run build
EXPOSE 3000
CMD ["bun", "run", "start"]
