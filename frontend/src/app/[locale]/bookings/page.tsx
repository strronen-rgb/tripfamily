'use client';
import { usePathname } from 'next/navigation';

export default function BookingsPage() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'he';
  const sections = [
    { key:'flights', icon:'✈️', title:'טיסות', color:'#6C63FF', count:0 },
    { key:'hotels', icon:'🏨', title:'המלונות', color:'#10B981', count:0 },
    { key:'attractions', icon:'🎯', title:'אטרקציות', color:'#FF6B6B', count:0 },
  ];
  return (
    <div style={{minHeight:'100vh',background:'#0F0F23',color:'#E8E8F0',fontFamily:'Inter,system-ui,sans-serif',direction:'rtl'}}>
      <header style={{position:'sticky',top:0,zIndex:40,background:'rgba(26,26,46,0.9)',backdropFilter:'blur(16px)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'12px 16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <h1 style={{fontSize:'20px',fontWeight:700,color:'#6C63FF',margin:0}}>✈️ TripFamily</h1>
        <span style={{fontSize:'12px',color:'#94A3B8'}}>הזמנות</span>
      </header>
      <main style={{padding:'16px',paddingBottom:'80px'}}>
        <h2 style={{fontSize:'24px',fontWeight:700,margin:'0 0 16px 0'}}>📋 ההזמנות שלי</h2>
        {sections.map(s => (
          <div key={s.key} style={{background:'#1A1A2E',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'16px',padding:'16px',marginBottom:'12px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
              <span style={{fontSize:'24px'}}>{s.icon}</span>
              <div>
                <h3 style={{fontSize:'16px',fontWeight:600,margin:'0 0 4px 0'}}>{s.title}</h3>
                <p style={{fontSize:'12px',color:'#94A3B8',margin:0}}>אין פריטים</p>
              </div>
            </div>
            <span style={{color:s.color,fontSize:'20px',fontWeight:700}}>0</span>
          </div>
        ))}
        <div style={{textAlign:'center',padding:'32px 0',marginTop:'16px'}}>
          <p style={{color:'#94A3B8',fontSize:'14px',margin:'0 0 16px 0'}}>אין הזמנות עדיין</p>
          <a href="/he/explore" style={{display:'inline-block',padding:'10px 20px',background:'rgba(108,99,255,0.15)',color:'#6C63FF',borderRadius:'8px',textDecoration:'none',fontWeight:500}}>גלה יעדים והוסף הזמנות</a>
        </div>
      </main>
    </div>
  );
}
