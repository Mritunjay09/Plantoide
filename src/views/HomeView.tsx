import { Camera, Sprout, CalendarDays, ArrowRight, Scan, BookOpen } from 'lucide-react';
import { WeatherWidget } from '../components/WeatherWidget';
import { useEffect, useState } from 'react';

interface HomeViewProps {
  onOpenDiagnosis: () => void;
  onNavigate: (tab: 'inventory' | 'analytics' | 'scheduler') => void;
}

export function HomeView({ onOpenDiagnosis, onNavigate }: HomeViewProps) {
  const [scanCount, setScanCount] = useState(0);

  useEffect(() => {
    setScanCount(parseInt(localStorage.getItem('scan_count') ?? '0', 10));
  }, []);

  return (
    <div style={{ padding: '1.25rem 1.25rem 0', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ── Weather ──────────────────────────────────────────────────────── */}
      <WeatherWidget />

      {/* ── Primary CTA Hero ─────────────────────────────────────────────── */}
      <button
        onClick={onOpenDiagnosis}
        id="scan-cta-button"
        style={{
          width: '100%',
          background: 'linear-gradient(135deg, var(--color-primary) 0%, #1a3fa6 60%, #163596 100%)',
          border: 'none',
          borderRadius: '20px',
          padding: '1.5rem',
          cursor: 'pointer',
          textAlign: 'left',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0,35,102,0.35)',
        }}
      >
        {/* Decorative circle */}
        <div style={{
          position: 'absolute', right: '-20px', top: '-20px',
          width: '120px', height: '120px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.07)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', right: '20px', bottom: '-30px',
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          pointerEvents: 'none',
        }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          backgroundColor: 'rgba(255,255,255,0.15)',
          borderRadius: '100px', padding: '4px 12px',
          marginBottom: '0.9rem',
        }}>
          <div style={{
            width: '6px', height: '6px', borderRadius: '50%',
            backgroundColor: '#4ade80',
            boxShadow: '0 0 6px #4ade80',
            animation: 'pulse-ring 2s ease infinite',
          }} />
          <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.07em' }}>
            AI READY
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{
              color: '#fff', fontSize: '1.25rem', fontWeight: 800,
              margin: '0 0 0.3rem', fontFamily: 'var(--font-heading)',
            }}>
              Scan Your Field
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.82rem', margin: 0, lineHeight: 1.4 }}>
              Point camera at plants to detect<br />& identify unwanted weeds
            </p>
          </div>
          <div style={{
            width: '52px', height: '52px', borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.15)',
            border: '2px solid rgba(255,255,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Camera size={24} color="white" />
          </div>
        </div>

        {/* Step hint */}
        <div style={{
          marginTop: '1rem',
          paddingTop: '0.85rem',
          borderTop: '1px solid rgba(255,255,255,0.12)',
          display: 'flex', alignItems: 'center', gap: '1rem',
        }}>
          {[
            { step: '1', label: 'Open camera' },
            { step: '2', label: 'Aim at plant' },
            { step: '3', label: 'Tap Scan' },
          ].map(({ step, label }, i, arr) => (
            <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{
                width: '20px', height: '20px', borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ color: '#fff', fontSize: '0.6rem', fontWeight: 800 }}>{step}</span>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.72rem', fontWeight: 500 }}>{label}</span>
              {i < arr.length - 1 && (
                <ArrowRight size={10} color="rgba(255,255,255,0.35)" style={{ marginLeft: '0.2rem' }} />
              )}
            </div>
          ))}
        </div>
      </button>

      {/* ── Quick stats row ───────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
        {[
          { value: String(scanCount), label: 'Scans done', color: 'var(--color-primary)' },
          { value: '16', label: 'Plants in DB', color: '#059669' },
          { value: 'Active', label: 'AI status', color: '#7c3aed' },
        ].map(({ value, label, color }) => (
          <div key={label} style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: '14px',
            padding: '0.85rem 0.75rem',
            textAlign: 'center',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color, fontFamily: 'var(--font-heading)' }}>
              {value}
            </div>
            <div style={{ fontSize: '0.62rem', color: 'var(--color-text-light)', fontWeight: 600, marginTop: '0.2rem', lineHeight: 1.3 }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Secondary nav cards ───────────────────────────────────────────── */}
      <div>
        <p style={{
          fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.07em',
          color: 'var(--color-text-light)', textTransform: 'uppercase',
          marginBottom: '0.75rem',
        }}>
          More Tools
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>

          {/* Inventory */}
          <SecondaryCard
            icon={<Sprout size={20} color="#059669" />}
            iconBg="rgba(5,150,105,0.1)"
            title="Inventory"
            subtitle="Track your seeds, fertilisers & supplies"
            onClick={() => onNavigate('inventory')}
          />

          {/* Scheduler */}
          <SecondaryCard
            icon={<CalendarDays size={20} color="#7c3aed" />}
            iconBg="rgba(124,58,237,0.1)"
            title="Watering Scheduler"
            subtitle="Set up automated plant watering reminders"
            onClick={() => onNavigate('scheduler')}
          />

          {/* About weed detection */}
          <div style={{
            backgroundColor: 'rgba(0,35,102,0.04)',
            border: '1px dashed rgba(0,35,102,0.2)',
            borderRadius: '14px',
            padding: '0.9rem 1rem',
            display: 'flex', alignItems: 'center', gap: '0.8rem',
          }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              backgroundColor: 'rgba(0,35,102,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <BookOpen size={18} color="var(--color-primary)" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 0.15rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                16 Weed Species Supported
              </p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-light)', lineHeight: 1.4 }}>
                Scan a plant and tap its card to get full botanical info, risk level, and control tips.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* bottom breathing room */}
      <div style={{ height: '0.5rem' }} />
    </div>
  );
}

// ─── Helper component ─────────────────────────────────────────────────────────
function SecondaryCard({
  icon, iconBg, title, subtitle, onClick,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', textAlign: 'left',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '14px',
        padding: '0.9rem 1rem',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: '0.8rem',
        boxShadow: 'var(--shadow-sm)',
        transition: 'box-shadow 0.2s',
      }}
    >
      <div style={{
        width: '40px', height: '40px', borderRadius: '10px',
        backgroundColor: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: '0 0 0.15rem', fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-neutral)' }}>
          {title}
        </p>
        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-light)', lineHeight: 1.3 }}>
          {subtitle}
        </p>
      </div>
      <ArrowRight size={18} color="var(--color-border)" style={{ flexShrink: 0 }} />
    </button>
  );
}
