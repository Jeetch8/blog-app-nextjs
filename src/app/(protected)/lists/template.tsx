import { BookmarkCategoryModalProvider } from '@/components/context/BookmarkCategoryModalContext';
import React from 'react';

const ListsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <BookmarkCategoryModalProvider>{children}</BookmarkCategoryModalProvider>
    </>
  );
};

export default ListsLayout;
