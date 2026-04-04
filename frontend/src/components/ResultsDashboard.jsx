// components/ResultsDashboard.jsx
import { useState } from "react"
import VideoPlayer from "./VideoPlayer"
import SpeedLegend from "./SpeedLegend"

const API = "http://localhost:8000"

export default function ResultsDashboard({ results, jobId, onReset }) {
  const [activeTab, setActiveTab] = useState("annotated")
  const meta = results.stats || {}

  const videos = {
    annotated: {
      label: "Annotated",
      url:   results.annotated_video,
      desc:  "YOLOv8 detections + ByteTrack IDs — each player gets a consistent color+number",
    },
    eagle: {
      label: "Eagle View",
      url:   results.eagle_video,
      desc:  "Top-down pitch with speed-colored trajectories. Green = slow → Red = fast.",
    },
    side: {
      label: "Side View",
      url:   results.side_video,
      desc:  "Ball height curve — horizontal = pitch distance, vertical = estimated height (m)",
    },
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Analysis Complete</h2>
          <p className="text-gray-600 text-xs mt-0.5 font-mono">job: {jobId?.slice(0, 8)}…</p>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-gray-500 hover:text-white border border-gray-700
                     hover:border-gray-500 rounded-lg px-3 py-1.5 transition-all"
        >
          ← New Video
        </button>
      </div>

      {/* Meta row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Frames",   value: meta.total_frames ?? "—",              color: "text-emerald-400" },
          { label: "FPS",      value: meta.fps ?? "—",                       color: "text-sky-400"     },
          { label: "Duration", value: meta.duration_s ? `${meta.duration_s}s` : "—", color: "text-violet-400" },
          { label: "Players",  value: meta.players_tracked ?? "—",           color: "text-yellow-400"  },
        ].map((m) => (
          <div key={m.label}
               className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center
                          hover:border-gray-700 transition-colors">
            <div className={`${m.color} font-bold text-2xl tabular-nums`}>{m.value}</div>
            <div className="text-gray-600 text-[11px] mt-0.5">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Main body */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Video section */}
        <div className="xl:col-span-2 space-y-3">
          {/* Tab bar */}
          <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1">
            {Object.entries(videos).map(([key, v]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all
                  ${activeTab === key
                    ? "bg-gray-700 text-emerald-400"
                    : "text-gray-500 hover:text-gray-300"
                  }`}
              >
                {v.label}
              </button>
            ))}
          </div>

          <VideoPlayer
            src={`${API}${videos[activeTab].url}`}
            label={videos[activeTab].label}
          />
          <p className="text-gray-600 text-xs px-1">{videos[activeTab].desc}</p>

          {(activeTab === "eagle" || activeTab === "side") && (
            <SpeedLegend />
          )}

          {/* Side-by-side toggle */}
          <details className="group">
            <summary className="text-xs text-gray-600 hover:text-gray-400 cursor-pointer
                                py-2 border-t border-gray-800 select-none transition-colors">
              ▶ Compare: Annotated + Eagle View side-by-side
            </summary>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <VideoPlayer src={`${API}${results.annotated_video}`} label="Annotated" />
              <VideoPlayer src={`${API}${results.eagle_video}`}     label="Eagle View" />
            </div>
          </details>
        </div>

        {/* Stats panel */}
        <StatsPanel statsUrl={results.stats_url} />
      </div>

      {/* Downloads */}
      <div className="border-t border-gray-800 pt-4">
        <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-3 font-semibold">
          Downloads
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "📹 Annotated",  url: results.annotated_video, fn: "annotated.mp4"   },
            { label: "🦅 Eagle View", url: results.eagle_video,     fn: "eagle_view.mp4"  },
            { label: "📐 Side View",  url: results.side_video,      fn: "side_view.mp4"   },
            { label: "📊 Stats JSON", url: results.stats_url,       fn: "stats.json"      },
          ].map((d) => (
            <a
              key={d.label}
              href={`${API}${d.url}`}
              download={d.fn}
              className="text-xs bg-gray-900 hover:bg-gray-800 border border-gray-700
                         hover:border-gray-500 text-gray-300 rounded-lg px-4 py-2 transition-all"
            >
              {d.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Stats panel
// ─────────────────────────────────────────────────────────────────────────────
function StatsPanel({ statsUrl }) {
  const [tab, setTab]     = useState("ball")
  const [data, setData]   = useState(null)
  const [loading, setLoad] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const load = () => {
    if (loaded || loading) return
    setLoad(true)
    fetch(`${API}${statsUrl}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoad(false); setLoaded(true) })
      .catch(() => setLoad(false))
  }

  return (
    <div
      className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden flex flex-col"
      onMouseEnter={load}
      onClick={load}
    >
      {/* Tabs */}
      <div className="flex border-b border-gray-800 shrink-0">
        {[
          { key: "ball",    icon: "⚽", label: "Ball"    },
          { key: "players", icon: "👤", label: "Players" },
          { key: "kicks",   icon: "👟", label: "Kicks"   },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); load() }}
            className={`flex-1 py-2.5 text-xs font-medium transition-all
              ${tab === t.key
                ? "text-yellow-400 border-b-2 border-yellow-400 bg-gray-800/50"
                : "text-gray-500 hover:text-gray-300"
              }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: "560px" }}>
        {loading && <LoadingDots />}
        {!loading && !data && (
          <div className="text-center text-gray-700 text-xs py-10">
            Click or hover to load stats
          </div>
        )}
        {data && tab === "ball"    && <BallTab    ball={data.ball} />}
        {data && tab === "players" && <PlayersTab players={data.players} />}
        {data && tab === "kicks"   && <KicksTab   kicks={data.ball?.kick_events ?? []} />}
      </div>
    </div>
  )
}

// ─── Ball tab ────────────────────────────────────────────────────────────────
function BallTab({ ball }) {
  if (!ball) return <Empty msg="No ball data — ball may not have been detected in your clip" />
  return (
    <div className="space-y-4">
      <SectionLabel>Ball Metrics</SectionLabel>
      <div className="space-y-2">
        {[
          ["Total Distance",  `${ball.total_distance_m} m`],
          ["Avg Speed",       `${ball.avg_speed_ms} m/s  (${ball.avg_speed_kmh} km/h)`],
          ["Max Speed",       `${ball.max_speed_ms} m/s  (${ball.max_speed_kmh} km/h)`],
          ["Max Height",      `${ball.max_height_m} m`],
          ["Avg Height",      `${ball.avg_height_m} m`],
          ["Total Kicks",     ball.total_kicks],
        ].map(([l, v]) => (
          <div key={l} className="flex justify-between text-xs">
            <span className="text-gray-500">{l}</span>
            <span className="text-gray-200 font-medium tabular-nums">{v}</span>
          </div>
        ))}
      </div>
      <SectionLabel>Max speed vs typical game range</SectionLabel>
      <Gauge pct={Math.min(100, (ball.max_speed_kmh / 120) * 100)} label={`${ball.max_speed_kmh} km/h`} color="red" />
    </div>
  )
}

// ─── Players tab ─────────────────────────────────────────────────────────────
function PlayersTab({ players }) {
  if (!players?.length) return <Empty msg="No player data available" />
  const maxDist  = Math.max(...players.map(p => p.total_distance_m), 1)
  const maxSpeed = Math.max(...players.map(p => p.max_speed_kmh), 1)
  return (
    <div className="space-y-3">
      <SectionLabel>{players.length} Players Tracked</SectionLabel>
      {players.slice(0, 12).map((p) => (
        <div key={p.player_id}
             className="bg-gray-800/50 border border-gray-700/40 rounded-xl p-3 space-y-2
                        hover:border-gray-600/60 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-900/80 border border-emerald-600/60
                              flex items-center justify-center text-[10px] text-emerald-400 font-bold shrink-0">
                {p.player_id}
              </div>
              <span className="text-sm font-semibold text-white">Player #{p.player_id}</span>
            </div>
            <span className="text-gray-600 text-[10px]">{p.frames_tracked} frames</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-center">
            {[
              { l: "Dist",     v: `${p.total_distance_m}m`  },
              { l: "Avg",      v: `${p.avg_speed_kmh}km/h`  },
              { l: "Max",      v: `${p.max_speed_kmh}km/h`  },
            ].map((s) => (
              <div key={s.l} className="bg-gray-900/60 rounded-lg py-1.5">
                <div className="text-white text-xs font-semibold">{s.v}</div>
                <div className="text-gray-600 text-[9px]">{s.l}</div>
              </div>
            ))}
          </div>

          <Gauge pct={(p.total_distance_m / maxDist)  * 100} color="emerald" />
          <Gauge pct={(p.max_speed_kmh    / maxSpeed) * 100} color="yellow"  />
        </div>
      ))}
    </div>
  )
}

// ─── Kicks tab ────────────────────────────────────────────────────────────────
function KicksTab({ kicks }) {
  if (!kicks?.length) return <Empty msg="No kick events detected. Try a clip with clear passes or shots." />
  return (
    <div className="space-y-3">
      <SectionLabel>{kicks.length} Kick Events</SectionLabel>
      {kicks.map((k, i) => (
        <div key={i}
             className="bg-gray-800/50 border border-gray-700/40 rounded-xl p-3 space-y-2
                        hover:border-yellow-700/40 transition-colors">
          <div className="flex justify-between items-center">
            <span className="text-yellow-400 font-bold text-sm">Kick #{i + 1}</span>
            <span className="text-gray-600 text-[10px]">frame {k.frame}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-900/60 rounded-lg p-2 text-center">
              <div className="text-white font-bold">{k.kick_speed_kmh} km/h</div>
              <div className="text-gray-600 text-[9px]">Speed</div>
            </div>
            <div className="bg-gray-900/60 rounded-lg p-2 text-center">
              <div className="text-white font-bold">{k.angle_deg}°</div>
              <div className="text-gray-600 text-[9px]">
                {dirLabel(k.angle_deg)}
              </div>
            </div>
          </div>
          <Gauge pct={Math.min(100, (k.kick_speed_kmh / 120) * 100)} color="red" />
          {/* Pitch position mini-map */}
          <div className="relative h-7 rounded bg-green-950/50 border border-green-900/40 overflow-hidden">
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-green-800/30" />
            <div
              className="absolute w-2 h-2 rounded-full bg-yellow-400 shadow-yellow-400/50 shadow-md
                         -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${Math.min(99, (k.eagle_x / 840) * 100)}%`,
                top:  `${Math.min(99, (k.eagle_y / 544) * 100)}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Micro components ─────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest
                    pb-1 border-b border-gray-800">
      {children}
    </div>
  )
}

function Gauge({ pct, label, color = "emerald" }) {
  const grads = {
    emerald: "from-emerald-700 to-emerald-400",
    yellow:  "from-yellow-700  to-yellow-400",
    red:     "from-orange-600  to-red-400",
  }
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${grads[color] ?? grads.emerald}
                      rounded-full transition-all duration-700`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
      {label && <span className="text-[10px] text-gray-500 tabular-nums w-16 text-right">{label}</span>}
    </div>
  )
}

function Empty({ msg }) {
  return <div className="text-center py-10 text-gray-700 text-xs leading-relaxed px-2">{msg}</div>
}

function LoadingDots() {
  return (
    <div className="flex justify-center gap-1.5 py-10">
      {[0, 1, 2].map(i => (
        <div key={i}
             className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce"
             style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </div>
  )
}

function dirLabel(deg) {
  if (deg == null) return ""
  const d = ((deg % 360) + 360) % 360
  if (d < 22.5  || d >= 337.5) return "→ right"
  if (d < 67.5)                return "↗ forward-right"
  if (d < 112.5)               return "↑ forward"
  if (d < 157.5)               return "↖ forward-left"
  if (d < 202.5)               return "← left"
  if (d < 247.5)               return "↙ back-left"
  if (d < 292.5)               return "↓ back"
  return                              "↘ back-right"
}
