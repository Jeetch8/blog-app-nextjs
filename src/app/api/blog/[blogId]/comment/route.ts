import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/db/drizzle';
import { blogComments, blogs, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { desc } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

export async function GET(
  req: NextRequest,
  { params }: { params: { blogId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 15;
    const offset = (page - 1) * limit;

    const comments = await db
      .select({
        id: blogComments.id,
        content: blogComments.content,
        createdAt: blogComments.createdAt,
        user: {
          name: users.name,
          image: users.image,
          username: users.username,
        },
      })
      .from(blogComments)
      .leftJoin(users, eq(blogComments.userId, users.id))
      .where(eq(blogComments.blogId, params.blogId))
      .orderBy(desc(blogComments.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({ comments });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { blogId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content } = await req.json();
    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }
    const comment = await db.transaction(async (tx) => {
      const [comment] = await tx
        .insert(blogComments)
        .values({
          content,
          blogId: params.blogId,
          userId: session.user.id,
        })
        .returning();
      await tx
        .update(blogs)
        .set({
          numberOfComments: sql`${blogs.numberOfComments} + 1`,
        })
        .where(eq(blogs.id, params.blogId));
      return comment;
    });
    return NextResponse.json({ comment });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
