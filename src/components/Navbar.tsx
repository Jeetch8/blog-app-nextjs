import { Box, Container, Stack, Typography } from '@mui/material';
import Link from 'next/link';
import RssFeedIcon from '@mui/icons-material/RssFeed';
import NavbarMenu from './navbar/NavbarMenu';
// import NavbarMenu from './navbar/TestNavbarMenu';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import ThemeToggler from './navbar/ThemeToggler';

async function Navbar() {
  const session = await getServerSession(authOptions);

  return (
    <Box
      component="nav"
      sx={{
        // bgcolor: 'background.paper',
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        color: 'text.primary',
        mb: 2,
        position: 'sticky',
        top: 0,
        py: '5px',
        zIndex: 10,
      }}
    >
      <Container maxWidth="xl">
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ padding: '5px' }}
        >
          <Stack
            direction="row"
            alignItems="center"
            gap={0}
            color={'text.primary'}
            sx={{ textDecoration: 'none' }}
          >
            <Typography
              component={Link}
              href="/"
              variant="h5"
              noWrap
              sx={{
                mr: 2,
                flexGrow: 1,
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                textDecoration: 'none',
              }}
            >
              Blog
            </Typography>
          </Stack>

          <Box>
            <ThemeToggler />
            <NavbarMenu user={session?.user} />
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
export default Navbar;
