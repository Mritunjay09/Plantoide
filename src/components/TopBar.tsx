import { Menu, Bell } from 'lucide-react';

interface TopBarProps {
  title?: string;
  onMenuClick?: () => void;
}

export function TopBar({ title = "Precision Agronomist", onMenuClick }: TopBarProps) {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.5rem',
      paddingTop: 'calc(env(safe-area-inset-top, 24px) + 12px)',
      paddingBottom: '12px',
      minHeight: 'var(--topbar-height)',
      backgroundColor: 'transparent',
      borderBottom: '1px solid var(--color-border)',
      flexShrink: 0,
      zIndex: 10,
    }}>
      <button
        onClick={onMenuClick}
        style={{ color: 'var(--color-primary)', padding: '8px', margin: '-8px' }}
      >
        <Menu size={24} />
      </button>
      <h1 style={{
        fontSize: '1.125rem',
        margin: 0,
        fontWeight: 800,
        color: 'var(--color-primary)',
        letterSpacing: '-0.01em',
      }}>
        {title}
      </h1>
      <button style={{ color: 'var(--color-primary)', padding: '8px', margin: '-8px', position: 'relative' }}>
        <Bell size={24} />
        <span style={{
          position: 'absolute', top: '6px', right: '6px',
          width: '8px', height: '8px',
          backgroundColor: '#EF4444',
          borderRadius: '50%',
          border: '2px solid white',
        }} />
      </button>
    </header>
  );
}
