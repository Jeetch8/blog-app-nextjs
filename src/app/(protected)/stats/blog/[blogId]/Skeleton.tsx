import {
  Container,
  Box,
  Stack,
  Card,
  CardContent,
  Skeleton,
  Divider,
  Grid2,
} from '@mui/material';
import { memo } from 'react';

const StatsPageSkeleton = memo(() => (
  <Container>
    <Box sx={{ pt: 3, color: 'text.primary' }}>
      <Stack direction="row" justifyContent="space-between" mb={4}>
        <Stack direction="row" spacing={2}>
          {[1, 2, 3].map((i) => (
            <Card key={i} sx={{ minWidth: 200 }}>
              <CardContent>
                <Skeleton width={100} height={32} />
                <Skeleton width={120} height={42} />
              </CardContent>
            </Card>
          ))}
        </Stack>
        <Box>
          <Skeleton width={150} height={40} />
        </Box>
      </Stack>

      <Box sx={{ height: 400 }}>
        <Skeleton variant="rectangular" width="100%" height={400} />
      </Box>
    </Box>
    <Divider sx={{ my: 4 }} />
    <Grid2 container spacing={2} sx={{ width: '100%', pb: 10 }}>
      <Grid2 size="grow">
        <Skeleton variant="rectangular" width="100%" height={400} />
      </Grid2>
      <Grid2 size="grow">
        <Skeleton variant="rectangular" width="100%" height={400} />
      </Grid2>
    </Grid2>
  </Container>
));

export default StatsPageSkeleton;
