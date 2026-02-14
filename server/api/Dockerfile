FROM node:20-alpine AS base
WORKDIR /app

# Install all dependencies (including devDependencies for tsx)
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY server/api/package.json server/api/
RUN npm ci 2>/dev/null || npm install

# Build shared package
COPY tsconfig.base.json ./
COPY packages/shared/ packages/shared/
RUN npm run build -w @hive/shared

# Copy API source and drizzle migrations
COPY server/api/ server/api/

# Build API
RUN npm run build -w @hive/api

EXPOSE 3000

# Run migrations then start server
WORKDIR /app/server/api
CMD ["sh", "-c", "npx tsx src/db/migrate.ts && node dist/index.js"]
