import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { z } from 'zod';
import { uploadToS3 } from '@/utils/s3';
import sanitizeHtml from 'sanitize-html';
import { nanoid } from 'nanoid';
import { getUserByEmail } from '@/db_access/user';
import { createBlogAndStats } from '@/db_access/blog';
import removeMd from 'remove-markdown';
import readingTimeFunc from 'reading-time';
import * as schema from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { count } from 'drizzle-orm';
import { db } from '@/db/drizzle';

const blogSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  markdown_content: z.string().min(1, 'Content is required'),
  tags: z.array(z.string()).optional(),
  banner_img: z.string().url('Invalid banner image URL'),
  blog_status: z.enum(['PUBLISHED', 'DRAFT']),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.json();
    const validatedData = blogSchema.safeParse(formData);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validatedData.error.errors },
        { status: 400 }
      );
    }

    const user = await getUserByEmail(session.user.email);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const sanitizedMarkdown = sanitizeHtml(
      validatedData?.data.markdown_content,
      {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
        allowedAttributes: {
          ...sanitizeHtml.defaults.allowedAttributes,
          img: ['src', 'alt'],
        },
      }
    );

    const short_description = removeMd(sanitizedMarkdown);
    const readingTime = readingTimeFunc(sanitizedMarkdown);

    const blog = await createBlogAndStats({
      title: validatedData.data.title,
      bannerImg: validatedData.data.banner_img,
      tags: validatedData.data.tags,
      content: sanitizedMarkdown,
      shortDescription: short_description,
      authorId: user.id,
      blogStatus: validatedData.data.blog_status,
      readingTime: Math.ceil(readingTime.minutes),
    });
    console.log(blog);

    return NextResponse.json(
      {
        message: 'Blog created successfully',
        blog: blog.blog,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Blog creation error:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the blog' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  try {
    const blogs = await db
      .select()
      .from(schema.blogs)
      .where(eq(schema.blogs.blogStatus, schema.blogStatusEnum.enumValues[1]))
      .orderBy(desc(schema.blogs.createdAt))
      .limit(limit)
      .offset((page - 1) * limit)
      .leftJoin(schema.users, eq(schema.blogs.authorId, schema.users.id));
    const totalBlogs = await db
      .select({ count: count() })
      .from(schema.blogs)
      .where(eq(schema.blogs.blogStatus, schema.blogStatusEnum.enumValues[1]));

    return NextResponse.json({
      blogs,
      pagination: {
        total: totalBlogs[0].count,
        pages: Math.ceil(totalBlogs[0].count / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}
