import { type ReactNode, type CSSProperties } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  dark?: boolean;
}

export function Card({ children, className = '', onClick, dark = false, style }: CardProps) {
  return (
    <div
      className={`card ${dark ? 'card-dark' : 'card-light'} ${className}`}
      onClick={onClick}
      style={{
        background: dark ? 'var(--color-primary)' : 'var(--color-surface)',
        color: dark ? 'white' : 'var(--color-neutral)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        boxShadow: dark ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
