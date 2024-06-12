import prisma from '@prisma_client/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(
  req: NextRequest,
  { params }: { params: { blogId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;
    const skip = (page - 1) * limit;

    const likes = await prisma.blog_like.findMany({
      where: {
        blogId: params.blogId,
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: skip,
    });

    return NextResponse.json({ likes });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch likes' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { blogId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create like and increment blog likes count in a transaction
    const [like] = await prisma.$transaction([
      prisma.blog_like.create({
        data: {
          userId: session.user.id,
          blogId: params.blogId,
        },
        include: {
          user: {
            select: {
              name: true,
              image: true,
              username: true,
            },
          },
        },
      }),
      prisma.blog.update({
        where: { id: params.blogId },
        data: {
          number_of_likes: { increment: 1 },
        },
      }),
    ]);

    return NextResponse.json({ like });
  } catch (error) {
    if ((error as any).code === 'P2002') {
      return NextResponse.json(
        { error: 'Already liked this blog' },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to like blog' }, { status: 500 });
  }
}
