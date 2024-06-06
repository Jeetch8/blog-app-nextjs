import prisma from '@prisma_client/prisma';
import { BlogStatus } from '@prisma/client';
import readingTime from 'reading-time';
import { marked } from 'marked';

interface CreateBlogData {
  title: string;
  markdown_content: string;
  markdown_file_url: string;
  markdown_file_name: string;
  topicId?: string;
  banner_img: string;
  embeddings: number[];
}

export async function extractTextFromMarkdown(
  markdown: string,
  wordLimit: number = 200
): Promise<string> {
  // Remove HTML tags that might be in the markdown
  const textWithoutHTML = markdown.replace(/<[^>]*>/g, '');

  // Convert markdown to plain text
  const plainText = await new Promise<string>((resolve) => {
    marked.parse(
      textWithoutHTML,
      {
        gfm: true, // GitHub Flavored Markdown
        renderer: {
          // Override default renderers to get plain text
          paragraph: (text: string) => text + '\n',
          heading: (text: string) => text + '\n',
          list: (text: string) => text + '\n',
          listitem: (text: string) => '- ' + text + '\n',
          link: (_: any, __: any, text: string) => text,
          image: (_: any, __: any, text: string) => text || '',
          codespan: (text: string) => text,
          code: (text: string) => text,
          html: () => '',
        },
      },
      (err: Error | null, result?: string) => {
        resolve(err ? '' : result || '');
      }
    );
  });
  // Clean up the text
  const cleanText = plainText
    .replace(/\n+/g, ' ') // Replace multiple newlines with space
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();

  // Get specified number of words
  const words = cleanText.split(' ');
  const limitedWords = words.slice(0, wordLimit);

  // Add ellipsis if text was truncated
  const excerpt =
    limitedWords.join(' ') + (words.length > wordLimit ? '...' : '');

  return excerpt;
}

export async function getBlogWithBlogId(blogId: string) {
  return await prisma.blog.findFirst({
    where: { id: blogId },
    include: { user: { select: { image: true, name: true, username: true } } },
  });
}

export async function getBlogById(id: string, userId: string) {
  const blog = await prisma.blog.findUnique({
    where: { id },
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
  const short_description = await extractTextFromMarkdown(
    data.markdown_content
  );

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
