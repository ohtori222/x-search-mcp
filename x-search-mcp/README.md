# x-search-mcp

An MCP (Model Context Protocol) server that wraps xAI's `x_search` tool. It allows AI agents to perform X (Twitter) searches without needing an X Developer account, using only an xAI API key.

## Features

- **x_search**: Search for posts on X using natural language queries.
- **x_user_search**: Search for a specific user's profile and their recent posts.
- Supports all xAI `x_search` parameters: `allowed_x_handles`, `excluded_x_handles`, `from_date`, `to_date`, etc.
- Returns search results along with citations (URLs to original posts).

## Setup

### Prerequisites

- Node.js 18+
- an xAI API Key (from [console.x.ai](https://console.x.ai/))

### Installation

1. Clone this repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```

### Configuration

Create a `.env` file in the root directory (or set environment variables):

```env
XAI_API_KEY=your-xai-api-key
XAI_MODEL=grok-4.3 (optional, default: grok-4.3)
```

## Usage with MCP Clients (e.g., Claude Desktop, OpenCode)

Add the following to your MCP configuration:

```json
{
  "mcpServers": {
    "x-search": {
      "command": "node",
      "args": ["path/to/x-search-mcp/dist/index.js"],
      "env": {
        "XAI_API_KEY": "your-xai-api-key"
      }
    }
  }
}
```

## Tools

### 1. `x_search`
Search for posts on X.

**Parameters:**
- `query` (required): The search query.
- `allowed_x_handles`: Array of handles to restrict search to.
- `excluded_x_handles`: Array of handles to exclude from search.
- `from_date`: Start date (YYYY-MM-DD).
- `to_date`: End date (YYYY-MM-DD).
- `max_results`: Max results to return (up to 50).
- `enable_image_understanding`: Analyze image content.
- `enable_video_understanding`: Analyze video content.

### 2. `x_user_search`
Search for a specific user's posts.

**Parameters:**
- `username` (required): X handle without @.
- `query`: Additional search terms within user's posts.

## Development

- `npm run dev`: Run with `tsx` for development.
- `npm run build`: Compile TypeScript to JavaScript.
- `npm test`: Run tests using `vitest`.

## License

ISC
