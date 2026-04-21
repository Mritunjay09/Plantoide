import React, { useState } from 'react';
import { Camera as CapCamera } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { MapPin, Camera, Shield, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

interface PermissionsModalProps {
  onComplete: () => void;
  onLocationGranted: (coords: { lat: number, lon: number }) => void;
}

export function PermissionsModal({ onComplete, onLocationGranted }: PermissionsModalProps) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAllowLocation = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const status = await Geolocation.requestPermissions();
      if (status.location === 'granted') {
        const coordinates = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000 
        });
        onLocationGranted({ lat: coordinates.coords.latitude, lon: coordinates.coords.longitude });
        setStep(1); 
      } else {
        setErrorMsg("Permission denied by user.");
      }
    } catch {
      setErrorMsg("GPS is off. Please turn on 'Location' in your phone settings and retry.");
    } finally {
      setLoading(false);
    }
  };

  const handleAllowCamera = async () => {
    setLoading(true);
    try {
      const status = await CapCamera.requestPermissions();
      if (status.camera === 'granted') setStep(2);
    } catch { setStep(2); } 
    finally { setLoading(false); }
  };

  const buttonStyle = { width: '100%', padding: '1rem', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: '0.2s' };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999, backgroundColor: 'white', display: 'flex', flexDirection: 'column', padding: '2rem' }}>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } } .spin { animation: spin 1s linear infinite; }`}</style>
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        {step === 0 && (
          <div className="animate-in">
            <div style={{ width: '80px', height: '80px', backgroundColor: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', margin: '0 auto' }}>
              {loading ? <Loader2 size={40} color="#3b82f6" className="spin" /> : <MapPin size={40} color="#3b82f6" />}
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Location Access</h2>
            <p style={{ color: '#64748b', margin: '1rem 0 2rem' }}>Plantoide uses GPS to provide localized soil data and weather alerts.</p>
            {errorMsg && <div style={{ color: '#ef4444', marginBottom: '1.5rem', fontSize: '0.85rem', display: 'flex', gap: '5px', alignItems: 'center' }}><AlertCircle size={14}/>{errorMsg}</div>}
            <button onClick={handleAllowLocation} disabled={loading} style={{ ...buttonStyle, opacity: loading ? 0.7 : 1 }}>
              {loading ? "Searching GPS..." : "Allow Location Access"} {!loading && <ArrowRight size={18} />}
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="animate-in">
            <div style={{ width: '80px', height: '80px', backgroundColor: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', margin: '0 auto' }}>
              {loading ? <Loader2 size={40} color="#10b981" className="spin" /> : <Camera size={40} color="#10b981" />}
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Camera Access</h2>
            <p style={{ color: '#64748b', margin: '1rem 0 2rem' }}>Required for the AI model to analyze plant health via live camera feed.</p>
            <button onClick={handleAllowCamera} disabled={loading} style={{ ...buttonStyle, backgroundColor: '#10b981' }}>
              {loading ? "Preparing Lens..." : "Allow Camera Access"}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in">
            <div style={{ width: '80px', height: '80px', backgroundColor: '#f5f3ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', margin: '0 auto' }}>
              <Shield size={40} color="#8b5cf6" />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Setup Complete</h2>
            <p style={{ color: '#64748b', margin: '1rem 0 2rem' }}>Your Plantoide profile is synced and ready for precision farming.</p>
            <button onClick={onComplete} style={{ ...buttonStyle, backgroundColor: 'black' }}>Enter Dashboard</button>
          </div>
        )}
      </div>
    </div>
  );
}