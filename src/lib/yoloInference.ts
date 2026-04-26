import * as ort from 'onnxruntime-web';

// ── Class labels (16 classes) ────────────────────────────────────────────────
export const CLASS_NAMES: readonly string[] = [
  'Kena',
  'Lavhala',
  'Lamber Quarter Plant',
  'Little Mallow',
  'Moti Dudhi',
  'Obscure Morning Glory',
  'Asian Pigeonwings',
  'Bilayat',
  'Choti Dudhi',
  'Digitaria SP',
  'Gajar Gavat',
  'Graceful Sandmart',
  'Sicklepod',
  'Harali',
  'Dwarf Cassia',
  'Punarnava',
] as const;

// ── Thresholds ────────────────────────────────────────────────────────────────
/**
 * Raw candidate threshold for NMS  – keep more candidates so tight groups
 * are deduped correctly even for low-confidence boxes.
 */
const RAW_CONF_THRESHOLD = 0.20;

/**
 * Display threshold – boxes below this are labelled "Unidentified".
 * Per user request: 0.35
 */
export const DISPLAY_THRESHOLD = 0.35;

/** IoU overlap threshold used in Non-Maximum Suppression */
const IOU_THRESHOLD = 0.45;

// ── Model constants ───────────────────────────────────────────────────────────
const INPUT_SIZE = 640;
const NUM_ANCHORS = 8400;
const NUM_CLASSES = CLASS_NAMES.length; // 16

// ── Types ─────────────────────────────────────────────────────────────────────
export interface Detection {
  /** Human-readable label shown in UI ("Kena", "Unidentified", …) */
  label: string;
  /** What the model actually predicted (always a class name) */
  rawLabel: string;
  /** Confidence score 0-1 */
  confidence: number;
  /** Bounding box in ORIGINAL image pixel coordinates */
  bbox: { x1: number; y1: number; x2: number; y2: number };
}

// ── Session singleton ─────────────────────────────────────────────────────────
let _session: ort.InferenceSession | null = null;
let _sessionPromise: Promise<ort.InferenceSession> | null = null;

/**
 * Loads and caches the ONNX model.
 * Safe to call multiple times – only loads once.
 */
export async function loadModel(): Promise<void> {
  if (_session) return;
  if (_sessionPromise) {
    await _sessionPromise;
    return;
  }

  // ── WASM configuration ────────────────────────────────────────────────────
  // Use CDN-hosted WASM files pinned to the exact installed version.
  // This avoids Vite hashing/renaming the local files, which breaks ORT's
  // internal fetch() calls. CDN works in Capacitor WebView (https scheme).
  const ORT_VERSION = '1.24.3';
  ort.env.wasm.wasmPaths =
    `https://cdn.jsdelivr.net/npm/onnxruntime-web@${ORT_VERSION}/dist/`;

  // Single-threaded required for Android WebView:
  // SharedArrayBuffer (needed for multi-threading) is blocked without
  // Cross-Origin-Isolation headers that Capacitor doesn't set by default.
  ort.env.wasm.numThreads = 1;

  _sessionPromise = ort.InferenceSession.create('/models/best.onnx', {
    executionProviders: ['wasm'],
    graphOptimizationLevel: 'all',
  });

  _session = await _sessionPromise;
}

// ── Pre-processing ────────────────────────────────────────────────────────────
interface LetterboxResult {
  tensor: Float32Array;
  scale: number;
  padX: number;
  padY: number;
}

/**
 * Resize a canvas frame to 640×640 with grey letterbox padding,
 * then convert to a CHW Float32Array normalised to [0, 1].
 */
function letterboxPreprocess(src: HTMLCanvasElement): LetterboxResult {
  const W = src.width;
  const H = src.height;
  const scale = Math.min(INPUT_SIZE / W, INPUT_SIZE / H);
  const scaledW = Math.round(W * scale);
  const scaledH = Math.round(H * scale);
  const padX = Math.floor((INPUT_SIZE - scaledW) / 2);
  const padY = Math.floor((INPUT_SIZE - scaledH) / 2);

  // Build the letterboxed 640×640 canvas
  const lb = document.createElement('canvas');
  lb.width = INPUT_SIZE;
  lb.height = INPUT_SIZE;
  const ctx = lb.getContext('2d')!;
  ctx.fillStyle = 'rgb(114,114,114)'; // COCO grey
  ctx.fillRect(0, 0, INPUT_SIZE, INPUT_SIZE);
  ctx.drawImage(src, padX, padY, scaledW, scaledH);

  // Convert to CHW Float32
  const { data } = ctx.getImageData(0, 0, INPUT_SIZE, INPUT_SIZE);
  const N = INPUT_SIZE * INPUT_SIZE;
  const tensor = new Float32Array(3 * N);
  for (let i = 0; i < N; i++) {
    tensor[i]         = data[i * 4]     / 255; // R plane
    tensor[N + i]     = data[i * 4 + 1] / 255; // G plane
    tensor[2 * N + i] = data[i * 4 + 2] / 255; // B plane
  }
  return { tensor, scale, padX, padY };
}

// ── NMS ───────────────────────────────────────────────────────────────────────
function computeIoU(a: Detection['bbox'], b: Detection['bbox']): number {
  const ix1 = Math.max(a.x1, b.x1);
  const iy1 = Math.max(a.y1, b.y1);
  const ix2 = Math.min(a.x2, b.x2);
  const iy2 = Math.min(a.y2, b.y2);
  const inter = Math.max(0, ix2 - ix1) * Math.max(0, iy2 - iy1);
  const areaA = (a.x2 - a.x1) * (a.y2 - a.y1);
  const areaB = (b.x2 - b.x1) * (b.y2 - b.y1);
  return inter / (areaA + areaB - inter + 1e-6);
}

function applyNMS(candidates: Detection[]): Detection[] {
  const sorted = [...candidates].sort((a, b) => b.confidence - a.confidence);
  const keep: Detection[] = [];
  const suppressed = new Uint8Array(sorted.length);

  for (let i = 0; i < sorted.length; i++) {
    if (suppressed[i]) continue;
    keep.push(sorted[i]);
    for (let j = i + 1; j < sorted.length; j++) {
      if (!suppressed[j] && computeIoU(sorted[i].bbox, sorted[j].bbox) > IOU_THRESHOLD) {
        suppressed[j] = 1;
      }
    }
  }
  return keep;
}

// ── Main inference function ───────────────────────────────────────────────────
/**
 * Run YOLO on a captured frame canvas.
 *
 * @param src  HTMLCanvasElement containing the captured photo at full resolution
 * @returns    Array of Detection objects (sorted by confidence, deduplicated via NMS)
 *             Detections with confidence < DISPLAY_THRESHOLD have label = "Unidentified"
 */
export async function runYOLO(src: HTMLCanvasElement): Promise<Detection[]> {
  if (!_session) await loadModel();
  const sess = _session!;

  const origW = src.width;
  const origH = src.height;

  // 1. Pre-process
  const { tensor, scale, padX, padY } = letterboxPreprocess(src);

  // 2. Build input tensor
  const inputName = sess.inputNames[0]; // usually "images"
  const feeds: Record<string, ort.Tensor> = {
    [inputName]: new ort.Tensor('float32', tensor, [1, 3, INPUT_SIZE, INPUT_SIZE]),
  };

  // 3. Run inference
  const results = await sess.run(feeds);
  const outputName = sess.outputNames[0]; // usually "output0"
  const raw = results[outputName].data as Float32Array;

  // 4. Parse output  [1, 20, 8400] → flat layout: row-major over 20×8400
  //    raw[(row) * NUM_ANCHORS + anchor_idx]
  const candidates: Detection[] = [];

  for (let a = 0; a < NUM_ANCHORS; a++) {
    // Find the best class score for this anchor
    let maxScore = 0;
    let maxCls = 0;
    for (let c = 0; c < NUM_CLASSES; c++) {
      const s = raw[(4 + c) * NUM_ANCHORS + a];
      if (s > maxScore) { maxScore = s; maxCls = c; }
    }

    // Filter low-confidence anchors early
    if (maxScore < RAW_CONF_THRESHOLD) continue;

    // Box coords (cx, cy, w, h) in 640-px letterbox space
    const cx = raw[0 * NUM_ANCHORS + a];
    const cy = raw[1 * NUM_ANCHORS + a];
    const bw = raw[2 * NUM_ANCHORS + a];
    const bh = raw[3 * NUM_ANCHORS + a];

    // Un-letterbox → original image pixel coords
    const x1 = Math.max(0,     Math.round((cx - bw / 2 - padX) / scale));
    const y1 = Math.max(0,     Math.round((cy - bh / 2 - padY) / scale));
    const x2 = Math.min(origW, Math.round((cx + bw / 2 - padX) / scale));
    const y2 = Math.min(origH, Math.round((cy + bh / 2 - padY) / scale));

    // Skip degenerate boxes
    if (x2 <= x1 || y2 <= y1) continue;

    const rawLabel = CLASS_NAMES[maxCls] as string;
    const label = maxScore >= DISPLAY_THRESHOLD ? rawLabel : 'Unidentified';

    candidates.push({ label, rawLabel, confidence: maxScore, bbox: { x1, y1, x2, y2 } });
  }

  // 5. Non-Maximum Suppression
  return applyNMS(candidates);
}
