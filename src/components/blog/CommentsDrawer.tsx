'use client';

import * as React from 'react';
import { useCallback, useState } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import {
  Avatar,
  IconButton,
  Typography,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useSession } from 'next-auth/react';
import dayjs from 'dayjs';
import InfiniteScroll from 'react-infinite-scroller';
import {
  BtnBold,
  BtnItalic,
  Toolbar,
  Editor,
  EditorProvider,
} from 'react-simple-wysiwyg';
import { useParams } from 'next/navigation';
import relativeTime from 'dayjs/plugin/relativeTime';
import { AcceptedMethods, useFetch } from '@/hooks/useFetch';
import { MapsUgc, MapsUgcOutlined } from '@mui/icons-material';

dayjs.extend(relativeTime);

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    name: string;
    image: string;
    username: string;
  };
}

interface CommentResponse {
  comment: Comment;
}

interface Props {
  hasUserCommentedBlog: boolean;
  totalComments: number;
}

export default function BlogCommentsDrawer({
  hasUserCommentedBlog,
  totalComments,
}: Props) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [html, setHtml] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { blogId } = useParams();

  const { doFetch: createComment } = useFetch<CommentResponse>({
    url: `/api/blog/${blogId}/comment`,
    method: AcceptedMethods.POST,
  });

  const handleHtmlChange = (e: any) => {
    setHtml(e.target.value);
  };

  const fetchComments = useCallback(
    async (pageNum: number) => {
      try {
        const res = await fetch(`/api/blog/${blogId}/comment?page=${pageNum}`);
        const data = await res.json();

        if (data.comments.length < 15) {
          setHasMore(false);
        }

        setComments((prev) => [...prev, ...data.comments]);
        setPage(pageNum + 1);
      } catch (error) {
        console.error('Failed to fetch comments:', error);
      }
    },
    [blogId]
  );

  const handleCancel = () => {
    setHtml('');
  };

  const handleRespond = async () => {
    if (!html.trim()) return;

    setIsSubmitting(true);
    try {
      await createComment({ content: html });
      setHtml('');
      // Refresh comments
      setComments([]);
      setPage(1);
      setHasMore(true);
      await fetchComments(1);
    } catch (error) {
      console.error('Failed to create comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDrawer =
    (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' ||
          (event as React.KeyboardEvent).key === 'Shift')
      ) {
        return;
      }
      setIsDrawerOpen(open);
    };

  return (
    <div>
      <Button onClick={toggleDrawer(true)} sx={{ color: 'white' }}>
        {hasUserCommentedBlog ? (
          <MapsUgc color="inherit" />
        ) : (
          <MapsUgcOutlined color="inherit" />
        )}
        <span style={{ marginLeft: 6 }}>{totalComments}</span>
      </Button>
      <Drawer open={isDrawerOpen} anchor="right" onClose={toggleDrawer(false)}>
        <Box sx={{ width: 430, height: '100%' }} role="presentation">
          <Box sx={{ padding: '20px' }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
              }}
            >
              <Typography variant="h6">Response</Typography>
              <IconButton color="inherit" onClick={toggleDrawer(false)}>
                <CloseIcon />
              </IconButton>
            </Box>

            <Box sx={{ mb: 3 }}>
              <EditorProvider>
                <Editor
                  value={html}
                  onChange={handleHtmlChange}
                  containerProps={{
                    style: {
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      minHeight: '150px',
                      outline: 'none',
                      boxShadow: 'none',
                    },
                  }}
                >
                  <Toolbar
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#fff',
                    }}
                  >
                    <BtnBold style={{ color: '#fff' }} />
                    <BtnItalic style={{ color: '#fff' }} />
                  </Toolbar>
                </Editor>
              </EditorProvider>
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  mt: 2,
                  justifyContent: 'flex-end',
                }}
              >
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleRespond}
                  disabled={!html.trim() || isSubmitting}
                >
                  {isSubmitting ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Respond'
                  )}
                </Button>
              </Box>
            </Box>

            <div
              className="noScrollbars"
              style={{ height: 'calc(100vh - 300px)', overflow: 'auto' }}
            >
              <InfiniteScroll
                pageStart={0}
                loadMore={() => fetchComments(page)}
                hasMore={hasMore}
                useWindow={false}
                loader={<CircularProgress />}
              >
                {comments.map((comment) => (
                  <Box
                    key={comment.id}
                    sx={{ mb: 3, p: 2, borderBottom: '1px solid #eee' }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <Avatar
                        src={comment.user.image}
                        alt={comment.user.name}
                      />
                      <Box>
                        <Typography variant="subtitle2">
                          {comment.user.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {dayjs(comment.createdAt).fromNow()}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography
                      dangerouslySetInnerHTML={{ __html: comment.content }}
                    />
                  </Box>
                ))}
              </InfiniteScroll>
            </div>
          </Box>
        </Box>
      </Drawer>
    </div>
  );
}
