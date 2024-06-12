import { Blog, User } from '@prisma/client';

export interface IHomeBlogs {
  blogs: Blog[];
  hasMore: boolean;
  prevPage: number;
  nextPage: number;
}

export interface IBlogPopulated extends Blog {
  user: User;
  hasUserLikedBlog: boolean;
  hasUserBookmarkedBlog: boolean;
  hasUserCommentedBlog: boolean;
}
