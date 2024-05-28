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
import { getUserProfileByUsername } from '@/db_access/user';
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

const ProfilePage = async ({ params }: { params: { userId: string } }) => {
  const session = await getServerSession(authOptions);
  if (session?.user?.name?.toLowerCase().split(' ').join('-') !== params.userId)
    notFound();

  const profile = await getUserProfileByUsername(params.userId);

  if (!profile) notFound();

  return (
    <Container>
      <Stack spacing={4} sx={{ marginTop: 10 }}>
        {/* First row */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" spacing={4} alignItems="center">
            {session?.user?.image ? (
              <Avatar
                src={session.user.image}
                sx={{ width: 150, height: 150 }}
              />
            ) : (
              <Avatar sx={{ width: 150, height: 150 }}>
                {session?.user?.name?.[0]}
              </Avatar>
            )}
            <Stack>
              <Typography variant="h4" fontWeight="bold">
                {profile.username}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                @{profile.username?.toLowerCase().split(' ').join('-')}
              </Typography>
              {profile.tagline && (
                <Typography variant="body1">{profile.tagline}</Typography>
              )}
              <Stack direction="row" spacing={2} mt={1}>
                <Typography>
                  <strong>
                    {numeral(profile.followers_count).format('0a')}
                  </strong>{' '}
                  followers
                </Typography>
                <Typography>
                  <strong>
                    {numeral(profile.following_count).format('0a')}
                  </strong>{' '}
                  following
                </Typography>
              </Stack>
            </Stack>
          </Stack>
          <Link href="/settings/profile" passHref>
            <Button variant="outlined">Edit Profile</Button>
          </Link>
        </Stack>

        {/* Second row */}
        {profile.bio && (
          <Box>
            <Typography
              variant="body1"
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <Person sx={{ mr: 1 }} /> {profile.bio}
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
          {profile.location && (
            <Typography sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationOn sx={{ mr: 0.5 }} /> {profile.location}
            </Typography>
          )}
          {profile.website && (
            <Link href={profile.website} passHref>
              <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                <Language sx={{ mr: 0.5 }} /> Website
              </Typography>
            </Link>
          )}
          {profile.github_url && (
            <Link href={profile.github_url} passHref>
              <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                <GitHub sx={{ mr: 0.5 }} /> GitHub
              </Typography>
            </Link>
          )}
          {profile.linkedin_url && (
            <Link href={profile.linkedin_url} passHref>
              <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                <LinkedIn sx={{ mr: 0.5 }} /> LinkedIn
              </Typography>
            </Link>
          )}
          {profile.twitter_url && (
            <Link href={profile.twitter_url} passHref>
              <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                <Twitter sx={{ mr: 0.5 }} /> Twitter
              </Typography>
            </Link>
          )}
          {profile.createdAt && (
            <Typography sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarToday sx={{ mr: 0.5 }} /> Member since{' '}
              {new Date(profile.createdAt).toLocaleDateString()}
            </Typography>
          )}
        </Stack>

        {/* Tech stack */}
        {profile.tech_stack && (
          <Box>
            <Typography
              variant="h6"
              sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
            >
              <Code sx={{ mr: 1 }} /> Tech Stack
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {profile.tech_stack.split(',').map((tech, index) => (
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
