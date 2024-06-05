import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@prisma_client/prisma';
import { z } from 'zod';
import { createBlog } from '@/db_access/blog';
import { BlogStatus } from '@prisma/client';
import { uploadToS3 } from '@/utils/s3';
import sanitizeHtml from 'sanitize-html';
import { nanoid } from 'nanoid';

// Mock function for creating embeddings (replace with actual implementation)
async function createEmbeddings(text: string) {
  return Array(1536)
    .fill(0)
    .map(() => Math.random());
}

const blogSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  markdown_content: z.string().min(1, 'Content is required'),
  topicId: z.string().optional(),
  banner_img: z.string().url('Invalid banner image URL'),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.json();
    const validatedData = blogSchema.parse(formData);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Sanitize markdown content
    const sanitizedMarkdown = sanitizeHtml(validatedData.markdown_content, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        img: ['src', 'alt'],
      },
    });

    // Generate unique filename
    const fileName = `blogs/${user.id}/${nanoid()}.md`;

    // Upload to S3
    const { fileUrl } = await uploadToS3(
      process.env.AWS_BLOG_BUCKET_NAME!,
      fileName,
      sanitizedMarkdown
    );

    // Create embeddings for the blog content
    const embeddings = await createEmbeddings(sanitizedMarkdown);

    // Create blog with file URL and embeddings
    const blog = await createBlog(
      {
        ...validatedData,
        markdown_content: sanitizedMarkdown,
        markdown_file_url: fileUrl,
        markdown_file_name: fileName,
        embeddings,
      },
      user.id
    );

    return NextResponse.json(
      {
        message: 'Blog created successfully',
        blog,
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
    const blogs = await prisma.blog.findMany({
      where: { blog_status: BlogStatus.PUBLISHED },
      take: limit,
      skip: (page - 1) * limit,
      include: {
        user: {
          select: {
            name: true,
            image: true,
            email: true,
            username: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.blog.count({
      where: { blog_status: BlogStatus.PUBLISHED },
    });

    return NextResponse.json({
      blogs,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
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
