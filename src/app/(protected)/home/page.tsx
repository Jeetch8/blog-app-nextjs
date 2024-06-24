'use client';

export type IHomeBlog = typeof blogs.$inferSelect & {
  author: Pick<typeof users.$inferSelect, 'name' | 'image' | 'username' | 'id'>;
  categoryBlogs?: Pick<typeof bookmarkCategoryBlogs.$inferSelect, 'id'>[];
};

import { ReactLenis } from 'lenis/dist/lenis-react';
import { memo, useCallback, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { blogs, bookmarkCategoryBlogs, users } from '@/db/schema';
import relativeTime from 'dayjs/plugin/relativeTime';
import dayjs from 'dayjs';
import { Box, Container, Divider, Stack, Typography } from '@mui/material';
import BlogCard from '@/components/blog/BlogCard';
import Image from 'next/image';
import { HashLoader } from 'react-spinners';

dayjs.extend(relativeTime);

interface HomeResponse {
  blogs: IHomeBlog[];
  nextCursor: number;
  prevCursor: number;
  hasMore: boolean;
}

const ErrorContainer = memo(() => {
  return (
    <Container>
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Image
          src="/images/undraw_cancel.svg"
          alt="Error"
          width={300}
          height={300}
        />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Something went wrong
        </Typography>
      </Box>
    </Container>
  );
});

const NoPostToShowContainer = memo(() => {
  return (
    <Box sx={{ textAlign: 'center', mt: 4 }}>
      <Image
        src="/images/undraw_posts.svg"
        alt="No posts"
        width={300}
        height={300}
      />
      <Typography variant="h6" sx={{ mt: 2 }}>
        No posts to show
      </Typography>
    </Box>
  );
});

const Home = () => {
  const [blogs, setBlogs] = useState<IHomeBlog[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [fetchError, setFetchError] = useState<Error | null>(null);

  const fetchPage = useCallback(async (pageParam: number) => {
    return await fetch(`/api/home?page=${pageParam}`)
      .then((res) => res.json())
      .then((data: HomeResponse) => {
        setBlogs((prev) => [...prev, ...data.blogs]);
        setHasMore(data.hasMore);
      })
      .catch((err) => {
        setFetchError(err);
      });
  }, []);

  if (fetchError) {
    return <ErrorContainer />;
  }

  return (
    <Container>
      <Box
        sx={{ marginX: 'auto' }}
        width={{ xs: '100%', tablet: 'fit-content' }}
      >
        {blogs.length === 0 && !hasMore ? (
          <NoPostToShowContainer />
        ) : (
          <ReactLenis
            options={{ overscroll: true, smoothWheel: true, duration: 1.5 }}
            root
          >
            <InfiniteScroll
              pageStart={0}
              loadMore={fetchPage}
              hasMore={hasMore}
              loader={
                <Stack
                  key={0}
                  sx={{ marginY: 6, justifyContent: 'center' }}
                  direction="row"
                >
                  <HashLoader size={45} />
                </Stack>
              }
            >
              {blogs.map((obj, ind) => (
                <>
                  <BlogCard
                    data={obj}
                    key={obj.id + ind}
                    isBookmarked={Boolean(
                      obj?.categoryBlogs && obj?.categoryBlogs?.length > 0
                    )}
                  />
                  <Divider />
                </>
              ))}
            </InfiniteScroll>
          </ReactLenis>
        )}
      </Box>
    </Container>
  );
};

export default Home;
