import { Box, Typography } from '@mui/material';
import React from 'react';

const BlogsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box sx={{ mt: 3, px: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        My Blogs
      </Typography>
      {children}
    </Box>
  );
};

export default BlogsLayout;
