import { Queue } from 'bullmq';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const manifestFetchQueue = new Queue('manifest-fetch', {
  connection: { url: redisUrl },
});

export const verificationCheckQueue = new Queue('verification-check', {
  connection: { url: redisUrl },
});
