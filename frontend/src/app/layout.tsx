'use client';

import { ReactNode, useEffect, useState } from 'react';
import { SessionProvider } from 'next-auth/react';
import './globals.css';

export const metadata = {
  title: 'TripFamily — מתכנן טיולים משפחתי',
  description: 'מתכנן טיולים משפחתי — טאילנד, יפן, דרום קוריאה',
  manifest: '/manifest.json',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0F0F23',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <meta name="theme-color" content="#0F0F23" />
        <link rel="icon" type="image/svg+xml" href="/icons/icon.svg" />
      </head>
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
