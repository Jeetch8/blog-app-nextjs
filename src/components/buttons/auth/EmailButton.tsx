'use client';

import { Button } from '@mui/material';
import { signIn } from 'next-auth/react';
import { Email } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export default function EmailButton({
  text,
  type,
}: {
  text: string;
  type: 'signin' | 'register';
}) {
  const router = useRouter();
  return (
    <Button
      size="large"
      variant="contained"
      onClick={() => router.push(`/auth/${type}/email`)}
      startIcon={<Email />}
    >
      {text}
    </Button>
  );
}
