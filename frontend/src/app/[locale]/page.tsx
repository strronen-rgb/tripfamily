'use client';

import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('Home');

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="safe-top sticky top-0 z-50 bg-bg-card/90 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold text-primary">✈️ TripFamily</h1>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">🌏 Thailand • Japan • Korea</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-6 pb-24">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-1">{t('welcome')}</h2>
          <p className="text-text-muted text-sm">Plan your perfect family trip</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-bg-card rounded-xl p-3 text-center border border-border">
            <div className="text-2xl font-bold text-primary font-mono">0</div>
            <div className="text-xs text-text-muted">{t('flights')}</div>
          </div>
          <div className="bg-bg-card rounded-xl p-3 text-center border border-border">
            <div className="text-2xl font-bold text-success font-mono">0</div>
            <div className="text-xs text-text-muted">{t('hotels')}</div>
          </div>
          <div className="bg-bg-card rounded-xl p-3 text-center border border-border">
            <div className="text-2xl font-bold text-secondary font-mono">0</div>
            <div className="text-xs text-text-muted">{t('attractions')}</div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-bg-card rounded-xl p-4 border border-border">
          <h3 className="text-lg font-semibold mb-3">{t('timeline')}</h3>
          <p className="text-text-muted text-sm">{t('noEvents')}</p>
        </div>
      </main>

      {/* Bottom Tab Bar */}
      <nav className="tab-bar fixed bottom-0 left-0 right-0 bg-bg-card/95 backdrop-blur-lg border-t border-border">
        <div className="flex items-center justify-around py-2">
          <TabItem icon="🏠" label={t('title')} active />
          <TabItem icon="🌏" label="Explore" />
          <TabItem icon="📋" label="Book" />
          <TabItem icon="💰" label="Budget" />
          <TabItem icon="👤" label="Profile" />
        </div>
      </nav>
    </div>
  );
}

function TabItem({ icon, label, active = false }: { icon: string; label: string; active?: boolean }) {
  return (
    <button className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
      active ? 'text-primary' : 'text-text-muted'
    }`}>
      <span className="text-lg">{icon}</span>
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}
