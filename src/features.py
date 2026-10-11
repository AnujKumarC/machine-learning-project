"""
features.py
───────────
Feature engineering for the Fake Review Detector.
Computes numeric signals alongside TF-IDF text features.
"""

import numpy as np
import pandas as pd
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

_ANALYZER = SentimentIntensityAnalyzer()

# All numeric column names produced by add_numeric_features()
NUMERIC_FEATURES = [
    "review_length",
    "word_count",
    "avg_word_length",
    "exclamation_count",
    "sentiment_score",
    "rating_sentiment_gap",
]


def add_numeric_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Adds six numeric features to the DataFrame in-place (returns a copy).

    Feature descriptions
    ────────────────────
    review_length       : total character count of the raw review
    word_count          : number of whitespace-separated words
    avg_word_length     : mean characters per word (bots tend to use unusual lengths)
    exclamation_count   : number of '!' characters (fake reviews are often over-hyped)
    sentiment_score     : VADER compound score in [-1, 1]
    rating_sentiment_gap: |star_rating/5 − (sentiment+1)/2|
                          A high gap means the star rating contradicts the text tone,
                          which is a classic signal of a fake review.
    """
    df = df.copy()
    raw_text = df["text_"].fillna("").astype(str)

    df["review_length"]     = raw_text.str.len()
    df["word_count"]        = raw_text.str.split().str.len().fillna(0)
    df["avg_word_length"]   = raw_text.apply(
        lambda t: float(np.mean([len(w) for w in t.split()])) if t.split() else 0.0
    )
    df["exclamation_count"] = raw_text.str.count("!")
    df["sentiment_score"]   = raw_text.apply(
        lambda t: _ANALYZER.polarity_scores(t)["compound"]
    )

    rating = df["rating"].fillna(3.0).astype(float)
    df["rating_sentiment_gap"] = (
        rating / 5.0 - (df["sentiment_score"] + 1.0) / 2.0
    ).abs()

    return df


def get_sentiment(text: str) -> float:
    """Return the VADER compound sentiment score for a single text string."""
    return _ANALYZER.polarity_scores(str(text))["compound"]
