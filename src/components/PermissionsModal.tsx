import React, { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { MapPin, Camera, Shield, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

interface PermissionsModalProps {
  onComplete: () => void;
  onLocationGranted: (coords: { lat: number; lon: number }) => void;
}

/** Get location — uses Capacitor plugin on Android, Web API on browser */
async function getLocation(): Promise<{ lat: number; lon: number }> {
  if (Capacitor.isNativePlatform()) {
    // Native Android: use Capacitor plugin
    const { Geolocation } = await import('@capacitor/geolocation');
    const status = await Geolocation.requestPermissions();
    if (status.location !== 'granted') throw new Error('denied');
    const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
    return { lat: pos.coords.latitude, lon: pos.coords.longitude };
  } else {
    // Web browser: standard navigator.geolocation
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 12000 },
      );
    });
  }
}

/** Request camera permission — Capacitor on Android, no-op on web (browser prompts itself) */
async function requestCameraPermission(): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    const { Camera: CapCamera } = await import('@capacitor/camera');
    await CapCamera.requestPermissions();
  }
  // On web the browser will ask for camera permission when getUserMedia() is called
}

export function PermissionsModal({ onComplete, onLocationGranted }: PermissionsModalProps) {
  const [step, setStep]       = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAllowLocation = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const coords = await getLocation();
      onLocationGranted(coords);
      setStep(1);
    } catch (e: any) {
      const msg = e?.message ?? '';
      if (msg === 'denied' || e?.code === 1) {
        setErrorMsg('Permission denied. Please allow location access and retry.');
      } else if (e?.code === 3) {
        setErrorMsg('Location timed out. Make sure GPS / Location Services is enabled.');
      } else {
        setErrorMsg('Could not get location. Check that Location Services is on and retry.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAllowCamera = async () => {
    setLoading(true);
    try {
      await requestCameraPermission();
    } catch { /* ignore — browser will ask on first camera use */ }
    finally {
      setLoading(false);
      setStep(2);
    }
  };

  const buttonStyle: React.CSSProperties = {
    width: '100%', padding: '1rem',
    backgroundColor: 'var(--color-primary)', color: 'white',
    border: 'none', borderRadius: '12px', fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '10px', cursor: 'pointer', transition: 'opacity 0.2s',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999, backgroundColor: 'white', display: 'flex', flexDirection: 'column', padding: '2rem' }}>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } } .spin { animation: spin 1s linear infinite; }`}</style>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>

        {/* ── Step 0: Location ── */}
        {step === 0 && (
          <div>
            <div style={{ width: '80px', height: '80px', backgroundColor: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', margin: '0 auto 1.5rem' }}>
              {loading ? <Loader2 size={40} color="#3b82f6" className="spin" /> : <MapPin size={40} color="#3b82f6" />}
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Location Access</h2>
            <p style={{ color: '#64748b', margin: '1rem 0 2rem' }}>
              Plantoide uses your location to show local weather and log where weeds were found.
            </p>
            {errorMsg && (
              <div style={{ color: '#ef4444', marginBottom: '1.5rem', fontSize: '0.85rem', display: 'flex', gap: '6px', alignItems: 'flex-start', textAlign: 'left', background: '#fef2f2', padding: '0.75rem', borderRadius: '10px' }}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
                {errorMsg}
              </div>
            )}
            <button onClick={handleAllowLocation} disabled={loading} style={{ ...buttonStyle, opacity: loading ? 0.75 : 1 }}>
              {loading ? 'Locating…' : 'Allow Location Access'}
              {!loading && <ArrowRight size={18} />}
            </button>
            {/* Skip option for browser testing */}
            {!Capacitor.isNativePlatform() && (
              <button
                onClick={() => setStep(1)}
                style={{ marginTop: '0.9rem', color: '#94a3b8', fontSize: '0.82rem', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Skip for now (weather will use default location)
              </button>
            )}
          </div>
        )}

        {/* ── Step 1: Camera ── */}
        {step === 1 && (
          <div>
            <div style={{ width: '80px', height: '80px', backgroundColor: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              {loading ? <Loader2 size={40} color="#10b981" className="spin" /> : <Camera size={40} color="#10b981" />}
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Camera Access</h2>
            <p style={{ color: '#64748b', margin: '1rem 0 2rem' }}>
              The AI model needs your camera to analyse plants live.{' '}
              {!Capacitor.isNativePlatform() && 'Your browser will ask when you open the scanner.'}
            </p>
            <button onClick={handleAllowCamera} disabled={loading} style={{ ...buttonStyle, backgroundColor: '#10b981', opacity: loading ? 0.75 : 1 }}>
              {loading ? 'Setting up…' : 'Continue'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </div>
        )}

        {/* ── Step 2: Done ── */}
        {step === 2 && (
          <div>
            <div style={{ width: '80px', height: '80px', backgroundColor: '#f5f3ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Shield size={40} color="#8b5cf6" />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Setup Complete</h2>
            <p style={{ color: '#64748b', margin: '1rem 0 2rem' }}>
              Your Plantoide profile is ready for precision farming.
            </p>
            <button onClick={onComplete} style={{ ...buttonStyle, backgroundColor: 'black' }}>
              Enter Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}