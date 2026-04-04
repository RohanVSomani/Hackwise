// App.jsx — Football Analytics Dashboard (Fixed)
// Features: Upload → Processing → Results with video players + stats

import { useState, useRef, useCallback } from "react"
import UploadPage from "./components/UploadPage"
import ResultsDashboard from "./components/ResultsDashboard"

export default function App() {
  const [page, setPage] = useState("upload")   // "upload" | "processing" | "results"
  const [jobId, setJobId] = useState(null)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const esRef = useRef(null)

  const handleUpload = useCallback(async (file) => {
    setError(null)
    setProgress(0)
    setPage("processing")

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      })
      if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`)
      const { job_id } = await res.json()
      setJobId(job_id)

      // Start SSE progress stream
      const es = new EventSource(`http://localhost:8000/progress/${job_id}`)
      esRef.current = es

      es.onmessage = (e) => {
        const data = JSON.parse(e.data)
        if (data.status === "error") {
          setError(data.message)
          setPage("upload")
          es.close()
          return
        }
        setProgress(data.progress || 0)
        if (data.status === "done") {
          es.close()
          fetchResults(job_id)
        }
      }

      es.onerror = () => {
        setError("Lost connection to server")
        setPage("upload")
        es.close()
      }
    } catch (err) {
      setError(err.message)
      setPage("upload")
    }
  }, [])

  const fetchResults = async (jid) => {
    try {
      const res = await fetch(`http://localhost:8000/results/${jid}`)
      if (!res.ok) throw new Error("Failed to fetch results")
      const data = await res.json()
      setResults(data)
      setPage("results")
    } catch (err) {
      setError(err.message)
      setPage("upload")
    }
  }

  const handleReset = () => {
    if (esRef.current) esRef.current.close()
    setPage("upload")
    setJobId(null)
    setProgress(0)
    setResults(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-mono">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-3 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-emerald-400 font-bold tracking-widest text-sm uppercase">
          Football Analytics System
        </span>
        <span className="text-gray-600 text-xs ml-auto">v2.0 — YOLOv8 + ByteTrack</span>
      </header>

      {/* Error banner */}
      {error && (
        <div className="bg-red-900/40 border border-red-700 text-red-300 px-6 py-3 text-sm flex items-center justify-between">
          <span>⚠ {error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-200">✕</button>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-6">
        {page === "upload" && <UploadPage onUpload={handleUpload} />}

        {page === "processing" && (
          <ProcessingPage progress={progress} />
        )}

        {page === "results" && results && (
          <ResultsDashboard
            results={results}
            jobId={jobId}
            onReset={handleReset}
          />
        )}
      </main>
    </div>
  )
}

function ProcessingPage({ progress }) {
  const stages = [
    { label: "Detection (YOLOv8)", done: progress > 10 },
    { label: "Tracking (ByteTrack)", done: progress > 25 },
    { label: "Homography calibration", done: progress > 35 },
    { label: "Eagle view rendering", done: progress > 55 },
    { label: "Side view (height)", done: progress > 70 },
    { label: "Analytics computation", done: progress > 85 },
    { label: "Exporting videos + JSON", done: progress > 95 },
  ]

  return (
    <div className="max-w-xl mx-auto mt-16 space-y-8">
      <div className="text-center space-y-2">
        <div className="text-3xl font-bold text-emerald-400">{progress}%</div>
        <div className="text-gray-400 text-sm">Processing your video…</div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Stage list */}
      <div className="space-y-2">
        {stages.map((s) => (
          <div key={s.label} className="flex items-center gap-3 text-sm">
            <span className={s.done ? "text-emerald-400" : "text-gray-600"}>
              {s.done ? "✓" : "○"}
            </span>
            <span className={s.done ? "text-gray-300" : "text-gray-600"}>
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
