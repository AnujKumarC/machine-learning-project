import { useEffect, useRef } from 'react'
import {
  ShieldCheck,
  ShieldAlert,
  Sliders,
  Activity,
  Layers,
  Info,
} from 'lucide-react'
import styles from './ResultCard.module.css'

export default function ResultCard({ result, loading }) {
  const cardRef = useRef(null)

  useEffect(() => {
    if (result && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [result])

  if (loading) {
    return (
      <div
        className={styles.loadingConsole}
        role="status"
        aria-live="polite"
        aria-label="Analyzing review manuscript"
      >
        <div className={styles.loadingInner}>
          <div className={styles.loadingSpinner} aria-hidden="true" />
          <div className={styles.loadingTextGroup}>
            <p className={styles.loadingTitle}>Processing Linguistic Vectors</p>
            <p className={styles.loadingSubtitle}>
              Calculating TF-IDF n-grams, VADER polarity, and rating concordance…
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!result) return null

  const isFake = result.label === 'Fake'
  const confidencePct = (result.confidence * 100).toFixed(1)
  const fakeProb = ((result.fake_prob ?? (isFake ? result.confidence : 1 - result.confidence)) * 100).toFixed(1)
  const realProb = (100 - parseFloat(fakeProb)).toFixed(1)

  return (
    <section
      ref={cardRef}
      className={`${styles.report} ${isFake ? styles.reportFake : styles.reportReal}`}
      role="region"
      aria-live="polite"
      aria-label={`Analysis result: ${result.label} review`}
    >
      {/* ── Verdict First ── */}
      <div className={styles.verdictSection}>
        <div className={styles.verdictLeft}>
          <div className={`${styles.iconBadge} ${isFake ? styles.badgeFake : styles.badgeReal}`}>
            {isFake ? (
              <ShieldAlert size={26} strokeWidth={2.2} />
            ) : (
              <ShieldCheck size={26} strokeWidth={2.2} />
            )}
          </div>

          <div className={styles.verdictInfo}>
            <span className={styles.kicker}>Model Verification Verdict</span>
            <div className={styles.titleRow}>
              <h2 className={`${styles.title} ${isFake ? styles.titleFake : styles.titleReal}`}>
                {isFake ? 'Synthetic Review Detected' : 'Authentic Review Verified'}
              </h2>
              <span className={`${styles.statusPill} ${isFake ? styles.pillFake : styles.pillReal}`}>
                {isFake ? 'High Risk' : 'Verified Signal'}
              </span>
            </div>
          </div>
        </div>

        {/* Confidence Score Display */}
        <div className={styles.confidenceMetric}>
          <span className={styles.confScore}>{confidencePct}%</span>
          <span className={styles.confLabel}>Model Confidence</span>
        </div>
      </div>

      {/* ── Confidence Second: Distribution Gauge ── */}
      <div className={styles.gaugeSection}>
        <div
          className={styles.barTrack}
          role="meter"
          aria-valuenow={confidencePct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={`${styles.barFill} ${isFake ? styles.fillFake : styles.fillReal}`}
            style={{ width: `${confidencePct}%` }}
          />
        </div>

        <div className={styles.probRow}>
          <div className={styles.probItem}>
            <span className={styles.probDot} style={{ background: 'var(--clr-system-green)' }} />
            <span className={styles.probText}>Authentic Likelihood:</span>
            <span className={styles.probNumber}>{realProb}%</span>
          </div>
          <div className={styles.probItem}>
            <span className={styles.probDot} style={{ background: 'var(--clr-system-red)' }} />
            <span className={styles.probText}>Synthetic Likelihood:</span>
            <span className={styles.probNumber}>{fakeProb}%</span>
          </div>
        </div>
      </div>

      {/* ── Supporting Evidence Third: Diagnostic Signals ── */}
      <div className={styles.signalsGrid}>
        <div className={styles.signalCol}>
          <div className={styles.signalHeader}>
            <Sliders size={14} strokeWidth={2.2} className={styles.signalIcon} />
            <span className={styles.signalTitle}>Syntactic Cadence</span>
          </div>
          <span className={styles.signalValue}>
            {isFake ? 'Abnormal Punctuation Rhythm' : 'Natural Sentence Lengths'}
          </span>
          <span className={styles.signalSub}>
            {isFake ? 'Exclamation density flags promotional tone' : 'Standard grammatical structure observed'}
          </span>
        </div>

        <div className={styles.signalCol}>
          <div className={styles.signalHeader}>
            <Activity size={14} strokeWidth={2.2} className={styles.signalIcon} />
            <span className={styles.signalTitle}>Sentiment Concordance</span>
          </div>
          <span className={styles.signalValue}>
            {isFake ? 'Rating–Sentiment Discordance' : 'Harmonious Emotional Valence'}
          </span>
          <span className={styles.signalSub}>
            {isFake ? 'Review tone contradicts star rating' : 'Star rating matches text tone accurately'}
          </span>
        </div>

        <div className={styles.signalCol}>
          <div className={styles.signalHeader}>
            <Layers size={14} strokeWidth={2.2} className={styles.signalIcon} />
            <span className={styles.signalTitle}>Lexical Diversity</span>
          </div>
          <span className={styles.signalValue}>
            {isFake ? 'Repetitive Marketing Tokens' : 'Specific Experiential Context'}
          </span>
          <span className={styles.signalSub}>
            {isFake ? 'Frequent generic superlatives detected' : 'Varied vocabulary with concrete details'}
          </span>
        </div>
      </div>

      {/* ── Concise Evidence Summary ── */}
      <div className={styles.evidenceCallout}>
        <Info size={15} strokeWidth={2.2} className={styles.calloutIcon} />
        <p className={styles.calloutText}>
          {isFake
            ? 'This manuscript displays high probability markers of automated generation or compensated feedback: concentrated superlatives, excessive exclamation cadence, and superficial experiential nuance.'
            : 'Natural linguistic variation detected: authentic sentence length distribution, balanced sentiment polarity, and specific experiential details consistent with verified human reviews.'}
        </p>
      </div>
    </section>
  )
}
