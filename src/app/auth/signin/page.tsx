import LoginButton from '@/components/buttons/LoginButton';
import { Container, Typography, Stack } from '@mui/material';

async function getProviders() {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/providers`);

  if (!res.ok) {
    throw new Error('Failed to fetch providers');
  }
  const data = await res.json();
  return data;
}

export default async function SignInOptions() {
  const resp: ReturnType<typeof getProviders> = (await getProviders()) || {};
  console.log(resp);

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
          Welcome back!
        </Typography>
        <Stack spacing={2} width="400px">
          {Object.values(resp).map((provider) => (
            <LoginButton auth={provider} key={provider.id} />
          ))}
        </Stack>
      </Stack>
    </Container>
  );
}
