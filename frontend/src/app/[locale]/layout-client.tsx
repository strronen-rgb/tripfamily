'use client';

import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ReactNode, useEffect } from 'react';

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
  const { data: session, status } = useSession();
  const currentPath = pathname.replace(`/${locale}`, '') || '/';
  const isAuthPage = currentPath === '/auth';

  // Redirect to auth if not authenticated (except on auth page)
  useEffect(() => {
    if (status === 'loading') return;
    if (!session && !isAuthPage && typeof window !== 'undefined') {
      window.location.href = `/${locale}/auth`;
    }
  }, [session, status, isAuthPage, locale]);

  // Show loading while checking session
  if (status === 'loading') {
    return (
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0F0F23',color:'#94A3B8',fontFamily:'Inter,system-ui,sans-serif'}}>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:'48px',marginBottom:'16px',animation:'pulse 1.5s ease-in-out infinite'}}>✈️</div>
          <p>טוען...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated and not on auth page
  if (!session && !isAuthPage) {
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

  return (
    <div style={{minHeight:'100vh',background:'#0F0F23'}}>
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
