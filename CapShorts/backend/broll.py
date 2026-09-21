"""
broll.py - Pexels Video Fetcher & FFmpeg Compositor for OpenCaption
Handles keyword searches, caching vertical video clips, and building multi-clip overlay pipelines.
"""

import os
import re
import json
import urllib.request
from typing import List, Dict, Any, Optional

CACHE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cache", "broll")
os.makedirs(CACHE_DIR, exist_ok=True)

# Curated high-quality royalty-free vertical stock video fallbacks (MP4)
FALLBACK_CLIPS = {
    "money": {
        "id": "stock-money",
        "title": "Money & Currency Counting",
        "preview_url": "https://assets.mixkit.co/videos/preview/mixkit-counting-dollar-bills-close-up-41589-large.mp4",
        "video_url": "https://assets.mixkit.co/videos/preview/mixkit-counting-dollar-bills-close-up-41589-large.mp4",
        "duration": 12,
        "width": 1080,
        "height": 1920
    },
    "laptop": {
        "id": "stock-laptop",
        "title": "Coding and Tech Typing",
        "preview_url": "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-typing-on-a-laptop-keyboard-41549-large.mp4",
        "video_url": "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-typing-on-a-laptop-keyboard-41549-large.mp4",
        "duration": 10,
        "width": 1080,
        "height": 1920
    },
    "rocket": {
        "id": "stock-rocket",
        "title": "Launch & Space Rocket",
        "preview_url": "https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-background-1610-large.mp4",
        "video_url": "https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-background-1610-large.mp4",
        "duration": 15,
        "width": 1080,
        "height": 1920
    },
    "crowd": {
        "id": "stock-crowd",
        "title": "City Crowd & People",
        "preview_url": "https://assets.mixkit.co/videos/preview/mixkit-crowd-of-people-walking-in-a-city-4318-large.mp4",
        "video_url": "https://assets.mixkit.co/videos/preview/mixkit-crowd-of-people-walking-in-a-city-4318-large.mp4",
        "duration": 14,
        "width": 1080,
        "height": 1920
    },
    "default": {
        "id": "stock-abstract",
        "title": "Dynamic Motion Backdrop",
        "preview_url": "https://assets.mixkit.co/videos/preview/mixkit-tunnel-of-futuristic-neon-lights-42998-large.mp4",
        "video_url": "https://assets.mixkit.co/videos/preview/mixkit-tunnel-of-futuristic-neon-lights-42998-large.mp4",
        "duration": 8,
        "width": 1080,
        "height": 1920
    }
}

def search_pexels_videos(keyword: str, api_key: Optional[str] = None, per_page: int = 5) -> List[Dict[str, Any]]:
    """
    Search Pexels API for portrait/vertical stock videos matching the keyword.
    Falls back gracefully to curated stock clips if API key is missing or quota exceeded.
    """
    clean_keyword = re.sub(r'[^a-zA-Z0-9\s]', '', keyword).strip().lower()
    if not clean_keyword:
        clean_keyword = "business"
        
    if api_key and api_key.strip():
        try:
            url = f"https://api.pexels.com/videos/search?query={urllib.parse.quote(clean_keyword)}&orientation=portrait&per_page={per_page}"
            req = urllib.request.Request(
                url,
                headers={
                    "Authorization": api_key.strip(),
                    "User-Agent": "OpenCaption/1.0"
                }
            )
            with urllib.request.urlopen(req, timeout=8) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode())
                    results = []
                    for v in data.get("videos", []):
                        # Find best portrait mp4 file
                        video_files = v.get("video_files", [])
                        hd_files = [f for f in video_files if f.get("quality") == "hd" and f.get("file_type") == "video/mp4"]
                        target_file = hd_files[0] if hd_files else (video_files[0] if video_files else None)
                        
                        if target_file:
                            results.append({
                                "id": str(v.get("id")),
                                "keyword": clean_keyword,
                                "title": f"{clean_keyword.title()} Clip ({v.get('duration')}s)",
                                "preview_url": target_file.get("link"),
                                "video_url": target_file.get("link"),
                                "thumbnail": v.get("image"),
                                "duration": v.get("duration", 5),
                                "width": target_file.get("width", 1080),
                                "height": target_file.get("height", 1920)
                            })
                    if results:
                        return results
        except Exception as e:
            print(f"[broll] Pexels API request failed ({e}), falling back to curated stock clips.")

    # Return curated royalty-free fallback
    matched = None
    for k, clip in FALLBACK_CLIPS.items():
        if k in clean_keyword:
            matched = clip
            break
    if not matched:
        matched = FALLBACK_CLIPS["default"]
    
    return [{
        "id": f"{matched['id']}-{clean_keyword}",
        "keyword": clean_keyword,
        "title": f"{clean_keyword.title()} - {matched['title']}",
        "preview_url": matched["preview_url"],
        "video_url": matched["video_url"],
        "thumbnail": "",
        "duration": matched["duration"],
        "width": matched["width"],
        "height": matched["height"]
    }]

def download_broll_clip(video_url: str, clip_id: str) -> Optional[str]:
    """Downloads remote broll clip to local cache directory if not already cached."""
    cache_path = os.path.join(CACHE_DIR, f"{clip_id}.mp4")
    if os.path.exists(cache_path) and os.path.getsize(cache_path) > 1024:
        return cache_path
    
    try:
        req = urllib.request.Request(video_url, headers={"User-Agent": "OpenCaption/1.0"})
        with urllib.request.urlopen(req, timeout=15) as resp, open(cache_path, "wb") as f:
            f.write(resp.read())
        return cache_path
    except Exception as e:
        print(f"[broll] Failed to download B-roll clip {video_url}: {e}")
        return None

def build_ffmpeg_broll_filter(
    broll_clips: List[Dict[str, Any]],
    base_label: str = "0:v"
) -> tuple[List[str], str]:
    """
    Builds FFmpeg input arguments and complex filter for compositing B-roll clips.
    broll_clips: list of {'local_path': str, 'start': float, 'end': float}
    """
    extra_inputs = []
    filter_chains = []
    current_stream = base_label
    
    for idx, clip in enumerate(broll_clips):
        path = clip.get("local_path")
        if not path or not os.path.exists(path):
            continue
        
        input_index = len(extra_inputs) + 1
        extra_inputs.extend(["-i", path])
        
        start_t = clip.get("start", 0.0)
        end_t = clip.get("end", start_t + 2.0)
        
        # Scale & Crop B-roll to 1080x1920 portrait
        broll_scaled = f"[broll_{idx}_scaled]"
        filter_chains.append(
            f"[{input_index}:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1{broll_scaled}"
        )
        
        next_stream = f"[v_comp_{idx}]"
        filter_chains.append(
            f"{current_stream}{broll_scaled}overlay=enable='between(t,{start_t:.2f},{end_t:.2f})':shortest=0{next_stream}"
        )
        current_stream = next_stream
        
    return extra_inputs, ";".join(filter_chains), current_stream
