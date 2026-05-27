'use client';

import { useState, FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Tab = 'login' | 'register';

export default function AuthPage() {
  const t = useTranslations('Auth');
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'he';
  const [activeTab, setActiveTab] = useState<Tab>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (activeTab === 'register' && !name.trim()) {
      newErrors.name = 'נדרש שם';
    }

    if (!email.trim()) {
      newErrors.email = 'נדרש אימייל';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'כתובת אימייל לא תקינה';
    }

    if (!password) {
      newErrors.password = 'נדרשת סיסמה';
    } else if (password.length < 6) {
      newErrors.password = 'לפחות 6 תווים';
    }

    if (activeTab === 'register' && password !== confirmPassword) {
      newErrors.confirmPassword = 'הסיסמאות אינן תואמות';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    // TODO: integrate with API
    alert('Auth submitted!');
  }

  const inputClass =
    'w-full px-4 py-3 bg-bg-surface border border-border rounded-xl text-text text-sm placeholder-text-muted/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all';

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Header */}
      <header className="safe-top pt-12 pb-6 px-4 text-center">
        <div className="text-5xl mb-3">✈️</div>
        <h1 className="text-2xl font-bold bg-gradient-to-l from-primary to-secondary bg-clip-text text-transparent">
          TripFamily
        </h1>
        <p className="text-text-muted text-sm mt-1">מתכנן טיולים משפחתי</p>
      </header>

      {/* Tab Switcher */}
      <div className="px-4 mb-6">
        <div className="flex bg-bg-card rounded-xl p-1 border border-border">
          <button
            onClick={() => {
              setActiveTab('login');
              setErrors({});
            }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
              activeTab === 'login'
                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                : 'text-text-muted'
            }`}
          >
            {t('login')}
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setErrors({});
            }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
              activeTab === 'register'
                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                : 'text-text-muted'
            }`}
          >
            {t('register')}
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 px-4" noValidate>
        <div className="space-y-4">
          {activeTab === 'register' && (
            <div>
              <label className="block text-xs text-text-muted mb-1.5 mr-1">
                {t('name')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ישראל ישראלי"
                className={inputClass}
              />
              {errors.name && (
                <p className="text-danger text-xs mt-1 mr-1">{errors.name}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs text-text-muted mb-1.5 mr-1">
              {t('email')}
            </label>
            <input
              type="email"
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className={inputClass}
            />
            {errors.email && (
              <p className="text-danger text-xs mt-1 mr-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-xs text-text-muted mb-1.5 mr-1">
              {t('password')}
            </label>
            <input
              type="password"
              dir="ltr"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={inputClass}
            />
            {errors.password && (
              <p className="text-danger text-xs mt-1 mr-1">{errors.password}</p>
            )}
          </div>

          {activeTab === 'register' && (
            <div>
              <label className="block text-xs text-text-muted mb-1.5 mr-1">
                {t('confirmPassword')}
              </label>
              <input
                type="password"
                dir="ltr"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
              />
              {errors.confirmPassword && (
                <p className="text-danger text-xs mt-1 mr-1">{errors.confirmPassword}</p>
              )}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full mt-8 py-3.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:bg-primary-dark active:scale-[0.98] transition-all duration-200"
        >
          {activeTab === 'login' ? t('loginButton') : t('registerButton')}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-text-muted">{t('or')}</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Google SSO */}
        <button
          type="button"
          className="w-full py-3 bg-bg-card border border-border text-text text-sm font-medium rounded-xl hover:bg-bg-surface transition-colors flex items-center justify-center gap-2"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path d="M17.64 9.2a10.34 10.34 0 0 0-.16-1.89H9v3.56h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92a8.78 8.78 0 0 0 2.68-6.65z" fill="#4285F4"/>
            <path d="M9 18a8.59 8.59 0 0 0 5.96-2.18l-2.92-2.26a5.43 5.43 0 0 1-3.04.85 5.38 5.38 0 0 1-5.07-3.72H.96v2.33A9 9 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.93 10.71a5.38 5.38 0 0 1 0-3.42V4.96H.96a9 9 0 0 0 0 8.08l2.97-2.33z" fill="#FBBC05"/>
            <path d="M9 3.58a4.86 4.86 0 0 1 3.44 1.35l2.58-2.58A8.65 8.65 0 0 0 9 0a9 9 0 0 0-8.04 4.96l2.97 2.33A5.38 5.38 0 0 1 9 3.58z" fill="#EA4335"/>
          </svg>
          {t('loginWithGoogle')}
        </button>

        {/* Switch Tab Link */}
        <p className="text-center mt-6 text-sm text-text-muted">
          {activeTab === 'login' ? (
            <>
              {t('noAccount')}{' '}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setErrors({});
                }}
                className="text-primary font-semibold hover:underline"
              >
                {t('register')}
              </button>
            </>
          ) : (
            <>
              {t('hasAccount')}{' '}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setErrors({});
                }}
                className="text-primary font-semibold hover:underline"
              >
                {t('login')}
              </button>
            </>
          )}
        </p>
      </form>
    </div>
  );
}
