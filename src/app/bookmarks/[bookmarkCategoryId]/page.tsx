'use client';

import BlogCard from '@/components/BlogCard';
import { Box, Paper, Typography } from '@mui/material';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import InfiniteScroll from 'react-infinite-scroller';

const BookmarkBlogs = ({
  params: { bookmarkCategoryId },
}: {
  params: { bookmarkCategoryId: string };
}) => {
  const { data: userSession } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [page, setPage] = useState(1);

  const getCaregoryBlogs = async (page: number) => {
    const res = await fetch(
      `/api/bookmark/${bookmarkCategoryId}/blog?page=${page}`
    );
    return res.json();
  };

  return (
    <Box sx={{ padding: '30px 10px' }}>
      <Typography variant="h4" sx={{ ml: 10, mb: 5 }}>
        Bookmark Blogs
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '30px',
          justifyContent: 'center',
        }}
      >
        <InfiniteScroll
          pageStart={0}
          loadMore={getCaregoryBlogs}
          hasMore={true}
        >
          {blogs.map((obj) => {
            return (
              <Box key={obj.id}>
                <Paper elevation={8} sx={{ padding: '20px 10px' }}>
                  {isEditing ? (
                    <input type="text" value={obj.note} />
                  ) : (
                    <Typography onClick={() => setIsEditing(true)}>
                      <span style={{ fontWeight: 600 }}>NOTES:</span>
                      {obj.note}
                    </Typography>
                  )}
                </Paper>
                <BlogCard obj={obj.blog} />
              </Box>
            );
          })}
        </InfiniteScroll>
      </Box>
    </Box>
  );
};

export default BookmarkBlogs;
