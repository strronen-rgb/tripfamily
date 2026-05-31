'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';

const API_URL = 'https://tripfamily-api.onrender.com';

interface Trip {
  id: string | number;
  name: string;
  destinations?: string[];
  start_date?: string;
  end_date?: string;
  members?: any[];
  memberCount?: number;
  family_members?: any[];
}

export default function TripsPage() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const locale = pathname.split('/')[1] || 'he';

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session && typeof window !== 'undefined') {
      window.location.href = `/${locale}/auth`;
    }
  }, [session, status, locale]);

  useEffect(() => {
    if (!session) return;
    const fetchTrips = async () => {
      try {
        const res = await fetch(`${API_URL}/api/families/my`, {
          headers: {
            'Authorization': `Bearer ${(session as any)?.accessToken || ''}`,
            'Content-Type': 'application/json',
          },
        });
        if (!res.ok) throw new Error('שגיאה בטעינת טיולים');
        const data = await res.json();
        // API may return a single family or an array
        const tripArray: Trip[] = Array.isArray(data) ? data : [data];
        setTrips(tripArray.map((t: any) => ({
          ...t,
          memberCount: t.members?.length || t.family_members?.length || 0,
        })));
      } catch (err: any) {
        setError(err.message || 'שגיאה בטעינת הטיולים');
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, [session]);

  if (status === 'loading') return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0F0F23',color:'#94A3B8',fontFamily:'Inter,system-ui,sans-serif'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:'48px',marginBottom:'16px'}}>✈️</div>
        <p>טוען...</p>
      </div>
    </div>
  );

  if (!session) return null;

  const formatDate = (d?: string) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString('he-IL', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return d; }
  };

  return (
    <div style={{minHeight:'100vh',background:'#0F0F23',color:'#E8E8F0',fontFamily:'Inter,system-ui,sans-serif',direction:'rtl'}}>
      {/* Header */}
      <header style={{position:'sticky',top:0,zIndex:40,background:'rgba(26,26,46,0.9)',backdropFilter:'blur(16px)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'12px 16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <h1 style={{fontSize:'20px',fontWeight:700,color:'#6C63FF',margin:0}}>✈️ TripFamily</h1>
        <span style={{fontSize:'14px',color:'#94A3B8'}}>הטיולים שלי</span>
      </header>

      <main style={{padding:'16px',paddingBottom:'100px'}}>
        {/* Action Buttons */}
        <div style={{display:'flex',gap:'12px',marginBottom:'20px'}}>
          <button
            onClick={() => router.push(`/${locale}/trips/new`)}
            style={{flex:1,padding:'14px 20px',background:'#6C63FF',color:'#fff',border:'none',borderRadius:'14px',fontSize:'15px',fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',transition:'all 0.2s'}}
          >
            <span style={{fontSize:'18px'}}>➕</span>
            צור טיול חדש
          </button>
          <button
            onClick={() => {
              const code = prompt('הכניסו קוד הזמנה לטיול:');
              if (code) alert(`מחפש טיול עם קוד: ${code}`);
            }}
            style={{flex:1,padding:'14px 20px',background:'rgba(108,99,255,0.12)',color:'#6C63FF',border:'1px solid rgba(108,99,255,0.25)',borderRadius:'14px',fontSize:'15px',fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}
          >
            <span style={{fontSize:'18px'}}>🔗</span>
            הצטרף לטיול
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'12px',padding:'14px 16px',marginBottom:'16px',color:'#EF4444',fontSize:'14px',textAlign:'center'}}>
            ⚠️ {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'60px 0',color:'#94A3B8'}}>
            <div style={{fontSize:'40px',marginBottom:'12px',animation:'pulse 1.5s ease-in-out infinite'}}>🗺️</div>
            <p style={{margin:0,fontSize:'14px'}}>טוען טיולים...</p>
          </div>
        ) : trips.length === 0 ? (
          /* Empty State */
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'60px 24px',textAlign:'center'}}>
            <div style={{fontSize:'72px',marginBottom:'20px',opacity:0.6}}>🗺️</div>
            <h2 style={{fontSize:'22px',fontWeight:700,color:'#E8E8F0',margin:'0 0 12px 0'}}>אין טיולים עדיין</h2>
            <p style={{color:'#94A3B8',fontSize:'15px',margin:'0 0 28px 0',maxWidth:'320px',lineHeight:1.6}}>
              צרו את הטיול הראשון שלכם או הצטרפו לטיול קיים עם קוד הזמנה
            </p>
            <button
              onClick={() => router.push(`/${locale}/trips/new`)}
              style={{padding:'14px 32px',background:'#6C63FF',color:'#fff',border:'none',borderRadius:'14px',fontSize:'16px',fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:'8px'}}
            >
              <span style={{fontSize:'18px'}}>✈️</span>
              התחילו לתכנן טיול
            </button>
          </div>
        ) : (
          /* Trip Cards */
          <>
            <h2 style={{fontSize:'18px',fontWeight:600,margin:'0 0 12px 0'}}>🗓️ הטיולים שלי ({trips.length})</h2>
            {trips.map((trip) => (
              <div
                key={trip.id}
                onClick={() => router.push(`/${locale}/trips/${trip.id}`)}
                style={{background:'#1A1A2E',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'18px',padding:'20px',marginBottom:'16px',cursor:'pointer',transition:'all 0.2s',position:'relative',overflow:'hidden'}}
              >
                {/* Accent bar */}
                <div style={{position:'absolute',top:0,right:0,width:'4px',height:'100%',background:'linear-gradient(180deg, #6C63FF, #10B981)'}} />

                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'12px'}}>
                  <div style={{flex:1}}>
                    <h3 style={{fontSize:'18px',fontWeight:700,color:'#E8E8F0',margin:'0 0 4px 0'}}>{trip.name}</h3>
                    <div style={{display:'flex',alignItems:'center',gap:'6px',color:'#94A3B8',fontSize:'13px'}}>
                      <span>👥</span>
                      <span>{trip.memberCount} חברים</span>
                    </div>
                  </div>
                  <span style={{fontSize:'22px'}}>✈️</span>
                </div>

                {/* Destinations */}
                {trip.destinations && trip.destinations.length > 0 && (
                  <div style={{display:'flex',flexWrap:'wrap',gap:'8px',marginBottom:'12px'}}>
                    {trip.destinations.map((dest: string, i: number) => (
                      <span key={i} style={{background:'rgba(108,99,255,0.12)',color:'#6C63FF',padding:'4px 12px',borderRadius:'20px',fontSize:'12px',fontWeight:500}}>
                        {dest}
                      </span>
                    ))}
                  </div>
                )}

                {/* Dates */}
                <div style={{display:'flex',alignItems:'center',gap:'8px',background:'rgba(255,255,255,0.04)',borderRadius:'10px',padding:'10px 14px'}}>
                  <span style={{fontSize:'16px'}}>📅</span>
                  <span style={{fontSize:'13px',color:'#94A3B8'}}>
                    {formatDate(trip.start_date)} — {formatDate(trip.end_date)}
                  </span>
                </div>
              </div>
            ))}
          </>
        )}
      </main>
    </div>
  );
}
