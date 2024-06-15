import Typography from '@mui/material/Typography';
import { Avatar, AvatarGroup, Box, Button, Stack } from '@mui/material';
import dayjs from 'dayjs';
import AddToBookmarkSelect from '@/components/blog/AddToBookmarkSelect';
import Image from 'next/image';
import { IHomeBlog } from '@/app/(protected)/page';
import Link from 'next/link';

export default function BlogCard({
  data,
  isBookmarked,
}: {
  data: IHomeBlog;
  isBookmarked: boolean;
}) {
  const createdAt = dayjs(data.createdAt).fromNow();

  return (
    <Stack
      sx={{
        color: 'text.primary',
        maxWidth: '640px',
        border: '1px solid gray',
        borderRadius: 3,
        paddingX: 3,
        paddingY: 3,
        marginY: 2,
      }}
    >
      <Stack direction="row" spacing={2}>
        <Avatar src={data.author.image || ''} aria-label="profile" />
        <Stack direction="column">
          <Typography fontSize={14} fontWeight={600}>
            {data.author.name}
          </Typography>
          <Typography fontSize={12} color="text.secondary">
            {createdAt}
          </Typography>
        </Stack>
      </Stack>
      <Stack direction="row" spacing={2} justifyContent="space-between">
        <Box>
          <Typography
            component={Link}
            href={`/blog/${data.id}`}
            fontSize={20}
            fontWeight={600}
            sx={{ textDecoration: 'none', color: 'text.primary' }}
          >
            {data.title}
          </Typography>
          <Typography fontSize={14} color="text.secondary">
            {data.shortDescription}
          </Typography>
        </Box>
        {data.bannerImg && (
          <Box>
            {/* <Image
        src=.banner_img}
        alt="banner"
        width={300}
        height={200}
        style={{ objectFit: 'cover' }}
      /> */}
            <img
              height={100}
              width={160}
              style={{ borderRadius: 10 }}
              src={data.bannerImg}
              alt="banner"
            />
          </Box>
        )}
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
            src={data.author.image || ''}
            aria-label="profile"
          />
          <Avatar
            sx={{ height: 25, width: 25 }}
            src={data.author.image || ''}
            aria-label="profile"
          />
          <Avatar
            sx={{ height: 25, width: 25 }}
            src={data.author.image || ''}
            aria-label="profile"
          />
          <Avatar
            sx={{ height: 25, width: 25 }}
            src={data.author.image || ''}
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
              {data.numberOfLikes} likes
            </Typography>
            <span>·</span>
            <Typography fontSize={14} color="text.secondary">
              {data.numberOfComments} comments
            </Typography>
          </Stack>
          <AddToBookmarkSelect isBookmarked={isBookmarked} blogId={data.id} />
        </Stack>
      </Box>
    </Stack>
  );
}
