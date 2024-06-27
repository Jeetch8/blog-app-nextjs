import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/db/drizzle';
import { blogs, bookmarkCategories, bookmarkCategoryBlogs } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { getBookmarkCategoryBlogsPS } from '@/utils/preparedStatments';

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

    // const categoryBlogs = await db
    //   .select()
    //   .from(bookmarkCategoryBlogs)
    //   .where(eq(bookmarkCategoryBlogs.categoryId, params.categoryId))
    //   .leftJoin(blogs, eq(bookmarkCategoryBlogs.blogId, blogs.id))
    //   .limit(4);

    const categoryBlogs = await getBookmarkCategoryBlogsPS.execute({
      categoryId: params.categoryId,
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

    const updatedCategory = await db
      .update(bookmarkCategories)
      .set({ title, description })
      .where(
        and(
          eq(bookmarkCategories.id, params.categoryId),
          eq(bookmarkCategories.userId, session.user.id)
        )
      )
      .returning();

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

    await db
      .delete(bookmarkCategories)
      .where(
        and(
          eq(bookmarkCategories.id, params.categoryId),
          eq(bookmarkCategories.userId, session.user.id)
        )
      );

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
