'use client';

import { Box } from '@mui/material';
import Grid from '@mui/material/Grid';
import BlogCard from '../components/BlogCard';
import { useEffect, useRef, useState } from 'react';
import { IAllBlogsRes } from '../interfaces/blog.interface';
import InfiniteScroll from 'react-infinite-scroller';
import { Blog } from '@prisma/client';

const Home = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);

  const fetchPage = async (pageParam = 0) => {
    const res = await fetch(
      `http://localhost:5000/api/v1/blog?page=${pageParam}`
    );
    const json: IAllBlogsRes = await res.json();
    setBlogs((prev) => [...prev, ...json.blogs]);
  };

  return (
    <Box sx={{ padding: '30px 40px 10px 40px' }}>
      <InfiniteScroll pageStart={0} loadMore={fetchPage} hasMore={true}>
        {blogs.map((obj, ind) => (
          <Grid item xs={12} sm={6} md={4} key={obj.id}>
            <BlogCard obj={obj} />
          </Grid>
        ))}
      </InfiniteScroll>
    </Box>
  );
};

export default Home;
