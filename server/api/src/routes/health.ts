import { FastifyInstance } from 'fastify';

export default async function (fastify: FastifyInstance) {
  fastify.get('/health', async (_request, _reply) => {
    return {
      status: 'ok',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
    };
  });
}
