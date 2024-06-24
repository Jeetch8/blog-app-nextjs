import * as schema from '@/db/schema';
import { db } from '@/db/drizzle';

export const createUserProfile = async (
  user: Partial<typeof schema.profiles.$inferInsert>,
  tx?: any
) => {
  if (tx) {
    await tx.insert(schema.profiles).values({ userId: user.id });
  } else {
    await db.insert(schema.profiles).values({ userId: user.id });
  }
};
