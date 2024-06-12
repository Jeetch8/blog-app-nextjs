'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Menu,
  MenuItem,
  Typography,
  Avatar,
  ListItemIcon,
  Button,
} from '@mui/material';
import { signOut } from 'next-auth/react';
import {
  Person,
  Edit,
  Bookmark,
  BarChart,
  Settings,
  Logout,
  Login,
} from '@mui/icons-material';
import { User } from '@prisma/client';

const settings = [
  { title: 'Profile', path: '/profile', icon: <Person fontSize="small" /> },
  { title: 'Write', path: '/write', icon: <Edit fontSize="small" /> },
  {
    title: 'Lists',
    path: '/lists',
    icon: <Bookmark fontSize="small" />,
  },
  { title: 'Stats', path: '/stats', icon: <BarChart fontSize="small" /> },
  { title: 'Settings', path: '/settings', icon: <Settings fontSize="small" /> },
];

interface NavbarMenuProps {
  user: User;
}

const NavbarMenu = ({ user }: NavbarMenuProps) => {
  const router = useRouter();
  if (!user) {
    return (
      <Button
        variant="outlined"
        startIcon={<Login fontSize="small" />}
        sx={{ px: 1, color: 'text.primary', borderRadius: 4 }}
        onClick={() =>
          router.push('/auth/signin?callbackUrl=' + window.location.href)
        }
      >
        Login
      </Button>
    );
  }

  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
    null
  );

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const onNavMenuOptionClick = (path: string) => {
    router.push(path);
    handleCloseUserMenu();
  };

  return (
    <>
      <Button
        startIcon={<Avatar alt="User Avatar" src={user.image || undefined} />}
        onClick={handleOpenUserMenu}
        sx={{ px: 1, color: 'text.primary', borderRadius: 4 }}
      >
        <Typography>{user.name.toUpperCase()}</Typography>
      </Button>
      <Menu
        sx={{ mt: '45px' }}
        id="menu-appbar"
        anchorEl={anchorElUser}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorElUser)}
        onClose={handleCloseUserMenu}
      >
        {settings.map((setting) => (
          <MenuItem
            key={setting.title}
            onClick={() => onNavMenuOptionClick(setting.path)}
          >
            <ListItemIcon>{setting.icon}</ListItemIcon>
            <Typography textAlign="center">{setting.title}</Typography>
          </MenuItem>
        ))}
        <MenuItem
          onClick={() =>
            signOut({
              redirect: true,
            })
          }
        >
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          <Typography textAlign="center">Logout</Typography>
        </MenuItem>
      </Menu>
    </>
  );
};

export default NavbarMenu;
