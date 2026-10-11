# ReviewGuard — Fake Product Review Detector

A machine learning system that classifies product reviews as **Fake** or **Real** using classical NLP and ML techniques. Built with Python (scikit-learn, FastAPI) and React.

---

## Project Structure

```
fake-review-detector/
├── data/                   ← Put reviews.csv here
├── src/
│   ├── preprocess.py       ← Text cleaning
│   ├── features.py         ← Feature engineering
│   ├── train.py            ← Training script (run this first)
│   └── evaluate.py         ← Evaluation + plot generation
├── models/                 ← Auto-created after training
│   ├── best_model.pkl
│   └── metrics.json
├── app/
│   └── main.py             ← FastAPI backend
├── frontend/               ← React (Vite) UI
├── visuals/                ← Auto-generated plots
├── notebooks/              ← Jupyter notebook
└── requirements.txt
```

---

## Quick Start

### 1. Install Python dependencies
```bash
pip install -r requirements.txt
```

### 2. Download the dataset
Download from: https://www.kaggle.com/datasets/mexwell/fake-reviews-dataset  
Place the CSV at: `data/reviews.csv`

### 3. Train the models
```bash
python src/train.py
```
This will:
- Train all 4 models (Logistic Regression, Naive Bayes, SVM, Random Forest)
- Save the best model to `models/best_model.pkl`
- Save metrics to `models/metrics.json`
- Generate all plots to `visuals/`

### 4. Start the FastAPI backend
```bash
uvicorn app.main:app --reload --port 8000
```
API docs available at: http://localhost:8000/docs

### 5. Start the React frontend
```bash
cd frontend
npm install
npm run dev
```
Open: http://localhost:5173

---

## Models

| Model              | Handles negative features | Notes                         |
|--------------------|--------------------------|-------------------------------|
| Logistic Regression| ✅                        | Strong interpretable baseline |
| Complement NB      | ✅ (vs MultinomialNB)     | Best for imbalanced text      |
| SVM (Linear)       | ✅                        | Top performer for text        |
| Random Forest      | ✅                        | Feature importance available  |

---

## API Endpoints

| Method | Route      | Description                                 |
|--------|------------|---------------------------------------------|
| GET    | `/`        | Health check                                |
| POST   | `/predict` | `{ "review": "...", "rating": 4 }` → result |
| GET    | `/metrics` | All model evaluation scores                 |

---

## Features Used

- TF-IDF (top 5000 unigrams + bigrams)
- Review character length
- Word count
- Average word length
- Exclamation mark count
- VADER sentiment score
- Rating–sentiment gap

---

*ML Course Project*
