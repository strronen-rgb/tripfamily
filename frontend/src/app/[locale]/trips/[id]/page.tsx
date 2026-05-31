'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';

const API_URL = 'https://tripfamily-api.onrender.com';

interface TripDetail {
  id: string | number;
  name: string;
  destinations?: string[];
  startDate?: string;
  endDate?: string;
  start_date?: string;
  end_date?: string;
  members?: any[];
  family_members?: any[];
  flights?: any[];
  hotels?: any[];
  attractions?: any[];
  status?: string;
  coverImage?: string;
}

function SectionCard({ title, icon, items, onAdd, locale, tripId }: {
  title: string;
  icon: string;
  items: any[];
  onAdd: () => void;
  locale: string;
  tripId: string;
}) {
  return (
    <div style={{background:'#1A1A2E',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'16px',padding:'20px',marginBottom:'16px'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'16px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
          <span style={{fontSize:'20px'}}>{icon}</span>
          <h3 style={{fontSize:'16px',fontWeight:600,color:'#E8E8F0',margin:0}}>{title}</h3>
          <span style={{background:'rgba(108,99,255,0.12)',color:'#6C63FF',padding:'2px 10px',borderRadius:'12px',fontSize:'12px',fontWeight:500,fontFamily:'JetBrains Mono,monospace'}}>
            {items?.length || 0}
          </span>
        </div>
        <button
          onClick={onAdd}
          style={{background:'rgba(108,99,255,0.12)',color:'#6C63FF',border:'none',borderRadius:'10px',padding:'8px 14px',fontSize:'13px',fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:'4px',fontFamily:'inherit'}}
        >
          <span>➕</span> הוסף
        </button>
      </div>

      {!items || items.length === 0 ? (
        <div style={{textAlign:'center',padding:'24px 0',color:'#94A3B8'}}>
          <div style={{fontSize:'32px',marginBottom:'8px',opacity:0.5}}>{icon}</div>
          <p style={{margin:0,fontSize:'13px'}}>עדיין לא הוספתם {title.toLowerCase()}</p>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
          {items.map((item: any, i: number) => (
            <div key={i} style={{background:'rgba(255,255,255,0.04)',borderRadius:'12px',padding:'14px 16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div>
                <p style={{fontSize:'14px',fontWeight:500,color:'#E8E8F0',margin:'0 0 2px 0'}}>{item.name || item.flight_number || item.title || `פריט ${i + 1}`}</p>
                <p style={{fontSize:'12px',color:'#94A3B8',margin:0}}>{item.details || item.location || item.airline || ''}</p>
              </div>
              {item.price != null && (
                <span style={{color:'#10B981',fontSize:'14px',fontWeight:600,fontFamily:'JetBrains Mono,monospace',flexShrink:0}}>
                  ₪{item.price}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TripDetailPage() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const locale = pathname.split('/')[1] || 'he';
  const segments = pathname.split('/').filter(Boolean);
  const tripId = segments[segments.length - 1];

  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session && typeof window !== 'undefined') {
      window.location.href = `/${locale}/auth`;
    }
  }, [session, status, locale]);

  useEffect(() => {
    if (!session || !tripId) return;
    const fetchTrip = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_URL}/api/families/${tripId}`, {
          headers: {
            'Authorization': `Bearer ${(session as any)?.accessToken || ''}`,
            'Content-Type': 'application/json',
          },
        });
        if (!res.ok) throw new Error('שגיאה בטעינת הטיול');
        const data = await res.json();
        setTrip(data);
      } catch (err: any) {
        setError(err.message || 'שגיאה בטעינת הטיול');
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [session, tripId]);

  const handleDelete = async () => {
    if (!trip) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/api/families/${trip.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${(session as any)?.accessToken || ''}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('שגיאה במחיקת הטיול');
      router.push(`/${locale}/trips`);
    } catch (err: any) {
      setError(err.message || 'שגיאה במחיקת הטיול');
      setShowDeleteConfirm(false);
      setDeleting(false);
    }
  };

  const handleDuplicate = async () => {
    if (!trip) return;
    setDuplicating(true);
    try {
      const res = await fetch(`${API_URL}/api/families/${trip.id}/duplicate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(session as any)?.accessToken || ''}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('שגיאה בשכפול הטיול');
      const data = await res.json();
      const newId = data?.data?.family?.id;
      if (newId) router.push(`/${locale}/trips/${newId}`);
    } catch (err: any) {
      setError(err.message || 'שגיאה בשכפול הטיול');
    } finally {
      setDuplicating(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!trip) return;
    setStatusUpdating(true);
    try {
      const res = await fetch(`${API_URL}/api/families/${trip.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${(session as any)?.accessToken || ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('שגיאה בעדכון סטטוס');
      setTrip(prev => prev ? { ...prev, status: newStatus } : prev);
    } catch (err: any) {
      setError(err.message || 'שגיאה בעדכון סטטוס');
    } finally {
      setStatusUpdating(false);
    }
  };

  if (status === 'loading') return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0F0F23',color:'#94A3B8',fontFamily:'Inter,system-ui,sans-serif'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:'48px',marginBottom:'16px'}}>✈️</div>
        <p>טוען...</p>
      </div>
    </div>
  );

  if (!session) return null;

  const startDate = trip.startDate || trip.start_date;
  const endDate = trip.endDate || trip.end_date;
  const statusColors: Record<string, string> = { planning: '#6C63FF', live: '#10B981', completed: '#F59E0B' };
  const statusLabels: Record<string, string> = { planning: 'תכנון', live: 'פעיל', completed: 'הושלם' };
  const statusIcons: Record<string, string> = { planning: '📋', live: '🟢', completed: '✅' };
  const currentStatus = trip.status || 'planning';

  const formatDate = (d?: string) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('he-IL', { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return d; }
  };

  return (
    <div style={{minHeight:'100vh',background:'#0F0F23',color:'#E8E8F0',fontFamily:'Inter,system-ui,sans-serif',direction:'rtl'}}>
      {/* Header */}
      <header style={{position:'sticky',top:0,zIndex:40,background:'rgba(26,26,46,0.9)',backdropFilter:'blur(16px)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'12px 16px',display:'flex',alignItems:'center',gap:'12px'}}>
        <button
          onClick={() => router.push(`/${locale}/trips`)}
          style={{background:'rgba(255,255,255,0.08)',border:'none',color:'#94A3B8',width:'36px',height:'36px',borderRadius:'10px',fontSize:'18px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}
        >
          →
        </button>
        <div style={{flex:1}}>
          <h1 style={{fontSize:'18px',fontWeight:700,color:'#6C63FF',margin:0}}>{trip?.name || 'טיול'}</h1>
          {trip && (
            <p style={{fontSize:'12px',color:'#94A3B8',margin:'2px 0 0 0'}}>
              {formatDate(trip.start_date)} — {formatDate(trip.end_date)}
            </p>
          )}
        </div>
        <button
          onClick={() => router.push(`/${locale}/trips/${tripId}/edit`)}
          style={{background:'rgba(108,99,255,0.12)',color:'#6C63FF',border:'none',borderRadius:'10px',padding:'8px 14px',fontSize:'13px',fontWeight:600,cursor:'pointer'}}
        >
          ✏️ ערוך
        </button>
      </header>

      <main style={{padding:'16px',paddingBottom:'100px'}}>
        {loading ? (
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'60px 0',color:'#94A3B8'}}>
            <div style={{fontSize:'40px',marginBottom:'12px'}}>✈️</div>
            <p style={{margin:0,fontSize:'14px'}}>טוען פרטי טיול...</p>
          </div>
        ) : error ? (
          <div style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'12px',padding:'14px 16px',color:'#EF4444',fontSize:'14px',textAlign:'center'}}>
            ⚠️ {error}
          </div>
        ) : trip ? (
          <>
            {/* Info Card */}
            <div style={{background:'linear-gradient(135deg, rgba(108,99,255,0.12), rgba(16,185,129,0.08))',border:'1px solid rgba(108,99,255,0.15)',borderRadius:'20px',padding:'20px',marginBottom:'20px'}}>
              {/* Destinations */}
              {trip.destinations && trip.destinations.length > 0 && (
                <div style={{display:'flex',flexWrap:'wrap',gap:'8px',marginBottom:'14px'}}>
                  {trip.destinations.map((dest: string, i: number) => (
                    <span key={i} style={{background:'rgba(108,99,255,0.15)',color:'#6C63FF',padding:'5px 14px',borderRadius:'20px',fontSize:'13px',fontWeight:500}}>
                      📍 {dest}
                    </span>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div style={{display:'flex',gap:'12px'}}>
                <div style={{flex:1,background:'rgba(255,255,255,0.05)',borderRadius:'12px',padding:'12px',textAlign:'center'}}>
                  <p style={{fontSize:'22px',fontWeight:700,color:'#6C63FF',margin:'0 0 4px 0'}}>{trip.members?.length || trip.family_members?.length || 0}</p>
                  <p style={{fontSize:'11px',color:'#94A3B8',margin:0}}>חברים</p>
                </div>
                <div style={{flex:1,background:'rgba(255,255,255,0.05)',borderRadius:'12px',padding:'12px',textAlign:'center'}}>
                  <p style={{fontSize:'22px',fontWeight:700,color:'#10B981',margin:'0 0 4px 0'}}>{trip.destinations?.length || 0}</p>
                  <p style={{fontSize:'11px',color:'#94A3B8',margin:0}}>יעדים</p>
                </div>
                <div style={{flex:1,background:'rgba(255,255,255,0.05)',borderRadius:'12px',padding:'12px',textAlign:'center'}}>
                  <p style={{fontSize:'22px',fontWeight:700,color:'#F59E0B',margin:'0 0 4px 0'}}>{trip.flights?.length || 0}</p>
                  <p style={{fontSize:'11px',color:'#94A3B8',margin:0}}>טיסות</p>
                </div>
              </div>
            </div>

            {/* Status Selector */}
            <div style={{background:'#1A1A2E',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'16px',padding:'16px',marginBottom:'20px'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'12px'}}>
                <h3 style={{fontSize:'15px',fontWeight:600,color:'#E8E8F0',margin:0,display:'flex',alignItems:'center',gap:'6px'}}>
                  🏷️ סטטוס הטיול
                </h3>
                <span style={{
                  display:'inline-flex',alignItems:'center',gap:'4px',
                  background:`${statusColors[currentStatus]}18`,color:statusColors[currentStatus],
                  padding:'3px 10px',borderRadius:'12px',fontSize:'12px',fontWeight:600,
                  border:`1px solid ${statusColors[currentStatus]}30`,
                }}>
                  {statusIcons[currentStatus]} {statusLabels[currentStatus]}
                </span>
              </div>
              <div style={{display:'flex',gap:'8px'}}>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => handleStatusChange(value)}
                    disabled={statusUpdating || currentStatus === value}
                    style={{
                      flex:1,padding:'10px',borderRadius:'12px',border:'2px solid',
                      borderColor: currentStatus === value ? statusColors[value] : 'rgba(255,255,255,0.06)',
                      background: currentStatus === value ? `${statusColors[value]}15` : 'transparent',
                      color: currentStatus === value ? statusColors[value] : '#94A3B8',
                      fontSize:'14px',fontWeight:600,cursor: (statusUpdating || currentStatus === value) ? 'not-allowed' : 'pointer',
                      transition:'all 0.2s',textAlign:'center',
                    }}
                  >
                    {statusIcons[value]} {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Duplicate Button */}
            <button
              onClick={handleDuplicate}
              disabled={duplicating}
              style={{
                width:'100%',padding:'14px',marginBottom:'20px',
                background:'rgba(16,185,129,0.1)',color:'#10B981',
                border:'1px solid rgba(16,185,129,0.25)',borderRadius:'14px',
                fontSize:'14px',fontWeight:600,cursor: duplicating ? 'not-allowed' : 'pointer',
                fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',
                opacity: duplicating ? 0.6 : 1,
              }}
            >
              📋 {duplicating ? 'משכפל...' : 'שכפל טיול'}
            </button>

            {/* Members */}
            {(trip.members && trip.members.length > 0) || (trip.family_members && trip.family_members.length > 0) && (
              <div style={{marginBottom:'20px'}}>
                <h3 style={{fontSize:'16px',fontWeight:600,margin:'0 0 10px 0'}}>👥 חברים בטיול</h3>
                <div style={{display:'flex',flexWrap:'wrap',gap:'8px'}}>
                  {(trip.members || trip.family_members || []).map((m: any, i: number) => (
                    <div key={i} style={{background:'#1A1A2E',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'8px 14px',display:'flex',alignItems:'center',gap:'8px'}}>
                      <div style={{width:'32px',height:'32px',borderRadius:'50%',background:'linear-gradient(135deg, #6C63FF, #10B981)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px',fontWeight:700,color:'#fff',flexShrink:0}}>
                        {(m.name || m.email || '?')[0].toUpperCase()}
                      </div>
                      <span style={{fontSize:'13px',color:'#E8E8F0'}}>{m.name || m.email || `חבר ${i + 1}`}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sections */}
            <SectionCard
              title="טיסות"
              icon="✈️"
              items={trip.flights || []}
              onAdd={() => alert('הוספת טיסה - בקרוב')}
              locale={locale}
              tripId={tripId}
            />
            <SectionCard
              title="מלונות"
              icon="🏨"
              items={trip.hotels || []}
              onAdd={() => alert('הוספת מלון - בקרוב')}
              locale={locale}
              tripId={tripId}
            />
            <SectionCard
              title="אטרקציות"
              icon="🎢"
              items={trip.attractions || []}
              onAdd={() => alert('הוספת אטרקציה - בקרוב')}
              locale={locale}
              tripId={tripId}
            />

            {/* Delete */}
            <div style={{marginTop:'32px'}}>
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  style={{width:'100%',padding:'14px',background:'transparent',color:'#EF4444',border:'1px solid rgba(239,68,68,0.25)',borderRadius:'14px',fontSize:'14px',fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}
                >
                  🗑️ מחק טיול
                </button>
              ) : (
                <div style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'14px',padding:'16px',textAlign:'center'}}>
                  <p style={{color:'#EF4444',fontSize:'14px',fontWeight:600,margin:'0 0 12px 0'}}>⚠️ האם אתם בטוחים? פעולה זו תמחק את הטיול לצמיתות.</p>
                  <div style={{display:'flex',gap:'10px'}}>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      style={{flex:1,padding:'12px',background:'rgba(255,255,255,0.06)',color:'#94A3B8',border:'none',borderRadius:'10px',fontSize:'14px',fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}
                    >
                      ביטול
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      style={{flex:1,padding:'12px',background:'#EF4444',color:'#fff',border:'none',borderRadius:'10px',fontSize:'14px',fontWeight:600,cursor: deleting ? 'not-allowed' : 'pointer',opacity: deleting ? 0.6 : 1,fontFamily:'inherit'}}
                    >
                      {deleting ? 'מוחק...' : 'כן, מחק הכל'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
