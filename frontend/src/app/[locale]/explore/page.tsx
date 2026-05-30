'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';

type Filter = 'all' | 'thailand' | 'japan' | 'korea';

interface Suggestion {
  id: string;
  title: string;
  country: string;
  desc: string;
  image: string;
  category: string;
}

const suggestions: Suggestion[] = [
  { id:'1', title:'בנגקוק', country:'thailand', desc:'עיר הבירה התוססת של תאילנד', image:'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=400', category:'attractions' },
  { id:'2', title:'קוסו גארדן', country:'thailand', desc:'גן לאומי עם יערות דקלים מרהיבים', image:'https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?w=400', category:'attractions' },
  { id:'3', title:'טוקיו', country:'japan', desc:'מטרופולין ענק עם מסורת וטכנולוגיה', image:'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400', category:'attractions' },
  { id:'4', title:'אוסקה', country:'japan', desc:'עיר הבירה הקוליארית של יפן', image:'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=400', category:'food' },
  { id:'5', title:'סיאול', country:'korea', desc:'עיר דינמית עם היסטוריה עשירה', image:'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=400', category:'culture' },
  { id:'6', title:'פוסן', country:'korea', desc:'עים חופית עם נופים מרהיבים', image:'https://images.unsplash.com/photo-1601621915196-528e9be19090?w=400', category:'attractions' },
];

const filters: { key: Filter; label: string; icon: string }[] = [
  { key:'all', label:'הכל', icon:'🌍' },
  { key:'thailand', label:'תאילנד', icon:'🇹🇭' },
  { key:'japan', label:'יפן', icon:'🇯🇵' },
  { key:'korea', label:'קוריאה', icon:'🇰🇷' },
];

export default function ExplorePage() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'he';
  const [activeFilter, setActiveFilter] = useState<Filter>('all');

  const filtered = activeFilter === 'all' ? suggestions : suggestions.filter(s => s.country === activeFilter);
  const currentPath = pathname.replace(`/${locale}`, '') || '/';

  return (
    <div style={{minHeight:'100vh',background:'#0F0F23',color:'#E8E8F0',fontFamily:'Inter,system-ui,sans-serif',direction:'rtl'}}>
      {/* Header */}
      <header style={{position:'sticky',top:0,zIndex:40,background:'rgba(26,26,46,0.9)',backdropFilter:'blur(16px)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'12px 16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <h1 style={{fontSize:'20px',fontWeight:700,color:'#6C63FF',margin:0}}>✈️ TripFamily</h1>
        <span style={{fontSize:'12px',color:'#94A3B8'}}>גלה יעדים</span>
      </header>

      <main style={{padding:'16px',paddingBottom:'80px'}}>
        {/* Hero */}
        <div style={{background:'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(255,107,107,0.1))',borderRadius:'20px',padding:'24px',marginBottom:'24px',textAlign:'center'}}>
          <h2 style={{fontSize:'24px',fontWeight:700,margin:'0 0 8px 0'}}>🌏 גלה יעדים חדשים</h2>
          <p style={{fontSize:'14px',color:'#94A3B8',margin:0}}>גלו מקומות חדשים לטיול המשפחתי הבא</p>
        </div>

        {/* Filters */}
        <div style={{display:'flex',gap:'8px',marginBottom:'24px',overflowX:'auto'}}>
          {filters.map(f => (
            <button key={f.key} onClick={() => setActiveFilter(f.key)} style={{
              padding:'8px 16px', borderRadius:'20px', border:'1px solid',
              borderColor: activeFilter === f.key ? '#6C63FF' : 'rgba(255,255,255,0.08)',
              background: activeFilter === f.key ? 'rgba(108,99,255,0.2)' : 'rgba(26,26,46,0.8)',
              color: activeFilter === f.key ? '#6C63FF' : '#94A3B8',
              fontSize:'14px', fontWeight:500, cursor:'pointer', whiteSpace:'nowrap'
            }}>
              {f.icon} {f.label}
            </button>
          ))}
        </div>

        {/* Suggestions Grid */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'12px'}}>
          {filtered.map(item => (
            <a key={item.id} href={`/${locale}/explore/${item.id}`} style={{display:'block',textDecoration:'none',color:'inherit'}}>
              <div style={{background:'#1A1A2E',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'16px',overflow:'hidden',transition:'transform 0.2s'}}>
                <div style={{width:'100%',height:'120px',background:'#252540',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'48px'}}>
                  {item.country === 'thailand' ? '🇹🇭' : item.country === 'japan' ? '🇯🇵' : '🇰🇷'}
                </div>
                <div style={{padding:'12px'}}>
                  <h3 style={{fontSize:'14px',fontWeight:600,margin:'0 0 4px 0'}}>{item.title}</h3>
                  <p style={{fontSize:'12px',color:'#94A3B8',margin:0}}>{item.desc}</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}
