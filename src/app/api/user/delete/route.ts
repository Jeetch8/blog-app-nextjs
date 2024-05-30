import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@prisma_client/prisma';

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Delete all related data
    await prisma.$transaction(async (prisma) => {
      // Delete user's blogs and related data
      const userBlogs = await prisma.blog.findMany({
        where: { user: { email: session.user.email } },
        select: { id: true },
      });

      const blogIds = userBlogs.map((blog) => blog.id);

      await prisma.blog_stat.deleteMany({ where: { blogId: { in: blogIds } } });
      await prisma.blog_like.deleteMany({ where: { blogId: { in: blogIds } } });
      await prisma.blog_comment.deleteMany({
        where: { blogId: { in: blogIds } },
      });
      await prisma.reading_history.deleteMany({
        where: { blogId: { in: blogIds } },
      });
      await prisma.bookmark_category_blog.deleteMany({
        where: { blogId: { in: blogIds } },
      });
      await prisma.blog.deleteMany({ where: { authorId: session.user.id } });

      // Delete user's bookmark categories
      await prisma.bookmark_category.deleteMany({
        where: { userId: session.user.id },
      });

      // Delete user's profile
      await prisma.user_Profile.delete({ where: { userId: session.user.id } });

      // Delete user's sessions and accounts
      await prisma.session.deleteMany({ where: { userId: session.user.id } });
      await prisma.account.deleteMany({ where: { userId: session.user.id } });

      // Finally, delete the user
      await prisma.user.delete({ where: { email: session.user.email } });
    });

    return NextResponse.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting the account' },
      { status: 500 }
    );
  }
}
