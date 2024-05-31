'use client';

export interface IHomeBlog extends Blog {
  user: Pick<User, 'name' | 'image' | 'username'>;
}

import { useEffect, useState, useCallback } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { Blog, User } from '@prisma/client';
import relativeTime from 'dayjs/plugin/relativeTime';
import dayjs from 'dayjs';
import { Box, Container } from '@mui/material';
import BlogCard from '@/components/BlogCard';

dayjs.extend(relativeTime);

const Home = () => {
  const [blogs, setBlogs] = useState<IHomeBlog[]>([]);

  const fetchPage = useCallback(async (pageParam = 1) => {
    const res = await fetch(`http://localhost:3000/api/home?page=${pageParam}`);
    const json: { blogs: Blog & [] } = await res.json();
    console.log(json);
    setBlogs((prev) => [...prev, ...json.blogs]);
  }, []);

  return (
    <Container>
      <Box sx={{ marginX: 'auto', width: 'fit-content' }}>
        <InfiniteScroll pageStart={0} loadMore={fetchPage} hasMore={true}>
          {blogs.map((obj, ind) => (
            <BlogCard blog={obj} key={ind} />
          ))}
        </InfiniteScroll>
      </Box>
    </Container>
  );
};

export default Home;
