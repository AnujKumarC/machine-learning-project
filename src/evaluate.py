"""
evaluate.py
───────────
Evaluation utilities for the Fake Review Detector.
Generates all plots required for the report and presentation.
"""

import os
import numpy as np
import matplotlib
matplotlib.use("Agg")          # Non-interactive backend (safe for scripts)
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, roc_curve, auc,
)
from wordcloud import WordCloud

# ── Output directory ─────────────────────────────────────────
VISUALS_DIR = os.path.join(os.path.dirname(__file__), "..", "visuals")
os.makedirs(VISUALS_DIR, exist_ok=True)

# ── Shared style ─────────────────────────────────────────────
plt.rcParams.update({
    "figure.facecolor": "#0a0b0f",
    "axes.facecolor":   "#111318",
    "axes.edgecolor":   "#2a2d3a",
    "axes.labelcolor":  "#e8eaf0",
    "text.color":       "#e8eaf0",
    "xtick.color":      "#7a7f9a",
    "ytick.color":      "#7a7f9a",
    "grid.color":       "#1a1d26",
    "font.family":      "DejaVu Sans",
})

MODEL_COLORS = {
    "Logistic Regression": "#6c63ff",
    "Naive Bayes":         "#00d4aa",
    "SVM":                 "#f4a261",
    "Random Forest":       "#ff4d6d",
}


# ─────────────────────────────────────────────────────────────
# 1. Compute metrics dict for a single model
# ─────────────────────────────────────────────────────────────
def compute_metrics(y_true, y_pred, y_prob=None) -> dict:
    """
    Returns a dict with accuracy, precision, recall, f1,
    and optionally roc_auc if probability scores are provided.
    """
    metrics = {
        "accuracy":  round(accuracy_score(y_true, y_pred), 4),
        "precision": round(precision_score(y_true, y_pred, zero_division=0), 4),
        "recall":    round(recall_score(y_true, y_pred, zero_division=0), 4),
        "f1":        round(f1_score(y_true, y_pred, zero_division=0), 4),
    }
    if y_prob is not None:
        from sklearn.metrics import roc_auc_score
        metrics["roc_auc"] = round(roc_auc_score(y_true, y_prob), 4)
    return metrics


# ─────────────────────────────────────────────────────────────
# 2. Confusion matrix heatmap
# ─────────────────────────────────────────────────────────────
def plot_confusion_matrix(y_true, y_pred, model_name: str, save: bool = True):
    cm = confusion_matrix(y_true, y_pred)
    fig, ax = plt.subplots(figsize=(5, 4))
    sns.heatmap(
        cm, annot=True, fmt="d", cmap="RdPu",
        xticklabels=["Real", "Fake"],
        yticklabels=["Real", "Fake"],
        linewidths=0.5, linecolor="#2a2d3a",
        ax=ax,
    )
    ax.set_title(f"Confusion Matrix — {model_name}", pad=12, fontsize=13, fontweight="bold")
    ax.set_xlabel("Predicted Label", labelpad=8)
    ax.set_ylabel("True Label",      labelpad=8)
    plt.tight_layout()
    if save:
        path = os.path.join(VISUALS_DIR, f"confusion_matrix_{model_name.lower().replace(' ', '_')}.png")
        fig.savefig(path, dpi=150, bbox_inches="tight")
        print(f"  ✔ Saved: {path}")
    plt.close(fig)


# ─────────────────────────────────────────────────────────────
# 3. ROC curves for all models on a single plot
# ─────────────────────────────────────────────────────────────
def plot_roc_curves(results: dict, save: bool = True):
    """
    results = {
        "Model Name": {"y_true": [...], "y_prob": [...]}
    }
    """
    fig, ax = plt.subplots(figsize=(7, 5))

    ax.plot([0, 1], [0, 1], "w--", linewidth=1, alpha=0.4, label="Random Chance")

    for name, data in results.items():
        fpr, tpr, _ = roc_curve(data["y_true"], data["y_prob"])
        roc_auc = auc(fpr, tpr)
        ax.plot(
            fpr, tpr,
            color=MODEL_COLORS.get(name, "#ffffff"),
            linewidth=2,
            label=f"{name}  (AUC = {roc_auc:.3f})",
        )

    ax.set_title("ROC Curves — All Models", fontsize=14, fontweight="bold", pad=12)
    ax.set_xlabel("False Positive Rate")
    ax.set_ylabel("True Positive Rate")
    legend = ax.legend(loc="lower right", framealpha=0.2, fontsize=9)
    plt.setp(legend.get_texts(), color="#e8eaf0")
    ax.grid(True, alpha=0.15)
    plt.tight_layout()

    if save:
        path = os.path.join(VISUALS_DIR, "roc_curves.png")
        fig.savefig(path, dpi=150, bbox_inches="tight")
        print(f"  ✔ Saved: {path}")
    plt.close(fig)


# ─────────────────────────────────────────────────────────────
# 4. Model comparison bar chart (F1 & Accuracy)
# ─────────────────────────────────────────────────────────────
def plot_model_comparison(all_metrics: dict, save: bool = True):
    """
    all_metrics = {
        "Model Name": {"accuracy": 0.9, "f1": 0.89, ...}
    }
    """
    names  = list(all_metrics.keys())
    f1s    = [all_metrics[n]["f1"]       for n in names]
    accs   = [all_metrics[n]["accuracy"] for n in names]

    x = np.arange(len(names))
    width = 0.35

    fig, ax = plt.subplots(figsize=(8, 5))
    bars1 = ax.bar(x - width / 2, accs, width, label="Accuracy", color="#6c63ff", alpha=0.85)
    bars2 = ax.bar(x + width / 2, f1s,  width, label="F1 Score",  color="#00d4aa", alpha=0.85)

    ax.set_xticks(x)
    ax.set_xticklabels(names, fontsize=10)
    ax.set_ylim(0.70, 1.00)
    ax.set_ylabel("Score")
    ax.set_title("Model Comparison — Accuracy vs F1 Score", fontsize=13, fontweight="bold", pad=12)
    ax.legend(framealpha=0.2)
    ax.grid(True, axis="y", alpha=0.15)

    # Value labels on top of bars
    for bar in bars1:
        ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.003,
                f"{bar.get_height():.3f}", ha="center", va="bottom", fontsize=8)
    for bar in bars2:
        ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.003,
                f"{bar.get_height():.3f}", ha="center", va="bottom", fontsize=8)

    plt.tight_layout()
    if save:
        path = os.path.join(VISUALS_DIR, "model_comparison.png")
        fig.savefig(path, dpi=150, bbox_inches="tight")
        print(f"  ✔ Saved: {path}")
    plt.close(fig)


# ─────────────────────────────────────────────────────────────
# 5. Word clouds (Fake vs Real)
# ─────────────────────────────────────────────────────────────
def plot_wordclouds(df, text_col: str = "text_", label_col: str = "label", save: bool = True):
    """
    Generates two word clouds: one for fake (CG) reviews and one for real (OR) reviews.
    """
    for label, tag, clr in [("CG", "Fake", "#ff4d6d"), ("OR", "Real", "#00d4aa")]:
        subset = df[df[label_col] == label][text_col].dropna().str.cat(sep=" ")
        wc = WordCloud(
            width=800, height=400,
            background_color="#111318",
            colormap="Reds" if tag == "Fake" else "GnBu",
            max_words=150,
            contour_width=0,
        ).generate(subset)

        fig, ax = plt.subplots(figsize=(10, 5))
        ax.imshow(wc, interpolation="bilinear")
        ax.axis("off")
        ax.set_title(
            f"Most Common Words in {tag} Reviews",
            fontsize=14, fontweight="bold", pad=12, color="#e8eaf0"
        )
        plt.tight_layout()

        if save:
            path = os.path.join(VISUALS_DIR, f"wordcloud_{tag.lower()}.png")
            fig.savefig(path, dpi=150, bbox_inches="tight", facecolor="#0a0b0f")
            print(f"  ✔ Saved: {path}")
        plt.close(fig)


# ─────────────────────────────────────────────────────────────
# 6. Class distribution bar chart
# ─────────────────────────────────────────────────────────────
def plot_class_distribution(df, label_col: str = "label", save: bool = True):
    counts = df[label_col].value_counts()
    labels_display = {"CG": "Fake (CG)", "OR": "Real (OR)"}
    colors = ["#ff4d6d", "#00d4aa"]

    fig, ax = plt.subplots(figsize=(5, 4))
    bars = ax.bar(
        [labels_display.get(l, l) for l in counts.index],
        counts.values,
        color=colors,
        width=0.5,
        edgecolor="#2a2d3a",
    )
    for bar in bars:
        ax.text(
            bar.get_x() + bar.get_width() / 2,
            bar.get_height() + 200,
            f"{int(bar.get_height()):,}",
            ha="center", va="bottom", fontsize=11
        )
    ax.set_title("Class Distribution — Fake vs Real Reviews", fontsize=13, fontweight="bold", pad=12)
    ax.set_ylabel("Number of Reviews")
    ax.grid(True, axis="y", alpha=0.15)
    plt.tight_layout()

    if save:
        path = os.path.join(VISUALS_DIR, "class_distribution.png")
        fig.savefig(path, dpi=150, bbox_inches="tight")
        print(f"  ✔ Saved: {path}")
    plt.close(fig)


# ─────────────────────────────────────────────────────────────
# 7. Feature importance (Random Forest)
# ─────────────────────────────────────────────────────────────
def plot_feature_importance(rf_pipeline, feature_names_numeric: list, save: bool = True):
    """
    Plots the top-20 feature importances from the Random Forest pipeline.
    """
    rf_model = rf_pipeline.named_steps["classifier"]
    preprocessor = rf_pipeline.named_steps["preprocessor"]

    # TF-IDF feature names
    tfidf_names = list(
        preprocessor.named_transformers_["tfidf"].get_feature_names_out()
    )
    all_names = tfidf_names + feature_names_numeric

    importances = rf_model.feature_importances_
    indices = np.argsort(importances)[-20:][::-1]

    top_names  = [all_names[i] for i in indices]
    top_values = importances[indices]

    fig, ax = plt.subplots(figsize=(8, 6))
    bars = ax.barh(
        range(len(top_names)), top_values[::-1],
        color="#6c63ff", alpha=0.85, edgecolor="#2a2d3a"
    )
    ax.set_yticks(range(len(top_names)))
    ax.set_yticklabels(top_names[::-1], fontsize=9)
    ax.set_xlabel("Feature Importance Score")
    ax.set_title("Top 20 Feature Importances — Random Forest", fontsize=13, fontweight="bold", pad=12)
    ax.grid(True, axis="x", alpha=0.15)
    plt.tight_layout()

    if save:
        path = os.path.join(VISUALS_DIR, "feature_importance.png")
        fig.savefig(path, dpi=150, bbox_inches="tight")
        print(f"  ✔ Saved: {path}")
    plt.close(fig)
