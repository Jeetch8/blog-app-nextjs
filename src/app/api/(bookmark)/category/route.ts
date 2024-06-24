import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/db/drizzle';
import { bookmarkCategories } from '@/db/schema';
import { getUserCategoriesListPS } from '@/app/api/_utils/preparedStatments';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const blogId = searchParams.get('blogId');

    if (!blogId) {
      return NextResponse.json(
        { error: 'BlogId is required' },
        { status: 400 }
      );
    }

    const categories = await getUserCategoriesListPS.execute({
      userId: session.user.id,
    });

    const categoriesWithCheckedStatus = categories.map((category) => ({
      id: category.id,
      title: category.title,
      description: category.description,
      checked: category.categoryBlogs.some((blog) => blog.blogId === blogId),
    }));

    return NextResponse.json({ categories: categoriesWithCheckedStatus });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// Create new category
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description } = await req.json();
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const category = await db.insert(bookmarkCategories).values({
      title,
      description,
      userId: session.user.id,
    });

    return NextResponse.json({ category });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
