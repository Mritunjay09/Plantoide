import { useState } from 'react';
import { Leaf, UserPlus, LogIn } from 'lucide-react';

export interface UserInfo {
  name: string;
  farmName: string;
  email: string;
  id?: string;
}

interface LoginViewProps {
  onLogin: (info: UserInfo) => void;
}

export function LoginView({ onLogin }: LoginViewProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [farmName, setFarmName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    // Determine which endpoint to hit based on mode
    const endpoint = isRegistering ? '/api/users/register' : '/api/users/login';
    const payload = isRegistering 
      ? { username: name, email, password, farmLocation: farmName } 
      : { email, password };

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        if (isRegistering) {
          setMessage({ text: 'Registration successful! Please Log In.', type: 'success' });
          setIsRegistering(false); // Switch to login mode automatically
        } else {
          localStorage.setItem('currentUserId', data.userId);
          localStorage.setItem('username', data.username);
          onLogin({ name: data.username, farmName, email, id: data.userId });
        }
      } else {
        setMessage({ text: data.error || 'Operation failed', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Cannot connect to Suk_admin server', type: 'error' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--color-surface)' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ 
          backgroundColor: 'var(--color-primary)', borderRadius: '50%', width: '80px', height: '80px', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' 
        }}>
          <Leaf size={40} color="white" />
        </div>
        
        <h1 style={{ fontSize: '2rem', margin: 0, fontWeight: 800, color: 'var(--color-primary)' }}>Plantoide</h1>
        <p style={{ color: 'var(--color-text-light)', marginBottom: '2rem' }}>
          {isRegistering ? 'Create your Farmer Profile' : 'Your AI Precision Agronomist'}
        </p>

        {message.text && (
          <p style={{ color: message.type === 'error' ? '#ef4444' : '#10b981', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600 }}>
            {message.text}
          </p>
        )}

        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {isRegistering && (
            <>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" required style={inputStyle} />
              <input type="text" value={farmName} onChange={(e) => setFarmName(e.target.value)} placeholder="Farm Location" required style={inputStyle} />
            </>
          )}
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" required style={inputStyle} />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required style={inputStyle} />
          
          <button type="submit" style={buttonStyle}>
            {isRegistering ? <UserPlus size={18} /> : <LogIn size={18} />}
            {isRegistering ? 'Register Account' : 'Log In'}
          </button>
        </form>

        <button 
          onClick={() => setIsRegistering(!isRegistering)}
          style={{ marginTop: '1.5rem', background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
        >
          {isRegistering ? 'Already have an account? Log In' : "Don't have an account? Register Now"}
        </button>
      </div>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '0.85rem 1rem', backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: '12px', fontSize: '0.9rem' };
const buttonStyle = { 
  backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', padding: '1rem', 
  marginTop: '1rem', borderRadius: '12px', fontSize: '1rem', fontWeight: 700,
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
};