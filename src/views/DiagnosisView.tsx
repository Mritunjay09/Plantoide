import { useEffect, useRef, useState } from 'react';
import { X, RotateCcw, Zap, Lightbulb, Info, Maximize, RefreshCcw } from 'lucide-react';
import { Card } from '../components/Card';

interface DiagnosisViewProps {
  onClose: () => void;
}

export function DiagnosisView({ onClose }: DiagnosisViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [flashOn, setFlashOn] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImg, setCapturedImg] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async (facing: 'environment' | 'user') => {
    // Stop any existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraError(null);
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError('Camera access denied. Please allow camera permission and try again.');
    }
  };

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      // Cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, [facingMode]);

  const flipCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      backgroundColor: 'black',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Live Camera Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',
          transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
        }}
      />

      {/* Captured Image Overlay */}
      {capturedImg && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 40,
          backgroundColor: '#000',
          display: 'flex', flexDirection: 'column'
        }}>
          <img 
            src={capturedImg} 
            alt="Captured" 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
          {/* Analysis Overlay */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '2rem', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem'
          }}>
            {analyzing ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
                <RefreshCcw size={32} className="spin-animation" style={{ animation: 'spin 1s linear infinite' }} />
                <h3 style={{ margin: 0 }}>Analyzing crop health...</h3>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '100%' }}>
                <div style={{ backgroundColor: 'var(--color-success)', color: 'white', padding: '1rem', borderRadius: '12px', textAlign: 'center', width: '100%' }}>
                  <h3 style={{ margin: '0 0 0.5rem' }}>No Diseases Found!</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>Your plant looks healthy.</p>
                </div>
                <button 
                  onClick={() => { setCapturedImg(null); setAnalyzing(false); }}
                  style={{ padding: '1rem', width: '100%', borderRadius: '12px', border: 'none', backgroundColor: 'white', fontWeight: 700 }}
                >
                  Retake Photo
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error fallback */}
      {cameraError && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '2rem', textAlign: 'center',
          backgroundColor: '#111',
        }}>
          <Info size={40} color="rgba(255,255,255,0.5)" style={{ marginBottom: '1rem' }} />
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', lineHeight: 1.5 }}>{cameraError}</p>
        </div>
      )}

      {/* Top Header */}
      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1.25rem 1.25rem 0',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, transparent 100%)',
      }}>
        <button
          onClick={onClose}
          style={{
            color: 'white',
            backgroundColor: 'rgba(0,0,0,0.45)',
            borderRadius: '50%', width: '40px', height: '40px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(8px)',
          }}
        >
          <X size={20} />
        </button>
        <span style={{ color: 'white', fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>Diagnosis</span>
        <button
          onClick={flipCamera}
          style={{
            color: 'white',
            backgroundColor: 'rgba(0,0,0,0.45)',
            borderRadius: '50%', width: '40px', height: '40px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(8px)',
          }}
        >
          <RotateCcw size={20} />
        </button>
      </div>

      {/* Right-side Action Buttons */}
      <div style={{
        position: 'absolute', top: '5rem', right: '1.25rem',
        display: 'flex', flexDirection: 'column', gap: '0.75rem',
        zIndex: 10,
      }}>
        <button
          onClick={() => setFlashOn(f => !f)}
          style={{
            backgroundColor: flashOn ? 'white' : 'var(--color-primary)',
            color: flashOn ? 'var(--color-primary)' : 'white',
            borderRadius: '14px',
            padding: '0.75rem 0.5rem',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
            width: '52px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          <Zap size={18} fill={flashOn ? 'var(--color-primary)' : 'white'} />
          <span style={{ fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Flash</span>
        </button>

        <button
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            borderRadius: '14px',
            padding: '0.75rem 0.5rem',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
            width: '52px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          <Lightbulb size={18} fill="white" />
          <span style={{ fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tips</span>
        </button>
      </div>

      {/* Scanner Reticle */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 5,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        <div style={{
          width: '65vw', height: '65vw',
          maxWidth: '260px', maxHeight: '260px',
          position: 'relative',
        }}>
          {/* Corner Brackets */}
          {[
            { top: -8, left: -8, borderTop: '4px solid white', borderLeft: '4px solid white', borderRadius: '12px 0 0 0' },
            { top: -8, right: -8, borderTop: '4px solid white', borderRight: '4px solid white', borderRadius: '0 12px 0 0' },
            { bottom: -8, left: -8, borderBottom: '4px solid white', borderLeft: '4px solid white', borderRadius: '0 0 0 12px' },
            { bottom: -8, right: -8, borderBottom: '4px solid white', borderRight: '4px solid white', borderRadius: '0 0 12px 0' },
          ].map((s, i) => (
            <div key={i} style={{ position: 'absolute', width: '28px', height: '28px', ...s as object }} />
          ))}

          {/* Faint inner ring */}
          <div style={{
            position: 'absolute', inset: '10%',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '8px',
          }} />
        </div>
      </div>

      {/* Shutter Controls */}
      <div style={{
        position: 'absolute', bottom: '13rem', left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '2rem', zIndex: 10,
      }}>
        {/* Thumbnail placeholder */}
        <div style={{
          width: '48px', height: '48px',
          backgroundColor: 'rgba(255,255,255,0.15)',
          borderRadius: '10px',
          border: '2px solid rgba(255,255,255,0.3)',
          backdropFilter: 'blur(4px)',
        }} />

        <div style={{ position: 'relative' }}>
          <button style={{
            width: '72px', height: '72px',
            borderRadius: '50%',
            backgroundColor: 'transparent',
            border: '4px solid white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 0 2px rgba(255,255,255,0.3)',
          }}>
            <div style={{
              width: '52px', height: '52px',
              backgroundColor: 'white',
              borderRadius: '50%',
            }} />
          </button>
          {/* Native Camera Fallback */}
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            title="Use System Camera"
            style={{
              position: 'absolute', inset: 0, 
              width: '100%', height: '100%', 
              opacity: 0, cursor: 'pointer',
              zIndex: 20
            }}
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                const imgUrl = URL.createObjectURL(e.target.files[0]);
                setCapturedImg(imgUrl);
                setAnalyzing(true);
                setTimeout(() => setAnalyzing(false), 2000);
              }
            }}
          />
        </div>

        {/* Flip camera */}
        <button
          onClick={flipCamera}
          style={{
            width: '48px', height: '48px',
            backgroundColor: 'rgba(255,255,255,0.15)',
            borderRadius: '10px',
            border: '2px solid rgba(255,255,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)',
          }}
        >
          <RefreshCcw size={20} color="white" />
        </button>
      </div>

      {/* Bottom Info Card */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.25rem', zIndex: 10 }}>
        <Card style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                backgroundColor: 'rgba(0, 35, 102, 0.08)',
                width: '32px', height: '32px',
                borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Info size={16} color="var(--color-primary)" />
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>
                Capture Best Results
              </div>
            </div>
            <button style={{
              fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em',
              color: 'var(--color-primary)', textTransform: 'uppercase',
            }}>
              Recent Scans →
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{
              flex: 1,
              backgroundColor: 'var(--color-background)',
              borderRadius: '10px', padding: '0.75rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <Zap size={14} color="var(--color-tertiary)" />
              <p style={{ fontSize: '0.7rem', margin: 0, lineHeight: 1.3, color: 'var(--color-text-light)' }}>
                Ensure even,<br />natural lighting
              </p>
            </div>
            <div style={{
              flex: 1,
              backgroundColor: 'var(--color-background)',
              borderRadius: '10px', padding: '0.75rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <Maximize size={14} color="var(--color-primary)" />
              <p style={{ fontSize: '0.7rem', margin: 0, lineHeight: 1.3, color: 'var(--color-text-light)' }}>
                Hold camera<br />steady for 2s
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
