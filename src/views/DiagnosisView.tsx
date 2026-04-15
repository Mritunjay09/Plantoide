import { useEffect, useRef, useState } from 'react';
import { X, RotateCcw, Zap, Lightbulb, Info, Maximize, RefreshCcw, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card } from '../components/Card';

const API_BASE_URL = "https://plantoide-backend.onrender.com";

interface DiagnosisViewProps {
  onClose: () => void;
}

export function DiagnosisView({ onClose }: DiagnosisViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null); // Hidden canvas for snapshots
  
  const [capturedImg, setCapturedImg] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [detectionResult, setDetectionResult] = useState<{species: string, confidence: number} | null>(null);
  
  const userId = localStorage.getItem('currentUserId') || "guest_user";

  // 1. Start Camera Feed Automatically
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }, 
          audio: false 
        });
        
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Force play to prevent that "Play Icon" placeholder
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(e => console.log("Auto-play blocked", e));
          };
        }
      } catch (err) {
        alert("Camera error: Please ensure you have granted camera permissions.");
      }
    };
    startCamera();
    return () => streamRef.current?.getTracks().forEach(t => t.stop());
  }, []);

  // 2. Capture Snapshot from Video Feed (Stay inside app)
  const takeSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImg(dataUrl);
        processImage(dataUrl);
      }
    }
  };

  const processImage = (imgData: string) => {
    setAnalyzing(true);
    // Simulating AI Processing
    setTimeout(() => {
      const species = Math.random() > 0.5 ? "Bindweed" : "Unrecognized";
      const confidence = species === "Unrecognized" ? 0.38 : 0.92;
      setDetectionResult({ species, confidence });
      setAnalyzing(false);
      saveDetection(species, confidence);
    }, 2000);
  };

  const saveDetection = async (species: string, confidence: number) => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const payload = {
        userId,
        detectedSpecies: species,
        confidenceScore: confidence,
        status: confidence > 0.6 ? 'weed' : 'unknown',
        location: { latitude: pos.coords.latitude, longitude: pos.coords.longitude }
      };
      try {
        await fetch(`${API_BASE_URL}/api/detections`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (err) { console.error("Cloud save failed:", err); }
    });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'black', zIndex: 100, display: 'flex', flexDirection: 'column' }}>
      {/* THE LIVE FEED */}
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} 
      />
      
      {/* HIDDEN CANVAS FOR TAKING THE PHOTO */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', padding: '1.25rem' }}>
        <button onClick={onClose} style={{ color: 'white', background: 'rgba(0,0,0,0.4)', borderRadius: '50%', width: '40px', height: '40px', border: 'none' }}><X /></button>
        <span style={{ color: 'white', fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>AI CROP SCANNER</span>
        <button style={{ color: 'white', background: 'rgba(0,0,0,0.4)', borderRadius: '50%', width: '40px', height: '40px', border: 'none' }}><RotateCcw /></button>
      </div>

      {/* Captured Image Overlay (Shown after clicking) */}
      {capturedImg && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 40, backgroundColor: '#000' }}>
          <img src={capturedImg} alt="Captured" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '2rem', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', textAlign: 'center' }}>
            {analyzing ? (
              <div style={{ color: 'white' }}>
                <RefreshCcw size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: '10px' }} />
                <h3>Analyzing Crop Health...</h3>
              </div>
            ) : (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {detectionResult && (
                  <div style={{ backgroundColor: detectionResult.species === "Unrecognized" ? '#f59e0b' : '#10b981', color: 'white', padding: '1rem', borderRadius: '12px' }}>
                    <h3>{detectionResult.species}</h3>
                    <p>Confidence: {(detectionResult.confidence * 100).toFixed(1)}%</p>
                  </div>
                )}
                <button onClick={() => { setCapturedImg(null); setDetectionResult(null); }} style={{ padding: '1rem', borderRadius: '12px', border: 'none', background: 'white', fontWeight: 700 }}>Scan Another</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FIXED SHUTTER BUTTON: DIRECTLY TAKES SNAPSHOT */}
      {!capturedImg && (
        <div style={{ position: 'absolute', bottom: '5rem', left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 10 }}>
          <button 
            onClick={takeSnapshot}
            style={{ 
              width: '72px', height: '72px', 
              borderRadius: '50%', 
              border: '6px solid white', 
              backgroundColor: 'rgba(255,255,255,0.2)',
              cursor: 'pointer'
            }} 
          />
        </div>
      )}

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.25rem', zIndex: 10 }}>
        <Card style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Maximize size={16} color="green" />
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Real-time Neural Analysis</span>
          </div>
        </Card>
      </div>
    </div>
  );
}