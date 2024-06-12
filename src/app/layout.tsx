import { Inter } from 'next/font/google';
import Provider from '@/components/providers/SessionProvider';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from '@/theme';
import '@/app/globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

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
    <html lang="en">
      <body className={inter.className} style={{ background: '#192231' }}>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <Provider>{children}</Provider>
            <CssBaseline enableColorScheme />
          </ThemeProvider>
        </AppRouterCacheProvider>
        <Toaster />
      </body>
    </html>
  );
}
