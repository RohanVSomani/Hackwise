// components/SpeedLegend.jsx
// Visual legend explaining the speed-color coding used in eagle + side views
export default function SpeedLegend({ compact = false }) {
  const steps = [
    { color: "from-green-500  to-green-400",  label: "Slow",   range: "0–2 m/s"   },
    { color: "from-yellow-500 to-yellow-400", label: "Medium", range: "2–6 m/s"   },
    { color: "from-orange-500 to-red-500",    label: "Fast",   range: "6–12 m/s"  },
    { color: "from-red-600    to-red-400",    label: "Sprint", range: "> 12 m/s"  },
  ]

  if (compact) {
    return (
      <div className="flex items-center gap-3 text-[10px] text-gray-500">
        <span className="text-gray-600">Speed:</span>
        {steps.map((s) => (
          <span key={s.label} className="flex items-center gap-1">
            <span className={`inline-block w-3 h-1.5 rounded-full bg-gradient-to-r ${s.color}`} />
            <span>{s.label}</span>
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 space-y-2">
      <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
        Trajectory Speed Key
      </div>

      {/* Gradient bar */}
      <div className="h-2 w-full rounded-full bg-gradient-to-r from-green-500 via-yellow-400 via-orange-400 to-red-500" />

      {/* Labels */}
      <div className="flex justify-between text-[10px] text-gray-500">
        <span>Slow (0)</span>
        <span>Medium (6 m/s)</span>
        <span>Fast (12+ m/s)</span>
      </div>

      {/* Individual rows */}
      <div className="space-y-1 pt-1">
        {steps.map((s) => (
          <div key={s.label} className="flex items-center gap-2 text-xs">
            <span className={`inline-block w-4 h-2 rounded-sm bg-gradient-to-r ${s.color}`} />
            <span className="text-gray-300 font-medium w-14">{s.label}</span>
            <span className="text-gray-600">{s.range}</span>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-gray-700 pt-1 leading-relaxed">
        Colors are normalized per entity per clip — green/red thresholds
        adapt to the actual speed range detected in your video.
      </p>
    </div>
  )
}
