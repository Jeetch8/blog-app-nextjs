'use client';

import {
  Box,
  Tab,
  Tabs,
  Card,
  CardContent,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Pagination,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { MoreVert as MoreVertIcon, Add as AddIcon } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { blogs } from '@/db/schema';
import { useFetch, FetchStates } from '@/hooks/useFetch';
import toast from 'react-hot-toast';
import { HashLoader } from 'react-spinners';
import { useFetch as useDeleteFetch } from '@/hooks/useFetch';

dayjs.extend(relativeTime);

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`blog-tabpanel-${index}`}
      aria-labelledby={`blog-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface BlogsResponse {
  blogs: (typeof blogs.$inferSelect)[];
  pagination: {
    nextCursor: number | null;
    prevCursor: number | null;
    total: number;
  };
}

function BlogCard({
  blog,
  isPublished,
  onDeleteSuccess,
}: {
  blog: any;
  isPublished: boolean;
  onDeleteSuccess: () => void;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const router = useRouter();

  const { doFetch: deleteBlog, fetchState: deleteState } = useDeleteFetch({
    url: `/api/blog/${blog.id}`,
    method: 'DELETE',
    onSuccess: () => {
      toast.success('Blog deleted successfully');
      onDeleteSuccess();
      handleDeleteDialogClose();
    },
    onError: () => {
      toast.error('Failed to delete blog');
    },
  });

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteDialogOpen = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };

  const handleDelete = async () => {
    await deleteBlog();
  };

  const handleAction = (action: string) => {
    switch (action) {
      case 'edit':
        router.push(`/write/${blog.id}`);
        break;
      case 'view':
        router.push(`/blog/${blog.id}`);
        break;
      case 'delete':
        handleDeleteDialogOpen();
        break;
    }
    handleMenuClose();
  };

  return (
    <>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6">{blog.title}</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            {blog.shortDescription}
          </Typography>

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mt: 2 }}
          >
            <Stack direction="row" spacing={2}>
              <Typography variant="body2" color="text.secondary">
                Updated {dayjs(blog.updatedAt).fromNow()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {blog.readingTime} min read
              </Typography>
            </Stack>

            <IconButton onClick={handleMenuClick}>
              <MoreVertIcon />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              {isPublished ? (
                <>
                  <MenuItem onClick={() => handleAction('edit')}>Edit</MenuItem>
                  <MenuItem onClick={() => handleAction('view')}>View</MenuItem>
                  <MenuItem onClick={() => handleAction('delete')}>
                    Delete
                  </MenuItem>
                </>
              ) : (
                <>
                  <MenuItem onClick={() => handleAction('edit')}>
                    Edit Draft
                  </MenuItem>
                  <MenuItem onClick={() => handleAction('delete')}>
                    Delete Draft
                  </MenuItem>
                </>
              )}
            </Menu>
          </Stack>
        </CardContent>
      </Card>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Delete Blog</DialogTitle>
        <DialogContent>
          Are you sure you want to delete "{blog.title}"? This action cannot be
          undone.
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDeleteDialogClose}
            disabled={deleteState === FetchStates.LOADING}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            disabled={deleteState === FetchStates.LOADING}
          >
            {deleteState === FetchStates.LOADING ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default function BlogsPage() {
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(1);
  const params = useParams();
  const username = params.username as string;
  const router = useRouter();

  const { fetchState, doFetch, dataRef } = useFetch<BlogsResponse>({
    url: `/api/user/${username}/blogs`,
    method: 'GET',
    onError: (error) => {
      toast.error('Failed to fetch blogs');
    },
  });

  useEffect(() => {
    const status = tabValue === 0 ? 'PUBLISHED' : 'DRAFT';
    doFetch(
      undefined,
      `/api/user/${username}/blogs?page=${page}&status=${status}`
    );
  }, [page, tabValue, username]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setPage(1); // Reset pagination when switching tabs
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  const handleDeleteSuccess = () => {
    // Refetch the blogs after successful deletion
    const status = tabValue === 0 ? 'PUBLISHED' : 'DRAFT';
    doFetch(
      undefined,
      `/api/user/${username}/blogs?page=${page}&status=${status}`
    );
  };

  const handleCreateNewBlog = () => {
    router.push('/blog/new');
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Published" />
            <Tab label="Drafts" />
          </Tabs>
          {/* <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateNewBlog}
          >
            Create New Blog
          </Button> */}
        </Stack>
      </Box>

      {fetchState === FetchStates.LOADING ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: 4,
            color: 'text.primary',
          }}
        >
          <HashLoader />
        </Box>
      ) : (
        <>
          <CustomTabPanel value={tabValue} index={0}>
            {dataRef.current?.blogs.length === 0 ? (
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  No published blogs yet
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateNewBlog}
                  sx={{ mt: 2 }}
                >
                  Create Your First Blog
                </Button>
              </Box>
            ) : (
              dataRef.current?.blogs.map((blog) => (
                <BlogCard
                  key={blog.id}
                  blog={blog}
                  isPublished={true}
                  onDeleteSuccess={handleDeleteSuccess}
                />
              ))
            )}
          </CustomTabPanel>

          <CustomTabPanel value={tabValue} index={1}>
            {dataRef.current?.blogs.length === 0 ? (
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  No drafts yet
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateNewBlog}
                  sx={{ mt: 2 }}
                >
                  Create New Draft
                </Button>
              </Box>
            ) : (
              dataRef.current?.blogs.map((blog) => (
                <BlogCard
                  key={blog.id}
                  blog={blog}
                  isPublished={false}
                  onDeleteSuccess={handleDeleteSuccess}
                />
              ))
            )}
          </CustomTabPanel>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={dataRef.current?.pagination.total}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </>
      )}
    </Box>
  );
}
