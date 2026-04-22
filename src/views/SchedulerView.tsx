import { useState, useEffect, useRef } from 'react';
import { Plus, Check, Clock, Bell, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Card } from '../components/Card';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Plant {
  id: string;
  name: string;
  emoji: string;
  wateringInterval: number; // hours
  lastWatered: Date;
}

// ─── Plant presets (common home / garden plants) ──────────────────────────────
const PLANT_PRESETS: { name: string; emoji: string; interval: number; tip: string }[] = [
  { name: 'Tomato',        emoji: '🍅', interval: 2,   tip: 'Every 2 hrs in hot sun' },
  { name: 'Basil',         emoji: '🌿', interval: 12,  tip: 'Twice a day' },
  { name: 'Mint',          emoji: '🫧', interval: 8,   tip: 'Every 8 hrs' },
  { name: 'Chilli',        emoji: '🌶️', interval: 24,  tip: 'Once a day' },
  { name: 'Pepper',        emoji: '🫑', interval: 24,  tip: 'Once a day' },
  { name: 'Sunflower',     emoji: '🌻', interval: 24,  tip: 'Once a day' },
  { name: 'Rose',          emoji: '🌹', interval: 48,  tip: 'Every 2 days' },
  { name: 'Hibiscus',      emoji: '🌺', interval: 24,  tip: 'Once a day' },
  { name: 'Jasmine',       emoji: '🌸', interval: 24,  tip: 'Once a day' },
  { name: 'Money Plant',   emoji: '🍃', interval: 72,  tip: 'Every 3 days' },
  { name: 'Spider Plant',  emoji: '🕷️', interval: 72,  tip: 'Every 3 days' },
  { name: 'Peace Lily',    emoji: '🌫️', interval: 48,  tip: 'Every 2 days' },
  { name: 'Aloe Vera',     emoji: '🪴', interval: 240, tip: 'Every 10 days' },
  { name: 'Cactus',        emoji: '🌵', interval: 168, tip: 'Once a week' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatInterval(hours: number): string {
  if (hours < 24) return `${hours}h`;
  const days = hours / 24;
  return days === Math.floor(days) ? `${days}d` : `${Math.round(days * 10) / 10}d`;
}

function formatTimeLeft(hours: number): string {
  if (hours <= 0)    return 'Now';
  if (hours < 1)     return `${Math.round(hours * 60)}min`;
  if (hours < 24)    return `${hours.toFixed(1)}h`;
  return `${(hours / 24).toFixed(1)}d`;
}

function sendNotification(title: string, body: string) {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/favicon.ico' });
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
export function SchedulerView() {
  const [plants, setPlants] = useState<Plant[]>(() => {
    const saved = localStorage.getItem('schedulerPlants');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return parsed.map((p: Plant & { lastWatered: string }) => ({
        ...p,
        lastWatered: new Date(p.lastWatered),
      }));
    } catch {
      return []; // BUG FIX: was `return [e]` — never store the error object!
    }
  });

  const [notifications, setNotifications] = useState<string[]>([]);
  const [showAddForm,   setShowAddForm]   = useState(false);
  const [showPresets,   setShowPresets]   = useState(true);

  // Form state
  const [newName,       setNewName]       = useState('');
  const [newInterval,   setNewInterval]   = useState('24');
  const [newLastWatered, setNewLastWatered] = useState(() => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });

  // Track which plants have already been notified this cycle (reset on watering)
  const notifiedRef = useRef<Set<string>>(new Set());

  // ── Persist to localStorage ───────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem('schedulerPlants', JSON.stringify(plants));
  }, [plants]);

  // ── Request notification permission on mount ──────────────────────────────
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // ── Watering reminder interval ────────────────────────────────────────────
  // Runs every 60s (was every 1s — wasteful with no visible difference)
  useEffect(() => {
    const check = () => {
      const now = new Date();
      const alerts: string[] = [];

      plants.forEach(plant => {
        const elapsed = (now.getTime() - plant.lastWatered.getTime()) / 3_600_000; // hours
        if (elapsed >= plant.wateringInterval) {
          alerts.push(`${plant.emoji} ${plant.name} needs watering!`);
          // Fire native notification only once per watering cycle
          if (!notifiedRef.current.has(plant.id)) {
            notifiedRef.current.add(plant.id);
            sendNotification(
              `🌱 ${plant.name} needs watering!`,
              `Last watered ${Math.round(elapsed)}h ago`,
            );
          }
        }
      });

      setNotifications(alerts);
    };

    check(); // run immediately
    const timer = setInterval(check, 60_000);
    return () => clearInterval(timer);
  }, [plants]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const waterPlant = (id: string) => {
    notifiedRef.current.delete(id); // allow re-notification next cycle
    setPlants(prev =>
      prev.map(p => p.id === id ? { ...p, lastWatered: new Date() } : p),
    );
  };

  const removePlant = (id: string) => {
    setPlants(prev => prev.filter(p => p.id !== id));
  };

  const addPreset = (preset: typeof PLANT_PRESETS[number]) => {
    const p: Plant = {
      id: `${Date.now()}-${Math.random()}`,
      name: preset.name,
      emoji: preset.emoji,
      wateringInterval: preset.interval,
      lastWatered: new Date(),
    };
    setPlants(prev => [...prev, p]);
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const p: Plant = {
      id: `${Date.now()}-${Math.random()}`,
      name: newName.trim(),
      emoji: '🌱',
      wateringInterval: Math.max(1, Number(newInterval) || 24),
      lastWatered: new Date(newLastWatered),
    };
    setPlants(prev => [...prev, p]);
    setShowAddForm(false);
    setNewName('');
    setNewInterval('24');
  };

  const dismissNotifications = () => setNotifications([]);

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '1.25rem 1.25rem 2rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.05em', color: 'var(--color-text-light)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
            Task Management
          </p>
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Watering Scheduler</h2>
        </div>
        <button
          onClick={() => setShowAddForm(f => !f)}
          style={{
            backgroundColor: 'var(--color-primary)', color: 'white',
            border: 'none', borderRadius: '50%',
            width: '42px', height: '42px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,35,102,0.2)',
          }}
          aria-label="Add custom plant"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* ── Notification banner ─────────────────────────────────────────────── */}
      {notifications.length > 0 && (
        <div style={{
          backgroundColor: '#FEF2F2', border: '1px solid #FECACA',
          borderRadius: '12px', padding: '1rem',
          marginBottom: '1rem',
          display: 'flex', flexDirection: 'column', gap: '0.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={16} color="#DC2626" />
              <h3 style={{ fontSize: '0.9rem', color: '#DC2626', margin: 0, fontWeight: 700 }}>
                {notifications.length} plant{notifications.length > 1 ? 's' : ''} need water
              </h3>
            </div>
            <button onClick={dismissNotifications} style={{ color: '#DC2626' }}>
              <X size={16} />
            </button>
          </div>
          {notifications.map((note, i) => (
            <p key={i} style={{ fontSize: '0.82rem', color: '#DC2626', margin: 0 }}>{note}</p>
          ))}
        </div>
      )}

      {/* ── Custom add form ──────────────────────────────────────────────────── */}
      {showAddForm && (
        <Card style={{ padding: '1.25rem', marginBottom: '1rem', border: '1px solid var(--color-border)' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700 }}>Add Custom Plant</h3>
          <form onSubmit={handleAddCustom} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <label style={labelStyle}>Plant Name</label>
              <input
                type="text" value={newName} onChange={e => setNewName(e.target.value)}
                placeholder="e.g. My Tomato" required style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Water Every (hours)</label>
              <input
                type="number" min="1" value={newInterval}
                onChange={e => setNewInterval(e.target.value)}
                required style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Last Watered</label>
              <input
                type="datetime-local" value={newLastWatered}
                onChange={e => setNewLastWatered(e.target.value)}
                required style={inputStyle}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" style={{ flex: 1, backgroundColor: 'var(--color-primary)', color: 'white', padding: '0.75rem', border: 'none', borderRadius: '8px', fontWeight: 700 }}>
                Save
              </button>
              <button type="button" onClick={() => setShowAddForm(false)} style={{ flex: 1, backgroundColor: 'white', color: 'var(--color-neutral)', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '8px', fontWeight: 600 }}>
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* ── Quick-add preset section ─────────────────────────────────────────── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <button
          onClick={() => setShowPresets(v => !v)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.75rem 0', background: 'none', border: 'none',
            borderBottom: '1px solid var(--color-border)',
            fontFamily: 'var(--font-body)', cursor: 'pointer',
          }}
        >
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-neutral)' }}>
            ⚡ Quick Add Common Plants
          </span>
          {showPresets ? <ChevronUp size={18} color="var(--color-text-light)" /> : <ChevronDown size={18} color="var(--color-text-light)" />}
        </button>

        {showPresets && (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem',
            paddingTop: '0.75rem',
          }}>
            {PLANT_PRESETS.map(preset => {
              const alreadyAdded = plants.some(p => p.name === preset.name);
              return (
                <button
                  key={preset.name}
                  onClick={() => !alreadyAdded && addPreset(preset)}
                  disabled={alreadyAdded}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                    gap: '0.2rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    border: `1.5px solid ${alreadyAdded ? 'var(--color-border)' : 'var(--color-primary)'}`,
                    backgroundColor: alreadyAdded ? '#f1f5f9' : 'rgba(0,35,102,0.04)',
                    cursor: alreadyAdded ? 'default' : 'pointer',
                    opacity: alreadyAdded ? 0.5 : 1,
                    textAlign: 'left',
                    fontFamily: 'var(--font-body)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', width: '100%' }}>
                    <span style={{ fontSize: '1.1rem' }}>{preset.emoji}</span>
                    <span style={{ fontWeight: 700, fontSize: '0.83rem', color: 'var(--color-neutral)', flex: 1 }}>
                      {preset.name}
                    </span>
                    {alreadyAdded && <Check size={13} color="var(--color-success)" />}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-light)' }}>
                    {preset.tip}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Empty state ───────────────────────────────────────────────────────── */}
      {plants.length === 0 && !showAddForm && (
        <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--color-text-light)' }}>
          <Clock size={36} style={{ opacity: 0.4, marginBottom: '0.75rem' }} />
          <p style={{ fontSize: '0.9rem', margin: 0 }}>
            No plants added yet.<br />Use Quick Add above or tap + to add custom.
          </p>
        </div>
      )}

      {/* ── Plant cards ───────────────────────────────────────────────────────── */}
      {plants.map(plant => {
        const now          = new Date();
        const elapsed      = (now.getTime() - plant.lastWatered.getTime()) / 3_600_000;
        const progress     = Math.min(elapsed / plant.wateringInterval, 1);
        const hoursLeft    = Math.max(0, plant.wateringInterval - elapsed);
        const isOverdue    = elapsed >= plant.wateringInterval;
        const isUrgent     = !isOverdue && hoursLeft < plant.wateringInterval * 0.2; // last 20%

        const barColor = isOverdue ? '#EF4444' : isUrgent ? '#f59e0b' : 'var(--color-primary)';

        return (
          <Card key={plant.id} style={{ padding: '1.25rem', marginBottom: '0.85rem', position: 'relative' }}>
            {/* Delete */}
            <button
              onClick={() => removePlant(plant.id)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--color-text-light)', background: 'none', border: 'none', cursor: 'pointer' }}
              aria-label={`Remove ${plant.name}`}
            >
              <X size={16} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingRight: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1rem', margin: '0 0 0.2rem', fontWeight: 800, color: 'var(--color-neutral)' }}>
                  {plant.emoji} {plant.name}
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-light)', margin: 0 }}>
                  Every {formatInterval(plant.wateringInterval)}
                </p>
              </div>

              <button
                onClick={() => waterPlant(plant.id)}
                style={{
                  backgroundColor: isOverdue ? '#EF4444' : 'rgba(0,35,102,0.08)',
                  color: isOverdue ? 'white' : 'var(--color-primary)',
                  border: 'none', borderRadius: '10px',
                  padding: '8px 14px',
                  display: 'flex', alignItems: 'center', gap: '5px',
                  fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <Check size={15} />
                {isOverdue ? 'Water Now!' : 'Mark Watered'}
              </button>
            </div>

            {/* Progress bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.78rem', fontWeight: 600 }}>
                <span style={{ color: isOverdue ? '#EF4444' : 'var(--color-text-light)' }}>
                  {isOverdue ? '⚠️ Overdue' : 'Time until water'}
                </span>
                <span style={{ color: isOverdue ? '#EF4444' : 'var(--color-neutral)' }}>
                  {isOverdue ? 'Now!' : formatTimeLeft(hoursLeft)}
                </span>
              </div>
              <div style={{ height: '8px', backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${progress * 100}%`, height: '100%',
                  backgroundColor: barColor, borderRadius: '4px',
                  transition: 'width 0.5s ease-out, background-color 0.3s',
                }} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ─── Shared form styles ───────────────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.75rem',
  fontWeight: 700, marginBottom: '0.35rem',
  color: 'var(--color-neutral)',
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.7rem',
  borderRadius: '8px', border: '1px solid var(--color-border)',
  fontSize: '0.9rem', fontFamily: 'var(--font-body)',
  boxSizing: 'border-box',
};