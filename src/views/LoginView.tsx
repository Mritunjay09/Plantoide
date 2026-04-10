import { useState } from 'react';
import { Leaf } from 'lucide-react';

export interface UserInfo {
  name: string;
  farmName: string;
  email: string;
}

interface LoginViewProps {
  onLogin: (info: UserInfo) => void;
}

export function LoginView({ onLogin }: LoginViewProps) {
  const [name, setName] = useState('');
  const [farmName, setFarmName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password && name && farmName) {
      onLogin({ name, farmName, email }); 
    }
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      backgroundColor: 'var(--color-surface)',
      position: 'relative'
    }}>
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{
          backgroundColor: 'var(--color-primary)',
          borderRadius: '50%',
          width: '80px', height: '80px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '1.5rem',
          boxShadow: '0 8px 32px rgba(0, 58, 153, 0.4)'
        }}>
          <Leaf size={40} color="white" />
        </div>
        <h1 style={{ fontSize: '2rem', margin: '0 0 0.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>Plantoide</h1>
        <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem', marginBottom: '2.5rem', textAlign: 'center' }}>
          Your AI Precision Agronomist
        </p>

        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-neutral)', marginBottom: '0.25rem' }}>YOUR NAME</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Rivera"
              required
              style={{
                width: '100%', padding: '0.75rem 1rem',
                backgroundColor: 'var(--color-background)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem', color: 'var(--color-neutral)'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-neutral)', marginBottom: '0.25rem' }}>FARM NAME</label>
            <input
              type="text"
              value={farmName}
              onChange={(e) => setFarmName(e.target.value)}
              placeholder="e.g. Salinas Valley"
              required
              style={{
                width: '100%', padding: '0.75rem 1rem',
                backgroundColor: 'var(--color-background)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem', color: 'var(--color-neutral)'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-neutral)', marginBottom: '0.25rem' }}>EMAIL ADDRESS</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="farmer@salinas.farm"
              required
              style={{
                width: '100%', padding: '0.75rem 1rem',
                backgroundColor: 'var(--color-background)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem', color: 'var(--color-neutral)'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-neutral)', marginBottom: '0.25rem' }}>PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%', padding: '0.75rem 1rem',
                backgroundColor: 'var(--color-background)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem', color: 'var(--color-neutral)'
              }}
            />
          </div>
          
          <button type="submit" style={{
            backgroundColor: 'var(--color-primary)',
            color: 'white', border: 'none',
            padding: '1rem', marginTop: '1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '1rem', fontWeight: 700,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}>
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}
