import { useState } from 'react';
import { MapPin, Camera, Bell, HardDrive } from 'lucide-react';

interface PermissionsModalProps {
  onComplete: () => void;
  onLocationGranted?: (coord: {lat: number, lon: number}) => void;
}

export function PermissionsModal({ onComplete, onLocationGranted }: PermissionsModalProps) {
  const [step, setStep] = useState(0);

  const permissionsList = [
    { id: 'location', icon: MapPin, title: 'Location Access', desc: 'Used for live weather data and localized field alerts.' },
    { id: 'camera', icon: Camera, title: 'Camera Access', desc: 'Used for AI crop diagnosis and disease detection.' },
    { id: 'notifications', icon: Bell, title: 'Notifications', desc: 'Used to alert you when watering is required.' },
    { id: 'storage', icon: HardDrive, title: 'Storage Access', desc: 'Used to save your farm images globally per session.' },
  ];

  const handleGrant = () => {
    if (permissionsList[step].id === 'location') {
      if (navigator.geolocation) {
         navigator.geolocation.getCurrentPosition(
           (pos) => {
             onLocationGranted?.({ lat: pos.coords.latitude, lon: pos.coords.longitude });
             nextStep();
           },
           () => {
             // on error, still continue
             nextStep();
           }
         );
      } else {
        nextStep();
      }
    } else if (permissionsList[step].id === 'camera' || permissionsList[step].id === 'notifications') {
       // We mock requesting or delay for real APIs
       setTimeout(() => nextStep(), 500);
    } else {
       setTimeout(() => nextStep(), 500);
    }
  };

  const nextStep = () => {
    if (step < permissionsList.length - 1) {
      setStep(s => s + 1);
    } else {
      onComplete();
    }
  };

  const currentPerm = permissionsList[step];
  const Icon = currentPerm.icon;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1.5rem',
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: '24px',
        padding: '2rem',
        width: '100%',
        maxWidth: '340px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center'
      }}>
        <div style={{
          backgroundColor: 'rgba(0, 35, 102, 0.08)',
          width: '64px', height: '64px',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '1.25rem'
        }}>
          <Icon size={32} color="var(--color-primary)" />
        </div>
        <h2 style={{ fontSize: '1.25rem', margin: '0 0 0.5rem', fontWeight: 800 }}>{currentPerm.title}</h2>
        <p style={{ color: 'var(--color-text-light)', fontSize: '0.875rem', marginBottom: '2rem', lineHeight: 1.5 }}>
          {currentPerm.desc}
        </p>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button onClick={handleGrant} style={{
            backgroundColor: 'var(--color-primary)', color: 'white',
            padding: '1rem', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700
          }}>
            Allow Access
          </button>
          <button onClick={nextStep} style={{
            backgroundColor: 'transparent', color: 'var(--color-text-light)',
            padding: '1rem', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 600,
            border: '1px solid var(--color-border)'
          }}>
            Skip for now
          </button>
        </div>

        <div style={{ display: 'flex', gap: '6px', marginTop: '1.5rem' }}>
          {permissionsList.map((_, i) => (
             <div key={i} style={{
               width: '8px', height: '8px', borderRadius: '50%',
               backgroundColor: i === step ? 'var(--color-primary)' : 'var(--color-border)'
             }} />
          ))}
        </div>
      </div>
    </div>
  );
}
