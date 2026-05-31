'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';

const API_URL = 'https://tripfamily-api.onrender.com';

const DESTINATION_OPTIONS = ['תאילנד', 'יפן', 'קוריאה', 'אחר'];

export default function EditTripPage() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const locale = pathname.split('/')[1] || 'he';
  const segments = pathname.split('/').filter(Boolean);
  const tripId = segments[segments.length - 2]; // /locale/trips/:id/edit → segments[-2] is id

  const [name, setName] = useState('');
  const [destinations, setDestinations] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [tripStatus, setTripStatus] = useState('planning');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session && typeof window !== 'undefined') {
      window.location.href = `/${locale}/auth`;
    }
  }, [session, status, locale]);

  // Fetch existing trip data
  useEffect(() => {
    if (!session || !tripId) return;
    const fetchTrip = async () => {
      try {
        const res = await fetch(`${API_URL}/api/families/${tripId}`, {
          headers: {
            'Authorization': `Bearer ${(session as any)?.accessToken || ''}`,
            'Content-Type': 'application/json',
          },
        });
        if (!res.ok) throw new Error('שגיאה בטעינת הטיול');
        const data = await res.json();
        const family = data?.data?.family || data;
        setName(family.name || '');
        setDestinations(family.destinations || []);
        setStartDate(family.startDate ? String(family.startDate).split('T')[0] : family.start_date ? String(family.start_date).split('T')[0] : '');
        setEndDate(family.endDate ? String(family.endDate).split('T')[0] : family.end_date ? String(family.end_date).split('T')[0] : '');
        setCoverImage(family.coverImage || '');
        setTripStatus(family.status || 'planning');
      } catch (err: any) {
        setError(err.message || 'שגיאה בטעינת פרטי הטיול');
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [session, tripId]);

  const toggleDestination = (dest: string) => {
    setDestinations(prev =>
      prev.includes(dest) ? prev.filter(d => d !== dest) : [...prev, dest]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('יש להזין שם טיול');
      return;
    }
    if (destinations.length === 0) {
      setError('יש לבחור לפחות יעד אחד');
      return;
    }
    if (!startDate || !endDate) {
      setError('יש לבחור תאריך התחלה וסיום');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError('תאריך הסיום לא יכול להיות לפני תאריך ההתחלה');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/families/${tripId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${(session as any)?.accessToken || ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          destinations,
          start_date: startDate,
          end_date: endDate,
          coverImage: coverImage.trim() || undefined,
          status: tripStatus,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `שגיאה בעדכון הטיול (${res.status})`);
      }

      router.push(`/${locale}/trips/${tripId}`);
    } catch (err: any) {
      setError(err.message || 'שגיאה בעדכון הטיול. נסו שוב.');
    } finally {
      setSubmitting(false);
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

  return (
    <div style={{minHeight:'100vh',background:'#0F0F23',color:'#E8E8F0',fontFamily:'Inter,system-ui,sans-serif',direction:'rtl'}}>
      {/* Header */}
      <header style={{position:'sticky',top:0,zIndex:40,background:'rgba(26,26,46,0.9)',backdropFilter:'blur(16px)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'12px 16px',display:'flex',alignItems:'center',gap:'12px'}}>
        <button
          onClick={() => router.back()}
          style={{background:'rgba(255,255,255,0.08)',border:'none',color:'#94A3B8',width:'36px',height:'36px',borderRadius:'10px',fontSize:'18px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}
        >
          →
        </button>
        <div>
          <h1 style={{fontSize:'18px',fontWeight:700,color:'#6C63FF',margin:0}}>ערוך טיול</h1>
          <p style={{fontSize:'12px',color:'#94A3B8',margin:'2px 0 0 0'}}>עדכנו את פרטי הטיול</p>
        </div>
      </header>

      <main style={{padding:'20px 16px',paddingBottom:'100px'}}>
        {loading ? (
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'60px 0',color:'#94A3B8'}}>
            <div style={{fontSize:'40px',marginBottom:'12px'}}>✈️</div>
            <p style={{margin:0,fontSize:'14px'}}>טוען פרטי טיול...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Trip Name */}
            <div style={{marginBottom:'24px'}}>
              <label style={{display:'block',fontSize:'14px',fontWeight:600,color:'#E8E8F0',marginBottom:'8px'}}>
                שם הטיול <span style={{color:'#EF4444'}}>*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="למשל: חופשת קיץ ביפן"
                required
                style={{width:'100%',padding:'14px 16px',background:'#1A1A2E',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',color:'#E8E8F0',fontSize:'15px',outline:'none',boxSizing:'border-box',fontFamily:'inherit'}}
              />
            </div>

            {/* Destinations */}
            <div style={{marginBottom:'24px'}}>
              <label style={{display:'block',fontSize:'14px',fontWeight:600,color:'#E8E8F0',marginBottom:'12px'}}>
                יעדים <span style={{color:'#EF4444'}}>*</span>
              </label>
              <div style={{display:'flex',flexWrap:'wrap',gap:'10px'}}>
                {DESTINATION_OPTIONS.map((dest) => {
                  const selected = destinations.includes(dest);
                  return (
                    <button
                      key={dest}
                      type="button"
                      onClick={() => toggleDestination(dest)}
                      style={{
                        padding:'10px 20px',
                        borderRadius:'24px',
                        border: selected ? '2px solid #6C63FF' : '2px solid rgba(255,255,255,0.08)',
                        background: selected ? 'rgba(108,99,255,0.15)' : 'rgba(255,255,255,0.04)',
                        color: selected ? '#6C63FF' : '#94A3B8',
                        fontSize:'14px',
                        fontWeight: selected ? 600 : 400,
                        cursor:'pointer',
                        transition:'all 0.2s',
                        fontFamily:'inherit',
                      }}
                    >
                      {selected ? '✓ ' : ''}{dest}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dates */}
            <div style={{display:'flex',gap:'12px',marginBottom:'24px'}}>
              <div style={{flex:1}}>
                <label style={{display:'block',fontSize:'14px',fontWeight:600,color:'#E8E8F0',marginBottom:'8px'}}>
                  תאריך התחלה <span style={{color:'#EF4444'}}>*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  style={{width:'100%',padding:'14px 16px',background:'#1A1A2E',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',color:'#E8E8F0',fontSize:'15px',outline:'none',boxSizing:'border-box',fontFamily:'inherit',colorScheme:'dark'}}
                />
              </div>
              <div style={{flex:1}}>
                <label style={{display:'block',fontSize:'14px',fontWeight:600,color:'#E8E8F0',marginBottom:'8px'}}>
                  תאריך סיום <span style={{color:'#EF4444'}}>*</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  style={{width:'100%',padding:'14px 16px',background:'#1A1A2E',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',color:'#E8E8F0',fontSize:'15px',outline:'none',boxSizing:'border-box',fontFamily:'inherit',colorScheme:'dark'}}
                />
              </div>
            </div>

            {/* Cover Image URL */}
            <div style={{marginBottom:'24px'}}>
              <label style={{display:'block',fontSize:'14px',fontWeight:600,color:'#E8E8F0',marginBottom:'8px'}}>
                🖼️ תמונת שער (URL)
              </label>
              <input
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
                style={{width:'100%',padding:'14px 16px',background:'#1A1A2E',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',color:'#E8E8F0',fontSize:'15px',outline:'none',boxSizing:'border-box',fontFamily:'inherit'}}
              />
              {coverImage && (
                <div style={{marginTop:'12px',borderRadius:'12px',overflow:'hidden',height:'120px',background:'#1A1A2E',border:'1px solid rgba(255,255,255,0.08)'}}>
                  <img src={coverImage} alt="preview" style={{width:'100%',height:'100%',objectFit:'cover'}} onError={(e) => {(e.target as HTMLImageElement).style.display = 'none';}} />
                </div>
              )}
            </div>

            {/* Trip Status */}
            <div style={{marginBottom:'24px'}}>
              <label style={{display:'block',fontSize:'14px',fontWeight:600,color:'#E8E8F0',marginBottom:'12px'}}>
                🏷️ סטטוס הטיול
              </label>
              <div style={{display:'flex',gap:'10px'}}>
                {[
                  { value: 'planning', label: 'תכנון', color: '#6C63FF', icon: '📋' },
                  { value: 'live', label: 'פעיל', color: '#10B981', icon: '🟢' },
                  { value: 'completed', label: 'הושלם', color: '#F59E0B', icon: '✅' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTripStatus(opt.value)}
                    style={{
                      flex:1,padding:'12px',borderRadius:'12px',
                      border: tripStatus === opt.value ? `2px solid ${opt.color}` : '2px solid rgba(255,255,255,0.08)',
                      background: tripStatus === opt.value ? `${opt.color}15` : 'transparent',
                      color: tripStatus === opt.value ? opt.color : '#94A3B8',
                      fontSize:'14px',fontWeight: tripStatus === opt.value ? 600 : 400,
                      cursor:'pointer',transition:'all 0.2s',textAlign:'center',fontFamily:'inherit',
                    }}
                  >
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'12px',padding:'14px 16px',marginBottom:'20px',color:'#EF4444',fontSize:'14px',textAlign:'center'}}>
                ⚠️ {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              style={{
                width:'100%',
                padding:'16px',
                background: submitting ? 'rgba(108,99,255,0.5)' : '#6C63FF',
                color:'#fff',
                border:'none',
                borderRadius:'14px',
                fontSize:'16px',
                fontWeight:700,
                cursor: submitting ? 'not-allowed' : 'pointer',
                transition:'all 0.2s',
                display:'flex',
                alignItems:'center',
                justifyContent:'center',
                gap:'8px',
              }}
            >
              {submitting ? (
                <>שומר שינויים...</>
              ) : (
                <>
                  <span style={{fontSize:'18px'}}>💾</span>
                  שמור שינויים
                </>
              )}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
