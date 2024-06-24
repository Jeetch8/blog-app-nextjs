'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Menu,
  MenuItem,
  Typography,
  Avatar,
  ListItemIcon,
  Button,
  IconButton,
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
import { User } from 'next-auth';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';

interface NavbarMenuProps {
  user: User | undefined;
}

const NavbarMenu = ({ user }: NavbarMenuProps) => {
  const router = useRouter();
  if (!user) {
    return (
      <Button
        variant="outlined"
        startIcon={<Login fontSize="small" />}
        sx={{
          px: 1,
          color: 'text.primary',
          borderRadius: 4,
          borderWidth: 2,
        }}
        onClick={() =>
          router.push('/auth/signin?callbackUrl=' + window.location.href)
        }
      >
        Login
      </Button>
    );
  }

  const settings = useMemo(
    () => [
      {
        title: 'Profile',
        path: `/profile/${(user as any).username}`,
        icon: <Person fontSize="small" />,
      },
      { title: 'Write', path: '/write', icon: <Edit fontSize="small" /> },
      {
        title: 'Reading Lists',
        path: '/lists',
        icon: <Bookmark fontSize="small" />,
      },
      { title: 'Stats', path: '/stats', icon: <BarChart fontSize="small" /> },
      {
        title: 'My Blogs',
        path: `/profile/${(user as any).username}/blogs`,
        icon: <FormatListNumberedIcon fontSize="small" />,
      },
      {
        title: 'Settings',
        path: '/settings',
        icon: <Settings fontSize="small" />,
      },
    ],
    [user]
  );

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
      <IconButton
        onClick={handleOpenUserMenu}
        sx={{ color: 'text.primary', borderRadius: 4 }}
      >
        <Avatar alt="User Avatar" src={user.image || undefined} />
      </IconButton>
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
