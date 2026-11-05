#!/usr/bin/env bash
# Runs the browser matrix against a local server backed by the Firestore emulator.
# Used by CI inside `firebase emulators:exec`; also works locally once the emulator is running.
set -euo pipefail
export FIRESTORE_EMULATOR_HOST="${FIRESTORE_EMULATOR_HOST:-127.0.0.1:8085}"
export VITE_FIRESTORE_EMULATOR="$FIRESTORE_EMULATOR_HOST"
PORT="${E2E_PORT:-3420}"

node tests/e2e/seed-emulator.mjs
PORT="$PORT" npx tsx server.ts > e2e-server.log 2>&1 &
SERVER_PID=$!
trap 'kill $SERVER_PID 2>/dev/null || true' EXIT
for _ in $(seq 1 60); do
  curl -sf "http://localhost:$PORT/api/health" > /dev/null && break
  sleep 1
done
BASE_URL="http://localhost:$PORT" node tests/e2e/matrix.mjs
