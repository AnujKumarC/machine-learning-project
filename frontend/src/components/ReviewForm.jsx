import { useState, useCallback, useRef } from 'react'
import { Star, ArrowRight, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react'
import styles from './ReviewForm.module.css'

const STAR_LABELS = ['', '1.0 Poor', '2.0 Fair', '3.0 Average', '4.0 Good', '5.0 Excellent']

const SAMPLE_REVIEWS = [
  {
    label: 'Fake Sample',
    type: 'fake',
    text: 'BEST PRODUCT EVER!!!! I bought this for my whole family and everyone LOVES it!!! 5 stars is not enough!! Will buy again and again!! Amazing amazing amazing!!!',
    rating: 5,
  },
  {
    label: 'Real Sample',
    type: 'real',
    text: "I've been using this for about three weeks now. The build quality is decent but the battery life is shorter than advertised. Good for the price, but don't expect premium performance.",
    rating: 3,
  },
]

export default function ReviewForm({ onAnalyze, loading }) {
  const [review, setReview] = useState('')
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const textareaRef = useRef(null)

  const handleSubmit = useCallback(
    e => {
      e?.preventDefault()
      const clean = review.trim()
      if (clean.length < 10 || loading) return
      onAnalyze({ review: clean, rating: rating || 3 })
    },
    [review, rating, loading, onAnalyze]
  )

  const handleKeyDown = useCallback(
    e => {
      // Shortcut: Cmd/Ctrl + Enter submits immediately
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        handleSubmit()
      }
    },
    [handleSubmit]
  )

  const loadSample = useCallback(sample => {
    setReview(sample.text)
    setRating(sample.rating)
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [])

  const handleClear = useCallback(() => {
    setReview('')
    setRating(0)
    setHovered(0)
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [])

  const charCount = review.length
  const isReady = review.trim().length >= 10 && !loading
  const currentRating = hovered || rating

  return (
    <form
      id="workspace"
      className={styles.console}
      onSubmit={handleSubmit}
      aria-label="Review analysis workspace"
      noValidate
    >
      {/* ── Console Header Bar ── */}
      <div className={styles.consoleHeader}>
        <div className={styles.headerLeft}>
          <label htmlFor="review-textarea" className={styles.inputLabel}>
            Input
          </label>
          <div className={styles.presetGroup}>
            {SAMPLE_REVIEWS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                className={`${styles.presetBtn} ${sample.type === 'fake' ? styles.presetFake : styles.presetReal}`}
                onClick={() => loadSample(sample)}
                aria-label={`Load example review: ${sample.label}`}
              >
                {sample.type === 'fake' ? (
                  <AlertCircle size={12} strokeWidth={2.4} />
                ) : (
                  <CheckCircle2 size={12} strokeWidth={2.4} />
                )}
                <span>{sample.label}</span>
              </button>
            ))}
          </div>
        </div>

        {charCount > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className={styles.clearBtn}
            title="Clear text"
          >
            <RotateCcw size={12} strokeWidth={2} />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* ── Carefully Contrasted Inset Writing Surface ── */}
      <div className={styles.textareaWrapper}>
        <div className={styles.textareaInset}>
          <textarea
            ref={textareaRef}
            id="review-textarea"
            className={styles.textarea}
            placeholder="Paste product review to analyze..."
            value={review}
            onChange={e => setReview(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={5}
            maxLength={2000}
            required
            aria-required="true"
            aria-describedby="workspace-status"
          />
        </div>
      </div>

      {/* ── Integrated Bottom Dock Toolbar ── */}
      <div className={styles.consoleFooter}>
        <div className={styles.footerLeft}>
          {/* Star Rating Inline Picker */}
          <div className={styles.ratingControl}>
            <span id="star-picker-label" className={styles.ratingLabel}>
              Star Rating
            </span>
            <div
              className={styles.starsTrack}
              role="group"
              aria-labelledby="star-picker-label"
              aria-label={`Rating: ${rating > 0 ? STAR_LABELS[rating] : 'Optional (default 3.0)'}`}
            >
              {[1, 2, 3, 4, 5].map(n => {
                const isFilled = n <= currentRating
                return (
                  <button
                    key={n}
                    type="button"
                    className={`${styles.starBtn} ${isFilled ? styles.starFilled : ''}`}
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHovered(n)}
                    onMouseLeave={() => setHovered(0)}
                    aria-label={`${n} star${n > 1 ? 's' : ''}`}
                    aria-pressed={rating === n}
                  >
                    <Star
                      size={18}
                      strokeWidth={1.75}
                      className={styles.starIcon}
                      fill={isFilled ? 'currentColor' : 'transparent'}
                    />
                  </button>
                )
              })}
            </div>
            <span className={styles.ratingFeedback}>
              {currentRating > 0 ? STAR_LABELS[currentRating] : 'Optional (default 3.0)'}
            </span>
          </div>

          <div id="workspace-status" className={styles.statusReadout}>
            <span className={styles.counter}>
              {charCount.toLocaleString()} / 2,000
            </span>
            {review.trim().length > 0 && review.trim().length < 10 && (
              <span className={styles.minWarning}>10 chars min</span>
            )}
          </div>
        </div>

        <div className={styles.footerRight}>
          <button
            id="analyze-btn"
            type="submit"
            className={styles.submitBtn}
            disabled={!isReady}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <span className={styles.spinner} aria-hidden="true" />
                <span>Analyzing…</span>
              </>
            ) : (
              <>
                <span>Analyze</span>
                <ArrowRight size={14} strokeWidth={2.4} className={styles.btnArrow} />
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  )
}
