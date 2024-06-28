import { expect, test, vi, describe, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProfilePage from '@/app/(protected)/profile/[username]/page';
import { makeServer } from './mocks/server';
import { Server } from 'miragejs';
import * as dbUser from '@/db_access/user';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

// Mock numeral
vi.mock('numeral', () => ({
  default: (value: number) => ({
    format: () => value?.toString(),
  }),
}));

const getUserProfilePageInfoSpy = vi.spyOn(dbUser, 'getUserProfilePageInfo');

describe('Profile Page', () => {
  let server: Server;

  beforeEach(() => {
    server = makeServer({ environment: 'test' });
  });

  afterEach(() => {
    server.shutdown();
    vi.clearAllMocks();
  });

  test('renders all profile components when data exists', async () => {
    // Create test data
    const user = server.create('user', {
      name: 'Test User',
      username: 'testuser',
      image: 'https://example.com/avatar.jpg',
    });

    const profile = server.create('profile', {
      userId: user.id,
      bio: 'Test bio',
      tagline: 'Test tagline',
      location: 'Test location',
      followersCount: 100,
      followingCount: 50,
      websiteUrl: 'https://example.com',
      githubUrl: 'https://github.com/testuser',
      linkedinUrl: 'https://linkedin.com/in/testuser',
      twitterUrl: 'https://twitter.com/testuser',
      techStack: 'React,Node.js,TypeScript',
    });
    console.log(user.attrs, profile.attrs);
    getUserProfilePageInfoSpy.mockResolvedValueOnce({
      users: user.attrs,
      profile: profile.attrs,
    });

    const page = await ProfilePage({ params: { username: 'testuser' } });
    render(page);

    // Check basic user info
    expect(screen.getByText('Test User')).toBeDefined();
    expect(screen.getByText('@testuser')).toBeDefined();
    expect(screen.getByText('Test tagline')).toBeDefined();

    // Check follower counts
    expect(screen.getByText('100')).toBeDefined(); // followers
    expect(screen.getByText('50')).toBeDefined(); // following

    // Check bio
    expect(screen.getByText('Test bio')).toBeDefined();

    // Check location
    expect(screen.getByText('Test location')).toBeDefined();

    // Check social links
    expect(screen.getByText('Website')).toBeDefined();
    expect(screen.getByText('GitHub')).toBeDefined();
    expect(screen.getByText('LinkedIn')).toBeDefined();
    expect(screen.getByText('Twitter')).toBeDefined();

    // Check tech stack
    expect(screen.getByText('Tech Stack')).toBeDefined();
    expect(screen.getByText('React')).toBeDefined();
    expect(screen.getByText('Node.js')).toBeDefined();
    expect(screen.getByText('TypeScript')).toBeDefined();

    // Check edit button
    expect(screen.getByText('Edit user')).toBeDefined();
  });

  test('redirects to not found when user does not exist', async () => {
    const { notFound } = await import('next/navigation');

    await ProfilePage({ params: { username: 'nonexistentuser' } });

    expect(notFound).toHaveBeenCalled();
  });

  test('renders avatar with initials when no image is provided', async () => {
    const user = server.create('user', {
      name: 'Test User',
      username: 'testuser',
      image: null,
    });

    server.create('profile', {
      userId: user.id,
    });

    const page = await ProfilePage({ params: { username: 'testuser' } });
    render(page);

    // Check if avatar with initial 'T' is rendered
    const avatar = screen.getByText('T');
    expect(avatar).toBeDefined();
  });

  test('renders profile without optional fields', async () => {
    const user = server.create('user', {
      name: 'Test User',
      username: 'testuser',
    });

    server.create('profile', {
      userId: user.id,
      // Omit optional fields
    });

    const page = await ProfilePage({ params: { username: 'testuser' } });
    render(page);

    // Basic info should still be present
    expect(screen.getByText('Test User')).toBeDefined();
    expect(screen.getByText('@testuser')).toBeDefined();

    // Optional elements should not be present
    expect(screen.queryByText('Website')).toBeNull();
    expect(screen.queryByText('Tech Stack')).toBeNull();
    expect(screen.queryByText('Location:')).toBeNull();
  });
});
