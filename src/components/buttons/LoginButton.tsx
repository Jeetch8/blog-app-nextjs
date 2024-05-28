'use client';

import { signIn } from 'next-auth/react';
import { MailOutline } from '@mui/icons-material';
import type { ClientSafeProvider } from 'next-auth/react';
import Image from 'next/image';
import { Button } from '@mui/material';

const Icon = ({ provider }: { provider: string }) => {
  let imagePath = '';

  if (provider === 'Google') {
    imagePath = '/images/icons/google.svg';
  } else if (provider === 'GitHub') {
    imagePath = '/images/icons/github.svg';
  } else {
    imagePath = '/images/icons/google.svg';
  }
  return (
    <Image
      src={imagePath}
      width={25}
      height={25}
      alt={provider}
      style={{ marginRight: '16px' }}
    />
  );
};

export default function LoginButton({ auth }: { auth?: ClientSafeProvider }) {
  return (
    <Button
      variant="outlined"
      color="primary"
      fullWidth
      onClick={() => signIn(auth?.id || '')}
      startIcon={
        auth ? (
          auth.id === 'credentials' ? (
            <MailOutline />
          ) : (
            <Icon provider={auth.name} />
          )
        ) : null
      }
      sx={{
        justifyContent: 'flex-start',
        textTransform: 'none',
        transition: 'background-color 0.3s ease',
        py: 1.5,
        '&:hover': {
          backgroundColor: '#5893df',
          color: ' black',
        },
      }}
    >
      {auth ? `Sign In with ${auth.name}` : 'Custom Login Page'}
    </Button>
  );
}
