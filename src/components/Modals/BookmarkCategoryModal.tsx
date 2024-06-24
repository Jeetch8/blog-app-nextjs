'use client';

import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFetch } from '@/hooks/useFetch';
import { useRouter } from 'next/navigation';

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

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface BookmarkCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BookmarkCategoryModal({
  isOpen,
  onClose,
}: BookmarkCategoryModalProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const { doFetch: createCategory } = useFetch<any>({
    url: '/api/bookmark/category',
    method: 'POST',
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createCategory(data);
      reset();
      onClose();
      router.refresh();
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Paper sx={modalStyle}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Create new list
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            {...register('title')}
            fullWidth
            label="List name"
            error={!!errors.title}
            helperText={errors.title?.message}
            sx={{ mb: 2 }}
          />
          <TextField
            {...register('description')}
            fullWidth
            label="Description (optional)"
            multiline
            rows={3}
            sx={{ mb: 3 }}
          />
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Create'
              )}
            </Button>
          </Box>
        </form>
      </Paper>
    </Modal>
  );
}
