from pathlib import Path
from ultralytics import YOLO

MODEL_IN  = Path(__file__).parent / "best.pt"
MODEL_OUT = Path(__file__).parent / "best.onnx"
COPY_TO   = Path(__file__).parent.parent / "public" / "models" / "best.onnx"

if not MODEL_IN.exists():
    raise FileNotFoundError(
        f"Cannot find {MODEL_IN}\n"
        "Make sure best.pt is in the weed-detection-backend/ folder."
    )

print(f"[1/3] Loading {MODEL_IN} ...")
model = YOLO(str(MODEL_IN))

print("[2/3] Exporting to ONNX (imgsz=640, opset=12, simplify=True) ...")
model.export(
    format="onnx",
    imgsz=640,
    opset=12,
    simplify=True,
    dynamic=False,
)

# ultralytics writes best.onnx next to best.pt
exported = MODEL_IN.with_suffix(".onnx")
if not exported.exists():
    raise RuntimeError("Export finished but best.onnx was not found. Check ultralytics output above.")

print(f"[3/3] Copying to {COPY_TO} ...")
COPY_TO.parent.mkdir(parents=True, exist_ok=True)
import shutil
shutil.copy2(exported, COPY_TO)

print()
print("✅ Done! best.onnx is ready at:")
print(f"   {COPY_TO}")
print()
print("Now rebuild the app:  npm run build && npx cap sync")
