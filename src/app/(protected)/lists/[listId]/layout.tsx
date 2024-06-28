import React from 'react';
import { BookmarkCategoryModalProvider } from '@/components/context/BookmarkCategoryModalContext';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <BookmarkCategoryModalProvider>{children}</BookmarkCategoryModalProvider>
    </>
  );
};

export default Layout;
