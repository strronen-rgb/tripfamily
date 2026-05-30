'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

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

  return (
    <div style={{minHeight:'100vh',background:'#0F0F23'}}>
      <main style={{paddingBottom:'80px'}}>{children}</main>

      {/* Bottom Tab Bar */}
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
    </div>
  );
}
