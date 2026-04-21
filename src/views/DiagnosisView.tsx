import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, Leaf, ScanLine, X } from 'lucide-react';
import type { Detection } from '../lib/yoloInference';
import { DISPLAY_THRESHOLD, loadModel, runYOLO } from '../lib/yoloInference';

// ─── Props ────────────────────────────────────────────────────────────────────
interface DiagnosisViewProps {
  onClose: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const API_BASE_URL = 'https://plantoide-backend.onrender.com';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Maps video-pixel coordinates to display coordinates when objectFit: cover. */
function coverTransform(cW: number, cH: number, vW: number, vH: number) {
  const scale = Math.max(cW / vW, cH / vH);
  return { scale, ox: (cW - vW * scale) / 2, oy: (cH - vH * scale) / 2 };
}

/** Draw YOLO detections on an overlay canvas that sits above a cover-fitted video. */
function paintDetections(
  canvas: HTMLCanvasElement,
  dets: Detection[],
  videoW: number,
  videoH: number,
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!dets.length || !videoW) return;

  const { scale, ox, oy } = coverTransform(canvas.width, canvas.height, videoW, videoH);

  for (const det of dets) {
    const ok    = det.label !== 'Unidentified';
    const color = ok ? '#22c55e' : '#f59e0b';
    const { x1, y1, x2, y2 } = det.bbox;

    const bx = ox + x1 * scale;
    const by = oy + y1 * scale;
    const bw = (x2 - x1) * scale;
    const bh = (y2 - y1) * scale;
    const cs = Math.min(bw, bh, 20);

    // Tinted fill
    ctx.fillStyle = ok ? 'rgba(34,197,94,0.07)' : 'rgba(245,158,11,0.07)';
    ctx.fillRect(bx, by, bw, bh);

    // Box outline
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, bw, bh);

    // Corner accents
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(bx,      by + cs);   ctx.lineTo(bx, by);           ctx.lineTo(bx + cs,      by);
    ctx.moveTo(bx+bw-cs, by);       ctx.lineTo(bx+bw, by);        ctx.lineTo(bx+bw,        by+cs);
    ctx.moveTo(bx+bw,   by+bh-cs); ctx.lineTo(bx+bw, by+bh);    ctx.lineTo(bx+bw-cs,     by+bh);
    ctx.moveTo(bx+cs,   by+bh);    ctx.lineTo(bx,    by+bh);     ctx.lineTo(bx,           by+bh-cs);
    ctx.stroke();

    // Label chip
    const txt = `${det.label}  ${(det.confidence * 100).toFixed(0)}%`;
    ctx.font = 'bold 12px "Public Sans", sans-serif';
    const tw   = ctx.measureText(txt).width + 12;
    const cy   = by > 28 ? by - 24 : by + bh + 4;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(bx, cy, tw, 22, 4);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillText(txt, bx + 6, cy + 15);
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
export function DiagnosisView({ onClose }: DiagnosisViewProps) {
  // DOM refs
  const videoRef   = useRef<HTMLVideoElement>(null);
  const snapRef    = useRef<HTMLCanvasElement>(null); // hidden – captures frame
  const overlayRef = useRef<HTMLCanvasElement>(null); // visible – draws boxes
  const streamRef  = useRef<MediaStream | null>(null);

  // Guard: prevents two inference calls running at once
  const busyRef    = useRef(false);
  // Tracks mount state so async callbacks don't call setState after unmount
  const mountedRef = useRef(true);
  // Latest detections stored in a ref for the ResizeObserver repaint (avoids stale closure)
  const detsRef    = useRef<Detection[]>([]);

  const [modelReady, setModelReady] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const [scanning,   setScanning]   = useState(false);
  const [detections, setDetections] = useState<Detection[]>([]);

  const userId = localStorage.getItem('currentUserId') ?? 'guest_user';

  // Keep detsRef in sync without triggering extra re-renders
  detsRef.current = detections;

  // ── Mount / unmount ────────────────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;

    // Load ONNX model
    loadModel()
      .then(() => { if (mountedRef.current) setModelReady(true); })
      .catch(() => {
        if (mountedRef.current)
          setModelError('Could not load AI model.\nEnsure best.onnx is in public/models/');
      });

    // Start camera
    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      .then((stream) => {
        if (!mountedRef.current) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        const vid = videoRef.current;
        if (vid) {
          vid.srcObject = stream;
          vid.onloadedmetadata = () => vid.play().catch(() => {});
        }
      })
      .catch(() => alert('Camera error: please grant camera permissions.'));

    return () => {
      mountedRef.current = false;
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []); // runs once on mount

  // ── Overlay canvas: resize + repaint whenever the element size changes ─────
  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      el.width  = el.clientWidth;
      el.height = el.clientHeight;
      const vid = videoRef.current;
      if (vid) paintDetections(el, detsRef.current, vid.videoWidth, vid.videoHeight);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []); // intentionally no deps; uses refs for fresh values

  // ── Scan ───────────────────────────────────────────────────────────────────
  const handleScan = useCallback(async () => {
    if (busyRef.current || !modelReady) return;

    const vid     = videoRef.current;
    const snap    = snapRef.current;
    const overlay = overlayRef.current;
    if (!vid || !snap || !overlay || vid.readyState < 2) return;

    busyRef.current = true;
    setScanning(true);
    // Clear previous results
    setDetections([]);
    detsRef.current = [];
    overlay.getContext('2d')?.clearRect(0, 0, overlay.width, overlay.height);

    try {
      // Capture the current video frame at full resolution
      snap.width  = vid.videoWidth;
      snap.height = vid.videoHeight;
      snap.getContext('2d')!.drawImage(vid, 0, 0);

      const dets = await runYOLO(snap);

      if (!mountedRef.current) return;

      setDetections(dets);
      paintDetections(overlay, dets, vid.videoWidth, vid.videoHeight);

      // Persist top detection to backend
      if (dets.length > 0) saveToBackend(dets[0]);
    } catch (err) {
      console.error('[DiagnosisView] Inference error:', err);
    } finally {
      busyRef.current = false;
      if (mountedRef.current) setScanning(false);
    }
  }, [modelReady]);

  const saveToBackend = (det: Detection) => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        await fetch(`${API_BASE_URL}/api/detections`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            detectedSpecies: det.rawLabel,
            confidenceScore: det.confidence,
            status: det.confidence >= DISPLAY_THRESHOLD ? 'weed' : 'unknown',
            location: { latitude: pos.coords.latitude, longitude: pos.coords.longitude },
          }),
        });
      } catch { /* offline – silently skip */ }
    });
  };

  // ── Derived state ──────────────────────────────────────────────────────────
  // Button is "ready" (green glow) only when model is loaded and not currently scanning
  const btnReady = modelReady && !scanning;

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{
      position: 'fixed', inset: 0,
      backgroundColor: '#000',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'var(--font-body, sans-serif)',
    }}>

      {/* ── Camera area (fills all space above the results strip) ─────────── */}
      <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>

        {/* Live video feed */}
        <video
          ref={videoRef}
          autoPlay playsInline muted
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {/* Bounding-box overlay (rendered on top of video, pointer-transparent) */}
        <canvas
          ref={overlayRef}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        />

        {/* Hidden frame-capture canvas */}
        <canvas ref={snapRef} style={{ display: 'none' }} />

        {/* ── Top bar ─────────────────────────────────────────────────────── */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 5,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: 'calc(env(safe-area-inset-top) + 0.75rem) 1rem 0.75rem',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)',
        }}>
          <button onClick={onClose} style={iconBtn}>
            <X size={20} />
          </button>

          <span style={{
            color: '#fff', fontWeight: 700,
            fontSize: '0.9rem', letterSpacing: '0.07em',
            textShadow: '0 1px 6px rgba(0,0,0,0.7)',
          }}>
            {scanning ? 'SCANNING…' : 'WEED SCANNER'}
          </span>

          {/* Spacer keeps title centred */}
          <div style={{ width: 40 }} />
        </div>

        {/* ── Model-load error ─────────────────────────────────────────────── */}
        {modelError && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 10,
            background: 'rgba(0,0,0,0.88)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: '1rem', padding: '2rem', textAlign: 'center',
          }}>
            <AlertTriangle size={48} color="#f59e0b" />
            <h3 style={{ color: '#fff', margin: 0 }}>Model Load Failed</h3>
            <pre style={{
              color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem',
              whiteSpace: 'pre-wrap', background: 'rgba(255,255,255,0.06)',
              padding: '0.75rem', borderRadius: '8px',
            }}>
              {modelError}
            </pre>
          </div>
        )}

        {/* ── Viewfinder brackets (idle state, no detections yet) ───────────── */}
        {!modelError && detections.length === 0 && !scanning && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            <div style={{ width: '60%', aspectRatio: '1', position: 'relative' }}>
              {(['tl', 'tr', 'bl', 'br'] as const).map((pos) => (
                <div key={pos} style={{
                  position: 'absolute', width: '20px', height: '20px',
                  borderColor: 'rgba(255,255,255,0.6)', borderStyle: 'solid', borderWidth: 0,
                  ...(pos === 'tl' ? { top: 0,    left: 0,  borderTopWidth: 3, borderLeftWidth: 3  } : {}),
                  ...(pos === 'tr' ? { top: 0,    right: 0, borderTopWidth: 3, borderRightWidth: 3 } : {}),
                  ...(pos === 'bl' ? { bottom: 0, left: 0,  borderBottomWidth: 3, borderLeftWidth: 3  } : {}),
                  ...(pos === 'br' ? { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 } : {}),
                }} />
              ))}
            </div>
          </div>
        )}

        {/* ── Scan button (bottom-centre of camera area) ───────────────────── */}
        <div style={{
          position: 'absolute', bottom: '1.5rem', left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 5,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.45rem',
        }}>
          <button
            onClick={handleScan}
            disabled={!btnReady}
            aria-label="Scan now"
            style={{
              width: '70px', height: '70px',
              borderRadius: '50%',
              border: '3px solid',
              // Green = ready, grey = loading model or currently scanning
              borderColor:     btnReady ? '#22c55e' : 'rgba(100,100,100,0.5)',
              backgroundColor: btnReady ? 'rgba(34,197,94,0.2)' : 'rgba(60,60,60,0.2)',
              backdropFilter: 'blur(8px)',
              boxShadow:  btnReady ? '0 0 20px rgba(34,197,94,0.45)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: btnReady ? 'pointer' : 'default',
              transition: 'border-color 0.3s, background-color 0.3s, box-shadow 0.3s',
            }}
          >
            {/* Spinner while scanning, scan icon otherwise */}
            {scanning
              ? <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  border: '3px solid rgba(120,120,120,0.5)',
                  borderTopColor: 'transparent',
                  animation: 'spin 0.75s linear infinite',
                }} />
              : <ScanLine size={28} color={btnReady ? '#22c55e' : 'rgba(110,110,110,0.7)'} />
            }
          </button>

          <span style={{
            fontSize: '0.68rem', letterSpacing: '0.06em',
            transition: 'color 0.3s',
            color: btnReady ? 'rgba(34,197,94,0.85)' : 'rgba(100,100,100,0.7)',
          }}>
            {scanning ? 'PROCESSING…' : !modelReady ? 'LOADING…' : 'SCAN NOW'}
          </span>
        </div>
      </div>

      {/* ── Results strip (fixed below camera, never overlaps image) ─────────── */}
      <div style={{
        flexShrink: 0,
        backgroundColor: 'rgba(8,8,8,0.97)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        minHeight: '80px',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.5rem)',
      }}>
        {detections.length === 0 ? (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '0.55rem', padding: '1.25rem 1rem',
            color: 'rgba(255,255,255,0.28)', fontSize: '0.85rem',
          }}>
            <Leaf size={15} />
            <span>
              {scanning ? 'Analysing frame…' : 'Tap Scan Now to detect weeds'}
            </span>
          </div>
        ) : (
          <div style={{
            display: 'flex', gap: '0.6rem',
            overflowX: 'auto', padding: '0.75rem 1rem',
            scrollbarWidth: 'none', // hide scrollbar in Firefox
          }}>
            {detections.map((det, i) => {
              const ok = det.label !== 'Unidentified';
              const c  = ok ? '#22c55e' : '#f59e0b';
              return (
                <div key={i} style={{
                  flexShrink: 0,
                  display: 'flex', flexDirection: 'column', gap: '0.2rem',
                  background: ok ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
                  border: `1.5px solid ${ok ? 'rgba(34,197,94,0.35)' : 'rgba(245,158,11,0.35)'}`,
                  borderRadius: '10px',
                  padding: '0.6rem 0.9rem',
                  minWidth: '115px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    {ok
                      ? <Leaf size={12} color={c} />
                      : <AlertTriangle size={12} color={c} />
                    }
                    <span style={{ color: c, fontWeight: 700, fontSize: '0.78rem' }}>
                      {(det.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.83rem', lineHeight: 1.25 }}>
                    {det.label}
                  </span>
                  {/* Show model's raw guess beneath "Unidentified" */}
                  {!ok && (
                    <span style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.7rem' }}>
                      ~{det.rawLabel}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Shared style object ──────────────────────────────────────────────────────
const iconBtn: React.CSSProperties = {
  width: '40px', height: '40px',
  borderRadius: '50%',
  background: 'rgba(0,0,0,0.45)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(255,255,255,0.15)',
  color: '#fff',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer',
  flexShrink: 0,
};