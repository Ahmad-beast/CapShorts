#!/usr/bin/env bash
# run.sh - 1-Click Launch Script for CapShorts (macOS & Linux)
set -e

export PATH="$HOME/.bun/bin:/usr/local/bin:$PATH"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/CapShorts"

if [ -f "./run_app.sh" ]; then
    bash "./run_app.sh"
else
    echo "[!] Could not find CapShorts/run_app.sh"
    exit 1
fi
