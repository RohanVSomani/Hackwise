import { useEffect, useState } from 'react'
import VideoPanel from '../components/VideoPanel'
import StatPanel from '../components/StatPanel'

/**
 * Results: three synchronized video panels + JSON-driven stats sidebar.
 * Videos load only after stats.json exists (outputs are complete) and use a
 * cache-busting query so the browser does not reuse a partial/cached MP4.
 */
export default function DashboardPage({ apiBase, jobId }) {
  const [stats, setStats] = useState(null)
  const [err, setErr] = useState(null)
  const [mediaKey, setMediaKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    let intervalId = null

    const load = async () => {
      try {
        const res = await fetch(`${apiBase}/api/results/${jobId}/stats`)
        if (!res.ok) throw new Error('Stats not available yet')
        const data = await res.json()
        if (!cancelled) {
          setStats(data)
          setMediaKey(Date.now())
          setErr(null)
          if (intervalId !== null) {
            clearInterval(intervalId)
            intervalId = null
          }
        }
      } catch (e) {
        if (!cancelled) setErr(e.message)
      }
    }

    load()
    intervalId = setInterval(load, 2000)

    return () => {
      cancelled = true
      if (intervalId !== null) clearInterval(intervalId)
    }
  }, [apiBase, jobId])

  const base = `${apiBase}/outputs/${jobId}`
  const url = (name) =>
    stats ? `${base}/${name}?v=${mediaKey}` : null

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <VideoPanel
          title="Annotated video"
          description="YOLOv8 detections + ByteTrack IDs"
          src={url('processed_video.mp4')}
        />
        <div className="grid gap-6 md:grid-cols-2">
          <VideoPanel
            title="Eagle view (top-down)"
            description="Homography → pitch; speed-colored paths"
            src={url('top_view.mp4')}
          />
          <VideoPanel
            title="Side view (height)"
            description="Distance vs estimated height + physics reference"
            src={url('side_view.mp4')}
          />
        </div>
      </div>

      <aside className="space-y-4">
        {err && !stats && (
          <p className="rounded-lg border border-amber-900/40 bg-amber-950/30 px-3 py-2 text-sm text-amber-200">
            Waiting for stats… {err}
          </p>
        )}
        <StatPanel stats={stats} jobId={jobId} />
      </aside>
    </div>
  )
}
