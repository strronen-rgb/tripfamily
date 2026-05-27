'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

interface Section {
  key: 'flights' | 'hotels' | 'attractions';
  icon: string;
  titleKey: string;
  addKey: string;
  color: string;
  suggestions: string[];
}

export default function BookingsPage() {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'he';

  const sections: Section[] = [
    {
      key: 'flights',
      icon: '✈️',
      titleKey: 'Bookings.flights',
      addKey: 'Bookings.addFlight',
      color: 'primary',
      suggestions: ['תאילנד', 'יפן', 'דרום קוריאה'],
    },
    {
      key: 'hotels',
      icon: '🏨',
      titleKey: 'Bookings.hotels',
      addKey: 'Bookings.addHotel',
      color: 'success',
      suggestions: ['מלון 5 כוכבים', 'צימר', 'הוסטל'],
    },
    {
      key: 'attractions',
      icon: '🎫',
      titleKey: 'Bookings.attractions',
      addKey: 'Bookings.addAttraction',
      color: 'secondary',
      suggestions: ['מקדשים', 'פארקים', 'מוזיאונים'],
    },
  ];

  function colorClasses(color: string) {
    const map: Record<string, { bg: string; border: string; text: string; btn: string }> = {
      primary: { bg: 'from-primary/15 to-primary/5', border: 'border-primary/20', text: 'text-primary', btn: 'bg-primary/10 text-primary hover:bg-primary/20' },
      success: { bg: 'from-success/15 to-success/5', border: 'border-success/20', text: 'text-success', btn: 'bg-success/10 text-success hover:bg-success/20' },
      secondary: { bg: 'from-secondary/15 to-secondary/5', border: 'border-secondary/20', text: 'text-secondary', btn: 'bg-secondary/10 text-secondary hover:bg-secondary/20' },
    };
    return map[color] || map.primary;
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="safe-top sticky top-0 z-40 bg-bg-card/90 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold text-text">{t('Bookings.title')}</h1>
          <button className="p-2 rounded-lg hover:bg-bg-surface transition-colors">
            <span className="text-lg">➕</span>
          </button>
        </div>
      </header>

      {/* Sections */}
      <main className="p-4 space-y-4">
        {sections.map((section) => {
          const colors = colorClasses(section.color);
          return (
            <div
              key={section.key}
              className={`bg-gradient-to-br ${colors.bg} rounded-2xl border ${colors.border} overflow-hidden`}
            >
              {/* Section Header */}
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{section.icon}</span>
                  <h2 className={`font-semibold ${colors.text}`}>
                    {t(section.titleKey)}
                  </h2>
                </div>
                <button className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${colors.btn}`}>
                  {t(section.addKey)}
                </button>
              </div>

              {/* Empty State */}
              <div className="px-4 pb-4">
                <div className="bg-bg-card/60 rounded-xl p-4 text-center">
                  <div className="text-3xl mb-2 opacity-50">{section.icon}</div>
                  <p className="text-text-muted text-xs mb-1">{t('Bookings.noBookings')}</p>
                  <p className="text-text-muted/60 text-[10px] mb-3">
                    הוסיפו את ה{section.key === 'flights' ? 'טיסה' : section.key === 'hotels' ? 'מלון' : 'אטרקציה'} הראשונה
                  </p>
                  <div className="flex justify-center gap-2 flex-wrap">
                    {section.suggestions.map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 bg-bg-surface rounded-full text-[10px] text-text-muted/70"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}
