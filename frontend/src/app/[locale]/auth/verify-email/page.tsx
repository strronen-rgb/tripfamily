'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired' | 'already'>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://tripfamily-api.onrender.com';

  // Handle token verification from URL
  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('קישור לא תקין — חסר קוד אימות');
      return;
    }

    fetch(`${API_URL}/api/auth/verify/verify-email?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus('success');
          setMessage(`האימייל ${data.data.email} אומת בהצלחה!`);
        } else {
          const errMsg = data.error || '';
          if (errMsg.includes('expired') || errMsg.includes('Expired')) {
            setStatus('expired');
            setMessage('קישור האימות פג תוקף. בקש קישור חדש.');
          } else if (errMsg.includes('Invalid') || errMsg.includes('invalid')) {
            setStatus('error');
            setMessage('קישור לא תקין.');
          } else if (errMsg.includes('already') || errMsg.includes('Already')) {
            setStatus('already');
            setMessage('האימייל כבר אומת.');
          } else {
            setStatus('error');
            setMessage(errMsg || 'שגיאה באימות האימייל.');
          }
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('שגיאת רשת. נסה שוב.');
      });
  }, [searchParams, API_URL]);

  // Resend verification email
  async function handleResend(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setResendMessage('הכנס אימייל');
      return;
    }
    setResendLoading(true);
    setResendMessage('');

    try {
      const res = await fetch(`${API_URL}/api/auth/verify/send-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setResendMessage('קישור אימות נשלח מחדש! בדוק את האימייל שלך.');
      } else {
        setResendMessage(data.error || 'שגיאה בשליחה. נסה שוב.');
      }
    } catch {
      setResendMessage('שגיאת רשת. נסה שוב.');
    } finally {
      setResendLoading(false);
    }
  }

  function goToLogin() {
    const locale = window.location.pathname.split('/')[1] || 'he';
    router.replace(`/${locale}/auth`);
  }

  function goToHome() {
    const locale = window.location.pathname.split('/')[1] || 'he';
    router.replace(`/${locale}`);
  }

  return (
    <div style={{minHeight:'100vh',background:'#0F0F23',color:'#E8E8F0',fontFamily:'Inter,system-ui,sans-serif',direction:'rtl',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'32px'}}>
      <div style={{textAlign:'center',maxWidth:'420px',width:'100%'}}>
        {/* Icon */}
        <div style={{fontSize:'64px',marginBottom:'16px'}}>
          {status === 'loading' ? '⏳' : status === 'success' || status === 'already' ? '✅' : '❌'}
        </div>

        {/* Title */}
        <h1 style={{fontSize:'24px',fontWeight:700,margin:'0 0 8px 0',background:'linear-gradient(to left, #6C63FF, #FF6B6B)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
          {status === 'loading' ? 'מאמת אימייל...' : status === 'success' ? 'אימות הצליח!' : status === 'already' ? 'כבר אומת' : 'שגיאה באימות'}
        </h1>

        {/* Message */}
        <p style={{color:'#94A3B8',fontSize:'14px',lineHeight:1.6,margin:'0 0 24px 0'}}>
          {message}
        </p>

        {/* Success / Already verified → Go to app */}
        {(status === 'success' || status === 'already') && (
          <button onClick={goToHome} style={{
            width:'100%',padding:'14px',background:'#6C63FF',color:'#fff',
            fontWeight:700,border:'none',borderRadius:'12px',fontSize:'16px',cursor:'pointer',
            boxShadow:'0 4px 12px rgba(108,99,255,0.3)',
          }}>
            לדף הבית ✈️
          </button>
        )}

        {/* Error / Expired → Resend form + Login button */}
        {(status === 'error' || status === 'expired') && (
          <>
            <form onSubmit={handleResend} style={{marginBottom:'16px'}}>
              <label style={{display:'block',fontSize:'12px',color:'#94A3B8',marginBottom:'6px'}}>
                אימייל לשליחת קישור חדש
              </label>
              <input
                type="email"
                dir="ltr"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@example.com"
                style={{
                  width:'100%',padding:'12px 16px',background:'#252540',
                  border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',
                  color:'#E8E8F0',fontSize:'14px',outline:'none',boxSizing:'border-box',
                  textAlign:'left',marginBottom:'12px',
                }}
              />
              <button type="submit" disabled={resendLoading} style={{
                width:'100%',padding:'14px',background:'#6C63FF',color:'#fff',
                fontWeight:700,border:'none',borderRadius:'12px',fontSize:'16px',cursor:'pointer',
                boxShadow:'0 4px 12px rgba(108,99,255,0.3)',
                opacity: resendLoading ? 0.5 : 1,
              }}>
                {resendLoading ? 'שולח...' : 'שלח קישור אימות חדש'}
              </button>
            </form>

            {resendMessage && (
              <p style={{color:resendMessage.includes('נשלח') ? '#34D399' : '#EF4444',fontSize:'13px',marginBottom:'16px'}}>
                {resendMessage}
              </p>
            )}

            <button onClick={goToLogin} style={{
              width:'100%',padding:'12px',background:'transparent',border:'1px solid rgba(255,255,255,0.08)',
              color:'#94A3B8',fontSize:'14px',fontWeight:500,borderRadius:'12px',cursor:'pointer',
            }}>
              חזרה להתחברות
            </button>
          </>
        )}

        {/* Loading spinner */}
        {status === 'loading' && (
          <div style={{marginTop:'24px'}}>
            <div style={{width:'40px',height:'40px',margin:'0 auto',border:'3px solid rgba(108,99,255,0.2)',borderTop:'3px solid #6C63FF',borderRadius:'50%',animation:'spin 1s linear infinite'}} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}
      </div>
    </div>
  );
}
