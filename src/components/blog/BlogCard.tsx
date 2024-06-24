'use client';

import Typography from '@mui/material/Typography';
import { Avatar, Box, Stack, useTheme } from '@mui/material';
import dayjs from 'dayjs';
import AddToBookmarkSelect from '@/components/blog/AddToBookmarkSelect';
import { IHomeBlog } from '@/app/(protected)/home/page';
import Link from 'next/link';
import { useMemo, useRef } from 'react';
import gsap from 'gsap';
import numeral from 'numeral';
import { Caveat } from 'next/font/google';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const caveatFont = Caveat({
  subsets: ['latin'],
});

export default function BlogCard({
  data,
  isBookmarked,
}: {
  data: IHomeBlog;
  isBookmarked: boolean;
}) {
  const { palette } = useTheme();
  const container = useRef<HTMLDivElement | null>(null);
  const createdAt = useMemo(() => {
    return dayjs(data.createdAt).fromNow();
  }, [data.createdAt]);
  console.log(data);

  const cardHoverTl = useMemo(() => {
    if (!container.current) return;
    const tl = gsap.timeline({
      defaults: { ease: 'power4.inOut', duration: 0.5 },
      paused: true,
    });
    tl.to(container.current?.querySelector('.banner_img img'), {
      scale: 1.1,
      duration: 1,
    })
      .to(
        container.current,
        {
          backgroundColor: palette.action.hover,
          duration: 0.5,
        },
        '-=1'
      )
      .to(
        container.current?.querySelector('.author-underline'),
        {
          scaleX: 1,
          duration: 0.4,
        },
        '-=1'
      );
    return tl;
  }, [container.current]);

  const handleCardHoverEnter = () => {
    cardHoverTl?.play();
  };

  const handleCardHoverLeave = () => {
    cardHoverTl?.reverse();
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return numeral(num).format('0.0a').toUpperCase(); // This will format like 1K, 1.2K, 1M etc.
    }
    return num.toString();
  };

  return (
    <Stack
      ref={container}
      sx={{
        color: 'text.primary',
        maxWidth: '700px',
        borderRadius: 3,
        paddingX: 3,
        paddingY: 3,
        marginY: 2,
        cursor: 'pointer',
      }}
      onMouseEnter={handleCardHoverEnter}
      onMouseLeave={handleCardHoverLeave}
    >
      <Stack direction="row" spacing={2}>
        <Avatar src={data.author.image || ''} aria-label="profile" />
        <Stack direction="column">
          <Stack direction="column" position="relative">
            <Typography
              component={Link}
              href={`/profile/${data.author.id}`}
              lineHeight={1.4}
              fontSize={20}
              fontWeight={600}
              sx={{ textDecoration: 'none', color: 'text.primary' }}
              fontFamily={caveatFont.style.fontFamily}
            >
              {data.author.name}
            </Typography>
            <Box
              className="author-underline"
              sx={{
                position: 'absolute',
                bottom: 2,
                left: 0,
                width: '100%',
                height: '2px',
                borderRadius: '2px',
                backgroundColor: 'white',
                transform: 'scaleX(0)',
                transformOrigin: 'left',
              }}
            />
          </Stack>
          <Typography fontSize={12} color="text.secondary">
            {createdAt}
          </Typography>
        </Stack>
      </Stack>
      <Stack
        width={'100%'}
        direction={{ xs: 'column', tablet: 'row' }}
        spacing={2}
        justifyContent="space-between"
      >
        <Box paddingTop={'10px'} maxWidth={{ xs: '100%', tablet: '460px' }}>
          <Typography
            component={Link}
            href={`/blog/${data.id}`}
            fontSize={20}
            variant="h6"
            fontWeight={600}
            sx={{
              textDecoration: 'none',
              color: 'text.primary',
            }}
          >
            {data.title}
          </Typography>
          <Typography
            fontSize={16}
            paddingTop={'5px'}
            color="text.secondary"
            display={{ xs: 'none', tablet: 'block' }}
          >
            {data.shortDescription}
          </Typography>
        </Box>
        {data.bannerImg && (
          <Box
            height={{ xs: '400px', tablet: '120px' }}
            width={{ xs: '100%', tablet: '200px' }}
            className="banner_img"
            sx={{
              overflow: 'hidden',
              borderRadius: 2,
            }}
          >
            <Box
              sx={{
                backgroundImage: `url(${data.bannerImg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: '100%',
                width: '100%',
              }}
            />
          </Box>
        )}
      </Stack>
      <Box>
        <Stack
          direction="row"
          spacing={2}
          fontSize={16}
          marginTop={'10px'}
          alignItems="center"
          fontWeight={600}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={1.5}>
            <Typography color="text.secondary" fontWeight={600}>
              {formatNumber(data.numberOfLikes)} likes
            </Typography>
            <span style={{ fontWeight: 500 }}>·</span>
            <Typography fontWeight={600} color="text.secondary">
              {formatNumber(data.numberOfComments)} comments
            </Typography>
          </Stack>
          {data?.categoryBlogs !== undefined ? (
            <AddToBookmarkSelect isBookmarked={isBookmarked} blogId={data.id} />
          ) : null}
        </Stack>
      </Box>
    </Stack>
  );
}
