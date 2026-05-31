'use client';

import { useState, FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';

type Tab = 'login' | 'register';

export default function AuthPage() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = pathname.split('/')[1] || 'he';
  const [activeTab, setActiveTab] = useState<Tab>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (activeTab === 'register' && !name.trim()) e.name = 'נדרש שם';
    if (!email.trim()) e.email = 'נדרש אימייל';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'אימייל לא תקין';
    if (!password) e.password = 'נדרשת סיסמה';
    else if (password.length < 6) e.password = 'לפחות 6 תווים';
    if (activeTab === 'register' && password !== confirmPassword) e.confirmPassword = 'הסיסמאות לא תואמות';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setServerError('');
    try {
      if (activeTab === 'register') {
        // Register via backend API first
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://tripfamily-api.onrender.com';
        const res = await fetch(`${API_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        });
        const data = await res.json();
        if (!res.ok) {
          // Handle specific backend errors
          if (res.status === 409) throw new Error('האימייל כבר רשום במערכת. נסה להתחבר.');
          if (res.status === 400) throw new Error(data.error || 'נתונים לא תקינים. בדוק שוב.');
          throw new Error(data.error || 'ההרשמה נכשלה. נסה שוב.');
        }
      }
      // Sign in with NextAuth
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        // Handle specific NextAuth errors
        if (result.error === 'CredentialsSignin') {
          throw new Error('אימייל או סיסמה שגויים. נסה שוב.');
        }
        throw new Error('ההתחברות נכשלה. בדוק את הפרטים ונסה שוב.');
      }
      if (!result?.ok) {
        throw new Error('ההתחברות נכשלה. נסה שוב מאוחר יותר.');
      }
      router.replace(`/${locale}`);
    } catch (err: any) {
      setServerError(err.message || 'אירעה שגיאה. נסו שוב.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    setServerError('');
    try {
      await signIn('google', { callbackUrl: `/${locale}` });
    } catch (err: any) {
      setServerError('שגיאה בהתחברות עם Google. נסה שוב.');
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px', background: '#252540',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px',
    color: '#E8E8F0', fontSize: '14px', outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '12px', color: '#94A3B8',
    marginBottom: '6px', marginRight: '4px',
  };

  return (
    <div style={{minHeight:'100vh',background:'#0F0F23',color:'#E8E8F0',fontFamily:'Inter,system-ui,sans-serif',direction:'rtl',display:'flex',flexDirection:'column'}}>
      {/* Header */}
      <div style={{paddingTop:'48px',paddingBottom:'24px',textAlign:'center'}}>
        <div style={{fontSize:'48px',marginBottom:'12px'}}>✈️</div>
        <h1 style={{fontSize:'24px',fontWeight:700,margin:'0 0 4px 0',background:'linear-gradient(to left, #6C63FF, #FF6B6B)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
          TripFamily
        </h1>
        <p style={{color:'#94A3B8',fontSize:'14px',margin:0}}>מתכנן טיולים משפחתי</p>
      </div>

      {/* Tab Switcher */}
      <div style={{padding:'0 16px',marginBottom:'24px'}}>
        <div style={{display:'flex',background:'#1A1A2E',borderRadius:'12px',padding:'4px',border:'1px solid rgba(255,255,255,0.08)'}}>
          <button onClick={() => { setActiveTab('login'); setErrors({}); }} style={{
            flex:1, padding:'10px', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:600, cursor:'pointer',
            background: activeTab === 'login' ? '#6C63FF' : 'transparent',
            color: activeTab === 'login' ? '#fff' : '#94A3B8',
            boxShadow: activeTab === 'login' ? '0 4px 12px rgba(108,99,255,0.3)' : 'none',
            transition:'all 0.3s',
          }}>
            התחברות
          </button>
          <button onClick={() => { setActiveTab('register'); setErrors({}); }} style={{
            flex:1, padding:'10px', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:600, cursor:'pointer',
            background: activeTab === 'register' ? '#6C63FF' : 'transparent',
            color: activeTab === 'register' ? '#fff' : '#94A3B8',
            boxShadow: activeTab === 'register' ? '0 4px 12px rgba(108,99,255,0.3)' : 'none',
            transition:'all 0.3s',
          }}>
            הרשמה
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{flex:1,padding:'0 16px'}}>
        {/* Name (register only) */}
        {activeTab === 'register' && (
          <div style={{marginBottom:'16px'}}>
            <label style={labelStyle}>שם מלא</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="ישראל ישראלי" style={inputStyle} />
            {errors.name && <p style={{color:'#EF4444',fontSize:'12px',margin:'4px 0 0 4px'}}>{errors.name}</p>}
          </div>
        )}

        {/* Email */}
        <div style={{marginBottom:'16px'}}>
          <label style={labelStyle}>אימייל</label>
          <input type="email" dir="ltr" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" style={{...inputStyle, textAlign:'left'}} />
          {errors.email && <p style={{color:'#EF4444',fontSize:'12px',margin:'4px 0 0 4px'}}>{errors.email}</p>}
        </div>

        {/* Password */}
        <div style={{marginBottom:'16px'}}>
          <label style={labelStyle}>סיסמה</label>
          <input type="password" dir="ltr" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{...inputStyle, textAlign:'left'}} />
          {errors.password && <p style={{color:'#EF4444',fontSize:'12px',margin:'4px 0 0 4px'}}>{errors.password}</p>}
        </div>

        {/* Confirm Password (register only) */}
        {activeTab === 'register' && (
          <div style={{marginBottom:'16px'}}>
            <label style={labelStyle}>אימות סיסמה</label>
            <input type="password" dir="ltr" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" style={{...inputStyle, textAlign:'left'}} />
            {errors.confirmPassword && <p style={{color:'#EF4444',fontSize:'12px',margin:'4px 0 0 4px'}}>{errors.confirmPassword}</p>}
          </div>
        )}

        {/* Server Error */}
        {serverError && (
          <div style={{marginBottom:'16px',padding:'12px',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'12px'}}>
            <p style={{color:'#EF4444',fontSize:'12px',textAlign:'center',margin:0}}>{serverError}</p>
          </div>
        )}

        {/* Submit */}
        <button type="submit" disabled={loading} style={{
          width:'100%',marginTop:'32px',padding:'14px',background:'#6C63FF',color:'#fff',
          fontWeight:700,border:'none',borderRadius:'12px',fontSize:'16px',cursor:'pointer',
          boxShadow:'0 4px 12px rgba(108,99,255,0.3)',
          opacity: loading ? 0.5 : 1,
        }}>
          {loading ? 'טוען...' : activeTab === 'login' ? 'התחברות' : 'הרשמה'}
        </button>

        {/* Divider */}
        <div style={{display:'flex',alignItems:'center',gap:'12px',margin:'24px 0'}}>
          <div style={{flex:1,height:'1px',background:'rgba(255,255,255,0.08)'}} />
          <span style={{fontSize:'12px',color:'#94A3B8'}}>או</span>
          <div style={{flex:1,height:'1px',background:'rgba(255,255,255,0.08)'}} />
        </div>

        {/* Google SSO */}
        <button type="button" disabled={loading} onClick={handleGoogleLogin} style={{
          width:'100%',padding:'12px',background:'#1A1A2E',border:'1px solid rgba(255,255,255,0.08)',
          color:'#E8E8F0',fontSize:'14px',fontWeight:500,borderRadius:'12px',cursor:'pointer',
          display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',
          opacity: loading ? 0.5 : 1,
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path d="M17.64 9.2a10.34 10.34 0 0 0-.16-1.89H9v3.56h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92a8.78 8.78 0 0 0 2.68-6.65z" fill="#4285F4"/>
            <path d="M9 18a8.59 8.59 0 0 0 5.96-2.18l-2.92-2.26a5.43 5.43 0 0 1-3.04.85 5.38 5.38 0 0 1-5.07-3.72H.96v2.33A9 9 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.93 10.71a5.38 5.38 0 0 1 0-3.42V4.96H.96a9 9 0 0 0 0 8.08l2.97-2.33z" fill="#FBBC05"/>
            <path d="M9 3.58a4.86 4.86 0 0 1 3.44 1.35l2.58-2.58A8.65 8.65 0 0 0 9 0a9 9 0 0 0-8.04 4.96l2.97 2.33A5.38 5.38 0 0 1 9 3.58z" fill="#EA4335"/>
          </svg>
          התחברות עם Google
        </button>

        {/* Switch Tab */}
        <p style={{textAlign:'center',marginTop:'24px',fontSize:'14px',color:'#94A3B8'}}>
          {activeTab === 'login' ? (
            <>אין לך חשבון? <button type="button" onClick={() => { setActiveTab('register'); setErrors({}); }} style={{color:'#6C63FF',fontWeight:600,border:'none',background:'none',cursor:'pointer',fontSize:'14px'}}>הירשם</button></>
          ) : (
            <>כבר יש לך חשבון? <button type="button" onClick={() => { setActiveTab('login'); setErrors({}); }} style={{color:'#6C63FF',fontWeight:600,border:'none',background:'none',cursor:'pointer',fontSize:'14px'}}>התחבר</button></>
          )}
        </p>
      </form>
    </div>
  );
}
