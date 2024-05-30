'use client';

import { Box } from '@mui/material';
import Grid from '@mui/material/Grid';
import BlogCard, { BlogCardProps } from '../components/BlogCard';
import { useState } from 'react';
import { IAllBlogsRes } from '../interfaces/blog.interface';
import InfiniteScroll from 'react-infinite-scroller';
import { Blog } from '@prisma/client';
import relativeTime from 'dayjs/plugin/relativeTime';
import dayjs from 'dayjs';

dayjs.extend(relativeTime);

const blogs: BlogCardProps[] = [
  {
    id: '1',
    title: 'Blog 1',
    description: 'Description 1',
    image: 'https://via.placeholder.com/150',
    author: 'Author 1',
    date: '2021-01-01',
    createdAt: '2021-01-01',
    number_of_likes: 10,
    number_of_comments: 10,
    short_description: 'Short description 1',
    banner_img: 'https://via.placeholder.com/150',
    user: {
      profile_img: 'https://via.placeholder.com/150',
      name: 'Author 1',
    },
  },
];

const Home = () => {
  // const [blogs, setBlogs] = useState<Blog[]>([]);

  // const fetchPage = async (pageParam = 0) => {
  //   const res = await fetch(
  //     `http://localhost:5000/api/v1/blog?page=${pageParam}`
  //   );
  //   const json: IAllBlogsRes = await res.json();
  //   setBlogs((prev) => [...prev, ...json.blogs]);
  // };

  return (
    <BlogCard blog={blogs[0]} />
    // <Box>
    //   {/* <InfiniteScroll pageStart={0} loadMore={fetchPage} hasMore={true}> */}
    //   {blogs.map((obj, ind) => (
    //     // <Grid item xs={12} sm={6} md={4} key={obj.id}>
    //     // </Grid>
    //   ))}
    //   {/* </InfiniteScroll> */}
    // </Box>
  );
};

export default Home;
