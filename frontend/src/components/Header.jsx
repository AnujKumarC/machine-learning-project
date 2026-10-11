import { ShieldCheck, Sparkles, Cpu } from 'lucide-react'
import styles from './Header.module.css'

export default function Header() {
  return (
    <header className={styles.header} role="banner">
      <div className={styles.topBar}>
        <div className={styles.systemCapsule}>
          <span className={styles.statusPulse} aria-hidden="true" />
          <Sparkles className={styles.capsuleIcon} size={13} strokeWidth={2.2} />
          <span className={styles.capsuleText}>Neural Defense System · v4.2</span>
        </div>

        <div className={styles.badgeGroup}>
          <div className={styles.specBadge}>
            <Cpu size={12} strokeWidth={2} />
            <span>4-Model Ensemble</span>
          </div>
        </div>
      </div>

      <div className={styles.heroSection}>
        <div className={styles.iconEmblem} aria-hidden="true">
          <div className={styles.emblemGlass}>
            <ShieldCheck className={styles.emblemIcon} size={32} strokeWidth={1.75} />
          </div>
          <div className={styles.emblemGlow} />
        </div>

        <div className={styles.titleGroup}>
          <h1 className={styles.title}>ReviewGuard</h1>
          <p className={styles.subtitle}>Precision Authenticity Intelligence</p>
        </div>
      </div>

      <p className={styles.tagline}>
        Analyze customer reviews with multi-dimensional linguistic vectors.
        Instant classification for <strong className={styles.realTag}>Genuine</strong> and{' '}
        <strong className={styles.fakeTag}>Synthetic</strong> entries.
      </p>
    </header>
  )
}
