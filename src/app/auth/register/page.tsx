import EmailButton from '@/components/buttons/auth/EmailButton';
import GithubButton from '@/components/buttons/auth/GithubButton';
import GoogleButton from '@/components/buttons/auth/GoogleButton';
import { Container, Typography, Stack } from '@mui/material';

async function getProviders() {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/providers`);

  if (!res.ok) {
    throw new Error('Failed to fetch providers');
  }
  const data = await res.json();
  return data;
}

export default async function SignUpOptions() {
  // const resp: ReturnType<typeof getProviders> = (await getProviders()) || {};

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <Stack spacing={4} alignItems="center">
        <Typography variant="h4" component="h1" fontWeight="bold">
          Registter
        </Typography>
        <Stack spacing={2} width="400px">
          <GoogleButton text="Sign Up with Google" />
          <EmailButton text="Sign Up with Email" type="register" />
          <GithubButton text="Sign Up with Github" />
        </Stack>
      </Stack>
    </Container>
  );
}
