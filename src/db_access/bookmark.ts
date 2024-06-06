import PrismaClient from '@prisma_client/prisma';
import { User } from '@prisma/client';

export async function createBookmarkCategory(
  title: string,
  description: string,
  userId: string
) {
  return await PrismaClient.bookmark_category.create({
    data: {
      title,
      description,
      userId,
    },
  });
}

export async function deleteBookmarkCategory(categoryId: string) {
  return await PrismaClient.bookmark_category.delete({
    where: {
      id: categoryId,
    },
    include: {
      category_blog: true,
    },
  });
}

export async function getCategoryWithBlogs(categoryId: string, userId: string) {
  const category = await PrismaClient.bookmark_category.findUnique({
    where: {
      id: categoryId,
      userId: userId, // Ensure user owns this category
    },
    include: {
      category_blog: {
        include: {
          blog: {
            include: {
              user: {
                select: {
                  name: true,
                  image: true,
                  username: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return category;
}

export async function getAllUserCategories(userId: string) {
  return await PrismaClient.bookmark_category.findMany({
    where: {
      userId,
    },
    include: {
      category_blog: {
        take: 3,
        include: {
          blog: {
            select: {
              id: true,
              banner_img: true,
            },
          },
        },
      },
    },
  });
}

export async function getSingleCategoryById(categoryId: string) {
  return await PrismaClient.bookmark_category_blog.findMany({
    where: {
      categoryId,
    },
  });
}

export async function updateCategoryInfo(
  categoryId: string,
  title: string,
  description: string
) {
  return await PrismaClient.bookmark_category.update({
    where: {
      id: categoryId,
    },
    data: {
      title,
      description,
    },
  });
}

export async function addBlogToCategory(
  categoryId: string,
  blogId: string,
  note: string = ''
) {
  return await PrismaClient.bookmark_category_blog.create({
    data: {
      categoryId,
      blogId,
      note,
    },
  });
}

export async function removeBlogFromCategory(blogId: string) {
  return await PrismaClient.bookmark_category_blog.delete({
    where: {
      id: blogId,
    },
  });
}

export async function updateBlogNote(blogId: string, note: string) {
  return await PrismaClient.bookmark_category_blog.update({
    where: {
      id: blogId,
    },
    data: {
      note,
    },
  });
}

export async function getListOfBookmarkCategories(userId: string) {
  return await PrismaClient.bookmark_category.findMany({
    where: {
      userId,
    },
    select: {
      id: true,
      title: true,
    },
  });
}
