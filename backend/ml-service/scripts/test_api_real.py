import os
import sys

# Ensure ml-service root is first in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app


def test_api():
    print("Testing ML Service FastAPI Application...")
    with TestClient(app) as client:
        # 1. Health check
        h_res = client.get("/health")
        print(f"Health response [{h_res.status_code}]: {h_res.json()}")
        assert h_res.status_code == 200
        assert h_res.json() == {"status": "ok"}

        # 2. Real inference check
        test_url = "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80"
        print(f"Sending real test image URL to POST /detect: {test_url}")
        d_res = client.post("/detect", json={"image_url": test_url})
        print(f"Detect response [{d_res.status_code}]: {d_res.json()}")
        assert d_res.status_code == 200
        data = d_res.json()
        assert "detections" in data
        assert len(data["detections"]) > 0

        for i, det in enumerate(data["detections"]):
            cat = det["category"]
            conf = det["confidence"]
            bbox = det["bounding_box"]
            print(f"\nDetection #{i+1}:")
            print(f"  Category    : {cat}")
            print(f"  Confidence  : {conf:.4f}")
            print(f"  Bounding Box: {bbox}")

            # Verify it is NOT the dummy fallback
            is_dummy_payload = (conf == 0.88 and bbox == [10.0, 20.0, 100.0, 120.0])
            assert not is_dummy_payload, "ERROR: Endpoint returned the dummy fallback detection!"

        print("\n>>> REAL ML API INFERENCE VERIFIED 100% SUCCESSFUL! <<<")

if __name__ == "__main__":
    test_api()
