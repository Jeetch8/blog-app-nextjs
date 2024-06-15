import { db } from '@/db/drizzle';
import * as schema from '@/db/schema';
import { and, eq, sql } from 'drizzle-orm';

export function incrementBlogViewsQuery(id: string) {
  return db.execute(sql`UPDATE ${schema.blogs} blog  
    JOIN blogs.author_id = users.id 
    SET number_of_views = number_of_views + 1
    WHERE ${schema.blogs.id} = ${id}`);
}

export function findUserBlogLikeQuery(blogId: string, userId: string) {
  return db
    .select()
    .from(schema.blogLikes)
    .where(
      and(
        eq(schema.blogLikes.blogId, blogId),
        eq(schema.blogLikes.userId, userId)
      )
    )
    .limit(1);
}

export function findUserBlogBookmarkQuery(blogId: string) {
  return db
    .select()
    .from(schema.bookmarkCategoryBlogs)
    .where(eq(schema.bookmarkCategoryBlogs.blogId, blogId))
    .limit(1);
}

export function findUserBlogCommentQuery(blogId: string, userId: string) {
  return db
    .select()
    .from(schema.blogComments)
    .where(
      and(
        eq(schema.blogLikes.blogId, blogId),
        eq(schema.blogLikes.userId, userId)
      )
    )
    .limit(1);
}

export function createBlogStatQuery(blogId: string) {
  return db.insert(schema.blogStats).values({ blogId, numberOfViews: 1 });
}

export function getBlogStatQuery(blogId: string) {
  return db
    .select()
    .from(schema.blogStats)
    .where(eq(schema.blogStats.blogId, blogId));
}

export function getReadingHistoryQuery(userId: string) {
  return db
    .select()
    .from(schema.readingHistories)
    .where(eq(schema.readingHistories.userId, userId));
}

export function createReadingHistoryQuery(
  props: typeof schema.readingHistories.$inferInsert
) {
  return db.insert(schema.readingHistories).values(props);
}
