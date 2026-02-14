import { FastifyInstance } from 'fastify';
import crypto from 'node:crypto';
import { db } from '../db/index.js';
import { operators } from '../db/schema.js';

export default async function (fastify: FastifyInstance) {
  fastify.post<{
    Body: { name: string; email: string };
  }>('/operators', async (request, reply) => {
    const { name, email } = request.body;

    const apiKey = crypto.randomBytes(32).toString('hex');

    const [operator] = await db
      .insert(operators)
      .values({
        name,
        email,
        apiKey,
      })
      .returning();

    reply.code(201);
    return {
      success: true,
      data: {
        id: operator.id,
        name: operator.name,
        email: operator.email,
        api_key: operator.apiKey,
        verification_status: operator.verificationStatus,
        created_at: operator.createdAt,
        updated_at: operator.updatedAt,
      },
    };
  });
}
