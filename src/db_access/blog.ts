import readingTime from 'reading-time';
import redisClient from '@/lib/redis';
import { IBlogPopulated } from '@/interfaces/blog.interface';
import { headers } from 'next/headers';
import {
  createBlogStatQuery,
  findUserBlogBookmarkQuery,
  findUserBlogCommentQuery,
  findUserBlogLikeQuery,
  incrementBlogViewsQuery,
  getBlogStatQuery,
  createReadingHistoryQuery,
} from './blog_stat';
import { UAParser } from 'ua-parser-js';
import { db } from '@/db/drizzle';
import * as schema from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import dayjs from 'dayjs';

export async function getBlogWithBlogId(blogId: string) {
  return await db
    .select({
      ...schema.blogs._.columns,
      user: {
        image: schema.users.image,
        name: schema.users.name,
        username: schema.users.username,
      },
    })
    .from(schema.blogs)
    .where(eq(schema.blogs.id, blogId))
    .innerJoin(schema.users, eq(schema.users.id, schema.blogs.authorId));
}

export async function getBlogById(id: string, userId: string) {
  if (!userId || !id) {
    throw new Error('Invalid user or blog id');
  }
  const userAgent = headers().get('user-agent');
  const parsedUserAgent = new UAParser(userAgent as string);
  const cacheKey = `blog:${id}:${userId}`;
  const cachedBlog = await redisClient.get(cacheKey);

  const blogStat = await getBlogStatQuery(id);
  if (!blogStat) {
    await createBlogStatQuery(id);
  }
  if (cachedBlog) {
    await db.transaction(async (tx) => {
      await tx.execute(incrementBlogViewsQuery(id));
      await tx.execute(
        createReadingHistoryQuery({
          userId,
          blogId: id,
          browser: parsedUserAgent.getBrowser().name || '',
          os: parsedUserAgent.getOS().name || '',
          device: parsedUserAgent.getDevice().type || '',
          ipAddress: headers().get('cf-connecting-ip') || '',
          referrer: headers().get('referer') || '',
        })
      );
    });
    const blog = JSON.parse(cachedBlog);
    const updatedBlog = {
      ...blog,
      number_of_views: blog.number_of_views + 1,
    };
    await redisClient.setEx(cacheKey, 300, JSON.stringify(updatedBlog));
    return updatedBlog;
  }

  const [blog, hasUserLikedBlog, hasUserBookmarkedBlog, hasUserCommentedBlog] =
    await db.transaction(async (tx) => {
      const blog = await tx.execute(incrementBlogViewsQuery(id));
      const hasUserLikedBlog = await tx.execute(
        findUserBlogLikeQuery(id, userId)
      );
      const hasUserBookmarkedBlog = await tx.execute(
        findUserBlogBookmarkQuery(id)
      );
      const hasUserCommentedBlog = await tx.execute(
        findUserBlogCommentQuery(id, userId)
      );
      return [
        blog,
        hasUserLikedBlog,
        hasUserBookmarkedBlog,
        hasUserCommentedBlog,
      ];
    });

  if (!blog) {
    throw new Error('Blog not found');
  }
  const blogData = {
    ...blog,
    hasUserLikedBlog: !!hasUserLikedBlog,
    hasUserBookmarkedBlog: !!hasUserBookmarkedBlog,
    hasUserCommentedBlog: !!hasUserCommentedBlog,
  };
  await redisClient.setEx(cacheKey, 300, JSON.stringify(blogData));
  return blogData;
}

export async function createBlogAndStats(
  data: typeof schema.blogs.$inferInsert
) {
  return await db.transaction(async (tx) => {
    const blogTx = await tx
      .insert(schema.blogs)
      .values({
        ...data,
      })
      .returning();
    const blogStatus = await tx
      .insert(schema.blogStats)
      .values({
        blogId: blogTx[0].id,
      })
      .returning();
    return { ...blogTx[0], blogStatus };
  });
}

export async function commentOnBlog(
  blogId: string,
  value: string,
  userId: string
) {
  return await db.transaction(async (tx) => {
    const blogComment = await tx
      .insert(schema.blogComments)
      .values({
        content: value,
        userId,
        blogId,
      })
      .returning();
    await tx
      .insert(schema.blogStats)
      .values({
        blogId,
        numberOfComments: 1,
        createdAt: dayjs(new Date()).format('YYYY-MM-DD'),
      })
      .onConflictDoUpdate({
        target: [schema.blogStats.blogId],
        set: {
          numberOfComments: sql`${schema.blogStats.numberOfComments} + 1`,
        },
      });
    await tx
      .update(schema.blogs)
      .set({
        numberOfComments: sql`${schema.blogs.numberOfComments} + 1`,
      })
      .where(eq(schema.blogs.id, blogId));

    return blogComment[0];
  });
}

export async function likeBlog(blogId: string, userId: string) {
  return await db.insert(schema.blogLikes).values({ userId, blogId });
}

export async function getUserBookmarkCategories(userId: string) {
  return await db.transaction(async (tx) => {
    const categories = await tx.query.bookmarkCategories.findMany({
      where: (categories, { eq }) => eq(categories.userId, userId),
      with: {
        categoryBlogs: {
          limit: 4,
          with: {
            blog: {
              columns: {
                bannerImg: true,
              },
            },
          },
        },
      },
      orderBy: (categories, { desc }) => [desc(categories.updatedAt)],
    });

    return categories;
  });
}
