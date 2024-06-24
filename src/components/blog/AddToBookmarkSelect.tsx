'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Popover,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  CircularProgress,
  IconButton,
  Tooltip,
  Button,
} from '@mui/material';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import AddIcon from '@mui/icons-material/Add';
import { useSession } from 'next-auth/react';
import { AcceptedMethods, useFetch } from '@/hooks/useFetch';
import { useBookmarkCategoryModal } from '@/components/context/BookmarkCategoryModalContext';

interface Category {
  id: string;
  title: string;
  description?: string;
  checked: boolean;
}

interface Props {
  blogId: string;
  isBookmarked: boolean;
}

export default function AddToBookmarkSelect({ blogId, isBookmarked }: Props) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<Set<string>>(
    new Set()
  );
  const { data: session } = useSession();
  const { openModal } = useBookmarkCategoryModal();

  const { doFetch: fetchCategories, fetchState: categoriesLoading } = useFetch<{
    categories: Category[];
  }>({
    url: `/api/category?blogId=${blogId}`,
    method: AcceptedMethods.GET,
    onSuccess: (data) => {
      setCategories(data.categories);
    },
  });

  const { doFetch: addBookmark } = useFetch<any, any>({
    url: `/api/bookmark/category`,
    method: AcceptedMethods.PUT,
    onSuccess: (data: { categoryId: string }) => {
      console.log(data);
      setCategories((prev) =>
        prev.map((category) =>
          category.id === data.categoryId
            ? { ...category, checked: !category.checked }
            : category
        )
      );
      setLoadingCategories((prev) => {
        const next = new Set(prev);
        next.delete(data.categoryId);
        return next;
      });
    },
    onError: (error: { categoryId: string }) => {
      setLoadingCategories((prev) => {
        const next = new Set(prev);
        next.delete(error.categoryId);
        return next;
      });
    },
  });
  const { doFetch: removeBookmark } = useFetch<any, any>({
    url: `/api/bookmark/category`,
    method: AcceptedMethods.DELETE,
    onSuccess: (data: { categoryId: string }) => {
      console.log(data);
      setCategories((prev) =>
        prev.map((category) =>
          category.id === data.categoryId
            ? { ...category, checked: !category.checked }
            : category
        )
      );
      setLoadingCategories((prev) => {
        const next = new Set(prev);
        next.delete(data.categoryId);
        return next;
      });
    },
    onError: (error: { categoryId: string }) => {
      setLoadingCategories((prev) => {
        const next = new Set(prev);
        next.delete(error.categoryId);
        return next;
      });
    },
  });

  useEffect(() => {
    if (session?.user && anchorEl) {
      fetchCategories();
    }
  }, [session?.user, anchorEl]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleToggleCategory = async (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category || loadingCategories.has(categoryId)) return;

    setLoadingCategories((prev) => new Set([...prev, categoryId]));
    if (category.checked) {
      await removeBookmark({ blogId }, `/api/category/${categoryId}/bookmark`);
    } else {
      await addBookmark({ blogId }, `/api/category/${categoryId}/bookmark`);
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? 'bookmark-popover' : undefined;

  useEffect(() => {
    const handleScroll = () => {
      if (open) {
        handleClose();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [open]);

  if (!session?.user) return null;

  const calcIsBookmarked = useMemo(() => {
    if (categories.length === 0 && isBookmarked) return true;
    return categories.some((cat) => cat.checked);
  }, [categories, isBookmarked]);

  return (
    <Box>
      <Tooltip title="Add to bookmarks">
        <IconButton onClick={handleClick} color="inherit">
          {calcIsBookmarked ? (
            <BookmarkIcon color="primary" />
          ) : (
            <BookmarkBorderIcon />
          )}
        </IconButton>
      </Tooltip>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box
          sx={{
            width: 300,
            display: 'flex',
            flexDirection: 'column',
            height: '400px',
          }}
        >
          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              px: 2,
              py: 1,
            }}
          >
            {categoriesLoading === 'loading' ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <List sx={{ width: '100%', color: 'text.primary' }}>
                {categories.map((category) => (
                  <ListItem
                    key={category.id}
                    dense
                    component={Button}
                    onClick={() => handleToggleCategory(category.id)}
                    disabled={loadingCategories.has(category.id)}
                    sx={{
                      width: '100%',
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      opacity: loadingCategories.has(category.id) ? 0.7 : 1,
                    }}
                  >
                    <ListItemIcon>
                      {loadingCategories.has(category.id) ? (
                        <CircularProgress size={20} />
                      ) : (
                        <Checkbox
                          edge="start"
                          checked={category.checked}
                          tabIndex={-1}
                          disableRipple
                        />
                      )}
                    </ListItemIcon>
                    <ListItemText>{category.title}</ListItemText>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>

          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Button
              startIcon={<AddIcon />}
              onClick={() => {
                openModal();
                handleClose();
              }}
              fullWidth
              variant="contained"
            >
              Create new list
            </Button>
          </Box>
        </Box>
      </Popover>
    </Box>
  );
}
