# Football Analytics System — Complete Setup Guide

---

## 📋 Prerequisites

| Tool        | Min Version | Check command         |
|-------------|-------------|-----------------------|
| Python      | 3.10+       | `python --version`    |
| Node.js     | 18+         | `node --version`      |
| npm         | 9+          | `npm --version`       |
| Git         | any         | `git --version`       |
| RAM         | 8GB+        | —                     |
| Disk        | 5GB free    | —                     |

GPU is **optional** — the system runs on CPU (slower but works).

---

## 🗂 Project Structure

```
Hackwise/
├── backend/
│   ├── main.py              ← FastAPI app (entry point)
│   ├── detection.py         ← YOLOv8 wrapper
│   ├── tracking.py          ← ByteTrack wrapper
│   ├── homography.py        ← Eagle view projection
│   ├── trajectory.py        ← Trajectory rendering + side view
│   ├── analytics.py         ← Stats computation + JSON export
│   ├── utils.py             ← Shared helpers
│   ├── calibration_tool.py  ← Manual corner picker (run once if needed)
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx
    │   ├── index.css
    │   └── components/
    │       ├── UploadPage.jsx
    │       ├── ResultsDashboard.jsx
    │       ├── VideoPlayer.jsx
    │       └── SpeedLegend.jsx
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── postcss.config.js
```

---

## ⚙️ Backend Setup

### Step 1 — Create virtual environment (recommended)
```bash
cd backend
python -m venv venv

# Activate:
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate
```

### Step 2 — Install dependencies
```bash
pip install -r requirements.txt
```

This installs:
- `ultralytics` (YOLOv8 + auto-download of weights)
- `supervision` (ByteTrack wrapper)
- `opencv-python`
- `scipy` (Savitzky-Golay smoothing)
- `fastapi` + `uvicorn`

### Step 3 — (Optional) GPU support
If you have an NVIDIA GPU:
```bash
# First install PyTorch with CUDA BEFORE installing requirements.txt
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
# Then install the rest
pip install -r requirements.txt
```

### Step 4 — Start the backend
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

The first time you run it, YOLOv8 will auto-download `yolov8s.pt` (~22MB).

---

## 🖥 Frontend Setup

### Step 5 — Install Node dependencies
```bash
cd frontend
npm install
```

### Step 6 — Start the dev server
```bash
npm run dev
```

You should see:
```
  VITE v5.x  ready in 400ms
  ➜  Local:   http://localhost:5173/
```

Open **http://localhost:5173** in your browser.

---

## 🎬 Input Video Requirements

### ✅ What works well
| Property       | Recommendation                                    |
|----------------|---------------------------------------------------|
| Resolution     | **1080p or 720p** (minimum 720p)                  |
| Duration       | **15–45 seconds** (optimal; longer = slower)      |
| Camera angle   | **Wide broadcast/sideline** — see both sidelines  |
| Pitch markings | **Clearly visible** (needed for homography)       |
| Content        | Includes a clear pass, shot, or dribbling run     |

### ❌ What doesn't work
- Close-up/zoomed replays (pitch lines not visible → homography fails)
- Fish-eye stadium overview cameras
- GoPro or pitch-level angles
- Heavily compressed/pixelated footage

### 🔗 Where to get test clips
1. **YouTube** — search `"Premier League broadcast 1080p"`, download with `yt-dlp`:
   ```bash
   pip install yt-dlp
   yt-dlp -f "bestvideo[ext=mp4][height<=1080]" "https://youtube.com/watch?v=VIDEO_ID" -o test_clip.mp4
   ```
2. **SoccerNet** — https://www.soccer-net.org/data (free academic dataset, broadcast angle)
3. **Kaggle DFL Bundesliga** — https://www.kaggle.com/competitions/dfl-bundesliga-data-shootout

### ✂️ Trim your clip
Keep it to 15–30 seconds for fast testing:
```bash
ffmpeg -i input.mp4 -ss 00:00:10 -t 00:00:25 -c copy test_clip.mp4
```

---

## 🔧 If Eagle View Looks Wrong (Homography Fix)

If the top-down view is distorted or misaligned, run the calibration tool:

```bash
cd backend
python calibration_tool.py --video ../test_clip.mp4 --frame 30
```

A window opens. **Click the 4 corners of the visible pitch area** clockwise
from top-left. Press **S** to save.

The tool prints a Python snippet like:
```python
MANUAL_CORNERS = [
    [142, 87],   # top-left
    [1720, 92],  # top-right
    [1780, 940], # bottom-right
    [88, 952],   # bottom-left
]
```

In `main.py`, find this block and add the fallback:
```python
mapper = HomographyMapper()
# Add these two lines:
MANUAL_CORNERS = [[142, 87], [1720, 92], [1780, 940], [88, 952]]  # ← your values
if not mapper.calibrate_from_frame(small):
    mapper.set_manual_corners(MANUAL_CORNERS)
```

---

## ⚡ Performance Tuning

### Faster processing (CPU)
In `main.py`, change:
```python
FRAME_SKIP    = 2    # process every 2nd frame (2x faster)
RESIZE_FACTOR = 0.5  # 50% size (4x faster inference)
```
Trade-off: trajectories are slightly coarser.

### Faster model
Change model in `main.py`:
```python
MODEL_PATH = "yolov8n.pt"   # nano — fastest, less accurate
```

### Expected processing times (30-second 1080p clip)
| Hardware          | FRAME_SKIP | Approx time |
|-------------------|------------|-------------|
| CPU only          | 1          | 8–15 min    |
| CPU only          | 2          | 4–7 min     |
| NVIDIA GPU        | 1          | 1–3 min     |
| NVIDIA GPU        | 2          | 30–90 sec   |

---

## 📊 Understanding the Outputs

### 1. Annotated Video (`annotated.mp4`)
- Bounding boxes on players (colored by track ID)
- Ball shown as gold circle
- HUD overlay: frame, timestamp, player count, ball speed

### 2. Eagle View (`eagle.mp4`)
- Top-down 2D pitch (FIFA standard: 105m × 68m)
- Player dots with ID labels
- Trajectory lines **color-coded by speed**:
  - 🟢 Green = slow (walking, < 2 m/s)
  - 🟡 Yellow = medium (jogging, 2–6 m/s)
  - 🔴 Red = fast (sprinting, > 12 m/s)
- Colors normalized per player per clip

### 3. Side View (`side.mp4`)
- Ball height curve (horizontal = pitch distance, vertical = meters)
- Uses **hybrid estimation**: bbox size change + y-pixel position
- **Not exact physics** — approximation from 2D video
- Accuracy: ±2–3m; good for seeing shot arcs vs ground passes

### 4. Stats JSON (`stats.json`)
```json
{
  "meta": { "total_frames": 750, "fps": 25, "duration_s": 30, "players_tracked": 11 },
  "ball": {
    "total_distance_m": 87.4,
    "max_speed_ms": 18.2,
    "max_speed_kmh": 65.5,
    "max_height_m": 7.3,
    "kick_events": [...]
  },
  "players": [
    { "player_id": 3, "total_distance_m": 42.1, "max_speed_kmh": 24.8, ... }
  ],
  "frames": [ { "frame": 0, "players": [...], "ball": {...} } ]
}
```

---

## 🐛 Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| Eagle view is skewed | Auto-homography failed | Run `calibration_tool.py` |
| Ball not detected | Conf threshold too high | `BALL_CONF = 0.2` in `detection.py` |
| All trajectories green | Speed range too narrow | Clip too short or camera static |
| `supervision` import error | Old supervision version | `pip install supervision>=0.21.0` |
| Video won't open | Codec issue | `pip install opencv-python-headless` |
| CORS error in browser | Backend not running | Check `uvicorn` is on port 8000 |
| `stats.json` all zeros | Player IDs swapping | Increase `track_buffer` in `tracking.py` |

---

## 🗃 Dataset Information

| Component   | Dataset           | Training needed? | Notes |
|-------------|-------------------|------------------|-------|
| Detection   | **COCO** (80 cls) | ❌ No — pretrained | `person` class 0, `sports ball` class 32 |
| Tracking    | ByteTrack (IoU-based) | ❌ No — algorithm | No re-ID model needed |
| Homography  | None              | ❌ No — geometry | OpenCV `findHomography` |
| Trajectories | None             | ❌ No — algorithm | Savitzky-Golay smoothing |

To improve ball detection specifically, you can fine-tune on:
- **Roboflow Football Dataset** — https://universe.roboflow.com/roboflow-jvuqo/football-players-detection-3zvbc
- **DFL Bundesliga** — Kaggle (football-specific, broadcast angle)

---

## 🚀 Running End-to-End

```bash
# Terminal 1 — Backend
cd backend && uvicorn main:app --port 8000

# Terminal 2 — Frontend
cd frontend && npm run dev

# Browser
open http://localhost:5173
# → Upload your clip → Wait → View results
```

---

*Built with: YOLOv8 (COCO pretrained) · ByteTrack (supervision) · OpenCV homography · Savitzky-Golay smoothing · FastAPI · React + Tailwind*
