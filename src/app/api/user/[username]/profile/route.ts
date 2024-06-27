import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/db/drizzle';
import { users, profiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const profileUpdateSchema = z.object({
  name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  username: z.string().min(6, 'Username must be at least 6 characters'),
  image: z.string().url().optional(),
  tagline: z.string().max(100).optional(),
  location: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  techStack: z.array(z.string()),
  availableFor: z.string().max(200).optional(),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  twitterUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is updating their own profile
    if (session.user.username !== params.username) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = await req.json();
    const validatedData = profileUpdateSchema.parse(data);

    // Start transaction
    const result = await db.transaction(async (tx) => {
      // Update user
      const updatedUser = await tx
        .update(users)
        .set({
          name: validatedData.name,
          email: validatedData.email,
          username: validatedData.username,
          image: validatedData.image,
          updatedAt: new Date(),
        })
        .where(eq(users.username, params.username))
        .returning();

      // Update or create profile
      const existingProfile = await tx.query.profiles.findFirst({
        where: eq(profiles.userId, session.user.id),
      });

      const profileData = {
        tagline: validatedData.tagline,
        location: validatedData.location,
        bio: validatedData.bio,
        techStack: validatedData.techStack.join(','),
        availableFor: validatedData.availableFor,
        websiteUrl: validatedData.websiteUrl,
        twitterUrl: validatedData.twitterUrl,
        githubUrl: validatedData.githubUrl,
        linkedinUrl: validatedData.linkedinUrl,
        updatedAt: new Date(),
      };

      let updatedProfile;
      if (existingProfile) {
        updatedProfile = await tx
          .update(profiles)
          .set(profileData)
          .where(eq(profiles.userId, session.user.id))
          .returning();
      } else {
        updatedProfile = await tx
          .insert(profiles)
          .values({
            ...profileData,
            userId: session.user.id,
          })
          .returning();
      }

      return {
        user: updatedUser[0],
        profile: updatedProfile[0],
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Profile update error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
