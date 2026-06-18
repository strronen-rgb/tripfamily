'use client';

import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';

const tabs = [
  { href: '', icon: '🏠', label: 'בית' },
  { href: '/explore', icon: '🌏', label: 'גלה' },
  { href: '/bookings', icon: '📋', label: 'הזמנות' },
  { href: '/budget', icon: '💰', label: 'תקציב' },
  { href: '/profile', icon: '👤', label: 'פרופיל' },
] as const;

export default function LocaleLayoutInner({
  children,
  locale,
}: {
  children: ReactNode;
  locale: string;
}) {
  const pathname = usePathname();
  const currentPath = pathname.replace(`/${locale}`, '') || '/';
  const isAuthPage = currentPath === '/auth' || currentPath.startsWith('/auth/');
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://tripfamily-api.onrender.com';

  // Check auth via JWT token
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('tripfamily_token');
    setIsAuthenticated(!!token);
  }, []);

  // Redirect to auth if not authenticated (except on auth page)
  useEffect(() => {
    if (isAuthenticated === null) return; // still checking
    if (!isAuthenticated && !isAuthPage && typeof window !== 'undefined') {
      window.location.href = `/${locale}/auth`;
    }
  }, [isAuthenticated, isAuthPage, locale]);

  // Show loading while checking auth
  if (isAuthenticated === null) {
    return (
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0F0F23',color:'#94A3B8',fontFamily:'Inter,system-ui,sans-serif'}}>
        <div style={{textAlign:'center'}}>
          <div style={{position:'relative',width:'120px',height:'120px',margin:'0 auto 16px'}}>
            <p style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',margin:0,fontSize:'16px',fontWeight:600,color:'#6C63FF',whiteSpace:'nowrap'}}>טעינה</p>
            <div style={{position:'absolute',top:'50%',left:'50%',width:'120px',height:'120px',marginTop:'-60px',marginLeft:'-60px',animation:'orbit 1.5s linear infinite'}}>
              <span style={{position:'absolute',top:'-12px',left:'50%',transform:'translateX(-50%)',fontSize:'28px'}}>✈️</span>
            </div>
          </div>
        </div>
        <style>{`
          @keyframes orbit {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Show login prompt if not authenticated and not on auth page
  if (!isAuthenticated && !isAuthPage) {
    return (
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0F0F23',color:'#E8E8F0',fontFamily:'Inter,system-ui,sans-serif',direction:'rtl',padding:'32px'}}>
        <div style={{textAlign:'center',background:'#1A1A2E',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'20px',padding:'32px',maxWidth:'400px'}}>
          <div style={{fontSize:'48px',marginBottom:'16px'}}>✈️</div>
          <h2 style={{fontSize:'20px',fontWeight:700,margin:'0 0 8px 0',color:'#6C63FF'}}>TripFamily</h2>
          <p style={{color:'#94A3B8',margin:'0 0 24px 0'}}>יש להתחבר כדי לצפות באפליקציה</p>
          <a href={`/${locale}/auth`} style={{display:'inline-block',padding:'12px 24px',background:'#6C63FF',color:'#fff',borderRadius:'12px',textDecoration:'none',fontWeight:600}}>
            התחברות
          </a>
        </div>
      </div>
    );
  }

  // Get user email from localStorage for verification banner
  let userEmail: string | null = null;
  try {
    const savedUser = typeof window !== 'undefined' ? localStorage.getItem('tripfamily_user') : null;
    if (savedUser) userEmail = JSON.parse(savedUser)?.email || null;
  } catch {}

  const needsVerification = userEmail && !isAuthPage;

  async function handleResendVerification() {
    if (!userEmail) return;
    setResending(true);
    setResendMsg('');
    try {
      const res = await fetch(`${API_URL}/api/auth/verify/send-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setResendMsg('קישור אימות נשלח מחדש! בדוק את האימייל שלך.');
      } else {
        setResendMsg(data.error || 'שגיאה בשליחה. נסה שוב.');
      }
    } catch {
      setResendMsg('שגיאת רשת. נסה שוב.');
    } finally {
      setResending(false);
    }
  }

  return (
    <div style={{minHeight:'100vh',background:'#0F0F23'}}>
      {/* Email verification banner */}
      {needsVerification && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(255,107,107,0.1))',
          borderBottom: '1px solid rgba(108,99,255,0.2)',
          padding: '12px 16px',
          textAlign: 'center',
          direction: 'rtl',
        }}>
          <p style={{margin:'0 0 8px 0',color:'#E8E8F0',fontSize:'13px'}}>
            📧 יש לאמת את האימייל שלך כדי להשתמש בכל הפיצ&apos;רים
          </p>
          <button
            onClick={handleResendVerification}
            disabled={resending}
            style={{
              padding:'6px 16px',background:'#6C63FF',color:'#fff',
              border:'none',borderRadius:'8px',fontSize:'12px',fontWeight:600,cursor:'pointer',
              opacity: resending ? 0.5 : 1,
            }}
          >
            {resending ? 'שולח...' : 'שלח קישור אימות'}
          </button>
          {resendMsg && (
            <p style={{margin:'8px 0 0 0',fontSize:'12px',color:resendMsg.includes('נשלח')?'#34D399':'#EF4444'}}>
              {resendMsg}
            </p>
          )}
        </div>
      )}

      <main style={{paddingBottom:'80px'}}>{children}</main>

      {/* Bottom Tab Bar - hide on auth page */}
      {!isAuthPage && (
        <nav style={{
          position:'fixed', bottom:0, left:0, right:0, zIndex:50,
          background:'rgba(26,26,46,0.95)', backdropFilter:'blur(16px)',
          borderTop:'1px solid rgba(255,255,255,0.08)',
          paddingBottom:'max(env(safe-area-inset-bottom, 0px), 8px)'
        }}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'spaceAround',padding:'8px 0',maxWidth:'512px',margin:'0 auto'}}>
            {tabs.map((tab) => {
              const tabPath = `/${locale}${tab.href}`;
              const isActive = tab.href === ''
                ? currentPath === '/' || currentPath === ''
                : currentPath === tab.href;

              return (
                <a
                  key={tab.href}
                  href={tabPath}
                  style={{
                    display:'flex',flexDirection:'column',alignItems:'center',
                    gap:'2px', padding:'6px 16px', borderRadius:'12px',
                    textDecoration:'none',color: isActive ? '#6C63FF' : '#94A3B8',
                    background: isActive ? 'rgba(108,99,255,0.1)' : 'transparent',
                    transition:'all 0.2s ease', fontSize:'10px', fontWeight:500
                  }}
                >
                  <span style={{fontSize:'20px', transform: isActive ? 'scale(1.1)' : 'scale(1)', transition:'transform 0.2s'}}>{tab.icon}</span>
                  <span style={{color: isActive ? '#6C63FF' : '#94A3B8'}}>{tab.label}</span>
                </a>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
