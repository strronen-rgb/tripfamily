'use client';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ProfilePage() {
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const locale = pathname.split('/')[1] || 'he';
  const [currentLocale, setCurrentLocale] = useState(locale);

  function toggleLanguage() {
    const nextLocale = currentLocale === 'he' ? 'en' : 'he';
    setCurrentLocale(nextLocale);
    const newPath = pathname.replace(`/${currentLocale}`, `/${nextLocale}`);
    router.push(newPath);
  }

  function handleLogout() {
    router.push(`/${locale}/auth`);
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="safe-top sticky top-0 z-40 bg-bg-card/90 backdrop-blur-lg border-b border-border">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-text">{t('Profile.title')}</h1>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {/* User Card */}
        <div className="bg-gradient-to-br from-bg-card to-bg-surface rounded-2xl border border-border p-6 text-center">
          {/* Avatar */}
          <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-3xl text-white">👤</span>
          </div>
          <h2 className="text-lg font-bold text-text">אורח אורח</h2>
          <p className="text-xs text-text-muted">guest@tripfamily.com</p>

          {/* Stats */}
          <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-border">
            <div className="text-center">
              <div className="text-lg font-bold text-primary font-mono">0</div>
              <div className="text-[10px] text-text-muted">טיולים</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-success font-mono">0</div>
              <div className="text-[10px] text-text-muted">הזמנות</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-secondary font-mono">0</div>
              <div className="text-[10px] text-text-muted">אטרקציות</div>
            </div>
          </div>
        </div>

        {/* Family Group */}
        <div className="bg-bg-card rounded-2xl border border-border p-4">
          <h3 className="text-sm font-semibold text-text-muted mb-3 flex items-center gap-2">
            <span>👨‍👩‍👧‍👦</span>
            {t('Profile.family')}
          </h3>
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <div className="text-3xl mb-2 opacity-50">👪</div>
            <p className="text-text-muted text-xs mb-3">אין קבוצה משפחתית</p>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-primary/10 text-primary text-xs rounded-lg hover:bg-primary/20 transition-colors">
                {t('Family.create')}
              </button>
              <button className="px-3 py-1.5 bg-bg-surface text-text-muted text-xs rounded-lg hover:text-text transition-colors">
                {t('Family.join')}
              </button>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-bg-card rounded-2xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-text-muted flex items-center gap-2">
              <span>⚙️</span>
              {t('Profile.settings')}
            </h3>
          </div>

          {/* Language Toggle */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
            <div className="flex items-center gap-2">
              <span>🌐</span>
              <span className="text-sm text-text">{t('Profile.language')}</span>
            </div>
            <button
              onClick={toggleLanguage}
              className="flex items-center bg-bg-surface rounded-lg p-1 border border-border min-w-[100px]"
            >
              <span
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all text-center ${
                  currentLocale === 'he'
                    ? 'bg-primary text-white'
                    : 'text-text-muted'
                }`}
              >
                עברית
              </span>
              <span
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all text-center ${
                  currentLocale === 'en'
                    ? 'bg-primary text-white'
                    : 'text-text-muted'
                }`}
              >
                English
              </span>
            </button>
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
            <div className="flex items-center gap-2">
              <span>🔔</span>
              <span className="text-sm text-text">התראות</span>
            </div>
            <div className="w-10 h-6 bg-primary rounded-full relative cursor-pointer">
              <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform" />
            </div>
          </div>

          {/* Dark Mode */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <span>🌙</span>
              <span className="text-sm text-text">מצב כהה</span>
            </div>
            <div className="w-10 h-6 bg-primary rounded-full relative cursor-pointer">
              <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform" />
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full py-3 bg-danger/10 text-danger font-semibold rounded-2xl border border-danger/20 hover:bg-danger/20 transition-colors flex items-center justify-center gap-2"
        >
          <span>🚪</span>
          {t('Profile.logout')}
        </button>

        {/* App Version */}
        <div className="text-center pb-4">
          <p className="text-[10px] text-text-muted/40">TripFamily v0.1.0</p>
        </div>
      </main>
    </div>
  );
}
