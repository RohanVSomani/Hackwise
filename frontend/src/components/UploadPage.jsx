// components/UploadPage.jsx
import { useState, useRef, useCallback } from "react"

export default function UploadPage({ onUpload }) {
  const [file, setFile]       = useState(null)
  const [preview, setPreview] = useState(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef()

  const handleFile = (f) => {
    if (!f || !f.type.startsWith("video/")) {
      alert("Please select a valid video file (.mp4, .avi, .mov)")
      return
    }
    setFile(f)
    const url = URL.createObjectURL(f)
    setPreview(url)
  }

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    handleFile(f)
  }, [])

  const onDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = () => setDragging(false)

  return (
    <div className="max-w-2xl mx-auto mt-12 space-y-6">
      {/* Title */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Upload Football Footage
        </h1>
        <p className="text-gray-500 text-sm">
          Best results with broadcast-angle HD clips (15–60 seconds)
        </p>
      </div>

      {/* Recommended clip info box */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 text-xs text-gray-400 space-y-1">
        <div className="text-emerald-400 font-semibold mb-2">📋 Recommended Input Clip</div>
        <div>✓ Resolution: <span className="text-gray-200">1080p or 720p HD</span></div>
        <div>✓ Duration: <span className="text-gray-200">15–60 seconds</span> (optimal balance)</div>
        <div>✓ Camera: <span className="text-gray-200">Wide-angle broadcast/sideline view</span></div>
        <div>✓ Content: <span className="text-gray-200">Clear pitch markings visible (needed for homography)</span></div>
        <div>✓ Source: <span className="text-gray-200">Premier League / Champions League highlights (YouTube)</span></div>
        <div className="pt-2 text-yellow-500/80">
          ⚠ Avoid: close-up shots, fish-eye lenses, heavily zoomed camera angles
        </div>
      </div>

      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all
          ${dragging
            ? "border-emerald-400 bg-emerald-900/10"
            : "border-gray-700 hover:border-gray-500 bg-gray-900/40"
          }`}
        onClick={() => inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />
        {file ? (
          <div className="space-y-1">
            <div className="text-emerald-400 text-lg">✓ {file.name}</div>
            <div className="text-gray-500 text-xs">
              {(file.size / 1024 / 1024).toFixed(1)} MB — click to change
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-4xl text-gray-600">⬆</div>
            <div className="text-gray-300 font-medium">Drop video here or click to browse</div>
            <div className="text-gray-600 text-xs">MP4, AVI, MOV, MKV</div>
          </div>
        )}
      </div>

      {/* Video preview */}
      {preview && (
        <div className="rounded-xl overflow-hidden border border-gray-800">
          <video
            src={preview}
            controls
            className="w-full max-h-64 bg-black"
          />
        </div>
      )}

      {/* Upload button */}
      {file && (
        <button
          onClick={() => onUpload(file)}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700
                     text-white font-bold rounded-xl transition-all text-sm tracking-wide uppercase"
        >
          Start Analysis →
        </button>
      )}
    </div>
  )
}
