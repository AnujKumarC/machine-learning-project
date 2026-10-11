"""
train.py
────────
Full training script for the Fake Review Detector.

Run from the project root:
    cd fake-review-detector/
    python src/train.py

Expects data/reviews.csv to exist (Kaggle fake-reviews-dataset).
Saves the best model to models/best_model.pkl.
Saves all evaluation metrics to models/metrics.json.
Generates all visual plots to visuals/.
"""

import os
import sys
import json
import warnings
import joblib
import numpy as np
import pandas as pd

from sklearn.model_selection  import train_test_split
from sklearn.pipeline         import Pipeline
from sklearn.compose          import ColumnTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing    import StandardScaler, LabelEncoder
from sklearn.linear_model     import LogisticRegression
from sklearn.naive_bayes      import MultinomialNB, ComplementNB
from sklearn.svm              import LinearSVC
from sklearn.ensemble         import RandomForestClassifier
from sklearn.calibration      import CalibratedClassifierCV

warnings.filterwarnings("ignore")

# Allow imports from src/ when run from project root
sys.path.insert(0, os.path.dirname(__file__))
from preprocess import clean_text
from features   import add_numeric_features, NUMERIC_FEATURES
from evaluate   import (
    compute_metrics, plot_confusion_matrix, plot_roc_curves,
    plot_model_comparison, plot_wordclouds, plot_class_distribution,
    plot_feature_importance,
)

# ── Paths ────────────────────────────────────────────────────
ROOT_DIR   = os.path.join(os.path.dirname(__file__), "..")
DATA_PATH  = os.path.join(ROOT_DIR, "data", "reviews.csv")
MODEL_DIR  = os.path.join(ROOT_DIR, "models")
os.makedirs(MODEL_DIR, exist_ok=True)


# ─────────────────────────────────────────────────────────────
# STEP 1 — Load Data
# ─────────────────────────────────────────────────────────────
def load_data(path: str) -> pd.DataFrame:
    print("\n[1/6] Loading dataset …")
    df = pd.read_csv(path)
    print(f"  Loaded {len(df):,} rows | columns: {list(df.columns)}")

    # Normalise column names (Kaggle CSV uses 'text_' and 'label')
    df.columns = [c.strip().lower() for c in df.columns]

    # Map label to binary: CG → 1 (Fake), OR → 0 (Real)
    df["binary_label"] = (df["label"].str.upper() == "CG").astype(int)

    # Ensure rating column exists
    if "rating" not in df.columns:
        df["rating"] = 3.0

    print(f"  Class distribution:\n{df['label'].value_counts().to_string()}")
    return df


# ─────────────────────────────────────────────────────────────
# STEP 2 — Preprocess & Feature Engineering
# ─────────────────────────────────────────────────────────────
def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    print("\n[2/6] Preprocessing text and engineering features …")
    df = add_numeric_features(df)

    print("  Cleaning review text (this may take a minute) …")
    df["cleaned_text"] = df["text_"].fillna("").apply(clean_text)

    print("  Done.")
    return df


# ─────────────────────────────────────────────────────────────
# STEP 3 — Build sklearn Pipelines
# ─────────────────────────────────────────────────────────────
def build_pipelines() -> dict:
    """
    Returns a dict of {model_name: Pipeline}.

    Each pipeline has two stages:
      1. preprocessor — ColumnTransformer: TF-IDF on cleaned_text + scaling on numeric features
      2. classifier   — the ML model

    Note on Naive Bayes:
      MultinomialNB requires non-negative features.
      We use ComplementNB which handles negative scaled values and
      generally outperforms MultinomialNB on imbalanced text data.
    """

    # Preprocessor A — for LR, SVM, RF (TF-IDF + StandardScaler)
    preprocessor_a = ColumnTransformer([
        ("tfidf",  TfidfVectorizer(max_features=5000, ngram_range=(1, 2), sublinear_tf=True), "cleaned_text"),
        ("scaler", StandardScaler(), NUMERIC_FEATURES),
    ])

    # Preprocessor B — for Naive Bayes (TF-IDF only, no negative values)
    preprocessor_b = ColumnTransformer([
        ("tfidf", TfidfVectorizer(max_features=5000, ngram_range=(1, 2), sublinear_tf=True), "cleaned_text"),
    ])

    pipelines = {
        "Logistic Regression": Pipeline([
            ("preprocessor", preprocessor_a),
            ("classifier",   LogisticRegression(C=1.0, max_iter=1000, random_state=42)),
        ]),
        "Naive Bayes": Pipeline([
            ("preprocessor", preprocessor_b),
            ("classifier",   ComplementNB(alpha=0.1)),
        ]),
        "SVM": Pipeline([
            ("preprocessor", preprocessor_a),
            # Wrap LinearSVC in CalibratedClassifierCV to enable predict_proba (needed for ROC)
            ("classifier",   CalibratedClassifierCV(LinearSVC(C=1.0, max_iter=3000, random_state=42))),
        ]),
        "Random Forest": Pipeline([
            ("preprocessor", preprocessor_a),
            ("classifier",   RandomForestClassifier(n_estimators=200, max_depth=None,
                                                    n_jobs=-1, random_state=42)),
        ]),
    }
    return pipelines


# ─────────────────────────────────────────────────────────────
# STEP 4 — Train, Evaluate, Collect Results
# ─────────────────────────────────────────────────────────────
def train_and_evaluate(df: pd.DataFrame) -> tuple:
    print("\n[3/6] Splitting data (80 / 20 stratified split) …")

    feature_cols = ["cleaned_text"] + NUMERIC_FEATURES
    X = df[feature_cols]
    y = df["binary_label"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42
    )
    print(f"  Train: {len(X_train):,}  |  Test: {len(X_test):,}")

    pipelines   = build_pipelines()
    all_metrics = {}
    roc_data    = {}
    best_f1     = -1
    best_name   = None
    best_pipe   = None

    print("\n[4/6] Training all models …\n")
    for name, pipe in pipelines.items():
        print(f"  ▶ {name} …", end=" ", flush=True)
        pipe.fit(X_train, y_train)
        y_pred = pipe.predict(X_test)
        y_prob = pipe.predict_proba(X_test)[:, 1]   # probability of Fake class

        metrics = compute_metrics(y_test, y_pred, y_prob)
        all_metrics[name] = metrics
        roc_data[name] = {"y_true": y_test.tolist(), "y_prob": y_prob.tolist()}

        print(f"Accuracy={metrics['accuracy']:.4f}  F1={metrics['f1']:.4f}")

        # Confusion matrix per model
        plot_confusion_matrix(y_test, y_pred, name)

        if metrics["f1"] > best_f1:
            best_f1   = metrics["f1"]
            best_name = name
            best_pipe = pipe

    return pipelines, all_metrics, roc_data, best_name, best_pipe, X_test, y_test


# ─────────────────────────────────────────────────────────────
# STEP 5 — Generate Visuals
# ─────────────────────────────────────────────────────────────
def generate_visuals(df, all_metrics, roc_data, rf_pipeline):
    print("\n[5/6] Generating all visualisations …")
    plot_class_distribution(df)
    plot_wordclouds(df)
    plot_roc_curves(roc_data)
    plot_model_comparison(all_metrics)
    plot_feature_importance(rf_pipeline, NUMERIC_FEATURES)
    print("  All visuals saved to visuals/")


# ─────────────────────────────────────────────────────────────
# STEP 6 — Save Best Model and Metrics
# ─────────────────────────────────────────────────────────────
def save_artifacts(best_pipe, best_name: str, all_metrics: dict):
    print(f"\n[6/6] Saving best model: {best_name} …")
    model_path   = os.path.join(MODEL_DIR, "best_model.pkl")
    metrics_path = os.path.join(MODEL_DIR, "metrics.json")

    joblib.dump(best_pipe, model_path)
    with open(metrics_path, "w") as f:
        json.dump({"best_model": best_name, "models": all_metrics}, f, indent=2)

    print(f"  ✔ Model  → {model_path}")
    print(f"  ✔ Metrics → {metrics_path}")


# ─────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    if not os.path.exists(DATA_PATH):
        print(f"\n❌  Dataset not found at: {DATA_PATH}")
        print("    Download it from: https://www.kaggle.com/datasets/mexwell/fake-reviews-dataset")
        print("    and place it at:  data/reviews.csv\n")
        sys.exit(1)

    df = load_data(DATA_PATH)
    df = engineer_features(df)

    pipelines, all_metrics, roc_data, best_name, best_pipe, X_test, y_test = \
        train_and_evaluate(df)

    generate_visuals(df, all_metrics, roc_data, pipelines["Random Forest"])
    save_artifacts(best_pipe, best_name, all_metrics)

    print(f"\n{'─'*50}")
    print(f"✅  Training complete!  Best model: {best_name}")
    print(f"   F1 Score: {all_metrics[best_name]['f1']:.4f}")
    print(f"   Accuracy: {all_metrics[best_name]['accuracy']:.4f}")
    print(f"{'─'*50}\n")
