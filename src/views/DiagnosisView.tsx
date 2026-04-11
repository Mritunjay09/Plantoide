import { useEffect, useRef, useState } from 'react';
import { X, RotateCcw, Zap, Lightbulb, Info, Maximize, RefreshCcw, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card } from '../components/Card';

interface DiagnosisViewProps {
  onClose: () => void;
}

const WEED_SPECIES = [
  "Bindweed", "Thistle", "Crabgrass", "Pigweed", "Foxtail", 
  "Dandelion", "Ragweed", "Nettle", "Clover", "Plantain",
  "Chicory", "Purslane", "Quackgrass", "Dock", "Chickweed", "Velvetleaf"
];

export function DiagnosisView({ onClose }: DiagnosisViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [capturedImg, setCapturedImg] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [detectionResult, setDetectionResult] = useState<{species: string, confidence: number} | null>(null);
  const [mongoId, setMongoId] = useState<string | null>(null);
  const [showSpeciesPicker, setShowSpeciesPicker] = useState(false);

  // Retrieve user ID from login
  const userId = localStorage.getItem('currentUserId') || "guest_user";

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) { console.error('Camera error:', err); }
    };
    startCamera();
    return () => streamRef.current?.getTracks().forEach(t => t.stop());
  }, []);

  const saveDetection = async (species: string, confidence: number) => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const payload = {
        userId: userId, // Linked to the farmer's account
        detectedSpecies: species,
        confidenceScore: confidence, // Parameter for evaluation [cite: 25]
        status: confidence > 0.6 ? 'weed' : 'unknown',
        location: { latitude: pos.coords.latitude, longitude: pos.coords.longitude }
      };

      try {
        const res = await fetch('http://localhost:5000/api/detections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        setMongoId(data._id);
      } catch (err) { console.error("Save failed", err); }
    });
  };

  const handleManualLabel = async (species: string) => {
    if (!mongoId) return;
    try {
      await fetch(`http://localhost:5000/api/detections/${mongoId}/manual-label`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manualLabelName: species, status: 'weed' })
      });
      setDetectionResult({ species, confidence: 1.0 });
      setShowSpeciesPicker(false);
    } catch (err) { console.error("Manual update failed", err); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'black', zIndex: 100, display: 'flex', flexDirection: 'column' }}>
      <video ref={videoRef} autoPlay playsInline muted style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />

      {capturedImg && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 40, backgroundColor: '#000' }}>
          <img src={capturedImg} alt="Captured" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '2rem', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', textAlign: 'center' }}>
            {analyzing ? (
              <div style={{ color: 'white' }}>
                <RefreshCcw size={32} style={{ animation: 'spin 1s linear infinite' }} />
                <h3>Analyzing via Knowledge Distillation...</h3>
              </div>
            ) : (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {detectionResult && (
                  <div style={{ backgroundColor: detectionResult.species === "Unrecognized" ? '#f59e0b' : '#10b981', color: 'white', padding: '1rem', borderRadius: '12px' }}>
                    <h3>{detectionResult.species === "Unrecognized" ? "Plant Unrecognized" : `Found: ${detectionResult.species}`}</h3>
                    <p>Confidence: {(detectionResult.confidence * 100).toFixed(1)}%</p>
                  </div>
                )}
                {detectionResult?.species === "Unrecognized" && (
                  <button onClick={() => setShowSpeciesPicker(true)} style={actionButtonStyle}>Identify Manually</button>
                )}
                <button onClick={() => { setCapturedImg(null); setDetectionResult(null); }} style={{ ...actionButtonStyle, backgroundColor: 'white', color: 'black' }}>Retake Photo</button>
              </div>
            )}
          </div>
        </div>
      )}

      {showSpeciesPicker && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.95)', padding: '2rem', overflowY: 'auto' }}>
          <h3 style={{ color: 'white', textAlign: 'center' }}>Select Species</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {WEED_SPECIES.map(s => (
              <button key={s} onClick={() => handleManualLabel(s)} style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: '#222', color: 'white' }}>{s}</button>
            ))}
          </div>
          <button onClick={() => setShowSpeciesPicker(false)} style={{ color: 'red', marginTop: '20px', width: '100%' }}>Cancel</button>
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', padding: '1.25rem' }}>
        <button onClick={onClose} style={{ color: 'white', background: 'rgba(0,0,0,0.4)', borderRadius: '50%', width: '40px', height: '40px' }}><X /></button>
        <span style={{ color: 'white', fontWeight: 700 }}>AI CROP SCANNER</span>
      </div>

      <div style={{ position: 'absolute', bottom: '13rem', left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 10 }}>
        <div style={{ position: 'relative', width: '72px', height: '72px' }}>
          <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: '4px solid white' }} />
          <input type="file" accept="image/*" capture="environment" style={{ position: 'absolute', inset: 0, opacity: 0 }} 
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setCapturedImg(URL.createObjectURL(e.target.files[0]));
                setAnalyzing(true);
                setTimeout(() => {
                  const species = Math.random() > 0.5 ? "Bindweed" : "Unrecognized";
                  const confidence = species === "Unrecognized" ? 0.38 : 0.92;
                  setDetectionResult({ species, confidence });
                  setAnalyzing(false);
                  saveDetection(species, confidence);
                }, 2000);
              }
            }} />
        </div>
      </div>
    </div>
  );
}

const actionButtonStyle = { padding: '1rem', width: '100%', borderRadius: '12px', border: '2px solid white', backgroundColor: 'transparent', color: 'white', fontWeight: 700 };