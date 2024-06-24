import Typography from '@mui/material/Typography';
import { Avatar, AvatarGroup, Box, Button, Stack } from '@mui/material';
import dayjs from 'dayjs';
import AddToBookmarkSelect from '@/components/blog/AddToBookmarkSelect';
import { IHomeBlog } from '@/app/(protected)/home/page';
import Link from 'next/link';
import { useCallback, useMemo, useRef } from 'react';
import gsap from 'gsap';
import numeral from 'numeral';
import { Caveat } from 'next/font/google';

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
  const container = useRef<HTMLDivElement | null>(null);
  const createdAt = useMemo(() => {
    return dayjs(data.createdAt).fromNow();
  }, [data.createdAt]);

  const cardHoverTl = useMemo(() => {
    if (!container.current) return;
    const tl = gsap.timeline({
      defaults: { ease: 'power4.inOut', duration: 0.5 },
      paused: true,
    });
    tl.to(container.current?.querySelector('.banner_img'), {
      scale: 1.05,
      duration: 1,
    })
      .to(
        container.current,
        {
          borderColor: 'white',
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
    console.log('enter');
    cardHoverTl?.play();
  };

  const handleCardHoverLeave = () => {
    cardHoverTl?.reverse();
  };

  return (
    <Box
      ref={container}
      //   height={{ xs: 400, sm: 300, md: 500 }}
      display={{ md: 'grid' }}
      height={'fit'}
      gridTemplateColumns={{ md: '1fr 1fr' }}
      gap={5}
      sx={{
        color: 'text.primary',
        paddingTop: 3,
        paddingBottom: 6,
        cursor: 'pointer',
        borderTop: '1px solid',
        borderColor: 'gray',
      }}
      onMouseEnter={handleCardHoverEnter}
      onMouseLeave={handleCardHoverLeave}
    >
      <Box>
        <Typography
          className="hoverable"
          variant="h4"
          fontWeight={100}
          component={Link}
          sx={{
            textDecoration: 'none',
            color: 'text.primary',
          }}
          href={`/blog/${data.id}`}
        >
          {data.title}
        </Typography>
        <Box
          sx={{
            overflow: 'hidden',
            height: 330,
            marginY: 2,
            // border: '1px solid white',
          }}
        >
          <Box
            className="banner_img"
            sx={{
              height: '100%',
              backgroundRepeat: 'no-repeat',
              background: `url(${data.bannerImg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          ></Box>
        </Box>
      </Box>
      <Box
        display={{ xs: 'block', md: 'flex' }}
        flexDirection={'column'}
        justifyContent={'space-between'}
      >
        <Box>
          <Typography fontSize={17}>{data.shortDescription}</Typography>
        </Box>
        <Stack
          direction={'row'}
          justifyContent={'space-between'}
          paddingTop={2}
        >
          <Stack direction="column" position="relative">
            <Typography
              fontSize={24}
              fontWeight={600}
              lineHeight={0.5}
              style={caveatFont.style}
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
          <Box color="text.secondary">
            <span>{createdAt}</span>
            <span>{' . '}</span>
            <span>{data.readingTime} min read</span>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
