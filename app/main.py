"""
app/main.py
───────────
FastAPI backend for the Fake Review Detector.

Start the server:
    uvicorn app.main:app --reload --port 8000

From the project root, or:
    cd fake-review-detector/
    uvicorn app.main:app --reload
"""

import os
import sys
import json

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Allow imports from src/
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))
from preprocess import clean_text
from features   import add_numeric_features, NUMERIC_FEATURES

# ── Paths ────────────────────────────────────────────────────
ROOT_DIR     = os.path.join(os.path.dirname(__file__), "..")
MODEL_PATH   = os.path.join(ROOT_DIR, "models", "best_model.pkl")
METRICS_PATH = os.path.join(ROOT_DIR, "models", "metrics.json")

# ── Load model on startup ─────────────────────────────────────
if not os.path.exists(MODEL_PATH):
    raise RuntimeError(
        f"Model not found at {MODEL_PATH}. "
        "Run 'python src/train.py' first to train and save the model."
    )

print(f"[ReviewGuard] Loading model from {MODEL_PATH} …")
MODEL = joblib.load(MODEL_PATH)
print("[ReviewGuard] Model loaded. Server ready.")

# ── Load cached metrics ────────────────────────────────────────
METRICS = {}
if os.path.exists(METRICS_PATH):
    with open(METRICS_PATH) as f:
        METRICS = json.load(f)

# ── FastAPI app ───────────────────────────────────────────────
app = FastAPI(
    title="ReviewGuard API",
    description="Fake product review detection using classical ML.",
    version="1.0.0",
)

# CORS — allow the React dev server (port 5173) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request / Response schemas ────────────────────────────────
class PredictRequest(BaseModel):
    review: str  = Field(..., min_length=5,  example="Absolutely amazing product! Works perfectly.")
    rating: float = Field(default=3.0, ge=1, le=5, example=5.0)


class PredictResponse(BaseModel):
    label:      str   # "Fake" or "Real"
    confidence: float # probability of the predicted class
    fake_prob:  float # always the probability of being Fake


# ── Helper: build a single-row DataFrame for the pipeline ─────
def _build_input_df(review: str, rating: float) -> pd.DataFrame:
    df = pd.DataFrame([{"text_": review, "rating": rating}])
    df = add_numeric_features(df)
    df["cleaned_text"] = df["text_"].apply(clean_text)
    return df[["cleaned_text"] + NUMERIC_FEATURES]


# ── Endpoints ─────────────────────────────────────────────────

@app.get("/", tags=["Health"])
def health_check():
    """Returns server status and the name of the loaded model."""
    return {
        "status": "ok",
        "model":  METRICS.get("best_model", "unknown"),
        "message": "ReviewGuard API is running.",
    }


@app.post("/predict", response_model=PredictResponse, tags=["Prediction"])
def predict(payload: PredictRequest):
    """
    Accepts a review string and a star rating (1–5).
    Returns:
      - label      : "Fake" or "Real"
      - confidence : probability of the predicted class
      - fake_prob  : probability of being Fake (useful for frontend colour coding)
    """
    try:
        input_df  = _build_input_df(payload.review, payload.rating)
        pred      = MODEL.predict(input_df)[0]          # 1 = Fake, 0 = Real
        prob      = MODEL.predict_proba(input_df)[0]    # [p_real, p_fake]

        fake_prob   = float(prob[1])
        label       = "Fake" if pred == 1 else "Real"
        confidence  = float(prob[pred])

        return PredictResponse(label=label, confidence=confidence, fake_prob=fake_prob)

    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/metrics", tags=["Metrics"])
def get_metrics():
    """
    Returns evaluation metrics for all trained models.
    Used by the React frontend's metrics dashboard.
    """
    if not METRICS:
        raise HTTPException(
            status_code=503,
            detail="Metrics file not found. Run 'python src/train.py' first."
        )
    return METRICS
