import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/db/drizzle';
import { z } from 'zod';
import {
  users,
  profiles,
  accounts,
  sessions,
  blogs,
  blogStats,
  blogLikes,
  blogComments,
  readingHistories,
  bookmarkCategories,
  bookmarkCategoryBlogs,
} from '@/db/schema';
import { eq } from 'drizzle-orm';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  username: z.string().min(6, 'Username must be at least 6 characters'),
  profileTagline: z.string().max(100).optional(),
  location: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  techStack: z.array(z.string()),
  availableFor: z.string().max(200).optional(),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  twitterUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
});

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validatedData = profileSchema.parse(body);

    const updatedUser = await db.transaction(async (tx) => {
      const [user] = await tx
        .update(users)
        .set({
          name: validatedData.fullName,
          email: validatedData.email,
          username: validatedData.username,
        })
        .where(eq(users.email, session.user.email))
        .returning();

      await tx
        .insert(profiles)
        .values({
          userId: user.id,
          tagline: validatedData.profileTagline,
          location: validatedData.location,
          bio: validatedData.bio,
          techStack: validatedData.techStack.join(','),
          availableFor: validatedData.availableFor,
          websiteUrl: validatedData.websiteUrl,
          twitterUrl: validatedData.twitterUrl,
          githubUrl: validatedData.githubUrl,
          linkedinUrl: validatedData.linkedinUrl,
        })
        .onConflictDoUpdate({
          target: profiles.userId,
          set: {
            tagline: validatedData.profileTagline,
            location: validatedData.location,
            bio: validatedData.bio,
            techStack: validatedData.techStack.join(','),
            availableFor: validatedData.availableFor,
            websiteUrl: validatedData.websiteUrl,
            twitterUrl: validatedData.twitterUrl,
            githubUrl: validatedData.githubUrl,
            linkedinUrl: validatedData.linkedinUrl,
          },
        });

      return user;
    });

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating the profile' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await db.transaction(async (tx) => {
      const userBlogs = await tx
        .select({ id: blogs.id })
        .from(blogs)
        .where(eq(blogs.authorId, session.user.id));

      const blogIds = userBlogs.map((blog) => blog.id);

      // Delete all related data
      await tx.delete(blogStats).where(eq(blogStats.blogId, blogIds[0]));
      await tx.delete(blogLikes).where(eq(blogLikes.blogId, blogIds[0]));
      await tx.delete(blogComments).where(eq(blogComments.blogId, blogIds[0]));
      await tx
        .delete(readingHistories)
        .where(eq(readingHistories.blogId, blogIds[0]));
      await tx
        .delete(bookmarkCategoryBlogs)
        .where(eq(bookmarkCategoryBlogs.blogId, blogIds[0]));
      await tx.delete(blogs).where(eq(blogs.authorId, session.user.id));

      // Delete user's bookmark categories
      await tx
        .delete(bookmarkCategories)
        .where(eq(bookmarkCategories.userId, session.user.id));

      // Delete user's profile
      await tx.delete(profiles).where(eq(profiles.userId, session.user.id));

      // Delete user's sessions and accounts
      await tx.delete(sessions).where(eq(sessions.userId, session.user.id));
      await tx.delete(accounts).where(eq(accounts.userId, session.user.id));

      // Finally, delete the user
      await tx.delete(users).where(eq(users.email, session.user.email));
    });

    return NextResponse.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting the account' },
      { status: 500 }
    );
  }
}
