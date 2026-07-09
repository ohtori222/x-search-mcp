#!/bin/sh
# xAI OAuth token を環境変数に設定（opencode-xai-oauth プラグインの認証ファイルから読む）
AUTH_FILE="${HOME:-/home/otr}/.config/opencode/xai-oauth/auth.json"
if [ -f "$AUTH_FILE" ]; then
  TOKEN=$(python3 -c "import json,sys; print(json.load(open(sys.argv[1]))['access'])" "$AUTH_FILE" 2>/dev/null)
  if [ -n "$TOKEN" ]; then
    export XAI_OAUTH_TOKEN="$TOKEN"
  fi
fi
