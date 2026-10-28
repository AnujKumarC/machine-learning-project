import styles from './MetricsPanel.module.css'

const MODEL_INFO = {
  svm: {
    name: 'Support Vector Machine',
    paradigm: 'Linear SVC',
    champion: true,
    accent: 'var(--clr-svm)',
  },
  logistic_regression: {
    name: 'Logistic Regression',
    paradigm: 'L2 Regularized',
    champion: false,
    accent: 'var(--clr-lr)',
  },
  random_forest: {
    name: 'Random Forest',
    paradigm: '100 Decision Trees',
    champion: false,
    accent: 'var(--clr-rf)',
  },
  naive_bayes: {
    name: 'Complement Naive Bayes',
    paradigm: 'Term Probability',
    champion: false,
    accent: 'var(--clr-nb)',
  },
}

const ORDERED_KEYS = ['svm', 'logistic_regression', 'random_forest', 'naive_bayes']

export default function MetricsPanel({ metrics }) {
  if (!metrics) return null

  const models = metrics.models ?? metrics

  return (
    <section id="benchmarks" className={styles.section} aria-label="Model performance benchmarks">
      {/* ── Section Header ── */}
      <div className={styles.header}>
        <h2 className={styles.headline}>Model Benchmarks</h2>
        <p className={styles.subtitle}>
          Comparative accuracy across 4,087 validation reviews.
        </p>
      </div>

      {/* ── Benchmark Matrix Container ── */}
      <div className={styles.matrixCard}>
        <div className={styles.matrixHeader}>
          <span className={styles.matrixTitle}>Performance Matrix</span>
          <span className={styles.matrixMeta}>80/20 Stratified Split</span>
        </div>

        {/* ── Desktop & Tablet Table (>= 600px) ── */}
        <div className={styles.desktopTableWrapper}>
          <table className={styles.table} aria-label="Model evaluation metrics comparison">
            <thead>
              <tr>
                <th scope="col" className={styles.thModel}>Classifier</th>
                <th scope="col" className={styles.thMetric}>F1 Score</th>
                <th scope="col" className={styles.thMetric}>Accuracy</th>
                <th scope="col" className={styles.thMetric}>Precision</th>
                <th scope="col" className={styles.thMetric}>Recall</th>
              </tr>
            </thead>
            <tbody>
              {ORDERED_KEYS.filter(k => k in models).map(key => {
                const data = models[key]
                const info = MODEL_INFO[key]
                const isChampion = info.champion

                return (
                  <tr
                    key={key}
                    className={`${styles.tr} ${isChampion ? styles.trChampion : ''}`}
                  >
                    <td className={styles.tdModel}>
                      <div className={styles.modelCell}>
                        <span className={styles.modelName}>{info.name}</span>
                        {isChampion && (
                          <span className={styles.miniChampionBadge}>Champion</span>
                        )}
                      </div>
                      <span className={styles.modelParadigm}>{info.paradigm}</span>
                    </td>

                    <td className={styles.tdMetric}>
                      <div className={styles.metricCell}>
                        <span className={`${styles.num} ${isChampion ? styles.numHighlight : ''}`}>
                          {(data.f1 * 100).toFixed(1)}%
                        </span>
                        <div className={styles.microTrack}>
                          <div
                            className={styles.microFill}
                            style={{ width: `${(data.f1 * 100).toFixed(1)}%`, background: info.accent }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className={styles.tdMetric}>
                      <div className={styles.metricCell}>
                        <span className={styles.num}>{(data.accuracy * 100).toFixed(1)}%</span>
                        <div className={styles.microTrack}>
                          <div
                            className={styles.microFill}
                            style={{ width: `${(data.accuracy * 100).toFixed(1)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className={styles.tdMetric}>
                      <div className={styles.metricCell}>
                        <span className={styles.num}>{(data.precision * 100).toFixed(1)}%</span>
                        <div className={styles.microTrack}>
                          <div
                            className={styles.microFill}
                            style={{ width: `${(data.precision * 100).toFixed(1)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className={styles.tdMetric}>
                      <div className={styles.metricCell}>
                        <span className={styles.num}>{(data.recall * 100).toFixed(1)}%</span>
                        <div className={styles.microTrack}>
                          <div
                            className={styles.microFill}
                            style={{ width: `${(data.recall * 100).toFixed(1)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* ── Mobile Stacked Cards (< 600px) ── */}
        <div className={styles.mobileCardsList} aria-label="Mobile model benchmark cards">
          {ORDERED_KEYS.filter(k => k in models).map(key => {
            const data = models[key]
            const info = MODEL_INFO[key]
            const isChampion = info.champion

            return (
              <div
                key={key}
                className={`${styles.mobileCard} ${isChampion ? styles.mobileCardChampion : ''}`}
              >
                <div className={styles.mobileCardHeader}>
                  <div className={styles.mobileCardTitleGroup}>
                    <div className={styles.mobileCardNameRow}>
                      <span className={styles.mobileCardName}>{info.name}</span>
                      {isChampion && (
                        <span className={styles.miniChampionBadge}>Champion</span>
                      )}
                    </div>
                    <span className={styles.mobileCardParadigm}>{info.paradigm}</span>
                  </div>
                </div>

                <div className={styles.mobileMetricsGrid}>
                  <div className={styles.mobileMetricItem}>
                    <span className={styles.mobileMetricLabel}>F1 Score</span>
                    <div className={styles.mobileMetricValueGroup}>
                      <span className={`${styles.mobileMetricValue} ${isChampion ? styles.numHighlight : ''}`}>
                        {(data.f1 * 100).toFixed(1)}%
                      </span>
                      <div className={styles.microTrack}>
                        <div
                          className={styles.microFill}
                          style={{ width: `${(data.f1 * 100).toFixed(1)}%`, background: info.accent }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className={styles.mobileMetricItem}>
                    <span className={styles.mobileMetricLabel}>Accuracy</span>
                    <div className={styles.mobileMetricValueGroup}>
                      <span className={styles.mobileMetricValue}>
                        {(data.accuracy * 100).toFixed(1)}%
                      </span>
                      <div className={styles.microTrack}>
                        <div
                          className={styles.microFill}
                          style={{ width: `${(data.accuracy * 100).toFixed(1)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className={styles.mobileMetricItem}>
                    <span className={styles.mobileMetricLabel}>Precision</span>
                    <div className={styles.mobileMetricValueGroup}>
                      <span className={styles.mobileMetricValue}>
                        {(data.precision * 100).toFixed(1)}%
                      </span>
                      <div className={styles.microTrack}>
                        <div
                          className={styles.microFill}
                          style={{ width: `${(data.precision * 100).toFixed(1)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className={styles.mobileMetricItem}>
                    <span className={styles.mobileMetricLabel}>Recall</span>
                    <div className={styles.mobileMetricValueGroup}>
                      <span className={styles.mobileMetricValue}>
                        {(data.recall * 100).toFixed(1)}%
                      </span>
                      <div className={styles.microTrack}>
                        <div
                          className={styles.microFill}
                          style={{ width: `${(data.recall * 100).toFixed(1)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
