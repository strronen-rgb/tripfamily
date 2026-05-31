'use client';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

export default function ProfilePage() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'he';
  const { data: session } = useSession();

  const menuItems = [
    { icon:'👤', label:'פרופיל אישי', href:`/${locale}/profile/edit` },
    { icon:'👨‍👩‍👧‍👦', label:'המשפחה שלי', href:`/${locale}/profile/family` },
    { icon:'⚙️', label:'הגדרות', href:`/${locale}/profile/settings` },
    { icon:'🔔', label:'התראות', href:`/${locale}/profile/notifications` },
    { icon:'📊', label:'סטטיסטיקות טיולים', href:`/${locale}/profile/stats` },
    { icon:'❓', label:'עזרה ותמיכה', href:`/${locale}/profile/help` },
  ];

  return (
    <div style={{minHeight:'100vh',background:'#0F0F23',color:'#E8E8F0',fontFamily:'Inter,system-ui,sans-serif',direction:'rtl'}}>
      <header style={{position:'sticky',top:0,zIndex:40,background:'rgba(26,26,46,0.9)',backdropFilter:'blur(16px)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'12px 16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <h1 style={{fontSize:'20px',fontWeight:700,color:'#6C63FF',margin:0}}>✈️ TripFamily</h1>
        <span style={{fontSize:'12px',color:'#94A3B8'}}>פרופיל</span>
      </header>
      <main style={{padding:'16px',paddingBottom:'80px'}}>
        {/* Profile Card */}
        <div style={{background:'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(255,107,107,0.1))',border:'1px solid rgba(108,99,255,0.2)',borderRadius:'20px',padding:'24px',marginBottom:'24px',textAlign:'center'}}>
          <div style={{width:'80px',height:'80px',borderRadius:'50%',background:'#252540',margin:'0 auto 12px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'36px',border:'3px solid #6C63FF',overflow:'hidden'}}>
            {session?.user?.image ? (
              <img src={session.user.image} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} />
            ) : '👤'}
          </div>
          <h2 style={{fontSize:'20px',fontWeight:700,margin:'0 0 4px 0'}}>{session?.user?.name || 'אורח'}</h2>
          <p style={{fontSize:'14px',color:'#94A3B8',margin:'0 0 16px 0'}}>{session?.user?.email || ''}</p>
          <div style={{display:'flex',gap:'8px',justifyContent:'center',flexWrap:'wrap'}}>
            <span style={{padding:'4px 12px',background:'rgba(108,99,255,0.15)',color:'#6C63FF',borderRadius:'12px',fontSize:'12px',fontWeight:500}}>משתמש</span>
          </div>
        </div>

        {/* Menu */}
        <h3 style={{fontSize:'16px',fontWeight:600,margin:'0 0 12px 0'}}>הגדרות</h3>
        {menuItems.map((item, idx) => (
          <a key={idx} href={item.href} style={{display:'flex',alignItems:'center',gap:'12px',padding:'16px',background:'#1A1A2E',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',marginBottom:'8px',textDecoration:'none',color:'inherit'}}>
            <span style={{fontSize:'20px'}}>{item.icon}</span>
            <span style={{fontSize:'14px',fontWeight:500,flex:1}}>{item.label}</span>
            <span style={{color:'#94A3B8'}}>›</span>
          </a>
        ))}

        {/* Logout */}
        <button onClick={() => signOut({ callbackUrl: `/${locale}/auth` })} style={{
          width:'100%',marginTop:'24px',padding:'14px',background:'rgba(239,68,68,0.1)',
          border:'1px solid rgba(239,68,68,0.2)',color:'#EF4444',borderRadius:'12px',
          fontSize:'14px',fontWeight:600,cursor:'pointer',
        }}>
          🚪 התנתקות
        </button>
      </main>
    </div>
  );
}
