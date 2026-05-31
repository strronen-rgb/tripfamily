'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';

// ── Types ──────────────────────────────────────────────────────────────────

type Category = 'all' | 'beach' | 'mountain' | 'city' | 'culture' | 'adventure' | 'family';

interface Destination {
  id: string;
  name: string;
  country: string;
  emoji: string;
  flag: string;
  description: string;
  longDescription: string;
  category: Category;
  bestTime: string;
  rating: number;
  reviewCount: number;
  budget: string;
  budgetLevel: 1 | 2 | 3 | 4;
  highlights: string[];
  weather: string;
  language: string;
  currency: string;
}

// ── Mock Data ───────────────────────────────────────────────────────────────

const destinations: Destination[] = [
  {
    id: 'thailand',
    name: 'תאילנד',
    country: 'דרום מזרח אסיה',
    emoji: '🏝️',
    flag: '🇹🇭',
    description: 'חופים קפואים, מקדשים מרהיבים ואוכל רחוב מדהים',
    longDescription: 'תאילנד מציעה חוויה מושלמת לכל המשפחה — מחופי פוקט הקפואים ועד למקדשי בנגקוק המרהיבים. אוכל רחוב מפורסם, טבע עוצר נשימה ואנשים אדיבים ללא סוף.',
    category: 'beach',
    bestTime: 'נובמבר - מרץ',
    rating: 4.7,
    reviewCount: 2450,
    budget: '₪3,500 - ₪6,000',
    budgetLevel: 2,
    highlights: ['חופי פוקט', 'מקדשי בנגקוק', 'איי פי פי', 'אוכל רחוב', 'מסאז\' תאילנדי'],
    weather: '🌡️ 28-35°C',
    language: 'תאית',
    currency: 'בהט (THB)',
  },
  {
    id: 'japan',
    name: 'יפן',
    country: 'מזרח אסיה',
    emoji: '🗾',
    flag: '🇯🇵',
    description: 'שילוב ייחודי של מסורת עתיקה וטכנולוגיה מתקדמת',
    longDescription: 'מטוקיו העתירה באנרגיה ועד לערי הקיסר של קיוטו, יפן מציעה מסע בלתי נשכח. המשפחה תוכל ליהנות מפסטיבלים, תרבות קפה ייחודית ואוכל שף עולמי.',
    category: 'culture',
    bestTime: 'מרץ - מאי, אוקטובר - נובמבר',
    rating: 4.8,
    reviewCount: 3100,
    budget: '₪8,000 - ₪14,000',
    budgetLevel: 4,
    highlights: ['טוקיו', 'קיוטו', 'הר פוג\'י', 'אוכל סושי', 'מקדשים'],
    weather: '🌡️ 10-28°C',
    language: 'יפנית',
    currency: 'ין (JPY)',
  },
  {
    id: 'italy',
    name: 'איטליה',
    country: 'דרום אירופה',
    emoji: '🍕',
    flag: '🇮🇹',
    description: 'אוכל עולמי, אמנות רנסנס ונופים מרהיבים',
    longDescription: 'מרומא העתיקה ועד לצפייני נהר ונציה, איטליה היא גן עדן של תרבות ואוכל. כל פיצה כמו באגדה, ההיסטוריה מנצנצת בכל פינה והאווירה חמימה ומזמינה.',
    category: 'culture',
    bestTime: 'אפריל - יוני, ספטמבר - אוקטובר',
    rating: 4.6,
    reviewCount: 4200,
    budget: '₪6,500 - ₪11,000',
    budgetLevel: 4,
    highlights: ['רומא', 'פירנצה', 'ונציה', 'אמלפי קוסט', 'פיצה וגלטו'],
    weather: '🌡️ 15-30°C',
    language: 'איטלקית',
    currency: 'אירו (EUR)',
  },
  {
    id: 'greece',
    name: 'יוון',
    country: 'דרום אירופה',
    emoji: '🏛️',
    flag: '🇬🇷',
    description: 'איים קפואים, ערב שמיים ואוכל ים תיכוני',
    longDescription: 'מסנטוריני הרומנטית ועד מטמונאקאס הדרמטי, יוון מציעה איים עם שקיעות מהפנטות, חול לבן וכחול, ואוכל ים תיכוני טרי ומתוק.',
    category: 'beach',
    bestTime: 'מאי - אוקטובר',
    rating: 4.7,
    reviewCount: 2800,
    budget: '₪5,000 - ₪9,000',
    budgetLevel: 3,
    highlights: ['סנטוריני', 'אתונה', 'מיקונוס', 'מטמונאקאס', 'אוכל יווני'],
    weather: '🌡️ 20-33°C',
    language: 'יוונית',
    currency: 'אירו (EUR)',
  },
  {
    id: 'spain',
    name: 'ספרד',
    country: 'דרום מערב אירופה',
    emoji: '💃',
    flag: '🇪🇸',
    description: 'ארכיטקטורה ייחודית, פסטיבלים וטפאס',
    longDescription: 'מברצלונה התוססת ועד מדריד המלכותית, ספרד מציעה ארכיטקטורה של גאודי, חיי לילה תוססים ותרבות עשירה. מושלם למשפחות שאוהבות לגלות.',
    category: 'city',
    bestTime: 'מרץ - מאי, ספטמבר - נובמבר',
    rating: 4.5,
    reviewCount: 3500,
    budget: '₪5,500 - ₪9,500',
    budgetLevel: 3,
    highlights: ['ברצלונה', 'מדריד', 'פאמלונה', 'טפאס', 'פסטיבלים'],
    weather: '🌡️ 15-32°C',
    language: 'ספרדית',
    currency: 'אירו (EUR)',
  },
  {
    id: 'usa',
    name: 'ארה"ב',
    country: 'צפון אמריקה',
    emoji: '🗽',
    flag: '🇺🇸',
    description: 'פארקים לאומיים, ערים ענק וויזות לא נות',
    longDescription: 'מנהטן הסואנת ועד גרנד קניון המרהיב, ארה"ב מציעה מגוון עצום של חוויות. דיסני לנד לילדים, יוסמיטי לאוהבי טבע וניו יורק לתרבות.',
    category: 'family',
    bestTime: 'אפריל - יוני, ספטמבר - אוקטובר',
    rating: 4.4,
    reviewCount: 5200,
    budget: '₪10,000 - ₪18,000',
    budgetLevel: 4,
    highlights: ['ניו יורק', 'לוס אנג\'לס', 'גרנד קניון', 'דיסני', 'יוסמיטי'],
    weather: '🌡️ 5-35°C',
    language: 'אנגלית',
    currency: 'דולר (USD)',
  },
  {
    id: 'france',
    name: 'צרפת',
    country: 'מערב אירופה',
    emoji: '🗼',
    flag: '🇫🇷',
    description: 'אוכל שף, מוזיאונים ואלגנציה אירופאית',
    longDescription: 'מפריז הרומנטית ועד לחוף הים התיכון, צרפת מציעה סגנון חיים ייחודי. המוזיאון הלובר, מגדל אייפל, טעימות גבינות ויינות ונופי כרמים מרהיבים.',
    category: 'city',
    bestTime: 'אפריל - יוני, ספטמבר - אוקטובר',
    rating: 4.6,
    reviewCount: 4800,
    budget: '₪7,000 - ₪12,000',
    budgetLevel: 4,
    highlights: ['פריז', 'חוף הכסף', 'בורגונדי', 'לובר', 'מגדל אייפל'],
    weather: '🌡️ 8-28°C',
    language: 'צרפתית',
    currency: 'אירו (EUR)',
  },
  {
    id: 'croatia',
    name: 'קרואטיה',
    country: 'דרום מזרח אירופה',
    emoji: '⛵',
    flag: '🇭🇷',
    description: 'ים אדריטי צולל, ערים ימיות ופארקים מים',
    longDescription: 'דוברובניק, בליט ואיים קפואים — קרואטיה חושפת את יופי הים האדריטי. מים צוללים, היסטוריה עתיקה ואווירה ימית מרגשת לכל המשפחה.',
    category: 'adventure',
    bestTime: 'מאי - ספטמבר',
    rating: 4.7,
    reviewCount: 1900,
    budget: '₪5,000 - ₪8,000',
    budgetLevel: 3,
    highlights: ['דוברובניק', 'פאליט', 'איי בראץ', 'אקווריום פולה', 'פארק פליטביצה'],
    weather: '🌡️ 18-30°C',
    language: 'קרואטית',
    currency: 'קונה (HRK)',
  },
  {
    id: 'portugal',
    name: 'פורטוגל',
    country: 'דרום מערב אירופה',
    emoji: '🐟',
    flag: '🇵🇹',
    description: 'בלאונים, יישונים תלת-אלוהיים ואווירה רגועה',
    longDescription: 'מליסבונה הסואנת ועד לפרטו הקטנה, פורטוגל מציעה חוויה מזרחית ונעימה. חופים מדהימים, בתים בצבעי פסטל, יישון פורט מעולה ואנשים מקסימים.',
    category: 'family',
    bestTime: 'מרץ - יוני, ספטמבר - אוקטובר',
    rating: 4.8,
    reviewCount: 2200,
    budget: '₪4,500 - ₪7,500',
    budgetLevel: 3,
    highlights: ['ליסבונה', 'פרטו', 'סינטרה', 'אלגאבו', 'דורו'],
    weather: '🌡️ 15-28°C',
    language: 'פורטוגזית',
    currency: 'אירו (EUR)',
  },
  {
    id: 'india',
    name: 'הודו',
    country: 'דרום אסיה',
    emoji: '🕌',
    flag: '🇮🇳',
    description: 'טאג\' מאהלול, תבלינות וחוויות תרבותיות ייחודיות',
    longDescription: 'הודו היא חוויה חושית מרהיבה — מערומי הטאג\' מאהלול ועד לשווקי ג\'ייפור הצבעוניים. תרבות עתיקה, אוכל מתובל מדהים, פארקים טבעיים ואנשים חמים.',
    category: 'adventure',
    bestTime: 'אוקטובר - מרץ',
    rating: 4.3,
    reviewCount: 1600,
    budget: '₪2,500 - ₪5,500',
    budgetLevel: 1,
    highlights: ['טאג\' מאהלול', 'גואה', 'ג\'ייפור', 'קרלה', 'ארוואלי'],
    weather: '🌡️ 15-40°C',
    language: 'הינדי',
    currency: 'רופי (INR)',
  },
];

const categories: { key: Category; label: string; icon: string }[] = [
  { key: 'all', label: 'הכל', icon: '🌍' },
  { key: 'beach', label: 'חופים', icon: '🏖️' },
  { key: 'mountain', label: 'הרים', icon: '⛰️' },
  { key: 'city', label: 'ערים', icon: '🏙️' },
  { key: 'culture', label: 'תרבות', icon: '🎭' },
  { key: 'adventure', label: 'הרפתקאות', icon: '🧗' },
  { key: 'family', label: 'משפחתי', icon: '👨‍👩‍👧‍👦' },
];

// ── Helpers ─────────────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const stars = '★'.repeat(full) + (half ? '½' : '');
  return <span style={{ color: '#F59E0B', letterSpacing: '1px' }}>{stars}</span>;
}

function BudgetDots({ level }: { level: 1 | 2 | 3 | 4 }) {
  return (
    <span style={{ color: '#10B981', letterSpacing: '2px' }}>
      {'₪'.repeat(level)}
      <span style={{ color: 'rgba(148,163,184,0.3)' }}>{'₪'.repeat(4 - level)}</span>
    </span>
  );
}

// ── Loading Skeleton ────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
      {[0, 1, 2, 3, 4, 5].map(i => (
        <div key={i} style={{
          background: '#1A1A2E',
          borderRadius: '20px',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.05)',
          animation: 'pulse 1.5s ease-in-out infinite',
          animationDelay: `${i * 0.1}s`,
        }}>
          <div style={{ height: '160px', background: 'linear-gradient(90deg, #252540 25%, #2A2A4A 50%, #252540 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
          <div style={{ padding: '16px' }}>
            <div style={{ height: '20px', background: '#252540', borderRadius: '4px', marginBottom: '8px', width: '70%' }} />
            <div style={{ height: '14px', background: '#252540', borderRadius: '4px', width: '90%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Modal ───────────────────────────────────────────────────────────────────

function DetailModal({ dest, onClose }: { dest: Destination; onClose: () => void }) {
  const budgetColors: Record<number, string> = { 1: '#10B981', 2: '#34D399', 3: '#F59E0B', 4: '#EF4444' };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'linear-gradient(180deg, #1E1E3A 0%, #1A1A2E 100%)',
          borderTop: '1px solid rgba(108,99,255,0.3)',
          borderRadius: '24px 24px 0 0',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '85vh',
          overflowY: 'auto',
          direction: 'rtl',
          animation: 'slideUp 0.3s ease-out',
        }}
      >
        {/* Modal Header */}
        <div style={{
          background: `linear-gradient(135deg, rgba(108,99,255,0.3), rgba(26,26,46,0.95))`,
          padding: '24px',
          position: 'relative',
          borderRadius: '24px 24px 0 0',
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: '16px', left: '16px',
              background: 'rgba(255,255,255,0.1)', border: 'none',
              color: '#E8E8F0', fontSize: '24px', cursor: 'pointer',
              width: '36px', height: '36px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >✕</button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '56px', marginBottom: '8px' }}>{dest.emoji}</div>
            <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#E8E8F0', margin: '0 0 4px 0' }}>
              {dest.flag} {dest.name}
            </h2>
            <p style={{ fontSize: '14px', color: '#94A3B8', margin: '0 0 12px 0' }}>{dest.country}</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <StarRating rating={dest.rating} />
              <span style={{ fontSize: '14px', color: '#F59E0B', fontWeight: 600 }}>{dest.rating}</span>
              <span style={{ fontSize: '12px', color: '#94A3B8' }}>({dest.reviewCount.toLocaleString('he-IL')} ביקורות)</span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Description */}
          <p style={{ fontSize: '14px', color: '#E8E8F0', lineHeight: 1.7, margin: 0 }}>
            {dest.longDescription}
          </p>

          {/* Info Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            <div style={{ background: '#252540', borderRadius: '12px', padding: '12px' }}>
              <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '4px' }}>⏰ זמן מיטבי לביקור</div>
              <div style={{ fontSize: '13px', color: '#E8E8F0', fontWeight: 500 }}>{dest.bestTime}</div>
            </div>
            <div style={{ background: '#252540', borderRadius: '12px', padding: '12px' }}>
              <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '4px' }}>{dest.weather.split(' ')[0]} מזג אוויר</div>
              <div style={{ fontSize: '13px', color: '#E8E8F0', fontWeight: 500 }}>{dest.weather.split(' ')[1]}</div>
            </div>
            <div style={{ background: '#252540', borderRadius: '12px', padding: '12px' }}>
              <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '4px' }}>💬 שפה</div>
              <div style={{ fontSize: '13px', color: '#E8E8F0', fontWeight: 500 }}>{dest.language}</div>
            </div>
            <div style={{ background: '#252540', borderRadius: '12px', padding: '12px' }}>
              <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '4px' }}>💰 מטבע</div>
              <div style={{ fontSize: '13px', color: '#E8E8F0', fontWeight: 500 }}>{dest.currency}</div>
            </div>
          </div>

          {/* Budget */}
          <div style={{ background: '#252540', borderRadius: '12px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '4px' }}>💵 תקציב משוער למשפה (7 ימים)</div>
              <div style={{ fontSize: '15px', color: budgetColors[dest.budgetLevel], fontWeight: 600 }}>{dest.budget}</div>
            </div>
            <BudgetDots level={dest.budgetLevel} />
          </div>

          {/* Highlights */}
          <div>
            <div style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '8px' }}>✨ נקודות עניין מובילות</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {dest.highlights.map((h, idx) => (
                <span key={idx} style={{
                  background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.2)',
                  borderRadius: '20px', padding: '4px 12px', fontSize: '12px', color: '#6C63FF',
                }}>{h}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Destination Card ────────────────────────────────────────────────────────

function DestCard({
  dest,
  isWishlisted,
  onToggleWishlist,
  onSelect,
  index,
}: {
  dest: Destination;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
  onSelect: () => void;
  index: number;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const budgetColors: Record<number, string> = { 1: '#10B981', 2: '#34D399', 3: '#F59E0B', 4: '#EF4444' };

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: isHovered ? 'linear-gradient(180deg, #1E1E3A 0%, #1A1A2E 100%)' : '#1A1A2E',
        borderRadius: '20px',
        overflow: 'hidden',
        border: `1px solid ${isHovered ? 'rgba(108,99,255,0.3)' : 'rgba(255,255,255,0.05)'}`,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered ? '0 12px 40px rgba(108,99,255,0.15)' : '0 2px 10px rgba(0,0,0,0.2)',
        animation: `fadeInUp 0.5s ease-out ${index * 0.06}s both`,
      }}
    >
      {/* Card Image / Emoji Header */}
      <div style={{
        height: '160px',
        background: `linear-gradient(135deg, rgba(108,99,255,0.2) 0%, rgba(255,107,107,0.1) 100%)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: '-20px', left: '-20px', width: '80px', height: '80px',
          borderRadius: '50%', background: 'rgba(108,99,255,0.08)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-15px', right: '-15px', width: '60px', height: '60px',
          borderRadius: '50%', background: 'rgba(255,107,107,0.06)',
        }} />

        <div style={{ fontSize: '56px', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>
          {dest.emoji}
        </div>
        <div style={{
          position: 'absolute', top: '10px', left: '10px',
          fontSize: '11px', color: '#94A3B8',
          background: 'rgba(0,0,0,0.4)',
          padding: '3px 8px', borderRadius: '10px',
          backdropFilter: 'blur(4px)',
        }}>{dest.flag}</div>

        {/* Wishlist Button */}
        <button
          onClick={e => { e.stopPropagation(); onToggleWishlist(); }}
          style={{
            position: 'absolute', top: '10px', right: '10px',
            background: isWishlisted ? 'rgba(255,107,107,0.2)' : 'rgba(0,0,0,0.4)',
            border: `1px solid ${isWishlisted ? 'rgba(255,107,107,0.4)' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: '50%', width: '32px', height: '32px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: '14px',
            transition: 'all 0.2s',
            backdropFilter: 'blur(4px)',
          }}
        >
          {isWishlisted ? '❤️' : '🤍'}
        </button>
      </div>

      {/* Card Content */}
      <div style={{ padding: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#E8E8F0', margin: 0 }}>{dest.name}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            <StarRating rating={dest.rating} />
            <span style={{ fontSize: '11px', color: '#F59E0B', fontWeight: 600 }}>{dest.rating}</span>
          </div>
        </div>

        <p style={{ fontSize: '12px', color: '#94A3B8', margin: '0 0 8px 0', lineHeight: 1.4 }}>
          {dest.description}
        </p>

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)',
        }}>
          <div>
            <div style={{ fontSize: '10px', color: '#64748B' }}>⏰ {dest.bestTime.split(' - ')[0]}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
            <span style={{ fontSize: '12px', color: budgetColors[dest.budgetLevel], fontWeight: 600 }}>{dest.budget}</span>
            <BudgetDots level={dest.budgetLevel} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page Component ─────────────────────────────────────────────────────

export default function ExplorePage() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'he';

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [loading, setLoading] = useState(true);
  const [selectedDest, setSelectedDest] = useState<Destination | null>(null);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const toggleWishlist = useCallback((id: string) => {
    setWishlist(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Filter destinations
  const filtered = destinations.filter(d => {
    const matchesCategory = activeCategory === 'all' || d.category === activeCategory;
    const matchesSearch = searchQuery === '' ||
      d.name.includes(searchQuery) ||
      d.country.includes(searchQuery) ||
      d.description.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  const wishlistCount = wishlist.size;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0F0F23',
      color: '#E8E8F0',
      fontFamily: 'Inter, system-ui, sans-serif',
      direction: 'rtl',
    }}>
      {/* Inline keyframe styles */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(108,99,255,0.3); }
          50% { box-shadow: 0 0 40px rgba(108,99,255,0.5); }
        }
      `}</style>

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(26,26,46,0.9)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#6C63FF', margin: 0 }}>✈️ TripFamily</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {wishlistCount > 0 && (
              <span style={{
                fontSize: '11px', color: '#FF6B6B',
                background: 'rgba(255,107,107,0.1)',
                padding: '2px 8px', borderRadius: '10px',
                border: '1px solid rgba(255,107,107,0.2)',
              }}>❤️ {wishlistCount}</span>
            )}
            <span style={{ fontSize: '12px', color: '#94A3B8' }}>גלה יעדים</span>
          </div>
        </div>
      </header>

      <main style={{ padding: '16px', paddingBottom: '100px' }}>

        {/* Hero */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(108,99,255,0.2) 0%, rgba(255,107,107,0.1) 100%)',
          borderRadius: '24px',
          padding: '28px 20px',
          marginBottom: '20px',
          textAlign: 'center',
          border: '1px solid rgba(108,99,255,0.1)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px',
            borderRadius: '50%', background: 'rgba(108,99,255,0.08)',
          }} />
          <div style={{
            position: 'absolute', bottom: '-20px', left: '-20px', width: '80px', height: '80px',
            borderRadius: '50%', background: 'rgba(255,107,107,0.06)',
          }} />
          <h2 style={{
            fontSize: '26px', fontWeight: 700, margin: '0 0 6px 0',
            background: 'linear-gradient(to left, #6C63FF, #8B83FF, #FF6B6B)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            🌏 גלה יעדים חדשים
          </h2>
          <p style={{ fontSize: '13px', color: '#94A3B8', margin: '0 0 4px 0' }}>
            גלו מקומות מדהימים לטיול המשפחתי הבא שלכם
          </p>
          <p style={{ fontSize: '11px', color: '#64748B', margin: 0 }}>
            {destinations.length} יעדים פופולריים בכל העולם
          </p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: '#1A1A2E', border: '1px solid rgba(108,99,255,0.2)',
            borderRadius: '16px', padding: '10px 16px',
            transition: 'all 0.2s',
          }}>
            <span style={{ fontSize: '18px', flexShrink: 0 }}>🔍</span>
            <input
              type="text"
              placeholder="חפש יעד... למשל: תאילנד, איטליה, יפן"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                background: 'none', border: 'none', outline: 'none',
                color: '#E8E8F0', fontSize: '14px', width: '100%',
                fontFamily: 'inherit', direction: 'rtl',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  background: 'none', border: 'none', color: '#94A3B8',
                  cursor: 'pointer', fontSize: '16px', padding: 0,
                }}
              >✕</button>
            )}
          </div>
        </div>

        {/* Category Filters */}
        <div style={{
          display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto',
          paddingBottom: '4px', scrollbarWidth: 'none',
        }}>
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              style={{
                padding: '8px 14px', borderRadius: '20px',
                border: `1px solid ${activeCategory === cat.key ? '#6C63FF' : 'rgba(255,255,255,0.06)'}`,
                background: activeCategory === cat.key
                  ? 'linear-gradient(135deg, rgba(108,99,255,0.25), rgba(108,99,255,0.1))'
                  : '#1A1A2E',
                color: activeCategory === cat.key ? '#6C63FF' : '#94A3B8',
                fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                whiteSpace: 'nowrap', flexShrink: 0,
                transition: 'all 0.2s ease',
                boxShadow: activeCategory === cat.key ? '0 2px 12px rgba(108,99,255,0.2)' : 'none',
              }}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
            {loading ? 'טוען...' : `${filtered.length} יעדים`}
          </p>
          {!loading && filtered.length > 0 && (
            <p style={{ fontSize: '12px', color: '#6C63FF', margin: 0 }}>
              ✈️ בחר יעד לפרטים
            </p>
          )}
        </div>

        {/* Destinations Grid */}
        {loading ? (
          <LoadingSkeleton />
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            background: '#1A1A2E', borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.05)',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#E8E8F0', margin: '0 0 6px 0' }}>לא נמצאו תוצאות</h3>
            <p style={{ fontSize: '13px', color: '#94A3B8', margin: '0 0 16px 0' }}>נסו לשנות את מונחי החיפוש או את הסינון</p>
            <button
              onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
              style={{
                background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.3)',
                color: '#6C63FF', borderRadius: '12px', padding: '8px 20px',
                fontSize: '13px', fontWeight: 500, cursor: 'pointer',
              }}
            >
              נקה סינון
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '18px',
          }}>
            {filtered.map((dest, idx) => (
              <DestCard
                key={dest.id}
                dest={dest}
                isWishlisted={wishlist.has(dest.id)}
                onToggleWishlist={() => toggleWishlist(dest.id)}
                onSelect={() => setSelectedDest(dest)}
                index={idx}
              />
            ))}
          </div>
        )}

        {/* Bottom Stats */}
        {!loading && (
          <div style={{
            marginTop: '32px', padding: '20px',
            background: '#1A1A2E', borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.05)',
            textAlign: 'center',
          }}>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px',
            }}>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#6C63FF', fontFamily: 'JetBrains Mono, monospace' }}>{destinations.length}</div>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>יעדים</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#10B981', fontFamily: 'JetBrains Mono, monospace' }}>6</div>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>קטגוריות</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#F59E0B', fontFamily: 'JetBrains Mono, monospace' }}>
                  {(destinations.reduce((a, d) => a + d.rating, 0) / destinations.length).toFixed(1)}
                </div>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>דירוג ממוצע</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {selectedDest && (
        <DetailModal dest={selectedDest} onClose={() => setSelectedDest(null)} />
      )}
    </div>
  );
}
