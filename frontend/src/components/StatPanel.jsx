function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-3 border-b border-slate-800/80 py-2 text-sm last:border-0">
      <span className="text-slate-400">{label}</span>
      <span className="font-mono text-slate-100">{value ?? '—'}</span>
    </div>
  )
}

export default function StatPanel({ stats, jobId }) {
  if (!stats) {
    return (
      <div className="rounded-xl border border-slate-800 bg-[#0f141b] p-4 text-sm text-slate-400">
        Loading analytics…
      </div>
    )
  }

  const ball = stats.ball || {}
  const players = stats.players || {}

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-800 bg-[#0f141b] p-4">
        <h4 className="mb-2 text-sm font-semibold text-emerald-400">Ball</h4>
        <Row label="Total distance (m)" value={ball.total_distance_m?.toFixed?.(2)} />
        <Row label="Avg speed (m/s)" value={ball.avg_speed_mps?.toFixed?.(2)} />
        <Row label="Max height est. (m)" value={ball.max_height_m?.toFixed?.(2)} />
        <Row label="Kick power est. (m/s)" value={ball.kick_power_mps?.toFixed?.(2)} />
        <Row label="Shot angle (°)" value={ball.shot_angle_deg?.toFixed?.(1)} />
      </div>

      <div className="rounded-xl border border-slate-800 bg-[#0f141b] p-4">
        <h4 className="mb-2 text-sm font-semibold text-sky-400">Players</h4>
        {Object.keys(players).length === 0 && (
          <p className="text-sm text-slate-500">No tracked players in clip.</p>
        )}
        {Object.entries(players).map(([pid, p]) => (
          <div key={pid} className="mb-4 last:mb-0">
            <p className="mb-1 text-xs font-medium text-slate-300">ID {pid}</p>
            <Row label="Distance (m)" value={p.total_distance_m?.toFixed?.(2)} />
            <Row label="Avg speed (m/s)" value={p.avg_speed_mps?.toFixed?.(2)} />
            <Row label="Max speed (m/s)" value={p.max_speed_mps?.toFixed?.(2)} />
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-800 bg-[#0f141b] p-4 text-xs text-slate-500">
        <p>
          Job <span className="font-mono text-slate-300">{jobId}</span>
        </p>
        <p className="mt-1">
          Frames in JSON: {stats.frames?.length ?? 0} · Stride{' '}
          {stats.video?.frame_stride ?? '—'}
        </p>
      </div>
    </div>
  )
}
