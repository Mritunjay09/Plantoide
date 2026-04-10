import { useState } from 'react';
import { Card } from '../components/Card';
import { TrendingUp, Banknote, Droplets, Calendar } from 'lucide-react';

export function AnalyticsView() {
  const [activeDate, setActiveDate] = useState(() => new Date().toISOString().split('T')[0]);

  return (
    <div style={{ padding: '1.25rem 1.25rem 0' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <p style={{ fontSize: '0.75rem', letterSpacing: '0.05em', color: 'var(--color-text-light)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
          Analytics Overview
        </p>
        <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Crop Performance</h2>
      </div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '0.5rem 1rem' }}>
        <Calendar size={18} color="var(--color-primary)" style={{ marginRight: '0.75rem' }} />
        <input 
          type="date" 
          value={activeDate} 
          onChange={e => setActiveDate(e.target.value)} 
          style={{ 
            border: 'none', width: '100%', fontSize: '1rem', fontWeight: 600,
            color: 'var(--color-neutral)', outline: 'none', backgroundColor: 'transparent' 
          }} 
        />
      </div>

      <Card dark style={{ marginBottom: '1rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
            YIELD PER ACRE
          </p>
          <TrendingUp size={20} color="var(--color-success)" />
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>184.2</span>
          <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)' }}>bu/ac</span>
        </div>
        <p style={{ fontSize: '0.875rem', color: '#88B8FF', margin: 0, fontWeight: 500 }}>
          +12.4% vs Previous Season
        </p>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <Card style={{ padding: '1.25rem' }}>
          <Banknote size={20} color="var(--color-primary)" style={{ marginBottom: '1rem' }} />
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.05em', color: 'var(--color-text-light)', margin: '0 0 0.5rem' }}>
            EST. PROFIT
          </p>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-heading)', marginBottom: '0.25rem' }}>
            $1,240
          </div>
          <p style={{ color: 'var(--color-success)', margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>+$210</p>
        </Card>

        <Card style={{ padding: '1.25rem' }}>
          <Droplets size={20} color="var(--color-primary)" style={{ marginBottom: '1rem' }} />
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.05em', color: 'var(--color-text-light)', margin: '0 0 0.5rem' }}>
            AVG MOISTURE
          </p>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-heading)', marginBottom: '0.5rem' }}>
            24.8%
          </div>
          <div style={{ height: '4px', backgroundColor: 'var(--color-border)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: '40%', height: '100%', backgroundColor: 'var(--color-primary)' }} />
          </div>
        </Card>
      </div>

      <Card style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', margin: '0 0 0.25rem' }}>Yield Trends over Time</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', margin: 0, lineHeight: 1.4, maxWidth: '140px' }}>
              Historical comparison and growth trajectory
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }} />
              <span style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.05em' }}>CURRENT</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#E0E0E0' }} />
              <span style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--color-text-light)' }}>2023 AVG</span>
            </div>
          </div>
        </div>
        <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-light)', fontSize: '0.875rem' }}>
           {/* Placeholder for chart */}
           [ Chart Area ]
        </div>
      </Card>
      
      <div style={{ height: '80px' }} /> {/* Bottom Nav padding */}
    </div>
  );
}
