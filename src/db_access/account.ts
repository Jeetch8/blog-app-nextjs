import * as schema from '@/db/schema';
import { db } from '@/db/drizzle';

export const createAccount = async (
  account: typeof schema.accounts.$inferInsert,
  tx?: any
) => {
  if (tx) {
    return await tx.insert(schema.accounts).values(account).returning();
  } else {
    return await db.insert(schema.accounts).values(account).returning();
  }
};
