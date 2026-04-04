# Football Analytics System

Dual-view visualization (eagle + side height), YOLOv8 detection, ByteTrack IDs, and JSON analytics — FastAPI backend + React (Vite) + Tailwind dashboard.

## Datasets & models (design notes)

| Purpose | Choice | Training? |
|--------|--------|-----------|
| **Detection** | **COCO-pretrained YOLOv8** (`yolov8n.pt` by default) | **No** — `person` and `sports ball` are standard COCO classes. |
| **Tracking** | **ByteTrack** via Ultralytics (`bytetrack.yaml`) | **No** — association is online; **SoccerTrack** / **SportsMOT** are useful if you later fine-tune or evaluate on football-specific MOT, but not required for this pipeline. |
| **Ball trajectory / height** | Heuristic height from bbox + homography ground mapping; physics parabola in JSON for reference | **No** large training — optional future use of football-specific datasets (e.g. SoccerNet) only if you add calibration or 3D lifting. |

**Why COCO:** Broad pretrained detectors generalize to broadcast football without extra labels.  
**Why SoccerTrack/SportsMOT (cited):** Gold-standard MOT benchmarks for soccer; use when you need IDF1 benchmarking or domain adaptation — not mandatory for pretrained inference.  
**Performance:** Resize (`imgsz` ~ 960), optional `FRAME_STRIDE=2` env; ~10 s of 1080p video often finishes in **~1–3× realtime** on a mid-range GPU with `yolov8n` (CPU is slower).

## Project layout

```
backend/
  main.py          # FastAPI, jobs, full pipeline
  detection.py     # YOLOv8 wrapper
  tracking.py      # ByteTrack result parsing
  homography.py    # Pitch mapping + eagle-view canvas
  trajectory.py    # Smoothing + speed-colored paths
  analytics.py     # Ball/player metrics
  utils.py         # Colors, I/O helpers
frontend/
  src/
    App.jsx
    pages/UploadPage.jsx
    pages/DashboardPage.jsx
    components/VideoPanel.jsx
    components/StatPanel.jsx
```

## Setup

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
```

First run downloads `yolov8n.pt` automatically.

**Optional env:**

- `YOLO_MODEL=yolov8s.pt` — slightly heavier, more accurate.
- `FRAME_STRIDE=2` — process every 2nd frame (faster).
- `MAX_WIDTH=960` — inference resize width.
- `HOMOGRAPHY_IMG_POINTS=x1,y1,x2,y2,x3,y3,x4,y4` — four image points (TL, TR, BR, BL of visible field) for custom calibration.
- `HOMOGRAPHY_PITCH_POINTS=...` — matching pitch points in meters (optional).

### Frontend

```bash
cd frontend
npm install
```

## Run (step by step)

1. **Terminal A — API**

```bash
cd backend
.venv\Scripts\activate
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

2. **Terminal B — UI**

```bash
cd frontend
npm run dev
```

3. Open **http://127.0.0.1:5173**, upload an MP4, wait for the progress bar, then open the dashboard (videos + stats).

The Vite dev server **proxies** `/api` and `/outputs` to the FastAPI backend.

**Production API URL:** set `VITE_API_URL=https://your-api.example.com` before `npm run build` if the frontend is hosted separately.

## Outputs (per job)

Under `backend/outputs/<job_id>/`:

| File | Description |
|------|-------------|
| `processed_video.mp4` | YOLOv8 + ByteTrack overlays |
| `top_view.mp4` | Virtual pitch, trajectories, speed colors |
| `side_view.mp4` | Ball cumulative distance vs estimated height |
| `stats.json` | Per-frame positions + aggregated analytics |

### Sample `stats.json` shape

- `frames[]`: `{ "frame", "players": [{id, x, y}], "ball": {x, y} | null }` (pitch meters).
- `ball`: total distance, avg speed, max height estimate, kick power estimate, shot angle.
- `players`: per-ID distance, speeds, trajectory, optional heatmap bins.

## Sample output explanation

- **Eagle view:** Player dots use a **stable color per ID**; trajectory segments blend with **green→yellow→red** by speed (normalized per clip).  
- **Side view:** Height is **heuristic** from bbox vs. a synthetic ground line — not true 3D — with a **projectile parabola** sample stored in JSON for comparison.  
- **Homography:** Default mapping uses a **typical broadcast trapezoid**; for precise top-down alignment, set `HOMOGRAPHY_IMG_POINTS`.

## License

MIT — YOLOv8 / Ultralytics and third-party weights follow their respective licenses.
"# Hackwise" 
