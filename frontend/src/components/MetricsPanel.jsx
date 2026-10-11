import { 
  TrendingUp, 
  BarChart3, 
  Zap, 
  Network, 
  Cpu, 
  Sliders, 
  Award,
  CheckCircle2
} from 'lucide-react'
import styles from './MetricsPanel.module.css'

const MODEL_CONFIG = {
  logistic_regression: {
    label: 'Logistic Regression',
    subtitle: 'L2-regularized linear decision boundary',
    Icon: TrendingUp,
    color: 'var(--clr-system-indigo)',
    colorRgb: '94, 92, 230',
  },
  naive_bayes: {
    label: 'Complement Naive Bayes',
    subtitle: 'Multivariate word distribution estimator',
    Icon: BarChart3,
    color: 'var(--clr-system-cyan)',
    colorRgb: '100, 210, 255',
  },
  svm: {
    label: 'Support Vector Machine',
    subtitle: 'Calibrated Platt scaling hyperplanes',
    Icon: Zap,
    color: 'var(--clr-system-orange)',
    colorRgb: '255, 159, 10',
    champion: true,
  },
  random_forest: {
    label: 'Random Forest Ensemble',
    subtitle: 'Bagged Gini impurity tree estimator',
    Icon: Network,
    color: 'var(--clr-system-pink)',
    colorRgb: '255, 55, 95',
  },
}

const METRIC_KEYS = ['accuracy', 'precision', 'recall', 'f1']

function MetricBar({ value, color }) {
  const pct = (value * 100).toFixed(1)
  return (
    <div className={styles.metricBarWrap}>
      <div className={styles.metricBarTrack}>
        <div
          className={styles.metricBarFill}
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className={styles.metricBarValue}>{pct}%</span>
    </div>
  )
}

function ModelCard({ modelKey, data }) {
  const config = MODEL_CONFIG[modelKey] ?? {
    label: modelKey.replace(/_/g, ' '),
    subtitle: 'Machine learning classifier',
    Icon: Cpu,
    color: 'var(--clr-system-blue)',
    colorRgb: '10, 132, 255',
  }
  const { Icon } = config

  return (
    <div
      className={`${styles.modelCard} ${config.champion ? styles.championCard : ''}`}
      style={{
        '--model-accent': config.color,
        '--model-rgb': config.colorRgb,
      }}
    >
      <div className={styles.cardHeader}>
        <div className={styles.iconEmblem}>
          <Icon size={18} strokeWidth={2.2} className={styles.icon} />
        </div>

        <div className={styles.titleArea}>
          <div className={styles.titleRow}>
            <h3 className={styles.modelName}>{config.label}</h3>
            {config.champion && (
              <span className={styles.championBadge}>
                <Award size={11} strokeWidth={2.4} />
                <span>Champion</span>
              </span>
            )}
          </div>
          <span className={styles.modelSubtitle}>{config.subtitle}</span>
        </div>

        <div className={styles.f1Capsule}>
          <span className={styles.f1Label}>F1 Score</span>
          <span className={styles.f1Score}>{(data.f1 * 100).toFixed(1)}%</span>
        </div>
      </div>

      <div className={styles.metricsGrid}>
        {METRIC_KEYS.map(key => (
          <div key={key} className={styles.metricRow}>
            <span className={styles.metricKey}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </span>
            <MetricBar value={data[key]} color={config.color} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function MetricsPanel({ metrics }) {
  if (!metrics) return null

  const models = metrics.models ?? metrics

  return (
    <section className={styles.panel} aria-label="Model performance benchmarks">
      <div className={styles.panelHeader}>
        <div className={styles.headerTag}>
          <Sliders size={13} strokeWidth={2.2} />
          <span>Model Benchmark Telemetry</span>
        </div>

        <h2 className={styles.panelTitle}>Comparative Algorithm Performance</h2>
        <p className={styles.panelSubtitle}>
          Evaluated on 4,087 held-out validation reviews across 8 engineering metrics.
          SVM with calibrated Platt probabilities achieves highest harmonic F1 accuracy.
        </p>
      </div>

      <div className={styles.grid}>
        {Object.entries(models).map(([key, data]) => (
          <ModelCard key={key} modelKey={key} data={data} />
        ))}
      </div>
    </section>
  )
}
