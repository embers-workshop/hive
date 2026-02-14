FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app

# Install dependencies
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY app/web/package.json app/web/
RUN pnpm install --frozen-lockfile 2>/dev/null || pnpm install

# Build web app
COPY app/web/ app/web/
RUN pnpm --filter @hive/web build

EXPOSE 3001
CMD ["pnpm", "--filter", "@hive/web", "start"]
