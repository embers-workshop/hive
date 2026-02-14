import { manifestFetchWorker } from './manifest-fetcher.js';
import { verificationCheckWorker } from './verification-checker.js';

console.log('[workers] Hive background workers starting...');
console.log('[workers] manifest-fetch and verification-check workers are running');

async function shutdown(): Promise<void> {
  console.log('[workers] Shutting down gracefully...');

  await Promise.allSettled([
    manifestFetchWorker.close(),
    verificationCheckWorker.close(),
  ]);

  console.log('[workers] All workers closed');
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
