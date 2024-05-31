import prisma from '@prisma_client/prisma';
import markdown from 'markdown-it';
import { convert } from 'html-to-text';
import sanitize from 'markdown-it-sanitizer';
import { BlogStatus } from '@prisma/client';

interface CreateBlogData {
  title: string;
  markdown_content: string;
  topicId?: string;
  banner_img: string;
}

export async function getBlogById(id: string, userId: string) {
  const blog = await prisma.blog.findUnique({
    where: { id },
    // Add any necessary includes here
  });

  if (!blog) {
    throw new Error('Blog not found');
  }

  const date = new Date().toISOString().split('T')[0];
  await updateBlogStats(blog.id, date, 'number_of_views');

  const hasUserLikedBlog = await prisma.blog_like.findFirst({
    where: {
      blogId: id,
      userId,
    },
  });

  return { ...blog, hasUserLikedBlog: !!hasUserLikedBlog };
}

export async function createBlog(data: CreateBlogData, userId: string) {
  const sanitized_markdown = sanitize(data.markdown_content);
  const html = markdown()
    .use(sanitize, {
      allowedTags: [
        'p',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'blockquote',
        'a',
        'ul',
        'ol',
        'li',
        'b',
        'i',
        'strong',
        'em',
        'strike',
        'code',
        'hr',
        'br',
        'div',
        'span',
        'pre',
        'img',
      ],
      allowedAttributes: {
        a: ['href'],
        img: ['src'],
      },
    })
    .render(data.markdown_content);
  const text = convert(html, {
    wordwrap: false,
    preserveNewlines: false,
  });
  const short_description = text
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\\n|\\r|\\t/g, '')
    .slice(0, 250);

  return await prisma.blog.create({
    data: {
      title: data.title,
      topicId: data.topicId || '',
      banner_img: data.banner_img,
      blog_status: BlogStatus.DRAFT,
      blog_stats: {
        create: {
          date: new Date().toISOString().split('T')[0],
          number_of_views: 0,
        },
      },
      markdown_content: sanitized_markdown,
      html_content: html,
      short_description,
      authorId: userId,
    },
  });
}

export async function commentOnBlog(
  blogId: string,
  value: string,
  userId: string
) {
  const blogComment = await prisma.blog_comment.create({
    data: {
      content: value,
      userId,
      blogId,
    },
  });

  const date = new Date().toISOString().split('T')[0];
  await updateBlogStats(blogId, date, 'number_of_comments');

  return blogComment;
}

export async function likeBlog(blogId: string, userId: string) {
  const blogLike = await prisma.blog_like.create({
    data: {
      userId,
      blogId,
    },
  });

  const date = new Date().toISOString().split('T')[0];
  await updateBlogStats(blogId, date, 'number_of_likes');

  return blogLike;
}

async function updateBlogStats(
  blogId: string,
  date: string,
  field: 'number_of_views' | 'number_of_comments' | 'number_of_likes'
) {
  await prisma.blog.update({
    where: { id: blogId },
    data: {
      [field]: { increment: 1 },
      blog_stats: {
        upsert: {
          create: {
            date,
            [field]: 1,
          },
          update: {
            [field]: { increment: 1 },
          },
          where: {
            blog: {
              id: blogId,
              createdAt: date,
            },
            id: blogId,
            date,
          },
        },
      },
    },
  });
}

export async function getBlogWithAuthor(id: string) {
  const blog = await prisma.blog.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          email: true,
          username: true,
          profile: {
            select: {
              bio: true,
              tagline: true,
              followers_count: true,
              following_count: true,
            },
          },
        },
      },
      topic: true,
      comments: {
        include: {
          user: {
            select: {
              name: true,
              image: true,
              username: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      likes: {
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
      _count: {
        select: {
          comments: true,
          likes: true,
        },
      },
    },
  });

  if (!blog) {
    throw new Error('Blog not found');
  }

  // Update view count
  const date = new Date().toISOString().split('T')[0];
  await updateBlogStats(blog.id, date, 'number_of_views');

  return blog;
}
