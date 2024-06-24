'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import BookmarkCategoryModal from '../Modals/BookmarkCategoryModal';

interface BookmarkCategoryModalContextType {
  openModal: () => void;
  closeModal: () => void;
  isModalOpen: boolean;
}

const BookmarkCategoryModalContext = createContext<
  BookmarkCategoryModalContextType | undefined
>(undefined);

export function BookmarkCategoryModalProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <BookmarkCategoryModalContext.Provider
      value={{ openModal, closeModal, isModalOpen }}
    >
      {children}
      <BookmarkCategoryModal isOpen={isModalOpen} onClose={closeModal} />
    </BookmarkCategoryModalContext.Provider>
  );
}

export function useBookmarkCategoryModal() {
  const context = useContext(BookmarkCategoryModalContext);
  if (context === undefined) {
    throw new Error(
      'useBookmarkCategoryModal must be used within a BookmarkCategoryModalProvider'
    );
  }
  return context;
}
