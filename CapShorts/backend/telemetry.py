"""
telemetry.py - Anonymous Telemetry & User Engagement Monitor for CapShorts
Tracks active installations, operating system, session duration, and export counts.
100% Privacy-Preserving: No personal data or file names are ever collected.
"""

import os
import sys
import time
import uuid
import hashlib
import platform
import threading
import requests
from typing import Dict, Any, Optional

# Telemetry Endpoint Configuration (Cloudflare Worker URL or environment variable)
DEFAULT_TELEMETRY_URL = os.environ.get(
    "CAPSHORTS_TELEMETRY_URL",
    "https://capshorts-telemetry.moharkasey.workers.dev/api/ping"
)

CONFIG_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "telemetry_config.json")

def get_telemetry_url() -> str:
    """Reads configured telemetry endpoint URL."""
    if os.path.exists(CONFIG_PATH):
        try:
            import json
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data.get("endpoint", DEFAULT_TELEMETRY_URL)
        except Exception:
            pass
    return DEFAULT_TELEMETRY_URL

class TelemetryManager:
    def __init__(self):
        self.session_start = time.time()
        self.machine_id = self._get_or_create_machine_id()
        self.os_info = self._get_os_info()
        self.app_version = "1.1.0"
        self.videos_transcribed = 0
        self.videos_exported = 0
        self._lock = threading.Lock()
        self._started = False

    def get_telemetry_url(self) -> str:
        return get_telemetry_url()

    def _get_or_create_machine_id(self) -> str:
        """Generates or loads a persistent anonymous machine ID."""
        try:
            home = os.path.expanduser("~")
            dir_path = os.path.join(home, ".capshorts")
            os.makedirs(dir_path, exist_ok=True)
            id_file = os.path.join(dir_path, "machine_id.txt")

            if os.path.exists(id_file):
                with open(id_file, "r", encoding="utf-8") as f:
                    mid = f.read().strip()
                    if len(mid) >= 8:
                        return mid

            # Generate unique deterministic hash
            raw = f"{platform.node()}-{uuid.getnode()}-{sys.platform}"
            mid = f"pc_{hashlib.sha256(raw.encode()).hexdigest()[:12]}"
            with open(id_file, "w", encoding="utf-8") as f:
                f.write(mid)
            return mid
        except Exception:
            return f"pc_{uuid.uuid4().hex[:12]}"

    def _get_os_info(self) -> str:
        """Formats operating system name nicely (e.g. Windows 11, macOS Sonoma)."""
        sys_name = platform.system()
        release = platform.release()
        if sys_name == "Darwin":
            return f"macOS {platform.mac_ver()[0] or release}"
        elif sys_name == "Windows":
            return f"Windows {release}"
        elif sys_name == "Linux":
            return f"Linux {release}"
        return sys_name

    def get_session_seconds(self) -> int:
        """Returns total elapsed seconds for current app session."""
        return int(time.time() - self.session_start)

    def record_transcribe(self):
        """Increments transcription counter."""
        with self._lock:
            self.videos_transcribed += 1
        self._async_ping(event="transcribe", stats={"transcribed_increment": 1})

    def record_export(self):
        """Increments video export counter."""
        with self._lock:
            self.videos_exported += 1
        self._async_ping(event="export", stats={"exported_increment": 1})

    def _async_ping(self, event: str = "heartbeat", stats: Optional[Dict[str, Any]] = None):
        """Fires a non-blocking background HTTP ping to Cloudflare."""
        threading.Thread(target=self._send_ping_worker, args=(event, stats or {}), daemon=True).start()

    def _send_ping_worker(self, event: str, stats: Dict[str, Any]):
        endpoint = get_telemetry_url()
        if not endpoint or "workers.dev" not in endpoint:
            # If endpoint is not configured yet or default, skip silently
            return

        payload = {
            "machine_id": self.machine_id,
            "os": self.os_info,
            "version": self.app_version,
            "session_seconds": self.get_session_seconds(),
            "event": event,
            "stats": {
                "total_transcribed": self.videos_transcribed,
                "total_exported": self.videos_exported,
                **stats
            }
        }

        try:
            requests.post(endpoint, json=payload, timeout=3)
        except Exception:
            # Fail completely silently so telemetry never interferes with video editing
            pass

    def start_heartbeat_loop(self):
        """Starts periodic 3-minute heartbeat sender."""
        if self._started:
            return
        self._started = True

        # Send initial launch event
        self._async_ping(event="launch")

        def loop():
            while True:
                time.sleep(180)  # Ping every 3 minutes
                self._async_ping(event="heartbeat")

        threading.Thread(target=loop, daemon=True).start()

# Global Singleton
telemetry = TelemetryManager()
