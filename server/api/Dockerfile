FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app

# Install dependencies
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/shared/package.json packages/shared/
COPY server/api/package.json server/api/
RUN pnpm install --frozen-lockfile 2>/dev/null || pnpm install

# Build shared package
COPY tsconfig.base.json ./
COPY packages/shared/ packages/shared/
RUN pnpm --filter @hive/shared build

# Build API
COPY server/api/ server/api/
RUN pnpm --filter @hive/api build

EXPOSE 3000
CMD ["node", "server/api/dist/index.js"]
