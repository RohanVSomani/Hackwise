import { useCallback, useRef, useState } from 'react'

/**
 * Drag-and-drop upload with local preview before sending to FastAPI.
 */
export default function UploadPage({ apiBase, onJobStarted }) {
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(0)
  const inputRef = useRef(null)

  const onFile = useCallback((f) => {
    if (!f) return
    if (!f.type.startsWith('video/')) {
      setError('Please choose a video file.')
      return
    }
    setError(null)
    setFile(f)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(f)
    })
  }, [])

  const onDrop = useCallback(
    (e) => {
      e.preventDefault()
      const f = e.dataTransfer.files?.[0]
      onFile(f)
    },
    [onFile],
  )

  const upload = async () => {
    if (!file) return
    setUploading(true)
    setError(null)
    setProgress(0)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch(`${apiBase}/api/upload`, {
        method: 'POST',
        body: fd,
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      const jobId = data.job_id
      // Poll until processing completes
      const poll = async () => {
        const st = await fetch(`${apiBase}/api/jobs/${jobId}`)
        if (!st.ok) throw new Error('Job status failed')
        const j = await st.json()
        setProgress(j.progress ?? 0)
        if (j.status === 'done') {
          setUploading(false)
          onJobStarted(jobId)
          return
        }
        if (j.status === 'error') {
          throw new Error(j.error || 'Processing failed')
        }
        setTimeout(poll, 600)
      }
      poll()
    } catch (e) {
      setError(e.message || String(e))
      setUploading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="mb-2 text-xl font-semibold text-white">Upload match footage</h2>
      <p className="mb-6 text-sm text-slate-400">
        MP4 recommended. The pipeline runs YOLOv8 + ByteTrack, homography mapping, and analytics on the server.
      </p>

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className="cursor-pointer rounded-2xl border-2 border-dashed border-slate-600 bg-slate-900/40 p-10 text-center transition hover:border-emerald-500/50 hover:bg-slate-900/70"
      >
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
        <p className="text-slate-300">Drop a video here or click to browse</p>
        <p className="mt-2 text-xs text-slate-500">.mp4, .mov, .avi, .mkv</p>
      </div>

      {previewUrl && (
        <div className="mt-8 rounded-xl border border-slate-800 bg-black/40 p-4">
          <p className="mb-2 text-sm font-medium text-slate-300">Preview</p>
          <video
            src={previewUrl}
            className="max-h-72 w-full rounded-lg object-contain"
            controls
            muted
          />
          <p className="mt-2 truncate text-xs text-slate-500">{file?.name}</p>
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          disabled={!file || uploading}
          onClick={upload}
          className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {uploading ? 'Processing…' : 'Analyze video'}
        </button>
        {uploading && (
          <div className="flex flex-1 flex-col gap-1">
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${Math.round((progress || 0) * 100)}%` }}
              />
            </div>
            <span className="text-xs text-slate-500">
              {Math.round((progress || 0) * 100)}% — YOLO + tracking + views
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
