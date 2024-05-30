'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  defaultColorScheme: 'dark',
  palette: {
    mode: 'dark',
    primary: {
      main: '#5893df',
    },
    secondary: {
      main: '#2ec5d3',
    },
    text: {
      primary: '#fff',
    },
    background: {
      default: '#192231',
      paper: '#24344d',
    },
  },
});

export default theme;
