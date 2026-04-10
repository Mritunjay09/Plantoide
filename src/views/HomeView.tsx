import { Camera, Sprout, Plus, TrendingUp } from 'lucide-react';
import { Card } from '../components/Card';
import { WeatherWidget } from '../components/WeatherWidget';

interface HomeViewProps {
  onOpenDiagnosis: () => void;
  onNavigate: (tab: 'inventory' | 'analytics') => void;
}

export function HomeView({ onOpenDiagnosis, onNavigate }: HomeViewProps) {
  return (
    <div style={{ padding: '1.25rem 1.25rem 0' }}>
      <WeatherWidget />



      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', marginTop: '1.25rem' }}>
        <Card onClick={onOpenDiagnosis} style={{ display: 'flex', flexDirection: 'column', padding: '1.25rem' }}>
          <div style={{
            backgroundColor: 'var(--color-primary)',
            width: '48px', height: '48px',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '1rem',
          }}>
            <Camera color="white" size={22} />
          </div>
          <h3 style={{ fontSize: '1rem', margin: '0 0 0.2rem 0', fontWeight: 700 }}>Diagnosis</h3>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-light)' }}>AI Crop Scan</p>
        </Card>

        <Card dark onClick={() => onNavigate('inventory')} style={{ display: 'flex', flexDirection: 'column', padding: '1.25rem' }}>
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.12)',
            width: '48px', height: '48px',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '1rem',
          }}>
            <Sprout color="white" size={22} />
          </div>
          <h3 style={{ fontSize: '1rem', margin: '0 0 0.2rem 0', color: 'white', fontWeight: 700 }}>Inventory</h3>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.65)' }}>Materials &<br />Supplies</p>
        </Card>
      </div>

      {/* Section Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 700 }}>Precision Analytics</h2>
        <button
          onClick={() => onNavigate('analytics')}
          style={{
            fontSize: '0.7rem', fontWeight: 700,
            letterSpacing: '0.08em', color: 'var(--color-primary)',
            textTransform: 'uppercase',
            borderBottom: '2px solid var(--color-primary)',
            paddingBottom: '1px',
          }}>
          Full Report
        </button>
      </div>

      {/* Analytics preview card */}
      <Card style={{ padding: '1.25rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.06em', color: 'var(--color-text-light)', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
              Soil Moisture
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>24.8</span>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-text-light)' }}>%</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              <TrendingUp size={12} color="var(--color-success)" />
              <span style={{ fontSize: '0.7rem', color: 'var(--color-success)', fontWeight: 600 }}>+2.1% since last week</span>
            </div>
          </div>
          <div style={{
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            width: '40px', height: '40px',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Plus size={20} />
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: '4px', backgroundColor: 'var(--color-border)', borderRadius: '2px', marginTop: '1rem', overflow: 'hidden' }}>
          <div style={{ width: '48%', height: '100%', backgroundColor: 'var(--color-primary)', borderRadius: '2px' }} />
        </div>
      </Card>
    </div>
  );
}
