// import 'dotenv/config';
// import { defineConfig } from 'drizzle-kit';

// export default defineConfig({
//   out: './drizzle',
//   schema: './src/db/schema.ts',
//   dialect: 'postgresql',
//   dbCredentials: {
//     ssl: true,
//     url: process.env.DATABASE_URL!,
//   },
//   strict: true,
//   verbose: true,
// });

import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    ssl:
      process.env.NODE_ENV === 'production'
        ? {
            rejectUnauthorized: false,
          }
        : false,
    url: process.env.DATABASE_URL!,
  },
  strict: true,
  verbose: true,
});
