'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { api } from '@/lib/api';

const API_URL = 'https://tripfamily-api.onrender.com';

const STATUS_OPTIONS = [
  { value: 'planning', label: 'תכנון', color: '#6C63FF', icon: '📋' },
  { value: 'live', label: 'פעיל', color: '#10B981', icon: '🟢' },
  { value: 'completed', label: 'הושלם', color: '#F59E0B', icon: '✅' },
] as const;

interface Trip {
  id: string;
  name: string;
  destinations?: string[];
  startDate?: string;
  endDate?: string;
  status?: string;
  coverImage?: string;
  members?: any[];
  users?: any[];
  memberCount?: number;
}

export default function TripsPage() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const locale = pathname.split('/')[1] || 'he';

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'status'>('date');

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
        if (res.ok) {
          const data = await res.json();
          const family = data?.data?.family;
          if (family) {
            setTrips([{
              ...family,
              memberCount: family.users?.length || family.members?.length || 0,
            }]);
            setLoading(false);
            return;
          }
        }
        // Fallback: empty
        setTrips([]);
      } catch (err: any) {
        setError(err.message || 'שגיאה בטעינת הטיולים');
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, [session]);

  // Filter + sort
  const filteredTrips = useMemo(() => {
    let result = [...trips];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.name.toLowerCase().includes(q) ||
        (t.destinations || []).some(d => d.toLowerCase().includes(q))
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter(t => t.status === statusFilter);
    }
    result.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name, 'he');
      if (sortBy === 'status') return (a.status || '').localeCompare(b.status || '');
      return new Date(b.startDate || 0).getTime() - new Date(a.startDate || 0).getTime();
    });
    return result;
  }, [trips, searchQuery, statusFilter, sortBy]);

  const getStatusInfo = (statusValue: string) => {
    return STATUS_OPTIONS.find(s => s.value === statusValue) || STATUS_OPTIONS[0];
  };

  if (status === 'loading') return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0F0F23',color:'#94A3B8',fontFamily:'Inter,system-ui,sans-serif'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:'48px',marginBottom:'16px',animation:'pulse 1.5s ease-in-out infinite'}}>✈️</div>
        <p>טוען טיולים...</p>
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

        {/* Search & Filter Bar */}
        {!loading && trips.length > 0 && (
          <div style={{marginBottom:'20px'}}>
            {/* Search Input */}
            <div style={{position:'relative',marginBottom:'12px'}}>
              <span style={{position:'absolute',top:'50%',right:'14px',transform:'translateY(-50%)',fontSize:'16px',pointerEvents:'none'}}>🔍</span>
              <input
                type="text"
                placeholder="חפש טיול לפי שם או יעד..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width:'100%',padding:'12px 40px 12px 16px',background:'#1A1A2E',
                  border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',
                  color:'#E8E8F0',fontSize:'14px',fontFamily:'inherit',
                  outline:'none',boxSizing:'border-box',
                }}
              />
            </div>

            {/* Status Filter Chips */}
            <div style={{display:'flex',gap:'8px',marginBottom:'12px',overflowX:'auto',paddingBottom:'4px'}}>
              <button
                onClick={() => setStatusFilter('all')}
                style={{
                  padding:'6px 14px',borderRadius:'20px',border:'1px solid',
                  borderColor: statusFilter === 'all' ? '#6C63FF' : 'rgba(255,255,255,0.08)',
                  background: statusFilter === 'all' ? 'rgba(108,99,255,0.15)' : 'transparent',
                  color: statusFilter === 'all' ? '#6C63FF' : '#94A3B8',
                  fontSize:'13px',fontWeight:500,cursor:'pointer',whiteSpace:'nowrap',
                  transition:'all 0.2s',
                }}
              >
                הכל ({trips.length})
              </button>
              {STATUS_OPTIONS.map(opt => {
                const count = trips.filter(t => t.status === opt.value).length;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setStatusFilter(opt.value)}
                    style={{
                      padding:'6px 14px',borderRadius:'20px',border:'1px solid',
                      borderColor: statusFilter === opt.value ? opt.color : 'rgba(255,255,255,0.08)',
                      background: statusFilter === opt.value ? `${opt.color}15` : 'transparent',
                      color: statusFilter === opt.value ? opt.color : '#94A3B8',
                      fontSize:'13px',fontWeight:500,cursor:'pointer',whiteSpace:'nowrap',
                      transition:'all 0.2s',
                    }}
                  >
                    {opt.icon} {opt.label} ({count})
                  </button>
                );
              })}
            </div>

            {/* Sort Dropdown */}
            <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
              <span style={{fontSize:'12px',color:'#94A3B8'}}>מיין לפי:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                style={{
                  padding:'6px 12px',background:'#1A1A2E',
                  border:'1px solid rgba(255,255,255,0.08)',borderRadius:'8px',
                  color:'#94A3B8',fontSize:'13px',fontFamily:'inherit',cursor:'pointer',
                }}
              >
                <option value="date">תאריך</option>
                <option value="name">שם</option>
                <option value="status">סטטוס</option>
              </select>
            </div>
          </div>
        )}

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
        ) : filteredTrips.length === 0 ? trips.length === 0 ? (
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
          /* No search results */
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'40px 24px',textAlign:'center'}}>
            <div style={{fontSize:'48px',marginBottom:'16px'}}>🔍</div>
            <p style={{color:'#94A3B8',fontSize:'15px'}}>לא נמצאו טיולים התואמים את החיפוש</p>
            <button
              onClick={() => {setSearchQuery(''); setStatusFilter('all');}}
              style={{marginTop:'12px',padding:'8px 20px',background:'rgba(108,99,255,0.12)',color:'#6C63FF',border:'1px solid rgba(108,99,255,0.25)',borderRadius:'10px',fontSize:'14px',fontWeight:600,cursor:'pointer'}}
            >
              נקה סינון
            </button>
          </div>
        ) : (
          /* Trip Cards */
          <>
            <h2 style={{fontSize:'18px',fontWeight:600,margin:'0 0 12px 0'}}>🗓️ הטיולים שלי ({filteredTrips.length})</h2>
            {filteredTrips.map((trip) => {
              const sInfo = getStatusInfo(trip.status || 'planning');
              return (
                <div
                  key={trip.id}
                  onClick={() => router.push(`/${locale}/trips/${trip.id}`)}
                  style={{background:'#1A1A2E',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'18px',padding:'20px',marginBottom:'16px',cursor:'pointer',transition:'all 0.2s',position:'relative',overflow:'hidden'}}
                >
                  {/* Cover Image */}
                  {trip.coverImage && (
                    <div style={{position:'absolute',top:0,left:0,right:0,height:'80px',background:`linear-gradient(180deg, transparent, #1A1A2E), url(${trip.coverImage}) center/cover`,opacity:0.6}} />
                  )}

                  {/* Accent bar */}
                  <div style={{position:'absolute',top:0,right:0,width:'4px',height:'100%',background:`linear-gradient(180deg, ${sInfo.color}, #10B981)`}} />

                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'12px',position:'relative'}}>
                    <div style={{flex:1}}>
                      <h3 style={{fontSize:'18px',fontWeight:700,color:'#E8E8F0',margin:'0 0 4px 0'}}>{trip.name}</h3>
                      <div style={{display:'flex',alignItems:'center',gap:'8px',flexWrap:'wrap'}}>
                        <div style={{display:'flex',alignItems:'center',gap:'6px',color:'#94A3B8',fontSize:'13px'}}>
                          <span>👥</span>
                          <span>{trip.memberCount || trip.users?.length || 0} חברים</span>
                        </div>
                        {/* Status Badge */}
                        <span style={{
                          display:'inline-flex',alignItems:'center',gap:'4px',
                          background:`${sInfo.color}18`,color:sInfo.color,
                          padding:'3px 10px',borderRadius:'12px',
                          fontSize:'12px',fontWeight:600,border:`1px solid ${sInfo.color}30`,
                        }}>
                          {sInfo.icon} {sInfo.label}
                        </span>
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
                      {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
                    </span>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </main>
    </div>
  );
}
