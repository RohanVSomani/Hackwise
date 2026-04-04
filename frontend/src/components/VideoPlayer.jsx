// components/VideoPlayer.jsx
// Full-featured video player with custom controls, speed selector, and sync option
import { useRef, useState, useEffect, useCallback } from "react"

export default function VideoPlayer({
  src,
  label = "",
  syncRef = null,          // pass another player's ref to sync playback
  className = "",
}) {
  const videoRef  = useRef(null)
  const [playing, setPlaying]   = useState(false)
  const [current, setCurrent]   = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume]     = useState(1)
  const [muted, setMuted]       = useState(true)
  const [speed, setSpeed]       = useState(1)
  const [fullscreen, setFullscreen] = useState(false)
  const containerRef = useRef(null)

  // ── Sync two players ──────────────────────────────────────────────────────
  const handleTimeUpdate = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    setCurrent(v.currentTime)
    // Sync other player if provided
    if (syncRef?.current) {
      const diff = Math.abs(syncRef.current.currentTime - v.currentTime)
      if (diff > 0.1) syncRef.current.currentTime = v.currentTime
    }
  }, [syncRef])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.addEventListener("timeupdate",  handleTimeUpdate)
    v.addEventListener("loadedmetadata", () => setDuration(v.duration || 0))
    v.addEventListener("ended", () => setPlaying(false))
    return () => {
      v.removeEventListener("timeupdate",  handleTimeUpdate)
    }
  }, [handleTimeUpdate])

  // ── Controls ──────────────────────────────────────────────────────────────
  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) { v.play(); setPlaying(true) }
    else          { v.pause(); setPlaying(false) }
  }

  const seek = (e) => {
    const v = videoRef.current
    if (!v) return
    const rect  = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    v.currentTime = ratio * duration
  }

  const changeSpeed = (s) => {
    setSpeed(s)
    if (videoRef.current) videoRef.current.playbackRate = s
  }

  const toggleMute = () => {
    const v = videoRef.current
    if (!v) return
    v.muted = !muted
    setMuted(!muted)
  }

  const toggleFullscreen = () => {
    const c = containerRef.current
    if (!document.fullscreenElement) {
      c?.requestFullscreen()
      setFullscreen(true)
    } else {
      document.exitFullscreen()
      setFullscreen(false)
    }
  }

  const skip = (delta) => {
    const v = videoRef.current
    if (!v) return
    v.currentTime = Math.max(0, Math.min(duration, v.currentTime + delta))
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  const fmt = (s) => {
    if (!s || isNaN(s)) return "0:00"
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60).toString().padStart(2, "0")
    return `${m}:${sec}`
  }

  const pct = duration ? (current / duration) * 100 : 0

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className={`relative bg-black rounded-xl overflow-hidden group select-none ${className}`}
    >
      {/* Label badge */}
      {label && (
        <div className="absolute top-2 left-2 z-10 bg-black/60 text-xs text-emerald-400
                        px-2 py-0.5 rounded font-mono tracking-wider pointer-events-none">
          {label}
        </div>
      )}

      {/* Video element */}
      <video
        ref={videoRef}
        src={src}
        muted={muted}
        loop={false}
        playsInline
        className="w-full cursor-pointer"
        onClick={togglePlay}
        style={{ maxHeight: "340px", display: "block" }}
      />

      {/* Play overlay (shown when paused) */}
      {!playing && (
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer
                     bg-black/30 transition-opacity group-hover:opacity-100 opacity-80"
          onClick={togglePlay}
        >
          <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm
                          border border-white/20 flex items-center justify-center text-2xl">
            ▶
          </div>
        </div>
      )}

      {/* Controls bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent
                      px-3 py-2 space-y-1.5 opacity-0 group-hover:opacity-100 transition-opacity">

        {/* Progress bar */}
        <div
          className="h-1.5 bg-white/20 rounded-full cursor-pointer relative"
          onClick={seek}
        >
          <div
            className="absolute left-0 top-0 h-full bg-emerald-400 rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
          {/* Thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full
                       shadow-lg -translate-x-1/2 pointer-events-none"
            style={{ left: `${pct}%` }}
          />
        </div>

        {/* Button row */}
        <div className="flex items-center gap-2 text-white text-xs">
          {/* Play/pause */}
          <button
            onClick={togglePlay}
            className="text-base w-6 h-6 flex items-center justify-center hover:text-emerald-400 transition-colors"
          >
            {playing ? "⏸" : "▶"}
          </button>

          {/* Skip -5 / +5 */}
          <button onClick={() => skip(-5)}
            className="text-[10px] opacity-70 hover:opacity-100 transition-opacity">
            ⏮5s
          </button>
          <button onClick={() => skip(5)}
            className="text-[10px] opacity-70 hover:opacity-100 transition-opacity">
            5s⏭
          </button>

          {/* Time */}
          <span className="text-gray-400 font-mono text-[10px]">
            {fmt(current)} / {fmt(duration)}
          </span>

          <div className="flex-1" />

          {/* Speed selector */}
          <div className="flex items-center gap-1">
            {[0.5, 1, 1.5, 2].map((s) => (
              <button
                key={s}
                onClick={() => changeSpeed(s)}
                className={`text-[9px] px-1.5 py-0.5 rounded transition-all
                  ${speed === s
                    ? "bg-emerald-500 text-white"
                    : "text-gray-400 hover:text-white"
                  }`}
              >
                {s}×
              </button>
            ))}
          </div>

          {/* Mute */}
          <button
            onClick={toggleMute}
            className="opacity-70 hover:opacity-100 transition-opacity text-base"
          >
            {muted ? "🔇" : "🔊"}
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="opacity-70 hover:opacity-100 transition-opacity text-base"
          >
            {fullscreen ? "⛶" : "⛶"}
          </button>
        </div>
      </div>
    </div>
  )
}
