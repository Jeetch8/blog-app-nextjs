import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@prisma_client/prisma';
import { z } from 'zod';

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

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: validatedData.fullName,
        email: validatedData.email,
        username: validatedData.username,
        profile: {
          upsert: {
            create: {
              tagline: validatedData.profileTagline,
              location: validatedData.location,
              bio: validatedData.bio,
              tech_stack: validatedData.techStack.join(','),
              available_for: validatedData.availableFor,
              website_url: validatedData.websiteUrl,
              twitter_url: validatedData.twitterUrl,
              github_url: validatedData.githubUrl,
              linkedin_url: validatedData.linkedinUrl,
            },
            update: {
              tagline: validatedData.profileTagline,
              location: validatedData.location,
              bio: validatedData.bio,
              tech_stack: validatedData.techStack.join(','),
              available_for: validatedData.availableFor,
              website_url: validatedData.websiteUrl,
              twitter_url: validatedData.twitterUrl,
              github_url: validatedData.githubUrl,
              linkedin_url: validatedData.linkedinUrl,
            },
          },
        },
      },
      include: { profile: true },
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
