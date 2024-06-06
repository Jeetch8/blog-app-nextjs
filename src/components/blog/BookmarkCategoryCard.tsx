'use client';

import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useFetch from '@/hooks/useFetch';
import Link from 'next/link';

interface BookmarkCategory {
  id: string;
  title: string;
  description?: string | null;
  category_blog: {
    blog: {
      banner_img: string;
    };
  }[];
}

interface Props {
  category: BookmarkCategory;
}

export default function BookmarkCategoryCard({ category }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { fetchData: deleteCategory } = useFetch<any>(
    `/api/bookmark/category/${category.id}`,
    'DELETE'
  );

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteCategory();
      router.refresh();
    } catch (error) {
      console.error('Failed to delete category:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Box
      sx={{
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        '&:hover': {
          boxShadow: 1,
        },
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
      >
        <Box>
          <Typography
            variant="h6"
            sx={{ mb: 1, textDecoration: 'none' }}
            component={Link}
            prefetch={false}
            href={`/lists/${category.id}`}
          >
            {category.title}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {category.category_blog.length} blogs
          </Typography>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Edit list">
              <IconButton
                size="small"
                onClick={() => router.push(`/lists/${category.id}/edit`)}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete list">
              <IconButton
                size="small"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        <Stack direction="row" sx={{ position: 'relative' }}>
          {category.category_blog.slice(0, 4).map((item, index) => (
            <Box
              key={index}
              component="img"
              src={item.blog.banner_img}
              alt=""
              sx={{
                width: 100,
                height: 100,
                objectFit: 'cover',
                borderRadius: 1,
                ml: index > 0 ? -2 : 0,
                border: '2px solid',
                borderColor: 'background.paper',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  zIndex: 1,
                },
              }}
            />
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}
