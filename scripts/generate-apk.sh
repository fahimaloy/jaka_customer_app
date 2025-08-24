#!/usr/bin/env bash

log() {
  echo "[INFO] $1"
}

warn() {
  echo "[WARN] $1"
}

check() {
  local cmd="$1"
  local name="$2"
  if command -v "$cmd" >/dev/null 2>&1; then
    log "$name detected ($(command -v $cmd))"
  else
    warn "$name not found"
  fi
}

log "Checking required tools"

check node "Node.js"
check npm "npm"
check java "Java"
check gradle "Gradle"

if command -v sdkmanager >/dev/null 2>&1 || [ -n "$ANDROID_HOME" ] || [ -n "$ANDROID_SDK_ROOT" ]; then
  log "Android SDK detected"
else
  warn "Android SDK not found"
fi

if command -v studio >/dev/null 2>&1 || command -v android-studio >/dev/null 2>&1 || command -v studio.sh >/dev/null 2>&1; then
  log "Android Studio detected"
else
  warn "Android Studio not found"
fi

if [[ "$1" == "--check" ]]; then
  log "Dependency check complete"
  exit 0
fi

echo "Select build option:"
echo "1) CLI build (npx cap build android)"
echo "2) Launch Android Studio (npx cap open android)"
read -r -p "Enter choice [1/2]: " choice

if [[ "$choice" == "1" ]]; then
  log "Running CLI build (npx cap build android)"
  npx cap build android
elif [[ "$choice" == "2" ]]; then
  log "Opening Android Studio (npx cap open android)"
  npx cap open android
else
  warn "Invalid choice: $choice"
  exit 1
fi
