'use client';

import { useTheme } from '@mui/material/styles';
import { IconButton, useColorScheme } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

export default function ThemeToggler() {
  const { mode, setMode } = useColorScheme();

  const handleThemeToggle = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };
  return (
    <IconButton
      onClick={handleThemeToggle}
      sx={{ mr: 2, color: 'text.primary' }}
    >
      {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
    </IconButton>
  );
}
