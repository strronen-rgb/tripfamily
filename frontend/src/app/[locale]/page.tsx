'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

export default function HomePage() {
  const t = useTranslations('Home');
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'he';

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="safe-top sticky top-0 z-40 bg-bg-card/90 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold text-primary">✈️ TripFamily</h1>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">🌏 Thailand • Japan • Korea</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-1 bg-gradient-to-l from-primary to-secondary bg-clip-text text-transparent">
            {t('welcome')}
          </h2>
          <p className="text-text-muted text-sm">Plan your perfect family trip</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-gradient-to-br from-bg-card to-bg-surface rounded-xl p-4 text-center border border-border animate-fadeInUp">
            <div className="text-2xl mb-1">✈️</div>
            <div className="text-2xl font-bold text-primary font-mono">0</div>
            <div className="text-xs text-text-muted">{t('flights')}</div>
          </div>
          <div className="bg-gradient-to-br from-bg-card to-bg-surface rounded-xl p-4 text-center border border-border animate-fadeInUp" style={{ animationDelay: '100ms' }}>
            <div className="text-2xl mb-1">🏨</div>
            <div className="text-2xl font-bold text-success font-mono">0</div>
            <div className="text-xs text-text-muted">{t('hotels')}</div>
          </div>
          <div className="bg-gradient-to-br from-bg-card to-bg-surface rounded-xl p-4 text-center border border-border animate-fadeInUp" style={{ animationDelay: '200ms' }}>
            <div className="text-2xl mb-1">🎯</div>
            <div className="text-2xl font-bold text-secondary font-mono">0</div>
            <div className="text-xs text-text-muted">{t('attractions')}</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-3">
            <Link
              href={`/${locale}/explore`}
              className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl p-4 border border-primary/20 hover:border-primary/40 transition-all group"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🌏</div>
              <div className="text-sm font-semibold text-primary">גלה יעדים</div>
              <div className="text-xs text-text-muted">המלצות טיול</div>
            </Link>
            <Link
              href={`/${locale}/budget`}
              className="bg-gradient-to-br from-success/20 to-success/5 rounded-xl p-4 border border-success/20 hover:border-success/40 transition-all group"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">💰</div>
              <div className="text-sm font-semibold text-success">נהל תקציב</div>
              <div className="text-xs text-text-muted">עקוב אחר הוצאות</div>
            </Link>
          </div>
        </div>

        {/* Upcoming Events Timeline */}
        <div className="bg-bg-card rounded-2xl p-4 border border-border">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span>📅</span>
            {t('upcoming')}
          </h3>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="text-4xl mb-3 opacity-50">🗓️</div>
            <p className="text-text-muted text-sm mb-1">{t('noEvents')}</p>
            <p className="text-text-muted/60 text-xs">התחילו לתכנן את הטיול הבא!</p>
            <Link
              href={`/${locale}/bookings`}
              className="mt-4 px-4 py-2 bg-primary/10 text-primary text-sm rounded-lg hover:bg-primary/20 transition-colors"
            >
              הוסף פעילות ראשונה
            </Link>
          </div>
        </div>

        {/* Family Tip */}
        <div className="mt-6 bg-gradient-to-br from-secondary/10 to-primary/5 rounded-2xl p-4 border border-secondary/10">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <div className="text-sm font-semibold text-secondary mb-1">טיפ לטיול</div>
              <p className="text-xs text-text-muted leading-relaxed">
                תכננו את היום הראשון כך שיכלול פעילות קלה להתרגל לאקלים והשעה המקומית.
                הקפידו על שתייה מרובה ומנוחה מספקת.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
