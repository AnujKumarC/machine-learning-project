import { useState, useCallback, useEffect } from 'react'
import { AlertCircle, Shield } from 'lucide-react'
import Header from './components/Header'
import ReviewForm from './components/ReviewForm'
import ResultCard from './components/ResultCard'
import MetricsPanel from './components/MetricsPanel'
import styles from './App.module.css'

// ── Baseline benchmark data for model comparison matrix ──
const MOCK_METRICS = {
  svm:                 { accuracy: 0.912, precision: 0.924, recall: 0.899, f1: 0.911 },
  logistic_regression: { accuracy: 0.887, precision: 0.901, recall: 0.871, f1: 0.886 },
  random_forest:       { accuracy: 0.894, precision: 0.908, recall: 0.879, f1: 0.893 },
  naive_bayes:         { accuracy: 0.853, precision: 0.868, recall: 0.836, f1: 0.852 },
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')

async function callPredict(review, rating) {
  const endpoint = API_BASE_URL ? `${API_BASE_URL}/predict` : '/predict'
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ review, rating }),
  })

  if (!res.ok) {
    let errorDetail = `Backend HTTP error ${res.status}`
    try {
      const errData = await res.json()
      if (errData && errData.detail) {
        errorDetail = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail)
      }
    } catch {
      // Body not JSON
    }
    throw new Error(errorDetail)
  }

  return await res.json()
}

export default function App() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [metrics, setMetrics] = useState(MOCK_METRICS)

  useEffect(() => {
    const metricsEndpoint = API_BASE_URL ? `${API_BASE_URL}/metrics` : '/metrics'
    fetch(metricsEndpoint)
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data && (data.models || typeof data === 'object')) {
          setMetrics(data)
        }
      })
      .catch(() => {
        // Fall back to baseline benchmark matrix
      })
  }, [])

  const handleAnalyze = useCallback(async ({ review, rating }) => {
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const data = await callPredict(review, rating)
      setResult(data)
    } catch (err) {
      setError(err?.message || 'Analysis interrupted: Unable to process manuscript vectors. Please verify pipeline status.')
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <div className={styles.app}>
      <Header />

      <main className={styles.main} id="main-content">
        <section className={styles.heroSection} aria-label="Review manuscript input">
          <ReviewForm onAnalyze={handleAnalyze} loading={loading} />

          {error && (
            <div className={styles.errorBanner} role="alert">
              <AlertCircle size={18} strokeWidth={2.2} className={styles.errorIcon} />
              <span>{error}</span>
            </div>
          )}

          {(loading || result) && (
            <ResultCard result={result} loading={loading} />
          )}
        </section>

        <section className={styles.metricsSection} aria-label="Model performance benchmarks">
          <MetricsPanel metrics={metrics} />
        </section>
      </main>

      <footer className={styles.footer} role="contentinfo">
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <Shield size={14} strokeWidth={2.2} />
            <span>ReviewGuard</span>
          </div>
          <span className={styles.footerDot} aria-hidden="true">·</span>
          <span>Machine Learning Systems</span>
          <span className={styles.footerDot} aria-hidden="true">·</span>
          <span>Calibrated Ensemble Architecture</span>
        </div>
      </footer>
    </div>
  )
}
