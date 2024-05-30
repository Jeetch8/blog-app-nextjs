import prisma from '@prisma_client/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { categoryId: string; page: number } }
) {
  const { categoryId, page } = params;
  const res = await prisma.bookmark_category_blog.findMany({
    skip: (page - 1) * 15,
    take: 15,
    where: {
      categoryId,
    },
    include: {
      blog: {
        select: {
          id: true,
          banner_img: true,
          title: true,
          short_description: true,
          createdAt: true,
          number_of_comments: true,
          number_of_likes: true,
          topicId: true,
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      },
    },
  });
  return NextResponse.json(res);
}
