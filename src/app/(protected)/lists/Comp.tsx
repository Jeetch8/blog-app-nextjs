'use client';

import React from 'react';
import { useBookmarkCategoryModal } from '@/components/context/BookmarkCategoryModalContext';
import { Button } from '@mui/material';

const modal = () => {
  const { openModal } = useBookmarkCategoryModal();

  return (
    <>
      <Button variant="contained" color="primary" onClick={openModal}>
        Create new list
      </Button>
    </>
  );
};

export default modal;
