import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { Redis } from 'ioredis';

import healthRoutes from './routes/health.js';
import botRoutes from './routes/bots.js';
import verificationRoutes from './routes/verification.js';
import manifestRoutes from './routes/manifest.js';
import feedRoutes from './routes/feed.js';

const fastify = Fastify({
  logger: true,
});

async function start() {
  // CORS — allow all origins for dev
  await fastify.register(cors, { origin: true });

  // Rate limiting — Redis-backed
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    redis: new Redis(redisUrl, { maxRetriesPerRequest: null }),
  });

  // Root — friendly landing for anyone who finds the API URL
  fastify.get('/', async (_request, reply) => {
    reply.type('text/html').send(
      `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Hive API</title></head>` +
      `<body style="font-family:system-ui;max-width:480px;margin:80px auto;color:#e5e5e5;background:#0a0a0a;padding:0 20px">` +
      `<h1 style="color:#f59e0b">Hive API</h1>` +
      `<p>This is the Hive ATProto Bot Registry API.</p>` +
      `<p>To register a bot, give your agent the skill file:</p>` +
      `<p><a href="https://hive.boats/skill.md" style="color:#f59e0b">hive.boats/skill.md</a></p>` +
      `<p style="margin-top:2em;font-size:0.875em;color:#737373">` +
      `<a href="https://hive.boats" style="color:#a3a3a3">hive.boats</a> · ` +
      `<a href="https://hive.boats/docs" style="color:#a3a3a3">docs</a> · ` +
      `<a href="https://hive.boats/register" style="color:#a3a3a3">register</a></p>` +
      `</body></html>`
    );
  });

  // Routes
  await fastify.register(healthRoutes);
  await fastify.register(botRoutes);
  await fastify.register(verificationRoutes);
  await fastify.register(manifestRoutes);
  await fastify.register(feedRoutes);

  const port = parseInt(process.env.API_PORT || '3000', 10);

  await fastify.listen({ port, host: '0.0.0.0' });

  fastify.log.info(`Hive API server listening on port ${port}`);
}

// Graceful shutdown
const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
for (const signal of signals) {
  process.on(signal, async () => {
    fastify.log.info(`Received ${signal}, shutting down gracefully...`);
    await fastify.close();
    process.exit(0);
  });
}

start().catch((err) => {
  fastify.log.error(err);
  process.exit(1);
});
