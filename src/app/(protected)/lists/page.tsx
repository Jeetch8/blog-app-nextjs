import { Container, Typography, Box, Button } from '@mui/material';
import BookmarkCategoryCard from '@/components/blog/BookmarkCategoryCard';
import BookmarkCategoryModal from '@/components/Modals/BookmarkCategoryModal';
import { getUserBookmarkCategories } from '@/db_access/blog';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';

export default async function ListsPage() {
  const session = await getServerSession(authOptions);

  const categories = await getUserBookmarkCategories(session?.user?.id!);

  return (
    <Container maxWidth="lg" sx={{ py: 4, color: 'text.primary' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4">Your Library</Typography>
        <BookmarkCategoryModal />
      </Box>

      {categories.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">No categories found</Typography>
        </Box>
      ) : (
        <Box>
          {categories.map((category) => (
            <Box key={category.id} sx={{ my: 4 }}>
              <BookmarkCategoryCard category={category} />
            </Box>
          ))}
        </Box>
      )}
    </Container>
  );
}
