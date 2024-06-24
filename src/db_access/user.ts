import { db } from '@/db/drizzle';
import * as schema from '@/db/schema';
import { hash } from 'bcrypt';
import { eq } from 'drizzle-orm';

export const getUserById = async (id: string) => {
  const user = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, id));
  return user;
};

export const getUserByEmail = async (email: string) => {
  const user = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email.toLowerCase()));
  return user[0];
};

export const updateUserPassword = async (email: string, password: string) => {
  const hashedPassword = await hash(password, 10);
  return await db
    .update(schema.users)
    .set({ password: hashedPassword })
    .where(eq(schema.users.email, email.toLowerCase()));
};

export const getUserProfilePageInfo = async (username: string) => {
  const data = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.username, username.toLowerCase()))
    .innerJoin(schema.profiles, eq(schema.users.id, schema.profiles.userId));
  return data[0];
};

export const getUserUsername = async (username: string) => {
  const user = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.username, username.toLowerCase()));
  return user;
};

export const createUser = async (
  user: typeof schema.users.$inferInsert & { username: string; email: string },
  tx?: any
) => {
  const object = {
    ...user,
    username: user?.username?.toLowerCase(),
    email: user?.email?.toLowerCase(),
  };
  if (tx) {
    return await tx.insert(schema.users).values(object).returning();
  } else {
    return await db.insert(schema.users).values(object).returning();
  }
};
