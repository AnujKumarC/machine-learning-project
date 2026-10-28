import { ShieldCheck, Sparkles } from 'lucide-react'
import styles from './Header.module.css'

export default function Header() {
  return (
    <header className={styles.header}>
      {/* ── Minimal Dark Apple Navigation Bar ── */}
      <nav className={styles.navBar} aria-label="Main navigation">
        <div className={styles.navInner}>
          <div className={styles.navLeft}>
            <a href="#" className={styles.brand} aria-label="ReviewGuard Home">
              <span className={styles.brandIconWrap} aria-hidden="true">
                <ShieldCheck size={17} strokeWidth={2.4} />
              </span>
              <span className={styles.brandTitle}>ReviewGuard</span>
            </a>

            <div className={styles.navLinks}>
              <a href="#workspace" className={styles.navLink}>
                Workspace
              </a>
              <a href="#benchmarks" className={styles.navLink}>
                Benchmarks
              </a>
              <a href="#methodology" className={styles.navLink}>
                Methodology
              </a>
            </div>
          </div>

          <div className={styles.navRight}>
            <div className={styles.modelStatus} title="Current champion classifier model">
              <span className={styles.statusDot} aria-hidden="true" />
              <span className={styles.statusModel}>Calibrated SVM</span>
              <span className={styles.statusScore}>91.1% F1</span>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Apple Editorial Hero Section ── */}
      <section className={styles.heroSection} aria-label="Introduction">
        <div className={styles.eyebrow}>
          <Sparkles size={11} strokeWidth={2.4} aria-hidden="true" />
          <span>TRUST EVERY REVIEW</span>
        </div>
        <h1 className={styles.headline}>Know what’s real.</h1>
        <p className={styles.supportingLine}>
          Discover the signals behind every review with intelligent authenticity analysis.
        </p>
        <p className={styles.description}>
          ReviewGuard analyzes customer manuscripts against calibrated multi-dimensional
          linguistic vectors, exposing synthetic marketing patterns and sentiment discordance in real time.
        </p>
      </section>
    </header>
  )
}
