import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { blogs } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(
  req: NextRequest,
  { params }: { params: { blogId: string } }
) {
  const blogId = params.blogId;
  const blog = await db.query.blogs.findFirst({
    where: eq(blogs.id, blogId),
  });
  if (!blog) {
    return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
  }
  return NextResponse.json(blog);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { blogId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const blogId = params.blogId;

    // Check if blog exists and belongs to the user
    const blog = await db.query.blogs.findFirst({
      where: eq(blogs.id, blogId),
    });

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    if (blog.authorId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete the blog
    await db.delete(blogs).where(eq(blogs.id, blogId));

    return NextResponse.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
