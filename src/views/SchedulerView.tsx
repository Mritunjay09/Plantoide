import { useState, useEffect } from 'react';
import { Plus, Check, Clock } from 'lucide-react';
import { Card } from '../components/Card';

interface Plant {
  id: string;
  name: string;
  wateringInterval: number; // in hours
  lastWatered: Date;
}

export function SchedulerView() {
  const [plants, setPlants] = useState<Plant[]>(() => {
    const saved = localStorage.getItem('schedulerPlants');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return parsed.map((p: any) => ({
          ...p,
          lastWatered: new Date(p.lastWatered)
        }));
      } catch (e) { return [e]; }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('schedulerPlants', JSON.stringify(plants));
  }, [plants]);

  const [notifications, setNotifications] = useState<string[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [newName, setNewName] = useState('');
  const [newLastWatered, setNewLastWatered] = useState(() => {
    const now = new Date();
    // format to YYYY-MM-DDTHH:mm for datetime-local
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });
  const [newInterval, setNewInterval] = useState('24');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const newNotifications: string[] = [];
      plants.forEach(plant => {
        const timeSinceWatered = (now.getTime() - plant.lastWatered.getTime()) / (1000 * 60 * 60);
        if (timeSinceWatered >= plant.wateringInterval) {
          newNotifications.push(`${plant.name} needs watering!`);
        }
      });
      setNotifications(newNotifications);
    }, 1000);

    return () => clearInterval(interval);
  }, [plants]);

  const waterPlant = (id: string) => {
    setPlants(prev => prev.map(plant =>
      plant.id === id ? { ...plant, lastWatered: new Date() } : plant
    ));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    const p: Plant = {
      id: Date.now().toString(),
      name: newName,
      lastWatered: new Date(newLastWatered),
      wateringInterval: Number(newInterval) || 24,
    };
    setPlants([...plants, p]);
    setShowAddForm(false);
    setNewName('');
    setNewInterval('24');
  };

  return (
    <div style={{ padding: '1.25rem 1.25rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.05em', color: 'var(--color-text-light)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
            Task Management
          </p>
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Scheduler</h2>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          style={{
          backgroundColor: 'var(--color-primary)',
          color: 'white', border: 'none',
          borderRadius: '50%', width: '40px', height: '40px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <Plus size={20} />
        </button>
      </div>

      {notifications.length > 0 && (
        <div style={{
          backgroundColor: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1rem',
        }}>
          <h3 style={{ fontSize: '0.9rem', color: '#DC2626', margin: '0 0 0.5rem 0' }}>Notifications</h3>
          {notifications.map((note, index) => (
            <p key={index} style={{ fontSize: '0.8rem', color: '#DC2626', margin: '0.25rem 0' }}>{note}</p>
          ))}
        </div>
      )}

      {showAddForm && (
        <Card style={{ padding: '1.5rem', marginBottom: '1rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>Add New Option</h3>
          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--color-neutral)' }}>Plant Name</label>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Tomato"
                required
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.9rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--color-neutral)' }}>Last Watered Time</label>
              <input
                type="datetime-local"
                value={newLastWatered}
                onChange={e => setNewLastWatered(e.target.value)}
                required
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.9rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--color-neutral)' }}>Hours Before Next Water</label>
              <input
                type="number"
                min="1"
                value={newInterval}
                onChange={e => setNewInterval(e.target.value)}
                required
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.9rem' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button type="submit" style={{ flex: 1, backgroundColor: 'var(--color-primary)', color: 'white', padding: '0.75rem', border: 'none', borderRadius: '8px', fontWeight: 700 }}>Save</button>
              <button type="button" onClick={() => setShowAddForm(false)} style={{ flex: 1, backgroundColor: 'white', color: 'var(--color-neutral)', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '8px', fontWeight: 600 }}>Cancel</button>
            </div>
          </form>
        </Card>
      )}

      {plants.length === 0 && !showAddForm && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-light)' }}>
          <Clock size={40} style={{ opacity: 0.5, marginBottom: '1rem' }} />
          <p style={{ fontSize: '0.9rem', margin: 0 }}>No schedules added yet.<br/>Click the plus icon to add one.</p>
        </div>
      )}

      {plants.map(plant => {
        const now = new Date();
        const timeSinceWatered = (now.getTime() - plant.lastWatered.getTime()) / (1000 * 60 * 60);
        // calculate progress (download style): 0 is just watered, 1 is need water now
        const progressRaw = timeSinceWatered / plant.wateringInterval;
        const boundedProgress = Math.max(0, Math.min(progressRaw, 1));
        const hoursLeft = Math.max(0, Math.round((plant.wateringInterval - timeSinceWatered) * 10) / 10);
        const isUrgent = hoursLeft === 0;

        return (
          <Card key={plant.id} style={{ padding: '1.25rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.25rem 0', fontWeight: 800, color: 'var(--color-neutral)' }}>{plant.name}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', margin: 0 }}>
                  Interval: every {plant.wateringInterval}h
                </p>
              </div>
              <button
                onClick={() => waterPlant(plant.id)}
                style={{
                  backgroundColor: 'rgba(0, 35, 102, 0.08)',
                  color: 'var(--color-primary)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Check size={16} /> Mark Watered
              </button>
            </div>

            {/* Download-style horizontal progress bar */}
            <div>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                  <span style={{ color: isUrgent ? '#EF4444' : 'var(--color-text-light)' }}>
                    {isUrgent ? 'Needs Water' : 'Time Elapsed'}
                  </span>
                  <span style={{ color: isUrgent ? '#EF4444' : 'var(--color-neutral)' }}>
                    {isUrgent ? '0h left' : `${hoursLeft}h left`}
                  </span>
               </div>
               <div style={{ height: '8px', backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                 <div style={{
                   width: `${boundedProgress * 100}%`,
                   height: '100%',
                   backgroundColor: isUrgent ? '#EF4444' : 'var(--color-primary)',
                   borderRadius: '4px',
                   transition: 'width 0.5s ease-out, background-color 0.3s'
                 }} />
               </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}