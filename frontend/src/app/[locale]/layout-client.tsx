'use client';

import { NextIntlClientProvider } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ReactNode } from 'react';

const tabs = [
  { href: '', icon: '🏠', labelKey: 'Home.title' },
  { href: '/explore', icon: '🌏', labelKey: 'Explore.title' },
  { href: '/bookings', icon: '📋', labelKey: 'Bookings.title' },
  { href: '/budget', icon: '💰', labelKey: 'Budget.title' },
  { href: '/profile', icon: '👤', labelKey: 'Profile.title' },
] as const;

export default function LocaleLayoutClient({
  children,
  locale,
  messages,
}: {
  children: ReactNode;
  locale: string;
  messages: Record<string, unknown>;
}) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages as any}>
      <LocaleLayoutInner locale={locale}>
        {children}
      </LocaleLayoutInner>
    </NextIntlClientProvider>
  );
}

function LocaleLayoutInner({ children, locale }: { children: ReactNode; locale: string }) {
  const pathname = usePathname();
  const t = useTranslations();

  const currentPath = pathname.replace(`/${locale}`, '') || '/';

  return (
    <div className="min-h-screen bg-bg">
      <main className="pb-20">{children}</main>

      {/* Bottom Tab Bar */}
      <nav className="tab-bar fixed bottom-0 left-0 right-0 z-50 bg-bg-card/95 backdrop-blur-lg border-t border-border">
        <div className="flex items-center justify-around py-2 max-w-lg mx-auto">
          {tabs.map((tab) => {
            const tabPath = `/${locale}${tab.href}`;
            const isActive =
              tab.href === ''
                ? currentPath === '/' || currentPath === ''
                : currentPath === tab.href;

            return (
              <a
                key={tab.href}
                href={tabPath}
                className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-primary bg-primary/10'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                <span className={`text-xl ${isActive ? 'scale-110' : ''} transition-transform duration-200`}>
                  {tab.icon}
                </span>
                <span className={`text-[10px] font-medium ${isActive ? 'text-primary' : ''}`}>
                  {t(tab.labelKey)}
                </span>
              </a>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
