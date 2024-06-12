import prisma from '@prisma_client/prisma';
import { BlogStatus } from '@prisma/client';
import readingTime from 'reading-time';
import redisClient from '@/lib/redis';
import { IBlogPopulated } from '@/interfaces/blog.interface';
import removeMd from 'remove-markdown';
import { headers } from 'next/headers';
import {
  createBlogStatQuery,
  findUserBlogBookmarkQuery,
  findUserBlogCommentQuery,
  findUserBlogLikeQuery,
  incrementBlogStatQuery,
  incrementBlogViewsQuery,
  getBlogStatQuery,
  createReadingHistoryQuery,
} from './db_calls';
import { UAParser } from 'ua-parser-js';

interface CreateBlogData {
  title: string;
  markdown_content: string;
  markdown_file_url: string;
  markdown_file_name: string;
  topicId?: string;
  banner_img: string;
  embeddings: number[];
}

export async function getBlogWithBlogId(blogId: string) {
  return await prisma.blog.findFirst({
    where: { id: blogId },
    include: { user: { select: { image: true, name: true, username: true } } },
  });
}

export async function getBlogById(
  id: string,
  userId: string
): Promise<IBlogPopulated> {
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
    await Promise.all([
      incrementBlogViewsQuery(id),
      createReadingHistoryQuery({
        userId,
        blogId: id,
        browser: parsedUserAgent.getBrowser().name || '',
        os: parsedUserAgent.getOS().name || '',
        device: parsedUserAgent.getDevice().type || '',
        ip_address: headers().get('cf-connecting-ip') || '',
        country: '',
        region: '',
        city: '',
        referrer: headers().get('referer') || '',
      }),
    ]);
    const blog = JSON.parse(cachedBlog);
    const updatedBlog = {
      ...blog,
      number_of_views: blog.number_of_views + 1,
    };
    await redisClient.setEx(cacheKey, 300, JSON.stringify(updatedBlog));
    return updatedBlog;
  }

  const [blog, hasUserLikedBlog, hasUserBookmarkedBlog, hasUserCommentedBlog] =
    await Promise.all([
      incrementBlogViewsQuery(id),
      findUserBlogLikeQuery(id, userId),
      findUserBlogBookmarkQuery(id),
      findUserBlogCommentQuery(id, userId),
    ]);

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

export async function createBlog(data: CreateBlogData, userId: string) {
  const short_description = removeMd(data.markdown_content);

  return await prisma.blog.create({
    data: {
      title: data.title,
      topicId: data.topicId || '',
      banner_img: data.banner_img,
      blog_status: BlogStatus.DRAFT,
      markdown_file_url: data.markdown_file_url,
      markdown_file_name: data.markdown_file_name,
      embeddings: data.embeddings,
      reading_time: readingTime(data.markdown_content).minutes,
      short_description,
      authorId: userId,
      blog_stats: {
        create: {
          date: new Date().toISOString().split('T')[0],
          number_of_views: 0,
        },
      },
    },
  });
}

export async function commentOnBlog(
  blogId: string,
  value: string,
  userId: string
) {
  const [blogComment] = await Promise.all([
    prisma.blog_comment.create({
      data: {
        content: value,
        userId,
        blogId,
      },
    }),
    prisma.blog_stat.upsert({
      where: {
        blogId_date: {
          blogId,
          date: new Date().toISOString().split('T')[0],
        },
      },
      update: {
        number_of_comments: { increment: 1 },
      },
      create: {
        number_of_comments: 1,
        date: new Date().toISOString().split('T')[0],
        blogId,
      },
    }),
    prisma.blog.update({
      where: { id: blogId },
      data: {
        number_of_comments: { increment: 1 },
      },
    }),
  ]);

  return blogComment;
}

export async function likeBlog(blogId: string, userId: string) {
  const blogLike = await prisma.blog_like.create({
    data: {
      userId,
      blogId,
    },
  });

  return blogLike;
}

export async function getUserBookmarkCategories(userId: string) {
  return await prisma.bookmark_category.findMany({
    where: {
      userId,
    },
    include: {
      category_blog: {
        include: {
          blog: {
            select: {
              banner_img: true,
            },
          },
        },
        take: 4,
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });
}
