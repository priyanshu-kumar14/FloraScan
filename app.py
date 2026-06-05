"""
FloraScan — Flask API server for plant disease detection.
Serves the frontend SPA and exposes POST /api/predict.
"""

import os
import csv
import json
import io
import base64
import numpy as np
import cv2
import tensorflow as tf
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from flask import Flask, request, jsonify, send_from_directory

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "plant_disease_model.h5")
CLASSES_PATH = os.path.join(BASE_DIR, "classes.json")
CSV_PATH = os.path.join(BASE_DIR, "disease_solution.csv")
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")

# ---------------------------------------------------------------------------
# Load model & class names
# ---------------------------------------------------------------------------
print("🌿 Loading TensorFlow model…")
model = tf.keras.models.load_model(MODEL_PATH)
print("✅ Model loaded")

with open(CLASSES_PATH) as f:
    class_indices = json.load(f)
class_names = list(class_indices.keys())

# ---------------------------------------------------------------------------
# Load disease solutions from CSV
# ---------------------------------------------------------------------------
DEFAULT_SOLUTION = {
    "common_name": "Unknown Class",
    "cause": "Information missing.",
    "symptoms": "No data available",
    "treatment": "No data available",
    "prevention": "No data available",
}


def _normalize(key):
    if not isinstance(key, str):
        return ""
    k = key.strip().lower().replace(" ", "_").replace("-", "_").replace(".", "")
    k = k.replace("___", "_")
    return "_".join(part for part in k.split("_") if part)


def _load_solutions(csv_path):
    solutions = {}
    if not os.path.exists(csv_path):
        return solutions
    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            key = (row.get("class_name") or row.get("class") or "").strip()
            if not key:
                continue
            entry = {
                "common_name": row.get("common_name", "").strip(),
                "cause": row.get("cause", "").strip(),
                "symptoms": row.get("symptoms", "").strip(),
                "treatment": row.get("treatment", "").strip(),
                "prevention": row.get("prevention", "").strip(),
            }
            solutions[key] = entry
            norm = _normalize(key)
            if norm and norm not in solutions:
                solutions[norm] = entry
    return solutions


disease_solutions = _load_solutions(CSV_PATH)


def get_solution(class_name):
    if class_name in disease_solutions:
        return disease_solutions[class_name]
    norm = _normalize(class_name)
    if norm in disease_solutions:
        return disease_solutions[norm]
    # Partial match fallback
    for k, v in disease_solutions.items():
        if norm and norm in _normalize(k):
            return v
    return DEFAULT_SOLUTION


# ---------------------------------------------------------------------------
# Prediction helper
# ---------------------------------------------------------------------------
def predict_image(img_bytes):
    """Accept raw image bytes, return (class_name, confidence, solution)."""
    arr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Could not decode image")

    img_resized = cv2.resize(img, (224, 224))
    img_float = np.array(img_resized, dtype=np.float32)
    img_preprocessed = preprocess_input(img_float)
    img_batch = np.expand_dims(img_preprocessed, axis=0)

    preds = model.predict(img_batch, verbose=0)
    idx = int(np.argmax(preds))
    confidence = float(preds[0][idx])
    class_name = class_names[idx]
    solution = get_solution(class_name)

    return class_name, confidence, solution


# ---------------------------------------------------------------------------
# Flask app
# ---------------------------------------------------------------------------
app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path="")


@app.route("/")
def index():
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.route("/<path:path>")
def static_files(path):
    return send_from_directory(FRONTEND_DIR, path)


@app.route("/api/predict", methods=["POST"])
def api_predict():
    """Accept multipart file upload or base64 JSON payload."""
    try:
        # Multipart file upload
        if "file" in request.files:
            file = request.files["file"]
            img_bytes = file.read()
        # Base64 JSON payload
        elif request.is_json:
            data = request.get_json()
            b64 = data.get("image", "")
            # Strip data-url header if present
            if "," in b64:
                b64 = b64.split(",", 1)[1]
            img_bytes = base64.b64decode(b64)
        else:
            return jsonify({"error": "No image provided"}), 400

        class_name, confidence, solution = predict_image(img_bytes)

        # Determine health status
        is_healthy = "healthy" in class_name.lower()

        return jsonify({
            "class_name": class_name,
            "confidence": round(confidence * 100, 1),
            "is_healthy": is_healthy,
            "solution": solution,
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/classes", methods=["GET"])
def api_classes():
    """Return list of supported classes."""
    return jsonify({"classes": class_names})


# ---------------------------------------------------------------------------
if __name__ == "__main__":
    print("🌱 Starting FloraScan server at http://localhost:5000")
    app.run(host="0.0.0.0", port=5000, debug=True)
