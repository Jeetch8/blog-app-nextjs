'use client';

import * as React from 'react';
import { useCallback, useState } from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import {
  Avatar,
  IconButton,
  Typography,
  CircularProgress,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import dayjs from 'dayjs';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import InfiniteScroll from 'react-infinite-scroller';
import { useParams } from 'next/navigation';
import { AcceptedMethods, useFetch } from '@/hooks/useFetch';
import Tooltip from '@mui/material/Tooltip';

interface Like {
  id: string;
  createdAt: string;
  user: {
    name: string;
    image: string;
    username: string;
  };
}

interface Props {
  numberOfLikes: number;
  hasUserLikedBlog: boolean;
}

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '100%',
  maxWidth: 600,
  maxHeight: '80vh',
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
  outline: 'none',
};

export default function BlogLikesDrawer({
  numberOfLikes,
  hasUserLikedBlog,
}: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [likes, setLikes] = useState<Like[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLiking, setIsLiking] = useState(false);
  const [localHasLiked, setLocalHasLiked] = useState(hasUserLikedBlog);
  const [localLikesCount, setLocalLikesCount] = useState(numberOfLikes);
  const { blogId } = useParams();

  const { doFetch: likeBlog } = useFetch<any>({
    url: `/api/blog/${blogId}/likes`,
    method: AcceptedMethods.PATCH,
  });

  const handleLike = async () => {
    if (isLiking || localHasLiked) return;

    try {
      setIsLiking(true);
      await likeBlog();
      setLocalHasLiked(true);
      setLocalLikesCount((prev) => prev + 1);

      // Refresh likes list if modal is open
      if (isModalOpen) {
        setLikes([]);
        setPage(1);
        setHasMore(true);
        fetchLikes(1);
      }
    } catch (error) {
      console.error('Failed to like blog:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const fetchLikes = useCallback(
    async (pageNum: number) => {
      try {
        const res = await fetch(`/api/blog/${blogId}/likes?page=${pageNum}`);
        const data = await res.json();

        if (data.likes.length < 20) {
          setHasMore(false);
        }

        setLikes((prev) => [...prev, ...data.likes]);
        setPage(pageNum + 1);
      } catch (error) {
        console.error('Failed to fetch likes:', error);
      }
    },
    [blogId]
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '1px' }}>
        <IconButton
          aria-label="like"
          onClick={handleLike}
          disabled={localHasLiked || isLiking}
          color={localHasLiked ? 'primary' : 'default'}
        >
          {isLiking ? (
            <CircularProgress size={20} />
          ) : localHasLiked ? (
            <FavoriteIcon color="primary" />
          ) : (
            <FavoriteBorderIcon color="secondary" />
          )}
        </IconButton>
        <Box
          component={'span'}
          onClick={() => setIsModalOpen(true)}
          sx={{
            cursor: 'pointer',
            color: 'gray',
            ':hover': { color: 'primary.main' },
          }}
        >
          <Tooltip title="View likes">
            <span aria-label="view likes">{localLikesCount}</span>
          </Tooltip>
        </Box>
      </Box>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        aria-labelledby="likes-modal-title"
      >
        <Paper sx={modalStyle}>
          <Box
            sx={{
              mb: 3,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography id="likes-modal-title" variant="h6">
              Likes from {numberOfLikes} users
            </Typography>
            <IconButton onClick={() => setIsModalOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          <Box
            sx={{ height: '60vh', overflow: 'auto' }}
            className="noScrollbars"
          >
            <InfiniteScroll
              pageStart={0}
              loadMore={() => fetchLikes(page)}
              hasMore={hasMore}
              useWindow={false}
              loader={
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              }
            >
              {likes.map((like) => (
                <Box
                  key={like.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Avatar src={like.user.image} alt={like.user.name} />
                  <Box>
                    <Typography variant="subtitle2">
                      {like.user.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {dayjs(like.createdAt).fromNow()}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </InfiniteScroll>
          </Box>
        </Paper>
      </Modal>
    </Box>
  );
}
