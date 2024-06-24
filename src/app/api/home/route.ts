import { db } from '@/db/drizzle';
import { and, count, desc, inArray, notInArray } from 'drizzle-orm';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import * as schema from '@/db/schema';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const page = 1 || req.nextUrl.searchParams.get('page');
  const pageSize = 15;
  const skip = (page - 1) * pageSize;
  let blogs = [];
  if (session?.user) {
    blogs = await db.transaction(async (tx) => {
      const feedHistory = await db.query.feedHistory.findMany({
        where: eq(schema.feedHistory.userId, session.user.id),
      });
      const blogsResult = await db.query.blogs.findMany({
        where: and(
          eq(schema.blogs.blogStatus, 'PUBLISHED'),
          notInArray(
            schema.blogs.id,
            feedHistory.map((history) => history.blogId)
          )
        ),
        with: {
          author: {
            columns: {
              id: true,
              name: true,
              image: true,
              username: true,
            },
          },
          categoryBlogs: {
            limit: 1,
            where: eq(
              schema.bookmarkCategoryBlogs.bookmarkedByUserId,
              session?.user.id as string
            ),
          },
        },
        limit: pageSize,
        offset: skip,
        orderBy: desc(schema.blogs.createdAt),
      });
      if (blogsResult.length === 0) return [];
      await tx.insert(schema.feedHistory).values(
        blogsResult.map((blog) => ({
          userId: session.user.id,
          blogId: blog.id,
        }))
      );
      return blogsResult;
    });
  } else {
    blogs = await db.query.blogs.findMany({
      where: eq(schema.blogs.blogStatus, 'PUBLISHED'),
      with: {
        author: {
          columns: {
            id: true,
            name: true,
            image: true,
            username: true,
          },
        },
      },
      limit: pageSize,
      offset: skip,
      orderBy: desc(schema.blogs.createdAt),
    });
  }

  return NextResponse.json({
    blogs,
    nextCursor: page + 1,
    prevCursor: page - 1,
    hasMore: blogs.length === pageSize,
  });
}
