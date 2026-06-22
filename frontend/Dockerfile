# Dev image for the Next.js frontend — uses Bun, runs `next dev`.
# Source is bind-mounted in docker-compose, so changes hot-reload.
FROM oven/bun:1

WORKDIR /app

# Install dependencies first (cached layer).
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

EXPOSE 3000

CMD ["bun", "run", "dev"]
