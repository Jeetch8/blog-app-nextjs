import { Stack, Typography } from '@mui/material';
import Image from 'next/image';
import React from 'react';

const page = () => {
  return (
    <Stack alignItems="center" justifyContent="center" spacing={2}>
      <Image
        src={'/images/in_progress.svg'}
        alt="logo"
        width={400}
        height={400}
      />
      <Typography variant="h5" textAlign="center">
        In Progress
      </Typography>
    </Stack>
  );
};

export default page;
