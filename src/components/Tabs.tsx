import { Calendar } from 'lucide-react';

interface TabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Tabs({ activeTab, onTabChange }: TabsProps) {
  const tabs = ['Season', 'Month', 'Week'];

  return (
    <div style={{
      display: 'flex',
      backgroundColor: 'var(--color-surface)',
      borderRadius: 'var(--radius-md)',
      padding: '0.25rem',
      marginBottom: '1.5rem',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ flex: 1, display: 'flex' }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: activeTab === tab ? 'var(--color-surface)' : 'transparent',
              color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-text-light)',
              fontWeight: activeTab === tab ? 600 : 500,
              boxShadow: activeTab === tab ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
              fontSize: '0.875rem'
            }}
          >
            {tab}
          </button>
        ))}
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0 0.75rem',
        borderLeft: '1px solid var(--color-border)',
        marginLeft: '0.25rem'
      }}>
        <Calendar size={14} style={{ marginRight: '0.25rem', color: 'var(--color-text-light)' }} />
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)', lineHeight: 1.2 }}>
          Mar<br/>2024<br/>-Oct<br/>2024
        </span>
      </div>
    </div>
  );
}
