import EmailButton from '@/components/buttons/auth/EmailButton';
import GithubButton from '@/components/buttons/auth/GithubButton';
import GoogleButton from '@/components/buttons/auth/GoogleButton';
import { Container, Typography, Stack } from '@mui/material';

export default async function SignInOptions() {
  return (
    <Container
      maxWidth="sm"
      sx={{
        color: 'text.primary',
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
          <GoogleButton text="Sign In with Google" />
          <EmailButton text="Sign In with Email" type="signin" />
          <GithubButton text="Sign In with Github" />
        </Stack>
      </Stack>
    </Container>
  );
}
