import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '../src/lib/auth';
import { authOptions } from './api/auth/[...nextauth]/route';
import './globals.css';

export const metadata = {
  title: 'TripFamily — מתכנן טיולים משפחתי',
  description: 'מתכנן טיולים משפחתי — טאילנד, יפן, דרום קוריאה',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TripFamily',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0F0F23',
};

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  const session = await getServerSession(authOptions);

  return (
    <html lang={locale} dir="rtl">
      <head>
        <meta name="theme-color" content="#0F0F23" />
        <link rel="icon" type="image/svg+xml" href="/icons/icon.svg" />
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>
        <SessionProvider session={session}>
          <AuthProvider>
            <NextIntlClientProvider locale={locale} messages={messages}>
              {children}
            </NextIntlClientProvider>
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
