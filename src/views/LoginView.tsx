import React, { useState } from 'react';
import { Leaf, UserPlus, LogIn, Loader2 } from 'lucide-react';

const API_BASE_URL = "https://plantoide-backend.onrender.com";

export interface UserInfo {
  name: string;
  farmName: string;
  email: string;
  id?: string;
}

export function LoginView({ onLogin }: { onLogin: (info: UserInfo) => void }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', farm: '', email: '', pass: '' });
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: '', type: '' });

    const endpoint = isRegistering ? '/api/users/register' : '/api/users/login';
    const payload = isRegistering 
      ? { username: formData.name, email: formData.email, password: formData.pass, farmLocation: formData.farm } 
      : { email: formData.email, password: formData.pass };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (response.ok) {
        if (isRegistering) {
          setMessage({ text: 'Success! Please Log In.', type: 'success' });
          setIsRegistering(false);
        } else {
          // SAVE TO STORAGE - This is the "Memory" for the Sidebar
          localStorage.setItem('currentUserId', data.userId);
          localStorage.setItem('username', data.username);
          localStorage.setItem('userEmail', formData.email);
          localStorage.setItem('farmName', formData.farm || 'Plantoide Research Farm');
          
          onLogin({ 
            name: data.username, 
            farmName: formData.farm, 
            email: formData.email, 
            id: data.userId 
          });
        }
      } else {
        setMessage({ text: data.error || 'Operation failed', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Cloud connection error. Ensure you have internet access.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = { width: '100%', padding: '0.85rem 1rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '0.9rem' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } } .spin { animation: spin 1s linear infinite; }`}</style>
      <div style={{ backgroundColor: '#003a99', borderRadius: '50%', width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <Leaf size={32} color="white" />
      </div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#003a99' }}>Plantoide</h1>
      <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '2rem' }}>8th Sem: AI Precision Agronomist</p>

      {message.text && <p style={{ color: message.type === 'error' ? '#ef4444' : '#10b981', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600 }}>{message.text}</p>}

      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '300px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {isRegistering && (
          <>
            <input type="text" placeholder="Full Name" required style={inputStyle} onChange={e => setFormData({...formData, name: e.target.value})} />
            <input type="text" placeholder="Farm Location" required style={inputStyle} onChange={e => setFormData({...formData, farm: e.target.value})} />
          </>
        )}
        <input type="email" placeholder="Email" required style={inputStyle} onChange={e => setFormData({...formData, email: e.target.value})} />
        <input type="password" placeholder="Password" required style={inputStyle} onChange={e => setFormData({...formData, pass: e.target.value})} />
        
        <button type="submit" disabled={isLoading} style={{ backgroundColor: '#003a99', color: 'white', border: 'none', padding: '1rem', borderRadius: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '1rem', opacity: isLoading ? 0.7 : 1 }}>
          {isLoading ? <Loader2 size={20} className="spin" /> : (isRegistering ? <UserPlus size={18} /> : <LogIn size={18} />)}
          {isLoading ? 'Processing...' : (isRegistering ? 'Register' : 'Sign In')}
        </button>
      </form>
      <button onClick={() => setIsRegistering(!isRegistering)} style={{ marginTop: '1.5rem', background: 'none', border: 'none', color: '#003a99', fontSize: '0.9rem', cursor: 'pointer' }}>
        {isRegistering ? 'Already have an account? Log In' : "Don't have an account? Register Now"}
      </button>
    </div>
  );
}