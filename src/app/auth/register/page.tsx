import EmailButton from '@/components/buttons/auth/EmailButton';
import GithubButton from '@/components/buttons/auth/GithubButton';
import GoogleButton from '@/components/buttons/auth/GoogleButton';
import { Container, Typography, Stack } from '@mui/material';

export default async function SignUpOptions() {
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
