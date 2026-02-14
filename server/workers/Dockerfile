FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY server/workers/package.json server/workers/
RUN npm ci 2>/dev/null || npm install

# Build shared package
COPY tsconfig.base.json ./
COPY packages/shared/ packages/shared/
RUN npm run build -w @hive/shared

# Build workers
COPY server/workers/ server/workers/
RUN npm run build -w @hive/workers

CMD ["node", "server/workers/dist/index.js"]
