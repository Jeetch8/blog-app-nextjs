'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Popover,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
  Modal,
  TextField,
  Paper,
} from '@mui/material';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import AddIcon from '@mui/icons-material/Add';
import { useSession } from 'next-auth/react';
import { AcceptedMethods, useFetch } from '@/hooks/useFetch';
import { bookmark_category } from '@prisma/client';

interface Category {
  id: string;
  title: string;
  description?: string;
  category_blog: {
    blogId: string;
  }[];
}

interface Props {
  blogId: string;
  isBookmarked: boolean;
}

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

export default function AddToBookmarkSelect({ blogId, isBookmarked }: Props) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set()
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCategoryTitle, setNewCategoryTitle] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const { data: session } = useSession();

  const { doFetch: addToCategory } = useFetch<any>({
    url: '',
    method: AcceptedMethods.POST,
  });
  const { doFetch: removeFromCategory } = useFetch<any>({
    url: '',
    method: AcceptedMethods.DELETE,
  });
  const { doFetch: createCategoryFetch, dataRef: createCategoryData } =
    useFetch<{ category: bookmark_category }>({
      url: '/api/bookmark/category',
      method: AcceptedMethods.POST,
    });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/category');
      const data = await response.json();
      setCategories(data.categories);

      // Initialize selected categories based on existing bookmarks
      const selected = new Set<string>();
      data.categories.forEach((category: Category) => {
        if (category.category_blog.some((blog) => blog.blogId === blogId)) {
          selected.add(category.id);
        }
      });
      setSelectedCategories(selected);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

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
    try {
      if (selectedCategories.has(categoryId)) {
        // Remove from category
        await fetch(`/api/bookmark/category/${categoryId}/bookmark`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ blogId }),
        });
        selectedCategories.delete(categoryId);
      } else {
        // Add to category
        await fetch(`/api/bookmark/category/${categoryId}/bookmark`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ blogId }),
        });
        selectedCategories.add(categoryId);
      }
      setSelectedCategories(new Set(selectedCategories));
    } catch (error) {
      console.error('Failed to update bookmark:', error);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryTitle.trim()) return;

    try {
      await createCategoryFetch({
        title: newCategoryTitle,
        description: newCategoryDescription,
      });

      // Add blog to the newly created category
      await fetch(
        `/api/bookmark/category/${createCategoryData?.current?.category.id}/bookmark`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ blogId }),
        }
      );

      setIsCreateModalOpen(false);
      setNewCategoryTitle('');
      setNewCategoryDescription('');
      fetchCategories();
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? 'bookmark-popover' : undefined;

  if (!session?.user) return null;

  return (
    <Box>
      <Tooltip title="Add to bookmarks">
        <IconButton onClick={handleClick} color="inherit">
          {selectedCategories.size > 0 || isBookmarked ? (
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
        <Box sx={{ width: 300, maxHeight: 400, p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Save to...
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <>
              <List sx={{ width: '100%' }}>
                {categories.map((category) => (
                  <ListItem
                    key={category.id}
                    dense
                    component={Button}
                    onClick={() => handleToggleCategory(category.id)}
                  >
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={selectedCategories.has(category.id)}
                        tabIndex={-1}
                        disableRipple
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={category.title}
                      secondary={category.description}
                    />
                  </ListItem>
                ))}
              </List>
              <Button
                startIcon={<AddIcon />}
                onClick={() => setIsCreateModalOpen(true)}
                fullWidth
                sx={{ mt: 2 }}
              >
                Create new list
              </Button>
            </>
          )}
        </Box>
      </Popover>

      <Modal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      >
        <Paper sx={modalStyle}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Create new list
          </Typography>
          <TextField
            fullWidth
            label="List name"
            value={newCategoryTitle}
            onChange={(e) => setNewCategoryTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description (optional)"
            value={newCategoryDescription}
            onChange={(e) => setNewCategoryDescription(e.target.value)}
            multiline
            rows={2}
            sx={{ mb: 3 }}
          />
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleCreateCategory}
              disabled={!newCategoryTitle.trim()}
            >
              Create
            </Button>
          </Box>
        </Paper>
      </Modal>
    </Box>
  );
}
