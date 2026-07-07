# X Premium で x_search を使う

## 前提

- X Premium（$8/mo）に加入済み
- X Premium の Grok 利用枠は **200プロンプト/日**（x_search もこの枠を消費）
- 上限超過時は API キー（従量課金）に自動フォールバック

## セットアップ手順

### 1. OAuth トークンを取得する

以下のいずれかの方法で X Premium の OAuth トークンを入手する。

**方法A: `opencode-xai-oauth` プラグインを使う（推奨）**

```bash
# プラグインをインストール
# （詳細は https://github.com/islee23520/opencode-xai-oauth を参照）

# OpenCode 内で xAI OAuth ログイン
/connect  →  xAI  →  OAuth ログイン
```

プラグインが自動でトークンを管理し、`XAI_OAUTH_TOKEN` を環境変数に注入する。

**方法B: 手動でトークンを取得する**

1. ブラウザで https://auth.x.ai にアクセスし、X Premium アカウントでログイン
2. 発行されたアクセストークンを環境変数に設定する

```bash
export XAI_OAUTH_TOKEN='<取得したトークン>'
```

### 2. 認証方式を切り替える

MCP サーバーは以下の優先順位で認証トークンを選択する：

| 優先 | 環境変数 | 説明 |
|:----:|:---------|:-----|
| 1 | `XAI_OAUTH_TOKEN` | X Premium OAuth（サブスクリプション枠を消費） |
| 2 | `XAI_API_KEY` | xAI API キー（従量課金、フォールバック） |

両方設定されている場合、OAuth が優先される。どちらも未設定の場合はエラーになる。

### 3. 動作確認

```bash
cd x-search-mcp
npm run build
printf '{"jsonrpc":"2.0","id":1,"method":"initialize"}\n{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"x_search","arguments":{"query":"動作テスト","max_results":1}}}\n' | timeout 30 node dist/index.js
```

## 注意点

- **OAuth トークンの有効期限は約6時間**。`opencode-xai-oauth` プラグインを使えば自動リフレッシュされるが、手動設定の場合は6時間ごとに再取得が必要
- **リフレッシュトークンによる自動更新は非対応**（Cloudflare が `auth.x.ai` への自動リクエストをブロックするため）
- 200プロンプト/日を超えた場合、`XAI_API_KEY` が設定されていれば自動的に従量課金にフォールバックする

## アーキテクチャ

```
OpenCode / Kimaki
  │
  ├── XAI_OAUTH_TOKEN ← opencode-xai-oauth プラグインが注入
  │   （または XAI_API_KEY）
  │
  └── MCP Server (x-search-mcp)
        │
        └── xAI Responses API (api.x.ai/v1/responses)
              │
              └── x_search（X投稿検索）
```
