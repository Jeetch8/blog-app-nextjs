import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/db/drizzle';
import { bookmarkCategories, bookmarkCategoryBlogs } from '@/db/schema';
import { and, eq } from 'drizzle-orm';

export async function PUT(
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
        { error: 'Blog ID is required', categoryId: params.categoryId },
        { status: 400 }
      );
    }

    const bookmark = await db
      .insert(bookmarkCategoryBlogs)
      .values({
        bookmarkedByUserId: session.user.id,
        categoryId: params.categoryId,
        blogId,
        note: note || '',
      })
      .returning();

    return NextResponse.json({ bookmark, categoryId: params.categoryId });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to add blog to category',
        categoryId: params.categoryId,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { blogId } = await req.json();
    if (!blogId) {
      return NextResponse.json(
        { error: 'Blog ID is required', categoryId: params.categoryId },
        { status: 400 }
      );
    }

    await db
      .delete(bookmarkCategoryBlogs)
      .where(
        and(
          eq(bookmarkCategoryBlogs.categoryId, params.categoryId),
          eq(bookmarkCategoryBlogs.blogId, blogId),
          eq(bookmarkCategoryBlogs.bookmarkedByUserId, session.user.id)
        )
      );

    return NextResponse.json({ categoryId: params.categoryId, success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to remove blog from category',
        categoryId: params.categoryId,
      },
      { status: 500 }
    );
  }
}
