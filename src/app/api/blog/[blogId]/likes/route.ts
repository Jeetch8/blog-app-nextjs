import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/db/drizzle';
import { blogLikes, blogs } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET(
  req: NextRequest,
  { params }: { params: { blogId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;
    const skip = (page - 1) * limit;

    const likes = await db.query.blogLikes.findMany({
      where: eq(blogLikes.blogId, params.blogId),
      with: {
        userThatLiked: {
          columns: {
            name: true,
            image: true,
            username: true,
          },
        },
      },
      orderBy: (likes, { desc }) => [desc(likes.createdAt)],
      limit: limit,
      offset: skip,
    });

    return NextResponse.json({ likes });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch likes' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { blogId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create like and increment blog likes count in a transaction
    const like = await db.transaction(async (tx) => {
      const [newLike] = await tx
        .insert(blogLikes)
        .values({
          userId: session.user.id,
          blogId: params.blogId,
        })
        .returning();

      await tx
        .update(blogs)
        .set({ numberOfLikes: sql`${blogs.numberOfLikes} + 1` })
        .where(eq(blogs.id, params.blogId));

      return newLike;
    });

    // Get the like with user details
    const likeWithUser = await db.query.blogLikes.findFirst({
      where: eq(blogLikes.id, like.id),
      with: {
        userThatLiked: {
          columns: {
            name: true,
            image: true,
            username: true,
          },
        },
      },
    });

    return NextResponse.json({ like: likeWithUser });
  } catch (error) {
    if ((error as any).code === '23505') {
      // Unique constraint violation in PostgreSQL
      return NextResponse.json(
        { error: 'Already liked this blog' },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to like blog' }, { status: 500 });
  }
}
