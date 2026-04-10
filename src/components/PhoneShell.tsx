import { Signal, Wifi } from 'lucide-react';
import { type ReactNode } from 'react';

interface PhoneShellProps {
  children: ReactNode;
}

function StatusBar() {
  const now = new Date();
  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.5rem',
      height: '44px',
      backgroundColor: 'var(--color-surface)',
      flexShrink: 0,
      zIndex: 20,
      position: 'relative',
    }}>
      {/* Time */}
      <span style={{
        fontSize: '0.875rem',
        fontWeight: 700,
        fontFamily: 'var(--font-heading)',
        color: 'var(--color-neutral)',
        letterSpacing: '0.02em',
      }}>
        {time}
      </span>

      {/* Dynamic Island / Notch */}
      <div style={{
        position: 'absolute',
        top: '8px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '126px',
        height: '34px',
        backgroundColor: '#000',
        borderRadius: '20px',
        zIndex: 30,
      }} />

      {/* Right icons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Signal size={14} strokeWidth={2.5} color="var(--color-neutral)" />
        <Wifi size={14} strokeWidth={2.5} color="var(--color-neutral)" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <div style={{
            width: '24px', height: '12px',
            border: '1.5px solid var(--color-neutral)',
            borderRadius: '3px',
            padding: '1.5px',
            display: 'flex', alignItems: 'center',
          }}>
            <div style={{
              width: '70%', height: '100%',
              backgroundColor: 'var(--color-neutral)',
              borderRadius: '1.5px',
            }} />
          </div>
          {/* Battery tip */}
          <div style={{
            width: '2px', height: '5px',
            backgroundColor: 'var(--color-neutral)',
            borderRadius: '0 1px 1px 0',
          }} />
        </div>
      </div>
    </div>
  );
}

function HomeIndicator() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '34px',
      backgroundColor: 'var(--color-surface)',
      flexShrink: 0,
      zIndex: 20,
    }}>
      <div style={{
        width: '134px',
        height: '5px',
        backgroundColor: 'var(--color-neutral)',
        borderRadius: '3px',
        opacity: 0.2,
      }} />
    </div>
  );
}

export function PhoneShell({ children }: PhoneShellProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <StatusBar />
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {children}
      </div>
      <HomeIndicator />
    </div>
  );
}
