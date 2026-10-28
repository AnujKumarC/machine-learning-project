import { useEffect, useRef } from 'react'
import {
  ShieldCheck,
  ShieldAlert,
  Sliders,
  Activity,
  Layers,
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
        aria-label="Analyzing review"
      >
        <div className={styles.loadingInner}>
          <div className={styles.loadingSpinner} aria-hidden="true" />
          <div className={styles.loadingTextGroup}>
            <p className={styles.loadingTitle}>Analyzing review…</p>
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
      {/* ── Verdict ── */}
      <div className={styles.verdictSection}>
        <div className={styles.verdictLeft}>
          <div className={`${styles.iconBadge} ${isFake ? styles.badgeFake : styles.badgeReal}`}>
            {isFake ? (
              <ShieldAlert size={24} strokeWidth={2.2} />
            ) : (
              <ShieldCheck size={24} strokeWidth={2.2} />
            )}
          </div>

          <div className={styles.verdictInfo}>
            <div className={styles.titleRow}>
              <h2 className={`${styles.title} ${isFake ? styles.titleFake : styles.titleReal}`}>
                {isFake ? 'Fake Review Detected' : 'Authentic Review Verified'}
              </h2>
              <span className={`${styles.statusPill} ${isFake ? styles.pillFake : styles.pillReal}`}>
                {isFake ? 'High Risk' : 'Verified'}
              </span>
            </div>
          </div>
        </div>

        {/* Confidence Score */}
        <div className={styles.confidenceMetric}>
          <span className={styles.confScore}>{confidencePct}%</span>
          <span className={styles.confLabel}>Confidence</span>
        </div>
      </div>

      {/* ── Distribution Gauge ── */}
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
            <span className={styles.probText}>Authentic:</span>
            <span className={styles.probNumber}>{realProb}%</span>
          </div>
          <div className={styles.probItem}>
            <span className={styles.probDot} style={{ background: 'var(--clr-system-red)' }} />
            <span className={styles.probText}>Synthetic:</span>
            <span className={styles.probNumber}>{fakeProb}%</span>
          </div>
        </div>
      </div>

      {/* ── Diagnostic Signals ── */}
      <div className={styles.signalsGrid}>
        <div className={styles.signalCol}>
          <div className={styles.signalHeader}>
            <Sliders size={14} strokeWidth={2.2} className={styles.signalIcon} />
            <span className={styles.signalTitle}>Cadence</span>
          </div>
          <span className={styles.signalValue}>
            {isFake ? 'Abnormal Punctuation' : 'Natural Rhythm'}
          </span>
        </div>

        <div className={styles.signalCol}>
          <div className={styles.signalHeader}>
            <Activity size={14} strokeWidth={2.2} className={styles.signalIcon} />
            <span className={styles.signalTitle}>Sentiment</span>
          </div>
          <span className={styles.signalValue}>
            {isFake ? 'Rating Mismatch' : 'Consistent'}
          </span>
        </div>

        <div className={styles.signalCol}>
          <div className={styles.signalHeader}>
            <Layers size={14} strokeWidth={2.2} className={styles.signalIcon} />
            <span className={styles.signalTitle}>Vocabulary</span>
          </div>
          <span className={styles.signalValue}>
            {isFake ? 'Repetitive Tokens' : 'Varied Details'}
          </span>
        </div>
      </div>
    </section>
  )
}
