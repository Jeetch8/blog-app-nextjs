import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@/db/schema';

// Create a PostgreSQL connection pool with configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait for a connection
});

// Initialize drizzle with the connection pool and schema
export const db = drizzle(pool, { schema });

// Export pool for potential direct usage
export { pool };
