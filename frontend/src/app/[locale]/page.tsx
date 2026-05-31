'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

const API_URL = 'https://tripfamily-api.onrender.com';

interface TripSummary {
  id: string | number;
  name: string;
  destinations?: string[];
  start_date?: string;
  end_date?: string;
  flights?: any[];
  hotels?: any[];
  attractions?: any[];
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'he';

  const [trips, setTrips] = useState<TripSummary[]>([]);
  const [stats, setStats] = useState({ flights: 0, hotels: 0, attractions: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) return;

    const fetchData = async () => {
      try {
        const token = (session as any)?.accessToken || '';
        const res = await fetch(`${API_URL}/api/families/my`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (res.status === 401 && typeof window !== 'undefined') {
          window.location.href = `/${locale}/auth`;
          return;
        }
        if (!res.ok) throw new Error('שגיאה בטעינת נתונים');
        const json = await res.json();
        const raw = (json && typeof json === 'object' && 'data' in json) ? json.data : json;
        const tripArray: TripSummary[] = Array.isArray(raw) ? raw : raw ? [raw] : [];
        setTrips(tripArray);

        let flights = 0, hotels = 0, attractions = 0;
        tripArray.forEach((t: any) => {
          flights += t.flights?.length || 0;
          hotels += t.hotels?.length || 0;
          attractions += t.attractions?.length || 0;
        });
        setStats({ flights, hotels, attractions });
      } catch (err: any) {
        setError(err.message || 'שגיאה בטעינת הנתונים');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [session, status, locale]);

  if (status === 'loading' || (loading && session)) {
    return (
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0F0F23',color:'#94A3B8',fontFamily:'Inter,system-ui,sans-serif'}}>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:'48px',marginBottom:'16px'}}>✈️</div>
          <p>טוען...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const formatDate = (d?: string) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('he-IL', { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return d; }
  };

  return (
    <div style={{minHeight:'100vh',background:'#0F0F23',color:'#E8E8F0',fontFamily:'Inter,system-ui,sans-serif',direction:'rtl'}}>
      <header style={{position:'sticky',top:0,zIndex:40,background:'rgba(26,26,46,0.9)',backdropFilter:'blur(16px)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'12px 16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <h1 style={{fontSize:'20px',fontWeight:700,color:'#6C63FF',margin:0}}>✈️ TripFamily</h1>
        <span style={{fontSize:'12px',color:'#94A3B8'}}>{(session.user as any)?.name || session.user?.name || 'משתמש'}</span>
      </header>

      <section style={{padding:'32px 16px',textAlign:'center',background:'linear-gradient(135deg, rgba(108,99,255,0.15) 0%, rgba(255,107,107,0.1) 100%)'}}>
        <h2 style={{fontSize:'32px',fontWeight:700,margin:'0 0 8px 0',background:'linear-gradient(to left, #6C63FF, #FF6B6B)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
          ברוכים הבאים לטיול הבא שלכם! 🌏
        </h2>
        <p style={{color:'#94A3B8',fontSize:'14px',margin:0}}>Plan your perfect family trip</p>
      </section>

      {error && (
        <div style={{margin:'16px',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'12px',padding:'14px 16px',color:'#EF4444',fontSize:'14px',textAlign:'center'}}>
          ⚠️ {error}
        </div>
      )}

      <section style={{padding:'0 16px 24px'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px'}}>
          <div style={{background:'linear-gradient(135deg, #1A1A2E, #252540)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'16px',padding:'16px',textAlign:'center'}}>
            <div style={{fontSize:'24px',marginBottom:'4px'}}>✈️</div>
            <div style={{fontSize:'24px',fontWeight:700,color:'#6C63FF',fontFamily:'JetBrains Mono,monospace'}}>{stats.flights}</div>
            <div style={{fontSize:'12px',color:'#94A3B8'}}>טיסות</div>
          </div>
          <div style={{background:'linear-gradient(135deg, #1A1A2E, #252540)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'16px',padding:'16px',textAlign:'center'}}>
            <div style={{fontSize:'24px',marginBottom:'4px'}}>🏨</div>
            <div style={{fontSize:'24px',fontWeight:700,color:'#10B981',fontFamily:'JetBrains Mono,monospace'}}>{stats.hotels}</div>
            <div style={{fontSize:'12px',color:'#94A3B8'}}>מלונות</div>
          </div>
          <div style={{background:'linear-gradient(135deg, #1A1A2E, #252540)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'16px',padding:'16px',textAlign:'center'}}>
            <div style={{fontSize:'24px',marginBottom:'4px'}}>🎯</div>
            <div style={{fontSize:'24px',fontWeight:700,color:'#FF6B6B',fontFamily:'JetBrains Mono,monospace'}}>{stats.attractions}</div>
            <div style={{fontSize:'12px',color:'#94A3B8'}}>אטרקציות</div>
          </div>
        </div>
      </section>

      <section style={{padding:'0 16px 24px'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'12px'}}>
          <a href={`/${locale}/trips`} style={{display:'block',background:'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(108,99,255,0.05))',border:'1px solid rgba(108,99,255,0.2)',borderRadius:'16px',padding:'16px',textAlign:'center',textDecoration:'none',color:'inherit'}}>
            <div style={{fontSize:'24px',marginBottom:'8px'}}>🗺️</div>
            <div style={{fontSize:'14px',fontWeight:600,color:'#6C63FF'}}>הטיולים שלי</div>
            <div style={{fontSize:'12px',color:'#94A3B8'}}>{trips.length} טיולים פעילים</div>
          </a>
          <a href={`/${locale}/budget`} style={{display:'block',background:'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.05))',border:'1px solid rgba(16,185,129,0.2)',borderRadius:'16px',padding:'16px',textAlign:'center',textDecoration:'none',color:'inherit'}}>
            <div style={{fontSize:'24px',marginBottom:'8px'}}>💰</div>
            <div style={{fontSize:'14px',fontWeight:600,color:'#10B981'}}>נהל תקציב</div>
            <div style={{fontSize:'12px',color:'#94A3B8'}}>עקוב אחר הוצאות</div>
          </a>
        </div>
      </section>

      <section style={{padding:'0 16px 24px'}}>
        <div style={{background:'#1A1A2E',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'20px',padding:'16px'}}>
          <h3 style={{fontSize:'18px',fontWeight:600,margin:'0 0 12px 0',display:'flex',alignItems:'center',gap:'8px'}}>
            <span>📅</span> הטיולים האחרונים
          </h3>
          {trips.length === 0 ? (
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'32px 0',textAlign:'center'}}>
              <div style={{fontSize:'48px',marginBottom:'12px',opacity:0.5}}>🗓️</div>
              <p style={{color:'#94A3B8',fontSize:'14px',margin:'0 0 4px 0'}}>אין טיולים עדיין</p>
              <p style={{color:'rgba(148,163,184,0.6)',fontSize:'12px',margin:'0 0 16px 0'}}>התחילו לתכנן את הטיול הבא!</p>
              <a href={`/${locale}/trips/new`} style={{display:'inline-block',padding:'8px 16px',background:'rgba(108,99,255,0.1)',color:'#6C63FF',fontSize:'14px',borderRadius:'8px',textDecoration:'none'}}>
                צור טיול חדש
              </a>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
              {trips.slice(0, 3).map((trip) => (
                <a
                  key={trip.id}
                  href={`/${locale}/trips/${trip.id}`}
                  style={{display:'block',background:'rgba(255,255,255,0.04)',borderRadius:'12px',padding:'14px 16px',textDecoration:'none',color:'inherit'}}
                >
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div>
                      <p style={{fontSize:'15px',fontWeight:600,color:'#E8E8F0',margin:'0 0 4px 0'}}>{trip.name}</p>
                      <p style={{fontSize:'12px',color:'#94A3B8',margin:0}}>
                        {trip.destinations && trip.destinations.length > 0
                          ? trip.destinations.join(', ')
                          : `${formatDate(trip.start_date)} — ${formatDate(trip.end_date)}`}
                      </p>
                    </div>
                    <span style={{color:'#94A3B8',fontSize:'14px'}}>‹</span>
                  </div>
                </a>
              ))}
              {trips.length > 3 && (
                <a href={`/${locale}/trips`} style={{display:'block',textAlign:'center',padding:'8px',color:'#6C63FF',fontSize:'13px',textDecoration:'none',fontWeight:500}}>
                  צפה בכל הטיולים →
                </a>
              )}
            </div>
          )}
        </div>
      </section>

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
