import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@/db/schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl:
    process.env.NODE_ENV !== 'production'
      ? false
      : {
          rejectUnauthorized: false,
        },
  max: 20,
  idleTimeoutMillis: 60000, // Increased from 30000
  connectionTimeoutMillis: 10000, // Increased from 2000
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

// Add error handling
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Add connection validation
pool.on('connect', async (client) => {
  try {
    await client.query('SELECT 1');
  } catch (err) {
    console.error('Connection validation failed:', err);
    client.release(true);
  }
});

export const db = drizzle(pool, { schema });
export { pool };
