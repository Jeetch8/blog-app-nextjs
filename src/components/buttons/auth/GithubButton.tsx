'use client';

import { Button } from '@mui/material';
import { signIn } from 'next-auth/react';
import { GitHub } from '@mui/icons-material';

export default function GithubButton({ text }: { text: string }) {
  return (
    <Button
      size="large"
      variant="contained"
      onClick={() => signIn('github')}
      startIcon={<GitHub />}
    >
      {text}
    </Button>
  );
}
