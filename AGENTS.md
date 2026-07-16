# x-search-mcp Project Rules

## x_search MCP Server

このプロジェクトは xAI の Responses API（x_search ツール）を MCP サーバーとしてラップしている。

### Result Handling

- x_search を実行したら、結果の全文を必ずユーザーにメッセージとして貼ること。「要約して伝える」「結果をファイルに書く」だけではダメ。ユーザーは検索結果を直接見たい。
- ユーザーに「結果を貼って」と言われたら、再実行せずに直近の実行結果を使うこと。無駄なAPI呼び出しを発生させてはいけない。
- 認証方式は `XAI_API_KEY`（従量課金）と `XAI_OAUTH_TOKEN`（X Premium）の2種類をサポート。優先順位は OAuth → APIキー。
