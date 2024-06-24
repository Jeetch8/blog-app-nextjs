'use client';

import React from 'react';
import {
  Box,
  Container,
  Stack,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import PersonIcon from '@mui/icons-material/Person';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';

const navItems = [
  { title: 'Profile', path: '/settings/profile', icon: <PersonIcon /> },
  { title: 'Account', path: '/settings/account', icon: <AccountCircleIcon /> },
  {
    title: 'Manage Subscription',
    path: '/settings/manage_subscription',
    icon: <SubscriptionsIcon />,
  },
];

const Layout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  return (
    <Container sx={{ color: 'text.primary', py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Settings
      </Typography>
      <Stack direction={{ xs: 'column', tablet: 'row' }} spacing={4}>
        <Box component="nav" sx={{ width: 240, flexShrink: 0 }}>
          <List sx={{ display: { xs: 'flex', tablet: 'block' }, gap: 2 }}>
            {navItems.map((item) => (
              <ListItem
                key={item.path}
                component={Link}
                href={item.path}
                sx={{
                  backgroundColor:
                    pathname === item.path ? 'action.hover' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.title}
                  sx={{ color: 'text.primary' }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
        <Box component="main" sx={{ flexGrow: 1 }}>
          {children}
        </Box>
      </Stack>
    </Container>
  );
};

export default Layout;
