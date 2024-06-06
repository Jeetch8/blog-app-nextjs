import { Box, Container, Stack, Typography } from '@mui/material';
import Link from 'next/link';
import RssFeedIcon from '@mui/icons-material/RssFeed';
import NavbarMenu from './navbar/NavbarMenu';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { User } from '@prisma/client';

async function Navbar() {
  const session = await getServerSession(authOptions);

  return (
    <Box
      component="nav"
      sx={{
        bgcolor: 'primary.main',
        mb: 2,
        position: 'sticky',
        top: 0,
        py: '5px',
        zIndex: 1000,
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
            component={Link}
            href="/"
            direction="row"
            alignItems="center"
            gap={0}
            sx={{ color: 'white', textDecoration: 'none' }}
          >
            <Typography
              variant="h5"
              noWrap
              sx={{
                mr: 2,
                flexGrow: 1,
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              Blog
            </Typography>
            <RssFeedIcon />
          </Stack>

          <Box>
            <NavbarMenu user={session?.user as User} />
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}

export default Navbar;
