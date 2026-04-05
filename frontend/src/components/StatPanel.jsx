/**
 * StatPanel.jsx — Displays stats from the JSON returned by the backend.
 *
 * Backend stats.json shape (from analytics.py):
 * {
 *   meta:    { total_frames, fps, duration_s, players_tracked }
 *   ball:    { total_distance_m, avg_speed_ms, max_speed_ms,
 *              avg_speed_kmh, max_speed_kmh, max_height_m, avg_height_m,
 *              total_kicks, kick_events: [...] }
 *   players: [ { player_id, total_distance_m, avg_speed_ms, max_speed_ms,
 *                avg_speed_kmh, max_speed_kmh, frames_tracked } ]
 *   frames:  [ ... per-frame positional data ]
 * }
 */

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

  // Backend wraps full export in { meta, ball, players, frames }
  // But /results endpoint passes only "meta" as stats.
  // StatPanel may receive the full JSON (loaded separately) or the meta block.
  const isFullJson = !!stats.ball
  const ball    = isFullJson ? (stats.ball    || {}) : {}
  // players is an ARRAY in the backend output
  const players = isFullJson ? (stats.players || []) : []
  const meta    = isFullJson ? (stats.meta    || stats) : stats

  const fmt = (v, decimals = 2) =>
    v != null && !isNaN(v) ? Number(v).toFixed(decimals) : '—'

  return (
    <div className="space-y-4">
      {/* Meta */}
      <div className="rounded-xl border border-slate-800 bg-[#0f141b] p-4">
        <h4 className="mb-2 text-sm font-semibold text-violet-400">Session</h4>
        <Row label="Frames processed" value={meta.total_frames} />
        <Row label="FPS"              value={meta.fps} />
        <Row label="Duration (s)"     value={fmt(meta.duration_s)} />
        <Row label="Players tracked"  value={meta.players_tracked} />
      </div>

      {/* Ball */}
      {isFullJson && (
        <div className="rounded-xl border border-slate-800 bg-[#0f141b] p-4">
          <h4 className="mb-2 text-sm font-semibold text-emerald-400">Ball</h4>
          <Row label="Total distance (m)"   value={fmt(ball.total_distance_m)} />
          <Row label="Avg speed (m/s)"      value={fmt(ball.avg_speed_ms)} />
          <Row label="Max speed (m/s)"      value={fmt(ball.max_speed_ms)} />
          <Row label="Avg speed (km/h)"     value={fmt(ball.avg_speed_kmh)} />
          <Row label="Max speed (km/h)"     value={fmt(ball.max_speed_kmh)} />
          <Row label="Max height est. (m)"  value={fmt(ball.max_height_m)} />
          <Row label="Avg height est. (m)"  value={fmt(ball.avg_height_m)} />
          <Row label="Kick events"          value={ball.total_kicks ?? 0} />
        </div>
      )}

      {/* Players — array */}
      {isFullJson && players.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-[#0f141b] p-4">
          <h4 className="mb-2 text-sm font-semibold text-sky-400">
            Players ({players.length})
          </h4>
          {players.map((p) => (
            <div key={p.player_id} className="mb-4 last:mb-0">
              <p className="mb-1 text-xs font-medium text-slate-300">
                Player #{p.player_id}
                <span className="ml-2 text-slate-600 font-normal">
                  {p.frames_tracked} frames
                </span>
              </p>
              <Row label="Distance (m)"     value={fmt(p.total_distance_m)} />
              <Row label="Avg speed (m/s)"  value={fmt(p.avg_speed_ms)} />
              <Row label="Max speed (m/s)"  value={fmt(p.max_speed_ms)} />
              <Row label="Avg speed (km/h)" value={fmt(p.avg_speed_kmh)} />
              <Row label="Max speed (km/h)" value={fmt(p.max_speed_kmh)} />
            </div>
          ))}
        </div>
      )}

      {!isFullJson && (
        <div className="rounded-xl border border-slate-800 bg-[#0f141b] p-4 text-xs text-slate-500">
          Hover the Stats panel in the results view to load full ball + player data.
        </div>
      )}

      <div className="rounded-xl border border-slate-800 bg-[#0f141b] p-4 text-xs text-slate-500">
        <p>
          Job <span className="font-mono text-slate-300">{jobId}</span>
        </p>
        {isFullJson && (
          <p className="mt-1">
            Frame records: {stats.frames?.length ?? 0}
          </p>
        )}
      </div>
    </div>
  )
}
