import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { blogs, users } from '@/db/schema';
import { and, desc, eq } from 'drizzle-orm';
import { blogStatusEnum } from '@/db/schema';

const ITEMS_PER_PAGE = 10;

export async function GET(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const status = searchParams.get('status') || 'PUBLISHED';
    const username = params.username;

    // Get user first
    const user = await db.query.users.findFirst({
      where: eq(users.username, username),
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate offset
    const offset = (page - 1) * ITEMS_PER_PAGE;

    // Get blogs with pagination
    const userBlogs = await db.query.blogs.findMany({
      where: and(
        eq(blogs.authorId, user.id),
        eq(
          blogs.blogStatus,
          status as (typeof blogStatusEnum.enumValues)[number]
        )
      ),
      orderBy: [desc(blogs.createdAt)],
      limit: ITEMS_PER_PAGE + 1, // Get one extra to determine if there's a next page
      offset: offset,
    });

    // Determine if there's a next page
    const hasNextPage: boolean = userBlogs.length > ITEMS_PER_PAGE;
    const resultBlogs: (typeof blogs.$inferSelect)[] = hasNextPage
      ? userBlogs.slice(0, -1)
      : userBlogs;

    // Calculate cursors
    const nextCursor = hasNextPage ? page + 1 : null;
    const prevCursor = page > 1 ? page - 1 : null;

    return NextResponse.json({
      blogs: resultBlogs,
      pagination: {
        nextCursor,
        prevCursor,
        total: Math.ceil(resultBlogs.length / ITEMS_PER_PAGE),
      },
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
