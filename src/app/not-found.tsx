import React from 'react';
import { Button, Container, Typography } from '@mui/material';
import Image from 'next/image';

const notFound = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
      <Container
        sx={{
          backgroundColor: 'background.default',
          color: 'text.primary',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <Image
          src="/images/not_found.svg"
          alt="not found"
          width={500}
          height={500}
        />
        <Typography variant="h5">Not Found</Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          The page you are looking for does not exist.
        </Typography>
        <Button variant="outlined" color="info" href="/" sx={{ mt: 2 }}>
          Go to Home
        </Button>
      </Container>
    </>
  );
};

export default notFound;
