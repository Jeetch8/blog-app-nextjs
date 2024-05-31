import React from 'react';
import { CustomAxiosAuth } from '../utils/CustomAxios';
import {
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  Typography,
} from '@mui/material';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import { useSession } from 'next-auth/react';

const AddToBookmarSelect = () => {
  const { data: user } = useSession();
  const [isSelectOpen, setIsSelectOpen] = React.useState(false);
  // const { data, isLoading, isFetching, error, isError } = useQuery({
  //   queryKey: ["bookmarkCategoryList"],
  //   queryFn: () =>
  //     CustomAxiosAuth(user?.token as string).get("/bookmark/category/list"),
  // });

  // const handleBookmarkCategory = (categoryId: string) => {
  //   console.log(categoryId);
  // };

  return (
    <Box sx={{ color: 'text.primary' }}>
      <IconButton onClick={() => setIsSelectOpen(!isSelectOpen)}>
        <BookmarkBorderIcon />
      </IconButton>
      {isSelectOpen && (
        <List
          sx={{
            position: 'absolute',
            border: '.5px solid black',
            borderRadius: '5px',
            backgroundColor: 'black',
            color: 'text.primary',
          }}
        >
          <ListItem
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              color: 'text.primary',
            }}
          >
            <input type="checkbox" /> hello
          </ListItem>
          <Divider />
          <ListItem sx={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <input type="checkbox" /> hello
          </ListItem>
          <Divider />

          <ListItem sx={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <input type="checkbox" /> hello
          </ListItem>
        </List>
      )}
    </Box>
  );
};

export default AddToBookmarSelect;
