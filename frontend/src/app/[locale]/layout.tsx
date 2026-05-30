import { notFound } from 'next/navigation';
import { ReactNode } from 'react';
import LocaleLayoutInner from './layout-client';

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  // Verify locale is supported
  if (!['he', 'en'].includes(locale)) {
    notFound();
  }

  return (
    <LocaleLayoutInner locale={locale}>
      {children}
    </LocaleLayoutInner>
  );
}
