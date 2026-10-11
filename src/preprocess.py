"""
preprocess.py
─────────────
Text cleaning utilities for the Fake Review Detector.
Handles lowercasing, punctuation removal, stopword filtering, and lemmatization.
"""

import re
import string
import nltk

nltk.download("stopwords", quiet=True)
nltk.download("wordnet",   quiet=True)
nltk.download("omw-1.4",   quiet=True)

from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

_STOP_WORDS   = set(stopwords.words("english"))
_LEMMATIZER   = WordNetLemmatizer()
_PUNCT_TABLE  = str.maketrans("", "", string.punctuation)


def clean_text(text: str) -> str:
    """
    Full text cleaning pipeline:
      1. Lowercase
      2. Remove URLs and HTML tags
      3. Strip punctuation
      4. Tokenise by whitespace
      5. Remove stopwords and non-alpha tokens
      6. Lemmatize each token

    Returns a single cleaned string ready for TF-IDF vectorisation.
    """
    if not isinstance(text, str):
        text = str(text)

    # Lowercase
    text = text.lower()

    # Remove URLs
    text = re.sub(r"http\S+|www\.\S+", "", text)

    # Remove HTML tags
    text = re.sub(r"<[^>]+>", "", text)

    # Strip punctuation
    text = text.translate(_PUNCT_TABLE)

    # Tokenise
    tokens = text.split()

    # Filter stopwords and non-alpha tokens, then lemmatize
    tokens = [
        _LEMMATIZER.lemmatize(tok)
        for tok in tokens
        if tok.isalpha() and tok not in _STOP_WORDS
    ]

    return " ".join(tokens)
