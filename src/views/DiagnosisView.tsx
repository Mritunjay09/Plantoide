import { useEffect, useRef, useState } from 'react';
import { X, RefreshCcw, Maximize } from 'lucide-react';

export function DiagnosisView({ onClose }: { onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [capturedImg, setCapturedImg] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      });
    return () => streamRef.current?.getTracks().forEach(t => t.stop());
  }, []);

  const scan = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      ctx?.drawImage(videoRef.current, 0, 0);
      setCapturedImg(canvasRef.current.toDataURL('image/jpeg'));
      setAnalyzing(true);
      
      // Simulate Deep Learning Analysis
      setTimeout(() => {
        setResult({ species: "Field Bindweed", conf: 94.2 });
        setAnalyzing(false);
      }, 2500);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'black', zIndex: 100 }}>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } } .spin { animation: spin 1s linear infinite; }`}</style>
      <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      <div style={{ position: 'absolute', top: 20, left: 20, right: 20, display: 'flex', justifyContent: 'space-between', zIndex: 110 }}>
        <button onClick={onClose} style={{ background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', padding: '10px', borderRadius: '50%' }}><X /></button>
        <span style={{ color: 'white', fontWeight: 800, textShadow: '0 2px 4px black' }}>AI CROP SCANNER</span>
        <div style={{ width: 40 }} />
      </div>

      {!capturedImg && (
        <button onClick={scan} style={{ position: 'absolute', bottom: 50, left: '50%', transform: 'translateX(-50%)', width: 70, height: 70, borderRadius: '50%', border: '5px solid white', background: 'rgba(255,255,255,0.2)' }} />
      )}

      {capturedImg && (
        <div style={{ position: 'absolute', inset: 0, background: 'black', display: 'flex', flexDirection: 'column' }}>
          <img src={capturedImg} style={{ flex: 1, objectFit: 'contain' }} />
          <div style={{ padding: '2rem', background: 'linear-gradient(transparent, black)', textAlign: 'center' }}>
            {analyzing ? (
              <div style={{ color: 'white' }}>
                <RefreshCcw size={40} className="spin" color="#10b981" />
                <h3 style={{ marginTop: '1rem' }}>Neural Analysis in Progress...</h3>
              </div>
            ) : (
              <div style={{ backgroundColor: '#10b981', color: 'white', padding: '1.5rem', borderRadius: '16px' }}>
                <h2 style={{ margin: 0 }}>{result?.species}</h2>
                <p>Confidence: {result?.conf}%</p>
                <button onClick={() => setCapturedImg(null)} style={{ marginTop: '1rem', width: '100%', padding: '0.8rem', borderRadius: '10px', border: 'none', fontWeight: 700 }}>Scan Again</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}