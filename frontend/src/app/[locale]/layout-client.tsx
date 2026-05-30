'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

const tabs = [
  { href: '', icon: '🏠', labelKey: 'Home' },
  { href: '/explore', icon: '🌏', labelKey: 'Explore' },
  { href: '/bookings', icon: '📋', labelKey: 'Bookings' },
  { href: '/budget', icon: '💰', labelKey: 'Budget' },
  { href: '/profile', icon: '👤', labelKey: 'Profile' },
] as const;

export default function LocaleLayoutInner({
  children,
  locale,
}: {
  children: ReactNode;
  locale: string;
}) {
  const pathname = usePathname();

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
                  {tab.labelKey}
                </span>
              </a>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
