import { db } from '@/db/drizzle';
import {
  bookmarkCategories,
  bookmarkCategoryBlogs,
  blogLikes,
  blogs,
  users,
  readingHistories,
  blogStats,
} from '@/db/schema';
import { and, desc, eq, gte, inArray, lte, sql } from 'drizzle-orm';

export const getUserCategoriesListPS = db.query.bookmarkCategories
  .findMany({
    with: {
      categoryBlogs: true,
    },
    where: eq(bookmarkCategories.userId, sql.placeholder('userId')),
  })
  .prepare('categorieList');

export const getUserCategoriesListWithBlogsPS = db.query.bookmarkCategories
  .findMany({
    where: eq(bookmarkCategories.userId, sql.placeholder('userId')),
    orderBy: desc(bookmarkCategories.createdAt),
    limit: 3,
    with: {
      categoryBlogs: {
        orderBy: desc(bookmarkCategoryBlogs.createdAt),
        with: {
          blog: {
            with: {
              author: {
                columns: {
                  name: true,
                  username: true,
                  image: true,
                },
              },
              likes: {
                where: eq(blogLikes.userId, sql.placeholder('userId')),
                limit: 1,
              },
            },
          },
        },
      },
    },
  })
  .prepare('categorieListWithBlogs');

export const getBookmarkCategoryBlogsPS = db.query.bookmarkCategoryBlogs
  .findMany({
    where: eq(bookmarkCategoryBlogs.categoryId, sql.placeholder('categoryId')),
    with: {
      blog: true,
    },
  })
  .prepare('bookmarkCategoryBlogs');

export const getAllUserBlogsPS = db.query.blogs
  .findMany({
    where: eq(blogs.authorId, sql.placeholder('userId')),
    columns: {
      id: true,
      title: true,
      numberOfComments: true,
      numberOfLikes: true,
      numberOfViews: true,
      readingTime: true,
      createdAt: true,
      bannerImg: true,
    },
  })
  .prepare('allUserBlogs');

export const getAllUserBlogsWithReadingHistoryAndStatsPS = db.query.blogs
  .findMany({
    where: eq(blogs.authorId, sql.placeholder('userId')),
    columns: {
      id: true,
      title: true,
      numberOfComments: true,
      numberOfLikes: true,
      numberOfViews: true,
      readingTime: true,
      createdAt: true,
      bannerImg: true,
    },
    with: {
      readingHistories: {
        where: and(
          gte(readingHistories.createdAt, sql.placeholder('startDate')),
          lte(readingHistories.createdAt, sql.placeholder('endDate'))
        ),
      },
      stats: {
        where: and(
          gte(blogStats.createdAt, sql.placeholder('startDate')),
          lte(blogStats.createdAt, sql.placeholder('endDate'))
        ),
        orderBy: [blogStats.createdAt],
      },
    },
  })
  .prepare('allUserBlogsWithReadingHistoryAndStats');

export const getBlogStatsAndReadingHistoryPS = db
  .select({
    stats: blogStats,
    readingHistories: readingHistories,
  })
  .from(blogStats)
  .fullJoin(
    readingHistories,
    and(
      eq(readingHistories.blogId, blogStats.blogId),
      gte(readingHistories.createdAt, sql.placeholder('startDate')),
      lte(readingHistories.createdAt, sql.placeholder('endDate'))
    )
  )
  .where(
    and(
      eq(blogStats.blogId, sql.placeholder('blogId')),
      gte(blogStats.createdAt, sql.placeholder('startDate')),
      lte(blogStats.createdAt, sql.placeholder('endDate'))
    )
  )
  .orderBy(blogStats.createdAt)
  .prepare('getBlogStatsAndReadingHistory');

export const getUserBlogsPS = db.query.blogs
  .findMany({
    where: and(
      eq(blogs.authorId, sql.placeholder('userId')),
      eq(blogs.blogStatus, sql.placeholder('blogStatus'))
    ),
    orderBy: [desc(blogs.createdAt)],
    limit: sql.placeholder('limit'),
    offset: sql.placeholder('offset'),
  })
  .prepare('getUserBlogs');

export const getUserBlogsByUsernamePS = db.query.users.findFirst({
  where: eq(users.username, sql.placeholder('username')),
  with: {
    blogsAuthored: {
      where: eq(blogs.blogStatus, sql.placeholder('blogStatus')),
      orderBy: [desc(blogs.createdAt)],
      limit: sql.placeholder('limit'),
    },
  },
});
