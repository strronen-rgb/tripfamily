'use client';
import { usePathname } from 'next/navigation';

export default function BudgetPage() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'he';
  const categories = [
    { key:'flights', label:'טיסות', icon:'✈️', color:'#6C63FF', amount:0 },
    { key:'hotels', label:'מלונות', icon:'🏨', color:'#10B981', amount:0 },
    { key:'food', label:'אוכל', icon:'🍜', color:'#FF6B6B', amount:0 },
    { key:'transport', label:'תחבורה', icon:'🚕', color:'#F59E0B', amount:0 },
  ];
  const total = categories.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div style={{minHeight:'100vh',background:'#0F0F23',color:'#E8E8F0',fontFamily:'Inter,system-ui,sans-serif',direction:'rtl'}}>
      <header style={{position:'sticky',top:0,zIndex:40,background:'rgba(26,26,46,0.9)',backdropFilter:'blur(16px)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'12px 16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <h1 style={{fontSize:'20px',fontWeight:700,color:'#6C63FF',margin:0}}>✈️ TripFamily</h1>
        <span style={{fontSize:'12px',color:'#94A3B8'}}>תקציב</span>
      </header>
      <main style={{padding:'16px',paddingBottom:'80px'}}>
        {/* Total Budget Card */}
        <div style={{background:'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(16,185,129,0.1))',border:'1px solid rgba(108,99,255,0.2)',borderRadius:'20px',padding:'24px',marginBottom:'24px',textAlign:'center'}}>
          <p style={{fontSize:'14px',color:'#94A3B8',margin:'0 0 8px 0'}}>סה"כ תקציב</p>
          <p style={{fontSize:'36px',fontWeight:700,color:'#6C63FF',margin:'0 0 4px 0',fontFamily:'JetBrains Mono,monospace'}}>₪{total.toLocaleString()}</p>
          <p style={{fontSize:'12px',color:'#94A3B8',margin:0}}>מתוך ₪0 שהוקצו</p>
        </div>

        {/* Categories */}
        <h2 style={{fontSize:'18px',fontWeight:600,margin:'0 0 12px 0'}}>💰 קטגוריות</h2>
        {categories.map(c => (
          <div key={c.key} style={{background:'#1A1A2E',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'16px',padding:'16px',marginBottom:'12px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
              <span style={{fontSize:'24px'}}>{c.icon}</span>
              <span style={{fontSize:'16px',fontWeight:500}}>{c.label}</span>
            </div>
            <span style={{color:c.color,fontSize:'16px',fontWeight:700,fontFamily:'JetBrains Mono,monospace'}}>₪{c.amount}</span>
          </div>
        ))}

        <div style={{textAlign:'center',padding:'32px 0',marginTop:'16px'}}>
          <p style={{color:'#94A3B8',fontSize:'14px',margin:'0 0 16px 0'}}>התחילו לעקוב אחר הוצאות</p>
          <a href="/he/bookings" style={{display:'inline-block',padding:'10px 20px',background:'rgba(108,99,255,0.15)',color:'#6C63FF',borderRadius:'8px',textDecoration:'none',fontWeight:500}}>הוסף הוצאה</a>
        </div>
      </main>
    </div>
  );
}
