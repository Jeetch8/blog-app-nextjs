import { db } from '@/db/drizzle';
import { eq, and } from 'drizzle-orm';
import {
  bookmarkCategories,
  bookmarkCategoryBlogs,
  blogs,
  blogsRelations,
  users,
  blogLikes,
} from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function createBookmarkCategory(
  title: string,
  description: string | undefined,
  userId: string
) {
  return await db
    .insert(bookmarkCategories)
    .values({
      title,
      description,
      userId,
    })
    .returning();
}

export async function deleteBookmarkCategory(categoryId: string) {
  return await db
    .delete(bookmarkCategories)
    .where(eq(bookmarkCategories.id, categoryId))
    .returning();
}

export async function getCategoryWithBlogs(categoryId: string, userId: string) {
  return await db.query.bookmarkCategories.findFirst({
    where: eq(bookmarkCategories.id, categoryId),
    with: {
      categoryBlogs: {
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
            },
          },
        },
      },
    },
  });
}

export async function getAllUserCategories(userId: string) {
  return await db.query.bookmarkCategories.findMany({
    where: eq(bookmarkCategories.userId, userId),
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
                where: eq(blogLikes.userId, userId),
                limit: 1,
              },
            },
          },
        },
      },
    },
  });
}

export async function getSingleCategoryById(categoryId: string) {
  return await db
    .select()
    .from(bookmarkCategoryBlogs)
    .where(eq(bookmarkCategoryBlogs.categoryId, categoryId));
}

export async function updateCategoryInfo(
  categoryId: string,
  title: string,
  description: string
) {
  return await db
    .update(bookmarkCategories)
    .set({
      title,
      description,
    })
    .where(eq(bookmarkCategories.id, categoryId))
    .returning();
}

export async function addBlogToCategory(
  bookmarkedByUserId: string,
  categoryId: string,
  blogId: string,
  note: string = ''
) {
  return await db
    .insert(bookmarkCategoryBlogs)
    .values({
      bookmarkedByUserId,
      categoryId,
      blogId,
      note,
    })
    .returning();
}

export async function removeBlogFromCategory(blogId: string) {
  return await db
    .delete(bookmarkCategoryBlogs)
    .where(eq(bookmarkCategoryBlogs.id, blogId))
    .returning();
}

export async function updateBlogNote(blogId: string, note: string) {
  return await db
    .update(bookmarkCategoryBlogs)
    .set({
      note,
    })
    .where(eq(bookmarkCategoryBlogs.id, blogId))
    .returning();
}

export async function getListOfBookmarkCategories(userId: string) {
  return await db
    .select({
      id: bookmarkCategories.id,
      title: bookmarkCategories.title,
    })
    .from(bookmarkCategories)
    .where(eq(bookmarkCategories.userId, userId));
}
