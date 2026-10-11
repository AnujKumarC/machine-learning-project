import { useState } from 'react'
import { Star, Sparkles, AlertCircle, CheckCircle2, RotateCcw, ArrowRight } from 'lucide-react'
import styles from './ReviewForm.module.css'

const STAR_LABELS = ['', 'Poor (1.0)', 'Fair (2.0)', 'Average (3.0)', 'Good (4.0)', 'Excellent (5.0)']

const SAMPLE_REVIEWS = [
  {
    label: 'Suspicious Synthetic',
    type: 'fake',
    text: 'BEST PRODUCT EVER!!!! I bought this for my whole family and everyone LOVES it!!! 5 stars is not enough!! Will buy again and again!! Amazing amazing amazing!!!',
    rating: 5,
  },
  {
    label: 'Authentic Customer',
    type: 'real',
    text: "I've been using this for about three weeks now. The build quality is decent but the battery life is shorter than advertised. Good for the price, but don't expect premium performance.",
    rating: 3,
  },
]

export default function ReviewForm({ onAnalyze, loading }) {
  const [review, setReview] = useState('')
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)

  function handleSubmit(e) {
    e.preventDefault()
    if (!review.trim() || review.trim().length < 10) return
    onAnalyze({ review: review.trim(), rating: rating || 3 })
  }

  function loadSample(sample) {
    setReview(sample.text)
    setRating(sample.rating)
  }

  function handleClear() {
    setReview('')
    setRating(0)
    setHovered(0)
  }

  const charCount = review.length
  const isReady = review.trim().length >= 10 && !loading

  return (
    <form
      className={styles.card}
      onSubmit={handleSubmit}
      aria-label="Review analysis input form"
      noValidate
    >
      {/* Sample presets bar */}
      <div className={styles.presetsBar}>
        <div className={styles.presetLabelGroup}>
          <span className={styles.presetsLabel}>Diagnostic Presets</span>
        </div>

        <div className={styles.presetButtons}>
          {SAMPLE_REVIEWS.map((s, i) => (
            <button
              key={i}
              type="button"
              className={`${styles.presetBtn} ${s.type === 'fake' ? styles.presetFake : styles.presetReal}`}
              onClick={() => loadSample(s)}
              aria-label={`Load preset sample: ${s.label}`}
            >
              {s.type === 'fake' ? (
                <AlertCircle size={13} strokeWidth={2.2} />
              ) : (
                <CheckCircle2 size={13} strokeWidth={2.2} />
              )}
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Textarea Area */}
      <div className={styles.field}>
        <div className={styles.fieldHeader}>
          <label className={styles.label} htmlFor="review-input">
            Review Manuscript
          </label>
          {review.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className={styles.clearBtn}
              title="Clear input"
            >
              <RotateCcw size={12} strokeWidth={2} />
              <span>Clear</span>
            </button>
          )}
        </div>

        <div className={styles.textareaWrapper}>
          <textarea
            id="review-input"
            className={styles.textarea}
            placeholder="Paste raw customer review, e-commerce feedback, or promotional testimonial here..."
            value={review}
            onChange={e => setReview(e.target.value)}
            rows={5}
            maxLength={2000}
            required
            aria-required="true"
            aria-describedby="char-count"
          />
        </div>

        <div className={styles.fieldFooter}>
          <span className={styles.charHint}>
            {review.trim().length < 10
              ? 'Minimum 10 characters required for inference'
              : 'Vector analysis ready'}
          </span>
          <span id="char-count" className={styles.charCount}>
            {charCount} / 2,000
          </span>
        </div>
      </div>

      {/* Apple-style Interactive Star Selector */}
      <div className={styles.ratingField}>
        <div className={styles.ratingInfo}>
          <label className={styles.label} id="star-label">
            Associated Star Rating
          </label>
          <span className={styles.ratingFeedback}>
            {(hovered || rating) > 0 ? STAR_LABELS[hovered || rating] : 'Optional (default 3.0)'}
          </span>
        </div>

        <div
          className={styles.starsTrack}
          role="group"
          aria-labelledby="star-label"
          aria-label={`Rating: ${rating > 0 ? STAR_LABELS[rating] : 'not selected'}`}
        >
          {[1, 2, 3, 4, 5].map(n => {
            const isFilled = n <= (hovered || rating)
            return (
              <button
                key={n}
                type="button"
                className={`${styles.starBtn} ${isFilled ? styles.starFilled : ''}`}
                onClick={() => setRating(n)}
                onMouseEnter={() => setHovered(n)}
                onMouseLeave={() => setHovered(0)}
                aria-label={`${n} star${n > 1 ? 's' : ''} — ${STAR_LABELS[n]}`}
                aria-pressed={rating === n}
              >
                <Star
                  size={22}
                  strokeWidth={1.8}
                  className={styles.starIcon}
                  fill={isFilled ? 'currentColor' : 'transparent'}
                />
              </button>
            )
          })}
        </div>
      </div>

      {/* Submit Action Bar */}
      <div className={styles.actionBar}>
        <button
          id="analyze-btn"
          type="submit"
          className={styles.submitBtn}
          disabled={!isReady}
          aria-busy={loading}
        >
          {loading ? (
            <>
              <span className={styles.appleSpinner} aria-hidden="true" />
              <span>Analyzing Linguistic Vectors…</span>
            </>
          ) : (
            <>
              <Sparkles size={16} strokeWidth={2.2} />
              <span>Analyze Review</span>
              <ArrowRight size={14} strokeWidth={2.2} className={styles.btnArrow} />
            </>
          )}
        </button>
      </div>
    </form>
  )
}
