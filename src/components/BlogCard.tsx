interface BlogCardProps {
  title: string;
  description: string;
  image: string;
  author: string;
  date: string;
}

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { Avatar, CardActionArea, CardActions, CardHeader } from '@mui/material';
import CommentIcon from '@mui/icons-material/Comment';
import FavoriteIcon from '@mui/icons-material/Favorite';
import dayjs from 'dayjs';
import AddToBookmarSelect from './AddToBookmarSelect';
import { useRouter } from 'next/navigation';

export default function BlogCard({ obj }: any) {
  const navigate = useRouter();
  const navigateToBlog = () => {
    let title = obj.title;
    let temp = encodeURIComponent(title.replace(/\s+/g, '-'));
    navigate.push(`/blog/${temp}-${obj.id}`);
  };
  const createdAt = dayjs(obj.createdAt).fromNow();

  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardHeader
        avatar={<Avatar src={obj.user.profile_img} aria-label="recipe" />}
        title={obj.user.name}
        subheader={createdAt}
      />
      <CardActionArea onClick={navigateToBlog}>
        <CardMedia
          component="img"
          height="140"
          image={obj.banner_img}
          alt="green iguana"
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {obj.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {obj.short_description}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions>
        <span>
          <FavoriteIcon /> {obj.number_of_likes}
        </span>
        <span>
          <CommentIcon /> {obj.number_of_comments}
        </span>
        <AddToBookmarSelect />
      </CardActions>
    </Card>
  );
}
