import { NextRequest, NextResponse } from 'next/server';
import prisma from '@prisma_client/prisma';

export async function GET(req: NextRequest) {
  const page = 1 || req.nextUrl.searchParams.get('page');
  const pageSize = 15;
  const skip = (page - 1) * pageSize;

  const [blogs, count] = await Promise.all([
    prisma.blog.findMany({
      skip,
      take: pageSize,
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
    prisma.blog.count(),
  ]);

  const totalNumberOfPages = Math.ceil(count / pageSize);
  const nextPage = page + 1 > totalNumberOfPages ? page : page + 1;

  return NextResponse.json({
    blogs,
    nextCursor: nextPage,
    prevCursor: page - 1,
    totalPages: totalNumberOfPages,
  });
}
