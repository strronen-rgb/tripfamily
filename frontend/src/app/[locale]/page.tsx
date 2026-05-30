import React from 'react';

export default function HomePage() {
  return (
    <div style={{minHeight:'100vh',background:'#0F0F23',color:'#E8E8F0',fontFamily:'Inter,system-ui,sans-serif',direction:'rtl'}}>
      {/* Header */}
      <header style={{position:'sticky',top:0,zIndex:40,background:'rgba(26,26,46,0.9)',backdropFilter:'blur(16px)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'12px 16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <h1 style={{fontSize:'20px',fontWeight:700,color:'#6C63FF',margin:0}}>✈️ TripFamily</h1>
        <span style={{fontSize:'12px',color:'#94A3B8'}}>🌏 Thailand • Japan • Korea</span>
      </header>

      {/* Hero Section */}
      <section style={{padding:'32px 16px',textAlign:'center',background:'linear-gradient(135deg, rgba(108,99,255,0.15) 0%, rgba(255,107,107,0.1) 100%)'}}>
        <h2 style={{fontSize:'32px',fontWeight:700,margin:'0 0 8px 0',background:'linear-gradient(to left, #6C63FF, #FF6B6B)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
          ברוכים הבאים לטיול הבא שלכם! 🌏
        </h2>
        <p style={{color:'#94A3B8',fontSize:'14px',margin:0}}>Plan your perfect family trip</p>
      </section>

      {/* Quick Stats */}
      <section style={{padding:'0 16px 24px'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px'}}>
          <div style={{background:'linear-gradient(135deg, #1A1A2E, #252540)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'16px',padding:'16px',textAlign:'center'}}>
            <div style={{fontSize:'24px',marginBottom:'4px'}}>✈️</div>
            <div style={{fontSize:'24px',fontWeight:700,color:'#6C63FF',fontFamily:'JetBrains Mono,monospace'}}>0</div>
            <div style={{fontSize:'12px',color:'#94A3B8'}}>טיסות</div>
          </div>
          <div style={{background:'linear-gradient(135deg, #1A1A2E, #252540)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'16px',padding:'16px',textAlign:'center'}}>
            <div style={{fontSize:'24px',marginBottom:'4px'}}>🏨</div>
            <div style={{fontSize:'24px',fontWeight:700,color:'#10B981',fontFamily:'JetBrains Mono,monospace'}}>0</div>
            <div style={{fontSize:'12px',color:'#94A3B8'}}>מלונות</div>
          </div>
          <div style={{background:'linear-gradient(135deg, #1A1A2E, #252540)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'16px',padding:'16px',textAlign:'center'}}>
            <div style={{fontSize:'24px',marginBottom:'4px'}}>🎯</div>
            <div style={{fontSize:'24px',fontWeight:700,color:'#FF6B6B',fontFamily:'JetBrains Mono,monospace'}}>0</div>
            <div style={{fontSize:'12px',color:'#94A3B8'}}>אטרקציות</div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section style={{padding:'0 16px 24px'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'12px'}}>
          <a href="/he/explore" style={{display:'block',background:'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(108,99,255,0.05))',border:'1px solid rgba(108,99,255,0.2)',borderRadius:'16px',padding:'16px',textAlign:'center',textDecoration:'none',color:'inherit'}}>
            <div style={{fontSize:'24px',marginBottom:'8px'}}>🌏</div>
            <div style={{fontSize:'14px',fontWeight:600,color:'#6C63FF'}}>גלה יעדים</div>
            <div style={{fontSize:'12px',color:'#94A3B8'}}>המלצות טיול</div>
          </a>
          <a href="/he/budget" style={{display:'block',background:'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.05))',border:'1px solid rgba(16,185,129,0.2)',borderRadius:'16px',padding:'16px',textAlign:'center',textDecoration:'none',color:'inherit'}}>
            <div style={{fontSize:'24px',marginBottom:'8px'}}>💰</div>
            <div style={{fontSize:'14px',fontWeight:600,color:'#10B981'}}>נהל תקציב</div>
            <div style={{fontSize:'12px',color:'#94A3B8'}}>עקוב אחר הוצאות</div>
          </a>
        </div>
      </section>

      {/* Upcoming Events */}
      <section style={{padding:'0 16px 24px'}}>
        <div style={{background:'#1A1A2E',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'20px',padding:'16px'}}>
          <h3 style={{fontSize:'18px',fontWeight:600,margin:'0 0 12px 0',display:'flex',alignItems:'center',gap:'8px'}}>
            <span>📅</span> האירועים הקרובים
          </h3>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'32px 0',textAlign:'center'}}>
            <div style={{fontSize:'48px',marginBottom:'12px',opacity:0.5}}>🗓️</div>
            <p style={{color:'#94A3B8',fontSize:'14px',margin:'0 0 4px 0'}}>אין אירועים קרובים</p>
            <p style={{color:'rgba(148,163,184,0.6)',fontSize:'12px',margin:'0 0 16px 0'}}>התחילו לתכנן את הטיול הבא!</p>
            <a href="/he/bookings" style={{display:'inline-block',padding:'8px 16px',background:'rgba(108,99,255,0.1)',color:'#6C63FF',fontSize:'14px',borderRadius:'8px',textDecoration:'none'}}>
              הוסף פעילות ראשונה
            </a>
          </div>
        </div>
      </section>

      {/* Family Tip */}
      <section style={{padding:'0 16px 80px'}}>
        <div style={{background:'linear-gradient(135deg, rgba(255,107,107,0.1), rgba(108,99,255,0.05))',border:'1px solid rgba(255,107,107,0.1)',borderRadius:'20px',padding:'16px'}}>
          <div style={{display:'flex',alignItems:'flex-start',gap:'12px'}}>
            <div style={{fontSize:'24px'}}>💡</div>
            <div>
              <div style={{fontSize:'14px',fontWeight:600,color:'#FF6B6B',margin:'0 0 4px 0'}}>טיפ לטיול</div>
              <p style={{fontSize:'12px',color:'#94A3B8',lineHeight:1.6,margin:0}}>
                תכננו את היום הראשון כך שיכלול פעילות קלה להתרגל לאקלים והשעה המקומית.
                הקפידו על שתייה מרובה ומנוחה מספקת.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
