import styles from './Background.module.css'

export default function Background() {
  return (
    <div className={styles.bg} aria-hidden="true">
      <div className={styles.ambientAura1} />
      <div className={styles.ambientAura2} />
      <div className={styles.ambientAura3} />
      <div className={styles.lensGrid} />
      <div className={styles.noiseOverlay} />
    </div>
  )
}
