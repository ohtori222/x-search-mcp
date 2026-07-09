#!/bin/bash
set -e
AUTH_FILE="/home/otr/.config/opencode/xai-oauth/auth.json"
if [ -f "$AUTH_FILE" ]; then
  TOKEN=$(python3 -c "import json; print(json.load(open('$AUTH_FILE'))['access'])")
  export XAI_OAUTH_TOKEN="$TOKEN"
fi
exec node dist/index.js "$@"
