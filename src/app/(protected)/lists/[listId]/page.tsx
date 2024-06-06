import { Container, Typography, Box } from '@mui/material';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import BlogCard from '@/components/blog/BlogCard';
import { getCategoryWithBlogs } from '@/db_access/bookmark';
import relativeTime from 'dayjs/plugin/relativeTime';
import dayjs from 'dayjs';

dayjs.extend(relativeTime);

export default async function ListDetailPage({
  params,
}: {
  params: { listId: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const category = await getCategoryWithBlogs(params.listId, session.user.id);
  if (!category) {
    redirect('/lists');
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, color: 'text.primary' }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        {category.title}
      </Typography>
      {category.description && (
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          {category.description}
        </Typography>
      )}

      {category.category_blog.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">No blogs bookmarked</Typography>
        </Box>
      ) : (
        <Box>
          {category.category_blog.map((cb) => (
            <BlogCard key={cb.id} blog={cb.blog} isBookmarked={true} />
          ))}
        </Box>
      )}
    </Container>
  );
}
