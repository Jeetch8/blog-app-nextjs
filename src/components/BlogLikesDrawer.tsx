interface Props {
  likesList: any;
  numberOfLikes: number;
  blogId: string;
  hasUserLikedBlog: boolean;
}

import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import { Avatar, IconButton, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { CustomAxiosAuth } from '../utils/CustomAxios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useSession } from 'next-auth/react';

dayjs.extend(relativeTime);
export default function BlogLikesDrawer({
  likesList,
  numberOfLikes,
  blogId,
  hasUserLikedBlog,
}: Props) {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const { data: user } = useSession();

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

  // const { mutateAsync: handleLikeBlog } = useMutation({
  //   mutationKey: ['likeBlog'],
  //   mutationFn: async () => {
  //     const res = await CustomAxiosAuth(user?.token as string).post(
  //       `/blog/:${blogId}/like`
  //     );
  //     return res.data;
  //   },
  //   onSuccess: (data) => {
  //     if (data.success === true) hasUserLikedBlog = true;
  //   },
  // });

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '1px',
        }}
      >
        <IconButton
          aria-label="like"
          onClick={() => handleLikeBlog()}
          disabled={hasUserLikedBlog}
        >
          {hasUserLikedBlog ? <FavoriteIcon /> : <FavoriteBorderIcon />}
        </IconButton>
        <Tooltip title="View likes" placement="top">
          <Box
            component={'span'}
            onClick={toggleDrawer(true)}
            sx={{
              cursor: 'pointer',
              color: 'gray',
              ':hover': { color: 'red' },
            }}
          >
            <span aria-label="view likes">{numberOfLikes}</span>
          </Box>
        </Tooltip>
      </Box>
      <Drawer open={isDrawerOpen} anchor="right" onClose={toggleDrawer(false)}>
        <Box sx={{ width: 400 }} role="presentation">
          <Box sx={{ padding: '0 10px' }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h2>Liked by</h2>
              <Button
                color="inherit"
                sx={{ color: 'black' }}
                onClick={toggleDrawer(false)}
              >
                <CloseIcon />
              </Button>
            </Box>
            {likesList?.map((like: any) => {
              return (
                <Box
                  key={like.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '0px 10px',
                  }}
                >
                  <Avatar
                    sx={{ width: 50, height: 50 }}
                    alt={like.user.name}
                    src={like.user.profile_img}
                  />
                  <Box sx={{ lineHeight: '5px' }}>
                    <h4>{like.user.name}</h4>
                    <p>{dayjs(like.createdAt).fromNow()}</p>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
}
