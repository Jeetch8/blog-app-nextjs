// import { db } from '@/db/drizzle';
// import { and, desc, eq, sql } from 'drizzle-orm';
// import { blogs, readingHistories, blogLikes, users } from '@/db/schema';

// interface RecommendationOptions {
//   userId?: string;
//   limit?: number;
//   excludeBlogIds?: string[];
// }

// export async function getPersonalizedFeed({
//   userId,
//   limit = 10,
//   excludeBlogIds = [],
// }: RecommendationOptions) {
//   if (!userId) {
//     // For non-logged in users, return most popular recent blogs
//     return await db
//       .select()
//       .from(blogs)
//       .where(
//         and(
//           eq(blogs.blogStatus, 'PUBLISHED')
//           // sql`${blogs.id} NOT IN ${excludeBlogIds}`
//         )
//       )
//       .orderBy(desc(blogs.numberOfViews))
//       .limit(limit);
//   }

//   // Get user's reading history and likes
//   const userHistory = await db
//     .select()
//     .from(readingHistories)
//     .where(eq(readingHistories.userId, userId))
//     .orderBy(desc(readingHistories.createdAt))
//     .limit(50);

//   const userLikes = await db
//     .select()
//     .from(blogLikes)
//     .where(eq(blogLikes.userId, userId))
//     .orderBy(desc(blogLikes.createdAt))
//     .limit(50);

//   // Get topics user is interested in
//   const topicIds = [
//     ...new Set(
//       (
//         await db
//           .select({ topicId: blogs.topicId })
//           .from(blogs)
//           .where(sql`${blogs.id} IN ${userHistory.map((h) => h.blogId)}`)
//       ).map((b) => b.topicId)
//     ),
//   ];

//   // Combine signals to get personalized recommendations
//   return await db.query.blogs.findMany({
//     where: and(
//       eq(blogs.blogStatus, 'PUBLISHED'),
//       // sql`${blogs.id} NOT IN ${excludeBlogIds}`,
//       sql`(
//         ${blogs.topicId} IN ${topicIds}
//         OR ${blogs.authorId} IN (
//           SELECT "authorId" FROM ${blogs}
//           WHERE id IN ${[
//             ...userHistory.map((h) => h.blogId),
//             ...userLikes.map((l) => l.blogId),
//           ]}
//         )
//       )`
//     ),
//     orderBy: [desc(blogs.createdAt)],
//     limit,
//   });
// }

// export async function getSimilarBlogs({
//   blogId,
//   limit = 5,
//   userId,
// }: {
//   blogId: string;
//   limit?: number;
//   userId?: string;
// }) {
//   // Get the current blog's embeddings and topic
//   const currentBlog = await db.query.blogs.findFirst({
//     where: eq(blogs.id, blogId),
//   });

//   if (!currentBlog?.embeddings) {
//     return [];
//   }

//   // Combine embedding similarity with topic matching
//   return await db
//     .select()
//     .from(blogs)
//     .where(
//       and(
//         eq(blogs.blogStatus, 'PUBLISHED'),
//         sql`${blogs.id} != ${blogId}`,
//         // Use vector similarity search
//         sql`${blogs.embeddings} <=> ${currentBlog.embeddings} < 0.5`
//       )
//     )
//     .orderBy(
//       sql`(
//       CASE
//         WHEN ${blogs.topicId} = ${currentBlog.topicId} THEN 0.3
//         ELSE 0
//       END +
//       (1 - (${blogs.embeddings} <=> ${currentBlog.embeddings}))
//     ) DESC`
//     )
//     .limit(limit);
// }
