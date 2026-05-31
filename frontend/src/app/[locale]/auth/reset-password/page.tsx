'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const API_URL = 'https://tripfamily-api.onrender.com';

export default function ResetPasswordPage() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = pathname.split('/')[1] || 'he';

  const [step, setStep] = useState<'email' | 'code' | 'newpassword'>('email');
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 1: Request reset code
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('יש להזין כתובת מייל'); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'שגיאה בשליחת קוד איפוס');

      setSuccess('קוד איפוס נשלח למייל שלכם');
      setStep('code');
    } catch (err: any) {
      setError(err.message || 'שגיאה בשליחת קוד האיפוס');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify code
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!resetCode.trim()) { setError('יש להזין את קוד האיפוס'); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code: resetCode.trim() }),
      });
      if (!res.ok) throw new Error('קוד לא תקין');
      setStep('newpassword');
    } catch (err: any) {
      setError(err.message || 'קוד לא תקין');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Set new password
  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!newPassword.trim() || newPassword.length < 6) { setError('הסיסמא חייבת להכיל לפחות 6 תווים'); return; }
    if (newPassword !== confirmPassword) { setError('הסיסמאות אינן תואמות'); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code: resetCode.trim(), password: newPassword }),
      });
      if (!res.ok) throw new Error('שגיאה בעדכון הסיסמא');
      setSuccess('הסיסמא עודכנה בהצלחה! ניתן להתחבר');
      setTimeout(() => router.push(`/${locale}/auth`), 3000);
    } catch (err: any) {
      setError(err.message || 'שגיאה בעדכון הסיסמא');
    } finally {
      setLoading(false);
    }
  };

  const styles = getStyles();

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>🔑</div>
        <h1 style={styles.title}>איפוס סיסמא</h1>

        {/* Step indicator */}
        <div style={styles.steps}>
          <div style={{...styles.stepBar, background: step === 'email' ? '#6C63FF' : '#10B981'}} />
          <div style={{...styles.stepBar, background: step === 'code' ? '#6C63FF' : step === 'newpassword' ? '#10B981' : 'rgba(255,255,255,0.08)'}} />
          <div style={{...styles.stepBar, background: step === 'newpassword' ? '#6C63FF' : 'rgba(255,255,255,0.08)'}} />
        </div>

        {/* Success */}
        {success && (
          <div style={styles.successBox}>✅ {success}</div>
        )}

        {/* Error */}
        {error && (
          <div style={styles.errorBox}>⚠️ {error}</div>
        )}

        {/* Step 1: Email */}
        {step === 'email' && (
          <form onSubmit={handleRequestCode}>
            <p style={styles.desc}>הזינו את כתובת המייל שלכם ונשלח לכם קוד איפוס</p>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
            <button type="submit" disabled={loading} style={styles.primaryBtn}>
              {loading ? 'שולח...' : 'שלח קוד איפוס'}
            </button>
          </form>
        )}

        {/* Step 2: Verify Code */}
        {step === 'code' && (
          <form onSubmit={handleVerifyCode}>
            <p style={styles.desc}>הזינו את קוד האיפוס שנשלח למייל: {email}</p>
            <input
              type="text"
              placeholder="הזינו כאן את הקוד"
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value)}
              required
              style={styles.input}
            />
            <button type="submit" disabled={loading} style={styles.primaryBtn}>
              {loading ? 'מאמת...' : 'אמת קוד'}
            </button>
            <button type="button" onClick={() => setStep('email')} style={styles.linkBtn}>
              חזרה — מייל אחר
            </button>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === 'newpassword' && (
          <form onSubmit={handleSetPassword}>
            <p style={styles.desc}>הזינו סיסמא חדשה</p>
            <input
              type="password"
              placeholder="סיסמא חדשה (לפחות 6 תווים)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              style={styles.input}
            />
            <input
              type="password"
              placeholder="אישור סיסמא"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              style={styles.input}
            />
            <button type="submit" disabled={loading} style={styles.primaryBtn}>
              {loading ? 'מעדכן...' : 'עדכן סיסמא'}
            </button>
          </form>
        )}

        <button
          onClick={() => router.push(`/${locale}/auth`)}
          style={styles.linkBtn}
        >
          ← חזרה להתחברות
        </button>
      </div>
    </div>
  );
}

function getStyles() {
  return {
    container: {
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0F0F23', fontFamily: 'Inter,system-ui,sans-serif', direction: 'rtl' as const,
      padding: '32px',
    },
    card: {
      background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px',
      padding: '40px 32px', maxWidth: '420px', width: '100%', textAlign: 'center' as const,
    },
    icon: { fontSize: '56px', marginBottom: '16px' },
    title: { fontSize: '24px', fontWeight: 700, color: '#E8E8F0', margin: '0 0 24px 0' },
    desc: { color: '#94A3B8', fontSize: '14px', margin: '0 0 20px 0', lineHeight: 1.6 },
    steps: { display: 'flex', gap: '8px', marginBottom: '28px' },
    stepBar: { flex: 1, height: '4px', borderRadius: '2px', transition: 'all 0.3s' },
    input: {
      width: '100%', padding: '14px 16px', marginBottom: '16px',
      background: '#0F0F23', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '12px', color: '#E8E8F0', fontSize: '15px', outline: 'none',
      boxSizing: 'border-box' as const, fontFamily: 'inherit',
    },
    primaryBtn: {
      width: '100%', padding: '14px', background: '#6C63FF', color: '#fff',
      border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 700,
      cursor: 'pointer', transition: 'all 0.2s', opacity: 1,
    },
    linkBtn: {
      background: 'transparent', border: 'none', color: '#6C63FF',
      fontSize: '14px', fontWeight: 600, cursor: 'pointer', marginTop: '16px',
      padding: '8px', fontFamily: 'inherit',
    },
    successBox: {
      background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
      borderRadius: '12px', padding: '12px 16px', marginBottom: '16px',
      color: '#10B981', fontSize: '14px',
    },
    errorBox: {
      background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
      borderRadius: '12px', padding: '12px 16px', marginBottom: '16px',
      color: '#EF4444', fontSize: '14px',
    },
  };
}
