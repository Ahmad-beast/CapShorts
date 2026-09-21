# CapShorts - Desktop AI Video Editor

> **A Free, Local-First, Open-Source Alternative to Opus Clip, Submagic, and CapCut.**  
> Run offline on your own hardware without subscriptions, without watermarks, and with word-level speech-to-text AI.

---

## 1. Overview & Architecture

CapShorts is a production-ready desktop video editing suite engineered specifically for short-form video creators (YouTube Shorts, TikTok, Instagram Reels). It transcribes spoken audio into word-level timestamps, applies viral subtitle typography and animations, automatically fetches relevant B-roll stock footage, and burns stylized subtitles using hardware-accelerated FFmpeg.

```
OpenCaption/
├── src-tauri/               # Tauri v2 Rust Desktop Shell
│   ├── src/
│   │   ├── main.rs          # Desktop window entrypoint
│   │   └── lib.rs           # Sidecar lifecycle & native file dialogs
│   ├── tauri.conf.json      # Desktop window, security & packaging configuration
│   └── Cargo.toml           # Rust dependencies (tauri v2, plugins)
├── backend/                 # Local Python AI & Media Engine (Sidecar Daemon)
│   ├── engine.py            # FastAPI server & Faster-Whisper word transcription
│   ├── broll.py             # Pexels Video API fetcher & FFmpeg compositor
│   ├── subtitle_gen.py      # Dynamic ASS generator supporting 100+ styles
│   └── requirements.txt     # faster-whisper, fastapi, uvicorn, requests
├── frontend/                # React 18 TypeScript Web / Desktop UI
│   ├── public/
│   │   ├── fonts/           # Bundled typography
│   │   └── logo.svg         # OpenCaption vector icon
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dropzone.tsx         # Drag-and-drop video intake & validation
│   │   │   ├── VideoPlayer.tsx      # Real-time preview with custom subtitle overlay
│   │   │   ├── CaptionTimeline.tsx  # Word-by-word editor with millisecond seek & inline edit
│   │   │   ├── TemplateSelector.tsx # 100+ presets card gallery with search/filters
│   │   │   ├── BrollManager.tsx     # Pexels B-roll suggested clips & overlay toggle
│   │   │   ├── ExportModal.tsx      # Render progress, AdSense placeholder, save path
│   │   │   └── Header.tsx           # Titlebar, engine health badges, aspect ratio switcher
│   │   ├── data/
│   │   │   ├── templates.json       # 100+ curated typography, color & animation presets
│   │   │   └── build_templates.js   # Generator for preset library
│   │   ├── store/
│   │   │   └── useVideoStore.ts     # Global application state (Zustand)
│   │   ├── types/
│   │   │   └── index.ts             # Strict TypeScript models
│   │   ├── utils/
│   │   │   ├── styleHelper.ts       # Preset CSS resolution & text formatting
│   │   │   └── timeFormat.ts        # Centisecond & millisecond time formatting
│   │   ├── App.tsx                  # Main CapCut/Linear-style dark studio workspace
│   │   ├── main.tsx
│   │   └── index.css                # Tailwind directives & subtitle animation keyframes
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
├── run_app.bat              # 1-Click launcher script for Windows
├── setup_backend.bat        # 1-Click Python venv & dependency setup
└── README.md
```

---

## 2. Core Functional Features

### A. Word-Level Offline Speech Recognition
- **Model**: Powered by `faster-whisper` (CTranslate2 inference engine) with automatic fallback to CPU (`int8` quantization) if no NVIDIA CUDA device is present.
- **Timestamp Accuracy**: Extracts precise word-level bounding timestamps (`start`, `end`, `word`, `keyword`).
- **Keyword Spotting**: Automatically tags viral high-impact words (*unlock, millions, crazy, money, stop, hack, viral, profit, revenue, ai, 10x*).

### B. 100+ Curated Styling Presets Engine (`templates.json`)
Includes 100+ unique, fully configured presets across 4 categories:
1. **Viral Shorts** (30 presets): MrBeast Yellow Pop, Hormozi Bold Red, Hormozi Cyan, Iman Gadzhi Minimal, Alex Style Impact, Ali Abdaal Clean, Luke Belmar Gold, Noah Kagan Punch, Dan Koe Sleek, David Goggins Grit, GaryVee Orange, etc.
2. **Neon & Gaming** (25 presets): Cyberpunk Glitch 2077, Glitch Green Matrix, Arcade Pulse Retro, Synthwave 80s Sunset, Toxic Venom, Hyper Blue Laser, Laser Magenta, Electric Violet, Retro Pixel 8-Bit, etc.
3. **Documentary & Clean** (25 presets): Vox White Box, Vox Highlight Yellow, Serif Editorial NYT, Lower Third Classic, BBC World Clean, National Geographic Gold, Cinema Noir, Kurzgesagt Rounded, Netflix Doc, etc.
4. **Karaoke Sweep** (20 presets): Rainbow Flow, Golden Glow Sweep, Aqua Splash Active, Fire Flame Sweep, Highlighter Yellow, Electric Blue Karaoke, Radiant Pink Track, etc.

Every preset defines:
- Font Family, Font Size, Bold Weight
- Primary Color (Hex), Highlight Color (Hex)
- Outline Width, Outline Color, Shadow Depth, Shadow Color
- Text Casing (UPPERCASE, Title Case, lowercase, Default)
- Words Per Block (1, 2, 3, or sentence)
- Animation Trigger (`pop`, `bounce`, `fade`, `none`)
- Position (`bottom-center`, `middle-center`, `top-center`)
- Background box options and karaoke sweep flags

### C. Interactive Word-by-Word Timeline & Inline Editor
- **Millisecond Seeking**: Clicking any word card instantly jumps video playback to that exact millisecond.
- **Inline Editing**: Clicking the pencil icon on any word allows fixing typos or misheard words directly before export.
- **Keyword Toggle**: Toggle the star icon on any word to highlight it as an emphasized keyword.
- **Auto-Playhead Tracking**: Timeline automatically scrolls to follow spoken words during playback.

### D. Automated B-Roll Inserter (Pexels Video API)
- Detects visual keywords spoken in speech.
- Queries Pexels portrait videos or uses built-in royalty-free vertical stock video clips.
- 1-Click insertion of B-roll overlays directly into the timeline with live preview.

### E. Advanced SubStation Alpha (.ass) & FFmpeg Export
- Generates standards-compliant ASS files with `{\k<centiseconds>}` karaoke tags, custom colors, outlines, and coordinate geometry.
- Burns subtitles directly into H.264 video with real-time percentage progress bar.

---

## 3. Quickstart Guide

### Option 1: 1-Click Launch (Windows)
Double-click `run_app.bat` or run:
```bash
run_app.bat
```
This automatically boots the Python AI backend on port `8000`, starts the Vite frontend on port `5173`, and opens OpenCaption in your default web browser.

### Option 2: Manual Frontend Development
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173`.

### Option 3: Backend Daemon Setup
```bash
cd backend
python -m venv venv
call venv\Scripts\activate.bat
pip install -r requirements.txt
python engine.py
```
Open `http://127.0.0.1:8000/docs` to test interactive Swagger endpoints.

### Option 4: Tauri Desktop Packaging
```bash
cd frontend
npm run build
cd ../src-tauri
cargo tauri build
```

---

## 4. License

Open-source and free for all content creators. Released under the MIT License.
