import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['he', 'en'],
  defaultLocale: 'he',
  localeDetection: false,
  localePrefix: 'always',
});

export const config = {
  matcher: ['/', '/(he|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
};
