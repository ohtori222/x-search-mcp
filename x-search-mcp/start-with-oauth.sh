#!/bin/bash
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
AUTH_FILE="/home/otr/.config/opencode/xai-oauth/auth.json"

echo "[start-with-oauth] SCRIPT_DIR=$SCRIPT_DIR" >> /tmp/oauth-debug.log
echo "[start-with-oauth] AUTH_FILE exists: $(test -f "$AUTH_FILE" && echo YES || echo NO)" >> /tmp/oauth-debug.log

if [ -f "$AUTH_FILE" ]; then
  TOKEN=$(python3 -c "import json; print(json.load(open('$AUTH_FILE'))['access'])" 2>>/tmp/oauth-debug.log)
  if [ -n "$TOKEN" ]; then
    export XAI_OAUTH_TOKEN="$TOKEN"
    echo "[start-with-oauth] TOKEN set: ${#TOKEN} chars" >> /tmp/oauth-debug.log
  else
    echo "[start-with-oauth] TOKEN empty after python3" >> /tmp/oauth-debug.log
  fi
fi

echo "[start-with-oauth] XAI_OAUTH_TOKEN=${XAI_OAUTH_TOKEN:+SET}${XAI_OAUTH_TOKEN:-EMPTY}" >> /tmp/oauth-debug.log
exec node "$SCRIPT_DIR/dist/index.js" "$@"
