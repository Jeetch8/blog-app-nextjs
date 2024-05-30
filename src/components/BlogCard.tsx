export interface BlogCardProps {
  title: string;
  description: string;
  image: string;
  author: string;
  date: string;
  createdAt: string;
  number_of_likes: number;
  number_of_comments: number;
  short_description: string;
  banner_img: string;
  id: string;
  user: {
    profile_img: string;
    name: string;
  };
}

import Typography from '@mui/material/Typography';
import { Avatar, AvatarGroup, Box, Button, Stack } from '@mui/material';
import dayjs from 'dayjs';
import AddToBookmarSelect from './AddToBookmarSelect';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function BlogCard({ blog }: { blog: BlogCardProps }) {
  const navigate = useRouter();
  console.log(blog, 'blog');
  const navigateToBlog = () => {
    let title = blog.title;
    let temp = encodeURIComponent(title.replace(/\s+/g, '-'));
    navigate.push(`/blog/${temp}-${blog.id}`);
  };
  const createdAt = dayjs(blog.createdAt).fromNow();

  return (
    <Stack sx={{ color: 'text.primary', maxWidth: '600px' }}>
      <Stack direction="row" spacing={2}>
        <Avatar src={blog.user.profile_img} aria-label="profile" />
        <Stack direction="column">
          <Typography fontSize={14} fontWeight={600}>
            {blog.user.name}
          </Typography>
          <Typography fontSize={12} color="text.secondary">
            {createdAt}
          </Typography>
        </Stack>
      </Stack>
      <Stack direction="row" spacing={2} justifyContent="space-between">
        <Box>
          <Typography fontSize={18} fontWeight={600}>
            {blog.title}
          </Typography>
          <Typography fontSize={14} color="text.secondary">
            {blog.short_description}
          </Typography>
        </Box>
        <Box>
          {/* <Image
            src={blog.banner_img}
            alt="banner"
            width={300}
            height={200}
            style={{ objectFit: 'cover' }}
          /> */}
          <img
            height={100}
            width={160}
            style={{ borderRadius: 10 }}
            src={blog.banner_img}
            alt="banner"
          />
        </Box>
      </Stack>
      <Box>
        <AvatarGroup
          max={4}
          sx={{
            justifyContent: 'start',
          }}
        >
          <Avatar
            sx={{ height: 25, width: 25 }}
            src={blog.user.profile_img}
            aria-label="profile"
          />
          <Avatar
            sx={{ height: 25, width: 25 }}
            src={blog.user.profile_img}
            aria-label="profile"
          />
          <Avatar
            sx={{ height: 25, width: 25 }}
            src={blog.user.profile_img}
            aria-label="profile"
          />
          <Avatar
            sx={{ height: 25, width: 25 }}
            src={blog.user.profile_img}
            aria-label="profile"
          />
        </AvatarGroup>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={0.5}>
            <Typography fontSize={14} color="text.secondary">
              {blog.number_of_likes} likes
            </Typography>
            <span>·</span>
            <Typography fontSize={14} color="text.secondary">
              {blog.number_of_comments} comments
            </Typography>
          </Stack>
          <AddToBookmarSelect />
        </Stack>
      </Box>
    </Stack>
  );
}
