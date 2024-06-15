import { db } from '@/db/drizzle';
import { and, count, desc } from 'drizzle-orm';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import * as schema from '@/db/schema';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getPersonalizedFeed } from '@/db_access/feed';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const page = 1 || req.nextUrl.searchParams.get('page');
  const pageSize = 15;
  const skip = (page - 1) * pageSize;

  const blogs = await db.query.blogs.findMany({
    with: {
      author: {
        columns: {
          name: true,
          image: true,
          username: true,
        },
      },
      likes: {
        limit: 1,
      },
      categoryBlogs: {
        limit: 1,
        where: (categoryBlogs, { eq }) =>
          eq(categoryBlogs.bookmarkedByUserId, session?.user.id as string),
      },
    },
    limit: pageSize,
    offset: skip,
    orderBy: desc(schema.blogs.createdAt),
  });
  const blogCount = await db
    .select({ count: count() })
    .from(schema.blogs)
    .where(eq(schema.blogs.blogStatus, schema.blogStatusEnum.enumValues[1]));

  const personalizedFeed = await getPersonalizedFeed({
    userId: session?.user.id,
  });
  const totalNumberOfPages = Math.ceil(blogCount[0].count / pageSize);
  const nextPage = page + 1 > totalNumberOfPages ? page : page + 1;

  return NextResponse.json({
    personalizedFeed,
    blogs,
    nextCursor: nextPage,
    prevCursor: page - 1,
    totalPages: totalNumberOfPages,
  });
}
