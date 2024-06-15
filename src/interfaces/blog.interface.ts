import { blogs, users } from '@/db/schema';

export interface IHomeBlogs {
  blogs: (typeof blogs.$inferSelect)[];
  hasMore: boolean;
  prevPage: number;
  nextPage: number;
}

export type IBlogPopulated = typeof blogs.$inferSelect & {
  user: typeof users.$inferSelect;
  hasUserLikedBlog: boolean;
  hasUserBookmarkedBlog: boolean;
  hasUserCommentedBlog: boolean;
};
