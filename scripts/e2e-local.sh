#!/usr/bin/env bash
# Runs the browser matrix against a local server backed by the Firestore emulator.
# Used by CI inside `firebase emulators:exec`; also works locally once the emulator is running.
set -euo pipefail
export FIRESTORE_EMULATOR_HOST="${FIRESTORE_EMULATOR_HOST:-127.0.0.1:8085}"
export VITE_FIRESTORE_EMULATOR="$FIRESTORE_EMULATOR_HOST"
export VITE_AUTH_EMULATOR="${FIREBASE_AUTH_EMULATOR_HOST:-127.0.0.1:9099}"
PORT="${E2E_PORT:-3420}"

node tests/e2e/seed-emulator.mjs
SCHEDULER_INTERVAL_MS=5000 PORT="$PORT" npx tsx server.ts > e2e-server.log 2>&1 &
SERVER_PID=$!
trap 'kill $SERVER_PID 2>/dev/null || true' EXIT
for _ in $(seq 1 60); do
  curl -sf "http://localhost:$PORT/api/health" > /dev/null && break
  sleep 1
done
# Server scheduler: the overdue article must go live, the future one must stay hidden.
for _ in $(seq 1 30); do
  [ "$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:$PORT/article/test_sched_due")" = "200" ] && break
  sleep 2
done
[ "$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:$PORT/article/test_sched_due")" = "200" ] || { echo "Scheduler test FAILED: due article not published"; exit 1; }
[ "$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:$PORT/article/test_sched_future")" = "404" ] || { echo "Scheduler test FAILED: future article is public"; exit 1; }
curl -s "http://localhost:$PORT/api/health" | grep -q '"scheduler":"on"' || { echo "Scheduler test FAILED: scheduler not on"; exit 1; }
echo "Scheduler test passed (due article published by the server, future article still hidden)."

BASE_URL="http://localhost:$PORT" node tests/e2e/matrix.mjs
BASE_URL="http://localhost:$PORT" node tests/e2e/newsroom.mjs
