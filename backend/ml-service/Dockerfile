FROM python:3.11-slim

WORKDIR /app

# libgl1/libglib2.0-0 are needed by opencv (a transitive ultralytics dependency)
# even though we never import cv2 directly in this service.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libgl1 \
        libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY models ./models


# Render sets $PORT at runtime - never hardcode 8000/8001 in the CMD.
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8001}"]
