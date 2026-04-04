import { useCallback, useState } from 'react'
import UploadPage from './pages/UploadPage'
import DashboardPage from './pages/DashboardPage'

const API = import.meta.env.VITE_API_URL || ''

/**
 * Root shell: toggles between upload flow and results dashboard.
 */
function App() {
  const [jobId, setJobId] = useState(null)
  const [resetToken, setResetToken] = useState(0)

  const handleNewUpload = useCallback(() => {
    setJobId(null)
    setResetToken((t) => t + 1)
  }, [])

  return (
    <div className="min-h-screen bg-[#0b0f14] text-slate-100">
      <header className="border-b border-slate-800/80 bg-[#0f141b]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">
              Football Analytics
            </h1>
            <p className="text-sm text-slate-400">
              Dual-view visualization & advanced metrics
            </p>
          </div>
          {jobId && (
            <button
              type="button"
              onClick={handleNewUpload}
              className="rounded-lg border border-slate-600 bg-slate-800/50 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-700"
            >
              New upload
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {!jobId ? (
          <UploadPage key={resetToken} apiBase={API} onJobStarted={setJobId} />
        ) : (
          <DashboardPage apiBase={API} jobId={jobId} />
        )}
      </main>
    </div>
  )
}

export default App
