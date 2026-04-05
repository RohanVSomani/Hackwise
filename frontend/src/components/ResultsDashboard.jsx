// components/ResultsDashboard.jsx
import { useState } from "react"
import VideoPlayer from "./VideoPlayer"
import SpeedLegend from "./SpeedLegend"

const API = "http://localhost:8000"

export default function ResultsDashboard({ results, jobId, onReset }) {
  const [activeTab, setActiveTab] = useState("annotated")

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
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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

      {/* Main Video Section */}
      <div className="space-y-4">
        <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 max-w-sm mx-auto">
          {Object.entries(videos).map(([key, v]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all
                ${activeTab === key
                  ? "bg-gray-700 text-emerald-400"
                  : "text-gray-500 hover:text-gray-300"
                }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        <div className="bg-black rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
          <VideoPlayer
            key={activeTab + "_" + videos[activeTab].url}
            src={`${API}${videos[activeTab].url}`}
            label={videos[activeTab].label}
          />
        </div>
        
        <div className="text-center p-2">
          <p className="text-gray-400 text-sm font-medium">{videos[activeTab].label}</p>
          <p className="text-gray-600 text-xs mt-1">{videos[activeTab].desc}</p>
        </div>

        {activeTab === "eagle" && (
          <div className="flex justify-center pt-2">
            <SpeedLegend />
          </div>
        )}

        {/* Comparison Toggle */}
        <div className="mt-8 pt-6 border-t border-gray-800">
          <details className="group">
            <summary className="text-xs text-gray-500 hover:text-gray-300 cursor-pointer
                                select-none transition-colors font-medium">
              ▶ Side-by-Side Comparison: Annotated + Eagle View
            </summary>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <span className="text-[10px] uppercase text-gray-600 font-bold tracking-widest px-1">Annotated</span>
                <VideoPlayer src={`${API}${results.annotated_video}`} />
              </div>
              <div className="space-y-2">
                <span className="text-[10px] uppercase text-gray-600 font-bold tracking-widest px-1">Eagle View</span>
                <VideoPlayer src={`${API}${results.eagle_video}`} />
              </div>
            </div>
          </details>
        </div>
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

