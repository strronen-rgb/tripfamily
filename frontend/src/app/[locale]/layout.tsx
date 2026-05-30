import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';
import { AuthProvider } from '../../lib/auth';
import LocaleLayoutInner from './layout-client';

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  let messages;
  try {
    messages = (await import(`../../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <AuthProvider>
        <LocaleLayoutInner locale={locale}>
          {children}
        </LocaleLayoutInner>
      </AuthProvider>
    </NextIntlClientProvider>
  );
}
