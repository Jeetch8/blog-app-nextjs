import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@prisma_client/prisma';

// Get blogs in category
export async function GET(
  req: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const categoryBlogs = await prisma.bookmark_category_blog.findMany({
      where: {
        categoryId: params.categoryId,
        category: {
          userId: session.user.id,
        },
      },
      include: {
        blog: true,
      },
    });

    return NextResponse.json({ categoryBlogs });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch category blogs' },
      { status: 500 }
    );
  }
}

// Update category
export async function PATCH(
  req: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description } = await req.json();

    const updatedCategory = await prisma.bookmark_category.update({
      where: {
        id: params.categoryId,
        userId: session.user.id,
      },
      data: {
        title,
        description,
      },
    });

    return NextResponse.json({ category: updatedCategory });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// Delete category
export async function DELETE(
  req: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.bookmark_category.delete({
      where: {
        id: params.categoryId,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
