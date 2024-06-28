import { Poppins } from 'next/font/google';
import Provider from '@/components/providers/SessionProvider';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { Box, CssBaseline } from '@mui/material';
import theme from '@/theme';
import '@/app/globals.css';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@mui/material/styles';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

export const metadata = {
  title: 'NextJs 14 App Router and NextAuth',
  description: 'NextJs 14 App Router and NextAuth',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={theme}>
      <html lang="en">
        <body className={poppins.className}>
          <AppRouterCacheProvider>
            <Provider>
              <Box
                sx={{
                  background: 'background.default',
                  position: 'relative',
                }}
              >
                {children}
              </Box>
            </Provider>
            <CssBaseline enableColorScheme />
          </AppRouterCacheProvider>
          <Toaster />
        </body>
      </html>
    </ThemeProvider>
  );
}
