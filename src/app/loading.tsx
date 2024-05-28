'use client';

import { CircularProgress, Container, Stack } from '@mui/material';

export default function Loading() {
  return (
    <Container>
      <Stack alignItems="center" justifyContent="center" height="100vh">
        <CircularProgress />
      </Stack>
    </Container>
  );
}
