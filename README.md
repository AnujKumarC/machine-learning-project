# ReviewGuard — Fake Product Review Detection System
> **Machine Learning Course Project** · Comprehensive Technical Documentation & Architecture Guide  
> Built with **Python (Scikit-Learn, NLTK, FastAPI)** & **React (Vite, Apple iOS 27 Design System)**

🌐 **Live Web Application:** [https://reviewguard-9li.pages.dev/](https://reviewguard-9li.pages.dev/)  
📂 **GitHub Repository:** [https://github.com/AnujKumarC/machine-learning-project](https://github.com/AnujKumarC/machine-learning-project)


---

## 📌 Table of Contents
1. [Project Overview & Objective](#1-project-overview--objective)
2. [End-to-End System Architecture](#2-end-to-end-system-architecture)
3. [Repository Directory & File Breakdown](#3-repository-directory--file-breakdown)
4. [Machine Learning Pipeline Walkthrough](#4-machine-learning-pipeline-walkthrough)
   - [Text Preprocessing (`src/preprocess.py`)](#text-preprocessing-srcpreprocesspy)
   - [Feature Engineering (`src/features.py`)](#feature-engineering-srcfeaturespy)
   - [Model Training & Selection (`src/train.py`)](#model-training--selection-srctrainpy)
   - [Evaluation & Visualization (`src/evaluate.py`)](#evaluation--visualization-srcevaluatepy)
5. [FastAPI Backend Service (`app/main.py`)](#5-fastapi-backend-service-appmainpy)
6. [React Frontend & iOS 27 Design System (`frontend/`)](#6-react-frontend--ios-27-design-system-frontend)
7. [Step-by-Step Local Setup Guide](#7-step-by-step-local-setup-guide)
8. [Cloudflare Deployment](#8-cloudflare-deployment)
9. [Viva & Project Defense Q&A Guide](#9-viva--project-defense-qa-guide)

---

## 1. Project Overview & Objective

E-commerce platforms (Amazon, Flipkart, etc.) rely heavily on customer reviews to drive purchasing decisions. However, an estimated 10%–30% of online reviews are synthetic, incentivized, or machine-generated ("fake reviews").

**Goal:** Build a robust, interpretable Machine Learning pipeline that classifies product reviews as **Authentic (Real)** or **Synthetic (Fake)** by analyzing:
1. **Linguistic TF-IDF patterns** (word frequencies, n-grams, repetitive marketing tokens).
2. **Heuristic behavioral signals** (review length, punctuation cadence, exclamation density).
3. **Sentiment–Rating discordance** (e.g., leaving a 5-star rating with overly short or contradictory feedback).

The system features:
- **4 Classical Machine Learning Classifiers:** Logistic Regression, Complement Naive Bayes, Linear Support Vector Machine (SVM), and Random Forest.
- **REST API:** High-throughput FastAPI backend with OpenAPI documentation.
- **Interactive UI:** Apple iOS 27 spatial glassmorphic dashboard built in React 19.

---

## 2. End-to-End System Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        USER / WEB INTERFACE                            │
│           React 19 Dashboard (Apple iOS 27 Glassmorphic UI)            │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ HTTP POST /predict (JSON payload)
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        FASTAPI BACKEND SERVICE                         │
│                           (app/main.py:8000)                           │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ Raw review text & star rating
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      DATA PREPROCESSING PIPELINE                       │
│                        (src/preprocess.py)                             │
│   • Lowercasing                                                        │
│   • HTML Tag & URL Removal (Regex)                                     │
│   • Punctuation & Special Character Filtering                          │
│   • NLTK Stopword Pruning                                              │
│   • WordNet Lemmatization (Tokens → Root Lemma)                        │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ Clean token stream + metadata
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      FEATURE ENGINEERING ENGINE                        │
│                         (src/features.py)                              │
│   ┌─────────────────────────────┐   ┌──────────────────────────────┐   │
│   │   Textual Vectors (TF-IDF)  │   │  Numerical Behavioral Signals│   │
│   │  • Unigrams + Bigrams (1,2) │   │  • Character length          │   │
│   │  • Max 5,000 vocabulary     │   │  • Word count & avg word len │   │
│   │  • Sublinear term frequency │   │  • Exclamation mark count    │   │
│   │                             │   │  • VADER Sentiment Score     │   │
│   │                             │   │  • Rating-Sentiment Gap      │   │
│   └──────────────┬──────────────┘   └──────────────┬───────────────┘   │
│                  └───────────────┬─────────────────┘                   │
│                                  ▼                                     │
│            Feature Union & Standard Scaling (scipy.sparse)             │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ 5,006-dimensional vector
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   TRAINED MACHINE LEARNING MODELS                      │
│                          (models/best_model.pkl)                       │
│   • Logistic Regression         • Complement Naive Bayes               │
│   • Linear SVM (Platt Calibrated) [CHAMPION: 91.1% F1]                 │
│   • Random Forest Ensemble                                             │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                           INFERENCE RESPONSE                           │
│   { "label": "Real"|"Fake", "confidence": 0.932, "fake_prob": 0.068 }  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Repository Directory & File Breakdown

```
MLP/
├── app/
│   └── main.py                     # FastAPI REST API (Endpoints: /predict, /metrics, /health)
├── data/
│   └── reviews.csv                 # Kaggle dataset (created after download)
├── frontend/                       # React 19 Single Page Application
│   ├── public/                     # Static assets & favicon
│   ├── src/
│   │   ├── assets/                 # Icons & branding assets
│   │   ├── components/
│   │   │   ├── Background.jsx      # Apple spatial ambient mesh backdrop
│   │   │   ├── Header.jsx          # iOS 27 glass topbar & neural defense badge
│   │   │   ├── ReviewForm.jsx      # Manuscript input, presets & vector star rating
│   │   │   ├── ResultCard.jsx      # Radar scanner, glowing verdict badge & signals
│   │   │   └── MetricsPanel.jsx    # Model benchmark telemetry cards (Champion SVM)
│   │   ├── App.jsx                 # Main React container with mock & live API bridge
│   │   ├── App.module.css          # Layout styling
│   │   ├── index.css               # Global Apple design tokens & typography
│   │   └── main.jsx                # React DOM root entrypoint
│   ├── index.html                  # HTML template with Google Fonts (Inter, JetBrains Mono)
│   ├── package.json                # Frontend dependencies (lucide-react, vite, react)
│   └── vite.config.js              # Vite server & backend reverse proxy (/predict, /metrics)
├── models/                         # Serialized ML artifacts (auto-generated by train.py)
│   ├── best_model.pkl              # Saved Pipeline object (Preprocessor + Scaler + Best Model)
│   └── metrics.json                # JSON report of Accuracy, Precision, Recall, F1 for all models
├── notebooks/
│   └── 01_EDA_and_Training.ipynb   # 16-section Jupyter Notebook for presentation & defense
├── src/
│   ├── preprocess.py               # Pure NLP text cleaning functions
│   ├── features.py                 # TF-IDF + VADER sentiment + 6 heuristic feature extractors
│   ├── train.py                    # Multi-model training, cross-validation & artifact exporter
│   └── evaluate.py                 # Generates 7 publication-ready evaluation charts
├── visuals/                        # Auto-generated visualization figures (PNG format)
│   ├── confusion_matrix_*.png      # Confusion matrices for each classifier
│   ├── roc_curves.png              # Overlaid ROC curves with AUC metrics
│   ├── model_comparison.png        # Bar chart comparing all 4 models
│   ├── feature_importance.png      # Top 20 most predictive features (Random Forest)
│   ├── wordcloud_fake.png          # Word cloud of synthetic reviews
│   ├── wordcloud_real.png          # Word cloud of genuine reviews
│   └── class_distribution.png      # Target label balance breakdown
├── .gitignore                      # Git exclusion rules (venv, node_modules, binaries)
├── package.json                    # Root package descriptor for CI/CD builds
├── requirements.txt                # Python package dependencies
└── README.md                       # Complete technical documentation
```

---

## 4. Machine Learning Pipeline Walkthrough

### Text Preprocessing (`src/preprocess.py`)
Raw customer reviews contain HTML formatting, website URLs, irregular casing, and uninformative stopwords.

1. **URL & HTML Stripping:** Regular expressions remove `http://...` links and `<p>`, `<br>` tags.
2. **Punctuation Filtering:** Removes punctuation while preserving internal apostrophes for contractions (e.g., *"don't"*).
3. **Lowercasing:** Normalizes vocabulary so `"EXCELLENT"`, `"Excellent"`, and `"excellent"` map to the same token.
4. **NLTK Stopword Removal:** Eliminates high-frequency non-discriminative English words (*"the"*, *"and"*, *"in"*).
5. **WordNet Lemmatization:** Reduces words to their dictionary root base form (e.g., *"running"*, *"runs"* → *"run"*).

---

### Feature Engineering (`src/features.py`)
Text alone is not enough; scam reviewers exhibit distinct behavioral patterns. We extract **two streams** of features:

#### Stream 1: Textual Vectorization (TF-IDF)
- **Vocabulary:** 5,000 most significant unigrams and bigrams (`ngram_range=(1, 2)`).
- **Sublinear Term Frequency Scaling:** Scales term frequency logarithmically ($1 + \log(TF)$) to prevent high-frequency words from dominating.
- **Minimum Document Frequency (`min_df=2`):** Discards single-occurrence typos and noise.

#### Stream 2: Engineered Behavioral & Heuristic Features
1. **Character Length (`char_count`):** Fake reviews are often unusually brief or excessively long.
2. **Word Count (`word_count`):** Number of individual tokens.
3. **Average Word Length (`avg_word_length`):** Captures vocabulary complexity.
4. **Exclamation Count (`exclamation_count`):** Fake reviews tend to over-use exclamation marks (`"BEST EVER!!!!"`).
5. **VADER Compound Sentiment (`vader_sentiment`):** Measures emotional valence between -1.0 (extremely negative) and +1.0 (extremely positive).
6. **Rating–Sentiment Discordance (`rating_sentiment_gap`):**
   $$\text{gap} = \left| \frac{\text{Rating} - 1}{4} - \frac{\text{Sentiment} + 1}{2} \right|$$
   A 5-star rating with a negative review text flags high discordance.

Features from both streams are merged into a unified sparse feature matrix using `scipy.sparse.hstack`.

---

### Model Training & Selection (`src/train.py`)
The dataset is partitioned into an **80% Training Set** and a **20% Test Set** using stratified sampling to preserve class ratios.

We evaluate 4 distinct algorithms representing different machine learning paradigms:

| Model | Paradigm | Strengths & Notes |
| :--- | :--- | :--- |
| **Logistic Regression** | Linear / Probabilistic | Fast, interpretable L2-regularized baseline. Provides clear feature coefficients. |
| **Complement Naive Bayes** | Bayesian Probability | Specifically designed for imbalanced text and negative feature inputs (unlike standard MultinomialNB). |
| **Support Vector Machine (SVM)** | Maximum Margin Hyperplane | **Champion Model.** Linear SVC wrapped in `CalibratedClassifierCV` (Platt Scaling) to enable true probability estimates. |
| **Random Forest** | Bagged Decision Tree Ensemble | 100 estimators using Gini impurity. Immune to feature scale variance, computes feature importances. |

#### Why ComplementNB instead of MultinomialNB?
Standard `MultinomialNB` requires strictly non-negative features. Because our heuristic features are standardized using `StandardScaler` (which produces negative values), `MultinomialNB` fails mathematically. `ComplementNB` handles negative feature arrays and corrects for word frequency imbalance.

#### Why CalibratedClassifierCV on SVM?
`LinearSVC` identifies the maximum-margin hyperplane by optimizing hinge loss, but it does **not** natively output probabilities (`predict_proba`). Wrapping it in Platt Scaling via `CalibratedClassifierCV` fits a sigmoid function over the margins, yielding calibrated confidence scores necessary for ROC curves and the UI confidence bar.

---

### Evaluation & Visualization (`src/evaluate.py`)
`src/evaluate.py` generates 7 publication-ready analytical figures stored in `visuals/`:
- **Confusion Matrices:** Heatmaps detailing True Positives, True Negatives, False Positives, and False Negatives for each classifier.
- **ROC Curves:** Receiver Operating Characteristic curves plotting True Positive Rate vs. False Positive Rate across thresholds.
- **Feature Importance:** Top 20 most influential words and heuristics from the Random Forest ensemble.
- **Word Clouds:** Visual frequency clouds comparing vocabulary in Real reviews vs. Fake reviews.
- **Model Comparison Bar Chart:** Side-by-side comparison of Accuracy, Precision, Recall, and F1 across all 4 models.

---

## 5. FastAPI Backend Service (`app/main.py`)

A production-grade Python web service that exposes the trained ML pipeline over HTTP.

### Available Endpoints

| HTTP Method | Route | Description | Request Body / Query | Sample Response |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | Service health check | None | `{"status": "online", "model_loaded": true}` |
| `POST` | `/predict` | Classify a single review | `{"review": "text...", "rating": 5}` | `{"label": "Fake", "confidence": 0.92, "fake_prob": 0.92}` |
| `GET` | `/metrics` | Retrieve all model benchmark scores | None | `{"models": {"svm": {"f1": 0.911, ...}}}` |

### Interactive Documentation
FastAPI provides automatic OpenAPI Swagger documentation at:  
👉 **`http://localhost:8000/docs`**

---

## 6. React Frontend & iOS 27 Design System (`frontend/`)

The frontend was built from the ground up to reflect an **Apple iOS 27 / Spatial Computing** dark mode aesthetic.

### Key UI Features
- **Zero Emojis Everywhere:** 100% crisp, thin-stroke vector iconography using `lucide-react` (`ShieldCheck`, `ShieldAlert`, `Scan`, `Activity`, `Sliders`, `Sparkles`, `Star`).
- **Frosted Acrylic Glassmorphism:** Layered `backdrop-filter: blur(30px) saturate(190%)` surfaces with specular top-edge highlights (`inset 0 1px 0 rgba(255, 255, 255, 0.16)`).
- **Apple Typography:** System San Francisco hierarchy with negative tracking (`-0.035em`) on titles and tabular monospaced numerals (`JetBrains Mono`) for metrics.
- **Radar Scan Pulse:** Real-time concentric radar animation during classification inference.
- **Interactive Star Rating:** 5-star selector with hover tooltips and Apple amber gold glow (`#FFD60A`).
- **Telemetry Cards:** Apple Health/Settings widget cards displaying Accuracy, Precision, Recall, and F1 with progress bars and a Champion badge for SVM.
- **Offline / Standalone Fallback:** If the FastAPI backend is not running, the frontend automatically falls back to an intelligent mock inference engine so the UI works seamlessly.

---

## 7. Step-by-Step Local Setup Guide

Follow these steps to run the entire project on any machine.

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm**
- **Git**

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/AnujKumarC/machine-learning-project.git
cd machine-learning-project
```

---

### Step 2: Set Up Python Virtual Environment
```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS / Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

---

### Step 3: Add Dataset & Train Models
1. Download the fake reviews dataset from Kaggle:  
   👉 **[Fake Reviews Dataset on Kaggle](https://www.kaggle.com/datasets/mexwell/fake-reviews-dataset)**
2. Save the CSV file as:
   ```bash
   data/reviews.csv
   ```
3. Run the training script:
   ```bash
   python src/train.py
   ```
   *This trains all 4 models, outputs test metrics, serializes `models/best_model.pkl`, and exports evaluation plots to `visuals/`.*

---

### Step 4: Run the Jupyter Notebook (Optional / For Demo)
```bash
jupyter notebook notebooks/01_EDA_and_Training.ipynb
```
*Walks through the entire data exploration, visualization, and training process step-by-step.*

---

### Step 5: Start the FastAPI Backend
```bash
uvicorn app.main:app --reload --port 8000
```
- Backend will be live at: **`http://localhost:8000`**
- Interactive Swagger docs: **`http://localhost:8000/docs`**

---

### Step 6: Start the React Frontend
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
- Open your browser to: **`http://localhost:5173`**
- Paste any review or click the diagnostic sample buttons to test the model!

---

## 8. Cloudflare Deployment

The React frontend is optimized for worldwide edge hosting on **Cloudflare Pages**:

- **Framework Preset:** `Vite`
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Build Output Directory:** `dist`

Cloudflare automatically builds and deploys the application with free global CDN and SSL termination whenever commits are pushed to the `main` branch.

---

## 9. Viva & Project Defense Q&A Guide

Use these talking points when presenting the project to professors or examiners:

### Q1: Why did you choose TF-IDF over simple CountVectorizer (Bag of Words)?
> *"CountVectorizer only counts raw frequency. Frequent words like 'product' or 'item' would dominate without providing discriminative value. TF-IDF down-weights words that appear across all documents and elevates rare, distinctive words that characterize authentic or deceptive reviews."*

### Q2: Why did Support Vector Machine (SVM) perform best?
> *"Text classification involves a sparse, high-dimensional feature space (5,000+ dimensions). Linear SVMs excel in high-dimensional spaces because they search for the maximum-margin hyperplane separating classes, minimizing risk of overfitting."*

### Q3: Why is Accuracy alone not enough for evaluating this system?
> *"If an e-commerce platform has 90% real reviews and 10% fake reviews, a naive model that predicts everything as 'Real' would achieve 90% accuracy but 0% recall on fake reviews. We prioritized the **F1-Score** (harmonic mean of Precision and Recall) and plotted ROC-AUC curves to measure performance across all decision thresholds."*

### Q4: How does the system detect reviews that have contradictory ratings?
> *"We engineered a specific feature called `rating_sentiment_gap`. It measures the mathematical distance between the normalized numerical star rating (1–5) and the VADER compound sentiment score (-1 to +1). Deceptive reviews often leave 5-star ratings with rushed or misaligned text, which this metric detects."*

### Q5: How does the system transition from research to production?
> *"The model is exported as an end-to-end serialized Scikit-Learn pipeline (`best_model.pkl`). The FastAPI backend loads this single artifact into memory on startup and runs real-time inference in sub-15ms latency, connected to an Apple iOS 27 glassmorphic React frontend."*

---

*Project developed for the Machine Learning Course.*
