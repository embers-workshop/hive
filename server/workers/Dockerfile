FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app

# Install dependencies
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/shared/package.json packages/shared/
COPY server/workers/package.json server/workers/
RUN pnpm install --frozen-lockfile 2>/dev/null || pnpm install

# Build shared package
COPY tsconfig.base.json ./
COPY packages/shared/ packages/shared/
RUN pnpm --filter @hive/shared build

# Build workers
COPY server/workers/ server/workers/
RUN pnpm --filter @hive/workers build

CMD ["node", "server/workers/dist/index.js"]
