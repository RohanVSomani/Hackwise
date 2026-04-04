import { useEffect, useRef } from 'react'

export default function VideoPanel({ title, description, src }) {
  const ref = useRef(null)

  // Force reload when src changes (e.g. new cache-bust query)
  useEffect(() => {
    if (ref.current && src) {
      ref.current.load()
    }
  }, [src])

  return (
    <section className="overflow-hidden rounded-xl border border-slate-800 bg-[#0f141b] shadow-lg">
      <div className="border-b border-slate-800 px-4 py-3">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <div className="bg-black/50 p-2">
        {!src ? (
          <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-black/60 text-sm text-slate-500">
            Waiting for rendered videos…
          </div>
        ) : (
          <video
            ref={ref}
            src={src}
            controls
            playsInline
            className="aspect-video w-full rounded-lg"
            preload="metadata"
          />
        )}
      </div>
    </section>
  )
}
