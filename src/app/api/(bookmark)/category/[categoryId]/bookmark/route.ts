import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@prisma_client/prisma';

// Add blog to category
export async function POST(
  req: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { blogId, note } = await req.json();
    if (!blogId) {
      return NextResponse.json(
        { error: 'Blog ID is required' },
        { status: 400 }
      );
    }

    const bookmark = await prisma.bookmark_category_blog.create({
      data: {
        categoryId: params.categoryId,
        blogId,
        note,
      },
      include: {
        blog: true,
      },
    });

    return NextResponse.json({ bookmark });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to add blog to category' },
      { status: 500 }
    );
  }
}
