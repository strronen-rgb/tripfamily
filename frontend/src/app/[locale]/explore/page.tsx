'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

type Filter = 'all' | 'thailand' | 'japan' | 'korea';

interface Suggestion {
  id: string;
  titleHe: string;
  titleEn: string;
  category: string;
  categoryKey: string;
  rating: number;
  filter: Filter;
  emoji: string;
}

const suggestions: Suggestion[] = [
  { id: '1', titleHe: 'אי הנחש קוה פקאד', titleEn: 'Phuket', category: 'beach', categoryKey: 'Explore.attractions', rating: 4.8, filter: 'thailand', emoji: '🏖️' },
  { id: '2', titleHe: 'שוק צהריים בבנגקוק', titleEn: 'Chatuchak Market', category: 'shopping', categoryKey: 'Explore.shopping', rating: 4.6, filter: 'thailand', emoji: '🛍️' },
  { id: '3', titleHe: 'מקדש פוטו בקואלה לומפור', titleEn: 'Batul Cave', category: 'culture', categoryKey: 'Explore.culture', rating: 4.5, filter: 'thailand', emoji: '🛕' },
  { id: '4', titleHe: 'פוג\'ודה פוטו', titleEn: 'Tokyo', category: 'culture', categoryKey: 'Explore.culture', rating: 4.9, filter: 'japan', emoji: '⛩️' },
  { id: '5', titleHe: 'הר פוג\'י', titleEn: 'Mount Fuji', category: 'nature', categoryKey: 'Explore.attractions', rating: 4.9, filter: 'japan', emoji: '🗻' },
  { id: '6', titleHe: 'דיסנילנד טוקיו', titleEn: 'Tokyo Disneyland', category: 'family', categoryKey: 'Explore.attractions', rating: 4.7, filter: 'japan', emoji: '🏰' },
  { id: '7', titleHe: 'ארמון גיונגבוקגונג', titleEn: 'Gyeongbokgung Palace', category: 'culture', categoryKey: 'Explore.culture', rating: 4.6, filter: 'korea', emoji: '🏯' },
  { id: '8', titleHe: 'אי ג\'ג\'ו', titleEn: 'Jeju Island', category: 'nature', categoryKey: 'Explore.attractions', rating: 4.8, filter: 'korea', emoji: '🏝️' },
];

const filters: { key: Filter; labelKey: string }[] = [
  { key: 'all', labelKey: 'Explore.all' },
  { key: 'thailand', labelKey: 'Explore.thailand' },
  { key: 'japan', labelKey: 'Explore.japan' },
  { key: 'korea', labelKey: 'Explore.korea' },
];

export default function ExplorePage() {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'he';
  const [activeFilter, setActiveFilter] = useState<Filter>('all');

  const filtered = activeFilter === 'all'
    ? suggestions
    : suggestions.filter((s) => s.filter === activeFilter);

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="safe-top sticky top-0 z-40 bg-bg-card/90 backdrop-blur-lg border-b border-border">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-text">{t('Explore.title')}</h1>
          <p className="text-xs text-text-muted">{t('Explore.subtitle')}</p>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="px-4 py-3 overflow-x-auto">
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                activeFilter === f.key
                  ? 'bg-primary text-white shadow-md shadow-primary/30'
                  : 'bg-bg-card border border-border text-text-muted hover:text-text'
              }`}
            >
              {t(f.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <main className="px-4 pb-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4 opacity-50">🔍</div>
            <p className="text-text-muted">אין תוצאות</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="bg-bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/30 transition-all group"
              >
                {/* Card Image Area */}
                <div className="relative h-28 bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center">
                  <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
                    {item.emoji}
                  </span>
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-bg/80 backdrop-blur-sm rounded-full">
                    <span className="text-[10px] text-text-muted flex items-center gap-0.5">
                      ⭐ {item.rating}
                    </span>
                  </div>
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-primary/90 backdrop-blur-sm rounded-full">
                    <span className="text-[10px] text-white font-medium">
                      {t(item.categoryKey)}
                    </span>
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-text mb-2 leading-tight">
                    {locale === 'he' ? item.titleHe : item.titleEn}
                  </h3>
                  <button className="w-full py-2 bg-primary/10 text-primary text-xs font-semibold rounded-lg hover:bg-primary/20 transition-colors">
                    {t('Explore.addToTrip')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
