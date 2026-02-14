import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL || 'postgres://hive:hive@localhost:5432/hive';
export const sql = postgres(connectionString);
