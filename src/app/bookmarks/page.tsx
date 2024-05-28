export interface bookmark_category_blog {
  blogId: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  id: string;
  note: string;
  blog: {
    id: string;
    banner_img: string;
    title: string;
    short_description: string;
    createdAt: string;
    number_of_comments: number;
    number_of_likes: number;
    topicId: string;
  };
}

export interface bookmark_category {
  createdAt: string;
  description: string;
  id: string;
  name: string;
  updatedAt: string;
  userId: string;
  category_blog: bookmark_category_blog[];
}

import BookmarkCategoryCard from '@/components/BookmarkCategoryCard';
import { Box, Typography } from '@mui/material';
import BookmarkCategoryModal from '@/components/Modals/BookmarkCategoryModal';
import { CustomAxiosAuth } from '@/utils/CustomAxios';
import { getServerSession } from 'next-auth';

const Bookmark = async () => {
  const session = await getServerSession();

  return (
    <Box sx={{ padding: '20px' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box>
          <Typography variant="h4">Bookmark</Typography>
          <Typography variant="subtitle1">
            Manage your bookmark categories
          </Typography>
        </Box>
        <BookmarkCategoryModal modalType="create" />
      </Box>
      {isFetching || isLoading ? (
        <Box>Loading....</Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            margin: '20px',
            gap: '40px',
          }}
        >
          {data?.data?.categories ? (
            data?.data.categories.map((el) => (
              <BookmarkCategoryCard bookmark_category={el} key={el.id} />
            ))
          ) : (
            <h2>Please create a category</h2>
          )}
        </Box>
      )}
    </Box>
  );
};

export default Bookmark;
