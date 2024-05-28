import PrismaClient from '@prisma_client/prisma';
import { User } from '@prisma/client';

export async function createBookmarkCategory(
  name: string,
  description: string,
  userId: string
) {
  return await PrismaClient.bookmark_Category.create({
    data: {
      name,
      description,
      userId,
    },
  });
}

export async function deleteBookmarkCategory(categoryId: string) {
  return await PrismaClient.bookmark_Category.delete({
    where: {
      id: categoryId,
    },
    include: {
      category_blog: true,
    },
  });
}

export async function getAllUserCategories(userId: string) {
  return await PrismaClient.bookmark_Category.findMany({
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
  return await PrismaClient.bookmark_Category_Blog.findMany({
    where: {
      categoryId,
    },
  });
}

export async function updateCategoryInfo(
  categoryId: string,
  name: string,
  description: string
) {
  return await PrismaClient.bookmark_Category.update({
    where: {
      id: categoryId,
    },
    data: {
      name,
      description,
    },
  });
}

export async function addBlogToCategory(
  categoryId: string,
  blogId: string,
  note: string = ''
) {
  return await PrismaClient.bookmark_Category_Blog.create({
    data: {
      categoryId,
      blogId,
      note,
    },
  });
}

export async function removeBlogFromCategory(blogId: string) {
  return await PrismaClient.bookmark_Category_Blog.delete({
    where: {
      id: blogId,
    },
  });
}

export async function updateBlogNote(blogId: string, note: string) {
  return await PrismaClient.bookmark_Category_Blog.update({
    where: {
      id: blogId,
    },
    data: {
      note,
    },
  });
}

export async function getListOfBookmarkCategories(userId: string) {
  return await PrismaClient.bookmark_Category.findMany({
    where: {
      userId,
    },
    select: {
      id: true,
      name: true,
    },
  });
}
