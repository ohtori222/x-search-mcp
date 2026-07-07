# x-search-mcp

MCP server for X/Twitter search via xAI's Grok API.

Uses Grok's built-in `x_search` tool to search X (Twitter) — no X Developer account required, just an xAI API key.

## Usage

```
"Xで話題のAI規制について調べて"
→ MCP tool: x_search({ query: "AI regulation" })
→ Returns posts from X
```

## Setup

1. Set `XAI_API_KEY` in your environment
2. Add to MCP client config
