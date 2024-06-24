'use client';

import { CircularProgress, Container, Stack } from '@mui/material';
import { HashLoader } from 'react-spinners';

export default function Loading() {
  return (
    <Container>
      <Stack
        alignItems="center"
        justifyContent="center"
        height="100vh"
        color={'text.primary'}
      >
        <HashLoader />
      </Stack>
    </Container>
  );
}
