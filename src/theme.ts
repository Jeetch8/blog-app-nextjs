'use client';
import { createTheme } from '@mui/material/styles';
import { Theme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface BreakpointOverrides {
    xs: true;
    sm: true;
    md: true;
    lg: true;
    xl: true;
    mobile: false;
    tablet: true;
    laptop: false;
    desktop: false;
  }
}

const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      tablet: 800,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  defaultColorScheme: 'light',
  colorSchemes: {
    light: {
      palette: {
        mode: 'light',
        primary: {
          main: '#2196f3',
          light: '#64b5f6',
          dark: '#1976d2',
        },
        secondary: {
          main: '#ff4081',
          light: '#ff80ab',
          dark: '#f50057',
        },
        background: {
          default: '#ffffff',
          paper: '#f7f7f9',
        },
        text: {
          primary: '#1a1a1a',
          secondary: '#666666',
        },
        divider: '#e0e0e0',
        action: {
          active: '#2196f3',
          hover: 'rgba(33, 150, 243, 0.08)',
          selected: 'rgba(33, 150, 243, 0.16)',
        },
      },
    },
    dark: {
      palette: {
        mode: 'dark',
        primary: {
          main: '#90caf9',
          light: '#b3e5fc',
          dark: '#42a5f5',
        },
        secondary: {
          main: '#ff80ab',
          light: '#ff99bb',
          dark: '#ff4081',
        },
        background: {
          default: '#121212',
          paper: '#1e1e1e',
        },
        text: {
          primary: '#ffffff',
          secondary: '#b3b3b3',
        },
        divider: '#404040',
        action: {
          active: '#90caf9',
          hover: 'rgba(239, 239, 240, 0.08)',
          selected: 'rgba(144, 202, 24, 0.16)',
        },
        grey: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#eeeeee',
          300: '#e0e0e0',
          400: '#bdbdbd',
          500: '#9e9e9e',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121',
          A100: '#f5f5f5',
          A200: '#eeeeee',
          A400: '#bdbdbd',
          A700: '#616161',
        },
      },
    },
  },
});

export default theme;
