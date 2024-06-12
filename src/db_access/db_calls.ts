import { Reading_history } from '@prisma/client';
import prisma from '@prisma_client/prisma';

export function incrementBlogViewsQuery(id: string) {
  return prisma.blog.update({
    where: { id },
    data: {
      number_of_views: { increment: 1 },
    },
    include: {
      user: true,
    },
  });
}

export function findUserBlogLikeQuery(blogId: string, userId: string) {
  return prisma.blog_like.findFirst({
    where: {
      blogId,
      userId,
    },
  });
}

export function findUserBlogBookmarkQuery(blogId: string) {
  return prisma.bookmark_category_blog.findFirst({
    where: {
      blogId,
    },
  });
}

export function findUserBlogCommentQuery(blogId: string, userId: string) {
  return prisma.blog_comment.findFirst({
    where: {
      blogId,
      userId,
    },
  });
}

export function incrementBlogStatQuery(blogId: string) {
  return prisma.blog_stat.update({
    where: {
      blogId_date: { blogId, date: new Date().toISOString().split('T')[0] },
    },
    data: { number_of_views: { increment: 1 } },
  });
}

export function createBlogStatQuery(blogId: string) {
  return prisma.blog_stat.create({
    data: {
      blogId,
      date: new Date().toISOString().split('T')[0],
      number_of_views: 1,
    },
  });
}

export function getBlogStatQuery(blogId: string) {
  return prisma.blog_stat.findFirst({
    where: {
      blogId,
      date: new Date().toISOString().split('T')[0],
    },
  });
}

export function getReadingHistoryQuery(userId: string) {
  return prisma.reading_history.findMany({
    where: { userId },
  });
}

export function createReadingHistoryQuery(
  props: Omit<Reading_history, 'id' | 'createdAt' | 'updatedAt'>
) {
  return prisma.reading_history.create({
    data: props,
  });
}
