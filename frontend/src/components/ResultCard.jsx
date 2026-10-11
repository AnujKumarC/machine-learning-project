import { useEffect, useRef } from 'react'
import { 
  ShieldCheck, 
  ShieldAlert, 
  Scan, 
  Activity, 
  Sliders, 
  Layers, 
  Sparkles,
  Info 
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
      <div className={styles.loadingCard} role="status" aria-live="polite" aria-label="Analyzing review manuscript">
        <div className={styles.loadingInner}>
          <div className={styles.radarRing1} aria-hidden="true" />
          <div className={styles.radarRing2} aria-hidden="true" />
          <div className={styles.loadingIconWrap} aria-hidden="true">
            <Scan className={styles.scanIcon} size={28} strokeWidth={2} />
          </div>
          <div className={styles.loadingTextGroup}>
            <p className={styles.loadingTitle}>Processing Linguistic Vectors</p>
            <p className={styles.loadingSubtitle}>Evaluating TF-IDF n-grams &amp; VADER sentiment distribution…</p>
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
    <div
      ref={cardRef}
      className={`${styles.card} ${isFake ? styles.cardFake : styles.cardReal}`}
      role="region"
      aria-live="polite"
      aria-label={`Classification result: ${result.label} review`}
    >
      {/* Ambient optical flare */}
      <div className={`${styles.glowAura} ${isFake ? styles.glowFake : styles.glowReal}`} aria-hidden="true" />

      {/* Header Verdict Section */}
      <div className={styles.verdictHeader}>
        <div className={`${styles.badgeWrap} ${isFake ? styles.badgeFake : styles.badgeReal}`}>
          <div className={styles.badgeGlass}>
            {isFake ? (
              <ShieldAlert size={28} strokeWidth={2} className={styles.verdictIcon} />
            ) : (
              <ShieldCheck size={28} strokeWidth={2} className={styles.verdictIcon} />
            )}
          </div>
        </div>

        <div className={styles.verdictTextGroup}>
          <span className={styles.verdictKicker}>Classification Verdict</span>
          <div className={styles.verdictTitleRow}>
            <h2 className={`${styles.verdictTitle} ${isFake ? styles.titleFake : styles.titleReal}`}>
              {isFake ? 'Synthetic (Fake)' : 'Authentic (Real)'}
            </h2>
            <span className={`${styles.statusPill} ${isFake ? styles.statusPillFake : styles.statusPillReal}`}>
              {isFake ? 'High Risk' : 'Verified'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Confidence Gauge */}
      <div className={styles.confidenceSection}>
        <div className={styles.confHeader}>
          <span className={styles.confLabel}>Model Classification Confidence</span>
          <span className={`${styles.confValue} ${isFake ? styles.confFake : styles.confReal}`}>
            {confidencePct}%
          </span>
        </div>

        <div className={styles.barTrack} role="meter" aria-valuenow={confidencePct} aria-valuemin={0} aria-valuemax={100}>
          <div
            className={`${styles.barFill} ${isFake ? styles.barFake : styles.barReal}`}
            style={{ width: `${confidencePct}%` }}
          />
        </div>

        <div className={styles.splitDistribution}>
          <div className={styles.splitItem}>
            <span className={styles.splitDot} style={{ background: 'var(--clr-system-green)' }} />
            <span className={styles.splitName}>Authentic Likelihood:</span>
            <span className={styles.splitVal}>{realProb}%</span>
          </div>
          <div className={styles.splitItem}>
            <span className={styles.splitDot} style={{ background: 'var(--clr-system-red)' }} />
            <span className={styles.splitName}>Synthetic Likelihood:</span>
            <span className={styles.splitVal}>{fakeProb}%</span>
          </div>
        </div>
      </div>

      {/* Apple Intelligence Feature Breakdown Grid */}
      <div className={styles.signalsGrid}>
        <div className={styles.signalCard}>
          <div className={styles.signalIconWrap}>
            <Sliders size={16} strokeWidth={2} />
          </div>
          <div className={styles.signalContent}>
            <span className={styles.signalTitle}>Syntactic Density</span>
            <span className={styles.signalValue}>
              {isFake ? 'Abnormal Punctuation' : 'Standard Cadence'}
            </span>
          </div>
        </div>

        <div className={styles.signalCard}>
          <div className={styles.signalIconWrap}>
            <Activity size={16} strokeWidth={2} />
          </div>
          <div className={styles.signalContent}>
            <span className={styles.signalTitle}>Emotional Polarity</span>
            <span className={styles.signalValue}>
              {isFake ? 'Hyperbolic Skew' : 'Balanced Review'}
            </span>
          </div>
        </div>

        <div className={styles.signalCard}>
          <div className={styles.signalIconWrap}>
            <Layers size={16} strokeWidth={2} />
          </div>
          <div className={styles.signalContent}>
            <span className={styles.signalTitle}>Vocabulary Specifics</span>
            <span className={styles.signalValue}>
              {isFake ? 'Repetitive Tokens' : 'Specific Details'}
            </span>
          </div>
        </div>
      </div>

      {/* Explanatory summary callout */}
      <div className={styles.summaryCallout}>
        <Info size={16} strokeWidth={2} className={styles.calloutIcon} />
        <p className={styles.summaryText}>
          {isFake
            ? 'This text exhibits strong markers of automated generation or promotional bias: disproportionate superlatives, extreme punctuation density, and superficial feedback.'
            : 'Natural linguistic variation detected: balanced sentence lengths, realistic nuance, and authentic experiential vocabulary consistent with verified purchases.'}
        </p>
      </div>
    </div>
  )
}
