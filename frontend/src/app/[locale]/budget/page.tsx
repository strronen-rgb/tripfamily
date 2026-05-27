'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

const categories = [
  { key: 'flights', label: 'טיסות', icon: '✈️', color: 'primary' },
  { key: 'hotels', label: 'מלונות', icon: '🏨', color: 'success' },
  { key: 'food', label: 'אוכל', icon: '🍜', color: 'secondary' },
  { key: 'transport', label: 'תחבורה', icon: '🚕', color: 'warning' },
  { key: 'shopping', label: 'קניות', icon: '🛍️', color: 'danger' },
  { key: 'other', label: 'אחר', icon: '📦', color: 'text-muted' },
] as const;

export default function BudgetPage() {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'he';

  // Mock budget data
  const budgetTotal = 15000;
  const budgetSpent = 3200;
  const budgetRemaining = budgetTotal - budgetSpent;
  const spendPercent = Math.round((budgetSpent / budgetTotal) * 100);

  return (
    <div className="min-h-screen bg-bg relative">
      {/* Header */}
      <header className="safe-top sticky top-0 z-40 bg-bg-card/90 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold text-text">{t('Budget.title')}</h1>
          <span className="text-xs text-text-muted font-mono">₪ {budgetTotal.toLocaleString()}</span>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {/* Overview Card */}
        <div className="bg-gradient-to-br from-bg-card to-bg-surface rounded-2xl border border-border p-4">
          <h2 className="text-sm font-semibold text-text-muted mb-3 flex items-center gap-2">
            <span>📊</span>
            {t('Budget.overview')}
          </h2>

          {/* Budget Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-text-muted">{t('Budget.spent')}</span>
              <span className="text-primary font-mono">{spendPercent}%</span>
            </div>
            <div className="h-3 bg-bg rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-l from-primary to-primary-light rounded-full transition-all duration-500"
                style={{ width: `${spendPercent}%` }}
              />
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-bg/50 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-text font-mono">
                ₪{budgetTotal.toLocaleString()}
              </div>
              <div className="text-[10px] text-text-muted">{t('Budget.total')}</div>
            </div>
            <div className="bg-bg/50 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-danger font-mono">
                ₪{budgetSpent.toLocaleString()}
              </div>
              <div className="text-[10px] text-text-muted">{t('Budget.spent')}</div>
            </div>
            <div className="bg-bg/50 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-success font-mono">
                ₪{budgetRemaining.toLocaleString()}
              </div>
              <div className="text-[10px] text-text-muted">{t('Budget.remaining')}</div>
            </div>
          </div>
        </div>

        {/* Chart Placeholder */}
        <div className="bg-bg-card rounded-2xl border border-border p-4">
          <h3 className="text-sm font-semibold text-text-muted mb-3">📈 גרף הוצאות לפי קטגוריה</h3>
          <div className="h-40 bg-bg/50 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl mb-2 opacity-40">📊</div>
              <p className="text-text-muted text-xs">הגרף יופיע כאן</p>
              <p className="text-text-muted/50 text-[10px]">לאחר הוספת הוצאות</p>
            </div>
          </div>
        </div>

        {/* Expenses List */}
        <div className="bg-bg-card rounded-2xl border border-border p-4">
          <h3 className="text-sm font-semibold text-text-muted mb-3 flex items-center gap-2">
            <span>🧾</span>
            {t('Budget.expenses')}
          </h3>

          {/* Empty State */}
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="text-4xl mb-3 opacity-40">💰</div>
            <p className="text-text-muted text-sm mb-1">{t('Budget.noExpenses')}</p>
            <p className="text-text-muted/60 text-xs">לחצו על הכפתור + להוספת הוצאה</p>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-bg-card rounded-2xl border border-border p-4">
          <h3 className="text-sm font-semibold text-text-muted mb-3">🏷️ קטגוריות</h3>
          <div className="grid grid-cols-3 gap-2">
            {categories.map((cat) => (
              <div
                key={cat.key}
                className="bg-bg/50 rounded-xl p-3 text-center"
              >
                <div className="text-xl mb-1">{cat.icon}</div>
                <div className="text-[11px] text-text font-medium">{cat.label}</div>
                <div className="text-[10px] text-text-muted font-mono mt-0.5">₪0</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* FAB Button */}
      <button
        className="fixed bottom-24 left-4 right-4 max-w-lg mx-auto h-14 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/30 hover:shadow-primary/50 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 z-50"
        style={{ marginBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)' }}
      >
        <span className="text-lg">＋</span>
        {t('Budget.addExpense')}
      </button>
    </div>
  );
}
