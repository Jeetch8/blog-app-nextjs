import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { bookmarkCategories, users } from '@/db/schema';
import { hash } from 'bcrypt';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { createUser } from '@/db_access/user';
import { createUserProfile } from '@/db_access/profile';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedData.email));
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }
    const hashedPassword = await hash(validatedData.password, 10);
    const newUser = await db.transaction(async (tx) => {
      const user = await createUser(
        {
          username: validatedData.fullName,
          name: validatedData.fullName,
          email: validatedData.email,
          password: hashedPassword,
        },
        tx
      );
      await createUserProfile(
        {
          userId: user.id,
        },
        tx
      );
      return user;
    });
    const { password, ...userWithoutPassword } = newUser;
    return NextResponse.json(
      { message: 'User registered successfully', user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}
