import { Blog } from '@prisma/client';

export interface IAllBlogsRes {
  blogs: Blog[];
  hasMore: boolean;
  prevPage: number;
  nextPage: number;
}
