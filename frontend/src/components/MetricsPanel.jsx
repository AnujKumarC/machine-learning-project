import { Award } from 'lucide-react'
import styles from './MetricsPanel.module.css'

const MODEL_INFO = {
  svm: {
    name: 'Support Vector Machine',
    paradigm: 'Linear SVC · Platt Scaling Hyperplane',
    champion: true,
    accent: 'var(--clr-svm)',
    summary: 'Optimal separating boundary in 5,006-dimensional TF-IDF space with Platt scaling calibration.',
  },
  logistic_regression: {
    name: 'Logistic Regression',
    paradigm: 'L2-Regularized Maximum Likelihood',
    champion: false,
    accent: 'var(--clr-lr)',
    summary: 'Fast, interpretable linear baseline with low variance across diverse text lengths.',
  },
  random_forest: {
    name: 'Random Forest Ensemble',
    paradigm: '100 Bagged Gini Decision Trees',
    champion: false,
    accent: 'var(--clr-rf)',
    summary: 'Non-linear tree ensemble invariant to numerical feature scales.',
  },
  naive_bayes: {
    name: 'Complement Naive Bayes',
    paradigm: 'Multivariate Term Frequency Probability',
    champion: false,
    accent: 'var(--clr-nb)',
    summary: 'Bayesian classifier tailored for severe text imbalance and sublinear TF-IDF vectors.',
  },
}

const ORDERED_KEYS = ['svm', 'logistic_regression', 'random_forest', 'naive_bayes']

export default function MetricsPanel({ metrics }) {
  if (!metrics) return null

  const models = metrics.models ?? metrics
  const championKey = 'svm'
  const championData = models[championKey] ?? models[Object.keys(models)[0]]
  const championConfig = MODEL_INFO[championKey]

  return (
    <section id="benchmarks" className={styles.section} aria-label="Model performance benchmarks">
      {/* ── Section Header ── */}
      <div className={styles.header}>
        <div className={styles.eyebrow}>SYSTEM ACCURACY</div>
        <h2 className={styles.headline}>Comparative Model Performance</h2>
        <p className={styles.subtitle}>
          Evaluated across 4,087 held-out validation reviews using an 80/20 stratified split.
          Linear Support Vector Machine with CalibratedClassifierCV achieves champion performance.
        </p>
      </div>

      {/* ── Champion Spotlight Card ── */}
      {championData && (
        <div className={styles.championSpotlight}>
          <div className={styles.spotlightHeader}>
            <div className={styles.spotlightLeft}>
              <div className={styles.championBadge}>
                <Award size={13} strokeWidth={2.4} />
                <span>Champion Model</span>
              </div>
              <h3 className={styles.championTitle}>{championConfig.name}</h3>
              <p className={styles.championParadigm}>{championConfig.paradigm}</p>
            </div>

            <div className={styles.championMetricHighlight}>
              <span className={styles.championF1Value}>
                {(championData.f1 * 100).toFixed(1)}%
              </span>
              <span className={styles.championF1Label}>Harmonic F1 Score</span>
            </div>
          </div>

          <div className={styles.championStatsGrid}>
            <div className={styles.championStat}>
              <span className={styles.statLabel}>Accuracy</span>
              <span className={styles.statValue}>{(championData.accuracy * 100).toFixed(1)}%</span>
            </div>
            <div className={styles.championStat}>
              <span className={styles.statLabel}>Precision</span>
              <span className={styles.statValue}>{(championData.precision * 100).toFixed(1)}%</span>
            </div>
            <div className={styles.championStat}>
              <span className={styles.statLabel}>Recall</span>
              <span className={styles.statValue}>{(championData.recall * 100).toFixed(1)}%</span>
            </div>
            <div className={styles.championStat}>
              <span className={styles.statLabel}>Harmonic F1</span>
              <span className={styles.statValue}>{(championData.f1 * 100).toFixed(1)}%</span>
            </div>
          </div>

          <p className={styles.championNote}>
            {championConfig.summary} Platt scaling probability calibration enables true confidence
            estimates while maintaining maximum margin separation to minimize false-positive classifications.
          </p>
        </div>
      )}

      {/* ── Comparative Benchmark Matrix Container ── */}
      <div className={styles.matrixCard}>
        <div className={styles.matrixHeader}>
          <span className={styles.matrixTitle}>Model Benchmark Matrix</span>
          <span className={styles.matrixMeta}>4,087 Validation Samples · 80/20 Stratified Split</span>
        </div>

        {/* ── Desktop & Tablet Responsive Table (>= 600px) ── */}
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

        {/* ── Mobile-Optimized Stacked Benchmark Cards (< 600px) ── */}
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

                {info.summary && (
                  <p className={styles.mobileCardSummary}>{info.summary}</p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Metric Definitions & Methodology Guide ── */}
      <div id="methodology" className={styles.definitionsGrid}>
        <div className={styles.defCard}>
          <span className={styles.defName}>Harmonic F1 Score</span>
          <p className={styles.defText}>
            Harmonic mean of precision and recall. Balances detection sensitivity against false accusations,
            ensuring reliable verdicts on imbalanced review distributions.
          </p>
        </div>

        <div className={styles.defCard}>
          <span className={styles.defName}>Precision</span>
          <p className={styles.defText}>
            When ReviewGuard classifies a manuscript as synthetic, precision measures the probability
            that it is genuinely fake, preventing genuine reviews from being flagged.
          </p>
        </div>

        <div className={styles.defCard}>
          <span className={styles.defName}>Recall</span>
          <p className={styles.defText}>
            Measures the percentage of total fraudulent reviews in the dataset correctly caught
            by the model without slipping through undetected.
          </p>
        </div>

        <div className={styles.defCard}>
          <span className={styles.defName}>Platt Calibration</span>
          <p className={styles.defText}>
            Applies logistic sigmoid regression over raw SVM decision distances to produce
            calibrated posterior probabilities rather than arbitrary distance scores.
          </p>
        </div>
      </div>
    </section>
  )
}
