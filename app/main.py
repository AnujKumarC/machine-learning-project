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
MODEL_PATH   = os.getenv("MODEL_PATH", os.path.join(ROOT_DIR, "models", "best_model.pkl"))
METRICS_PATH = os.getenv("METRICS_PATH", os.path.join(ROOT_DIR, "models", "metrics.json"))

# ── Load model on startup ─────────────────────────────────────
MODEL = None
if os.path.exists(MODEL_PATH):
    print(f"[ReviewGuard] Loading model from {MODEL_PATH} …")
    MODEL = joblib.load(MODEL_PATH)
    print("[ReviewGuard] Model loaded. Server ready.")
else:
    print(
        f"[ReviewGuard] Notice: Model not found at {MODEL_PATH}. "
        "Inference endpoint will return 503 until model is trained or mounted."
    )

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

# CORS — allow the React dev server (5173), custom origins, and Cloudflare Pages (*.pages.dev)
cors_origins_env = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
cors_origins = [o.strip() for o in cors_origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=os.getenv("CORS_ORIGIN_REGEX", r"^https:\/\/.*\.pages\.dev$"),
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
    is_ready = MODEL is not None
    return {
        "status": "ok" if is_ready else "degraded",
        "model_loaded": is_ready,
        "model": METRICS.get("best_model", "unknown") if is_ready else None,
        "message": (
            "ReviewGuard API is running."
            if is_ready
            else "ReviewGuard API is running, but model weights are not loaded. Place best_model.pkl in models/."
        ),
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
    if MODEL is None:
        raise HTTPException(
            status_code=503,
            detail="Model is not loaded. Ensure best_model.pkl is placed in models/ or train via src/train.py"
        )

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
