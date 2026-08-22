"""
Verification script for the real YOLO11s model weights.
Loads the model, downloads a real hazard image (or takes a local path), runs inference,
verifies bounding boxes & confidence scores, and saves the annotated prediction.
"""
import io
import os
import sys
from pathlib import Path

import httpx
from PIL import Image
from ultralytics import YOLO

# Sample hazard image URL
DEFAULT_TEST_IMAGE_URL = (
    "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80"
)
WEIGHTS_PATH = os.environ.get("YOLO_WEIGHTS_PATH", os.path.join(os.path.dirname(__file__), "..", "models", "best.pt"))
CONFIDENCE_THRESHOLD = float(os.environ.get("CONFIDENCE_THRESHOLD", "0.25"))
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "runs")


def verify():
    print("=" * 60)
    print("CivicGuard YOLO11s Model Real Inference Verification")
    print("=" * 60)

    weights_file = Path(WEIGHTS_PATH).resolve()
    if not weights_file.exists():
        print(f"FATAL: Weights file not found at {weights_file}")
        sys.exit(1)

    file_size = weights_file.stat().st_size
    print(f"Model Path: {weights_file}")
    print(f"Model File Size: {file_size} bytes ({file_size / (1024 * 1024):.2f} MB)")

    # 1. Load model
    print("\n[1] Loading YOLO model via Ultralytics...")
    model = YOLO(str(weights_file))
    print("YOLO model loaded successfully!")

    # 2. Inspect classes
    print("\n[2] Model Class Mapping (model.names):")
    for cls_id, cls_name in model.names.items():
        print(f"  Class {cls_id} -> '{cls_name}'")

    # 3. Load test image
    image_source = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_TEST_IMAGE_URL
    print(f"\n[3] Loading test image from: {image_source}")

    if image_source.startswith("http://") or image_source.startswith("https://"):
        res = httpx.get(image_source, timeout=20.0)
        res.raise_for_status()
        img = Image.open(io.BytesIO(res.content)).convert("RGB")
    else:
        img = Image.open(image_source).convert("RGB")

    width, height = img.size
    print(f"Image Dimensions: {width} x {height} (Width x Height)")

    # 4. Run inference
    print(f"\n[4] Running inference (conf threshold = {CONFIDENCE_THRESHOLD})...")
    results = model.predict(source=img, conf=CONFIDENCE_THRESHOLD, verbose=False)

    if not results or results[0].boxes is None or len(results[0].boxes) == 0:
        print("No detections found above threshold.")
        return

    boxes = results[0].boxes
    num_detections = len(boxes)
    print(f"Produced {num_detections} detection(s):")

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    all_valid = True

    for i, box in enumerate(boxes):
        cls_id = int(box.cls.item())
        cls_name = model.names.get(cls_id, f"unknown_{cls_id}")
        conf = float(box.conf.item())
        xyxy = [float(v) for v in box.xyxy[0].tolist()]
        x1, y1, x2, y2 = xyxy

        print(f"\n--- Detection #{i + 1} ---")
        print(f"  Class ID   : {cls_id}")
        print(f"  Class Name : {cls_name}")
        print(f"  Confidence : {conf:.4f}")
        print(f"  BoundingBox: [x1={x1:.2f}, y1={y1:.2f}, x2={x2:.2f}, y2={y2:.2f}]")

        # Verify confidence
        if not (0.0 <= conf <= 1.0):
            print(f"  [ERROR] Confidence {conf} out of range [0.0, 1.0]!")
            all_valid = False
        else:
            print("  [OK] Confidence range valid.")

        # Verify bounding box
        if not (0 <= x1 < x2 <= width and 0 <= y1 < y2 <= height):
            print(f"  [ERROR] Bounding box [{x1}, {y1}, {x2}, {y2}] exceeds image dimensions ({width}x{height})!")
            all_valid = False
        else:
            print("  [OK] Bounding box coordinate geometry valid.")

    # 5. Save annotated image
    annotated_img_arr = results[0].plot()
    annotated_img = Image.fromarray(annotated_img_arr)
    output_path = os.path.join(OUTPUT_DIR, "verified_inference.jpg")
    annotated_img.save(output_path)
    print(f"\n[5] Saved annotated verification image to: {os.path.abspath(output_path)}")

    if all_valid:
        print("\nAll detections verified successfully!")
    else:
        print("\nSome validations failed!")
        sys.exit(1)


if __name__ == "__main__":
    verify()
