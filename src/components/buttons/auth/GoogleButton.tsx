'use client';

import { Button } from '@mui/material';
import { signIn } from 'next-auth/react';
import { Google } from '@mui/icons-material';

export default function GoogleButton({ text }: { text: string }) {
  return (
    <Button
      size="large"
      variant="contained"
      onClick={() => signIn('google')}
      startIcon={<Google />}
    >
      {text}
    </Button>
  );
}
