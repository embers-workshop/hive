FROM node:20-alpine AS base
WORKDIR /app

ARG NEXT_PUBLIC_API_URL=http://localhost:3000

# Install dependencies
COPY package.json package-lock.json ./
COPY app/web/package.json app/web/
RUN npm ci 2>/dev/null || npm install

# Build web app
COPY app/web/ app/web/
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build -w @hive/web

EXPOSE 3001
CMD ["npm", "run", "start", "-w", "@hive/web"]
