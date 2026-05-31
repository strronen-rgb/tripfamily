'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const API_URL = 'https://tripfamily-api.onrender.com';

const DESTINATION_OPTIONS = ['תאילנד', 'יפן', 'קוריאה', 'אחר'];

export default function NewTripPage() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const locale = pathname.split('/')[1] || 'he';

  const [name, setName] = useState('');
  const [destinations, setDestinations] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session && typeof window !== 'undefined') {
      window.location.href = `/${locale}/auth`;
    }
  }, [session, status, locale]);

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
      const res = await fetch(`${API_URL}/api/families`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(session as any)?.accessToken || ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          destinations,
          start_date: startDate,
          end_date: endDate,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `שגיאה ביצירת טיול (${res.status})`);
      }

      const data = await res.json();
      const tripId = data.id || data.family?.id || data.trip?.id;
      router.push(`/${locale}/trips/${tripId}`);
    } catch (err: any) {
      setError(err.message || 'שגיאה ביצירת הטיול. נסו שוב.');
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
          <h1 style={{fontSize:'18px',fontWeight:700,color:'#6C63FF',margin:0}}>צור טיול חדש</h1>
          <p style={{fontSize:'12px',color:'#94A3B8',margin:'2px 0 0 0'}}>תכננו את ההרפתקה הבאה שלכם</p>
        </div>
      </header>

      <main style={{padding:'20px 16px',paddingBottom:'100px'}}>
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
              style={{width:'100%',padding:'14px 16px',background:'#1A1A2E',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',color:'#E8E8F0',fontSize:'15px',outline:'null',boxSizing:'border-box',fontFamily:'inherit'}}
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
              <>ⳳותשה..</>
            ) : (
              <>
                <span style={{fontSize:'18px'}}>✈️</span>
                צור טיול
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
