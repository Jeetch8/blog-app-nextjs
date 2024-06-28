import { Box, Typography } from '@mui/material';
import React from 'react';
import { BookmarkCategoryModalProvider } from '@/components/context/BookmarkCategoryModalContext';

const BlogsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <BookmarkCategoryModalProvider>
        <Box sx={{ mt: 3, px: 3 }}>
          <Typography variant="h4" sx={{ mb: 3 }}>
            My Blogs
          </Typography>
          {children}
        </Box>
      </BookmarkCategoryModalProvider>
    </>
  );
};

export default BlogsLayout;
