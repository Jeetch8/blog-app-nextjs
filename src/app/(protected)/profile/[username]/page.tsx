import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { notFound } from 'next/navigation';
import {
  Avatar,
  Button,
  Container,
  Stack,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import { getUserProfilePageInfo } from '@/db_access/user';
import Link from 'next/link';
import numeral from 'numeral';
import {
  Person,
  LocationOn,
  Language,
  GitHub,
  LinkedIn,
  Twitter,
  CalendarToday,
  Code,
} from '@mui/icons-material';

const ProfilePage = async ({ params }: { params: { username: string } }) => {
  const data = await getUserProfilePageInfo(params.username);
  if (!data) notFound();

  return (
    <Container sx={{ color: 'text.primary' }}>
      <Stack spacing={4} sx={{ marginTop: 10 }}>
        {/* First row */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" spacing={4} alignItems="center">
            {data.users?.image ? (
              <Avatar src={data.users.image} sx={{ width: 150, height: 150 }} />
            ) : (
              <Avatar sx={{ width: 150, height: 150 }}>
                {data.users?.name?.[0]}
              </Avatar>
            )}
            <Stack>
              <Typography variant="h4" fontWeight="bold">
                {data.users?.name}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                @{data.users?.username}
              </Typography>
              {data.profiles?.tagline && (
                <Typography variant="body1">
                  {data.profiles?.tagline}
                </Typography>
              )}
              <Stack direction="row" spacing={2} mt={1}>
                <Typography>
                  <strong>
                    {numeral(data.profiles?.followersCount).format('0a')}
                  </strong>{' '}
                  followers
                </Typography>
                <Typography>
                  <strong>
                    {numeral(data.profiles?.followingCount).format('0a')}
                  </strong>{' '}
                  following
                </Typography>
              </Stack>
            </Stack>
          </Stack>
          <Link href="/settings/profile" passHref>
            <Button variant="outlined">Edit user</Button>
          </Link>
        </Stack>

        {/* Second row */}
        {data.profiles?.bio && (
          <Box>
            <Typography
              variant="body1"
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <Person sx={{ mr: 1 }} /> {data.profiles?.bio}
            </Typography>
          </Box>
        )}

        {/* Third row */}
        <Stack
          direction="row"
          justifyContent="center"
          spacing={2}
          flexWrap="wrap"
        >
          {data.profiles?.location && (
            <Typography sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationOn sx={{ mr: 0.5 }} /> {data.profiles?.location}
            </Typography>
          )}
          {data.profiles?.websiteUrl && (
            <Link href={data.profiles?.websiteUrl} passHref>
              <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                <Language sx={{ mr: 0.5 }} /> Website
              </Typography>
            </Link>
          )}
          {data.profiles?.githubUrl && (
            <Link href={data.profiles?.githubUrl} passHref>
              <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                <GitHub sx={{ mr: 0.5 }} /> GitHub
              </Typography>
            </Link>
          )}
          {data.profiles?.linkedinUrl && (
            <Link href={data.profiles?.linkedinUrl} passHref>
              <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                <LinkedIn sx={{ mr: 0.5 }} /> LinkedIn
              </Typography>
            </Link>
          )}
          {data.profiles?.twitterUrl && (
            <Link href={data.profiles?.twitterUrl} passHref>
              <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                <Twitter sx={{ mr: 0.5 }} /> Twitter
              </Typography>
            </Link>
          )}
          {data.profiles?.createdAt && (
            <Typography sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarToday sx={{ mr: 0.5 }} /> Member since{' '}
              {new Date(data.profiles?.createdAt).toLocaleDateString()}
            </Typography>
          )}
        </Stack>

        {/* Tech stack */}
        {data.profiles?.techStack && (
          <Box>
            <Typography
              variant="h6"
              sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
            >
              <Code sx={{ mr: 1 }} /> Tech Stack
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {data.profiles?.techStack.split(',').map((tech, index) => (
                <Chip key={index} label={tech.trim()} variant="outlined" />
              ))}
            </Stack>
          </Box>
        )}
      </Stack>
    </Container>
  );
};

export default ProfilePage;
