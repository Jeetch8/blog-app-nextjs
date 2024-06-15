'use client';

export type IHomeBlog = typeof blogs.$inferSelect & {
  author: Pick<typeof users.$inferSelect, 'name' | 'image' | 'username'>;
};

import { useEffect, useState, useCallback } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { blogLikes, blogs, users } from '@/db/schema';
import relativeTime from 'dayjs/plugin/relativeTime';
import dayjs from 'dayjs';
import { Box, Container } from '@mui/material';
import BlogCard from '@/components/blog/BlogCard';

dayjs.extend(relativeTime);

const Home = () => {
  const [blogs, setBlogs] = useState<IHomeBlog[]>([]);

  const fetchPage = useCallback(async (pageParam = 1) => {
    const res = await fetch(`http://localhost:3000/api/home?page=${pageParam}`);
    const json: { blogs: IHomeBlog[] } = await res.json();
    console.log(json);
    setBlogs((prev) => [...prev, ...json.blogs]);
  }, []);

  return (
    <Container>
      <Box sx={{ marginX: 'auto', width: 'fit-content' }}>
        <InfiniteScroll pageStart={0} loadMore={fetchPage} hasMore={true}>
          {blogs.map((obj, ind) => (
            <BlogCard data={obj} key={ind} isBookmarked={false} />
          ))}
        </InfiniteScroll>
      </Box>
    </Container>
  );
};

export default Home;
