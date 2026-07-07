import { XAIClient } from './xai.js';
import { TOOL_SCHEMAS, handleToolCall } from './tools.js';
import * as readline from 'node:readline';
import { fileURLToPath } from 'node:url';

/**
 * Handles MCP JSON-RPC requests.
 * This is exported to allow testing without starting the full server.
 */
export async function handleJSONRPCRequest(request: any, xaiClient: XAIClient) {
  const { method, params, id } = request;

  if (method === 'initialize') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {},
        },
        serverInfo: {
          name: 'x-search-mcp',
          version: '1.0.0',
        },
      },
    };
  }

  if (method === 'notifications/initialized') {
    return null;
  }

  if (method === 'tools/list') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        tools: TOOL_SCHEMAS,
      },
    };
  }

  if (method === 'tools/call') {
    try {
      const result = await handleToolCall(params.name, params.arguments, xaiClient);
      return {
        jsonrpc: '2.0',
        id,
        result,
      };
    } catch (error: any) {
      return {
        jsonrpc: '2.0',
        id,
        error: {
          code: -32603,
          message: error.message || 'Internal error',
        },
      };
    }
  }

  if (id !== undefined) {
    return {
      jsonrpc: '2.0',
      id,
      error: {
        code: -32601,
        message: `Method not found: ${method}`,
      },
    };
  }

  return null;
}

export class MCPServer {
  private xaiClient: XAIClient;
  private rl: readline.Interface;

  constructor() {
    try {
      this.xaiClient = new XAIClient();
    } catch (error) {
      console.error('Failed to initialize XAIClient:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }

    this.rl = readline.createInterface({
      input: process.stdin,
      terminal: false,
    });
  }

  async run() {
    this.rl.on('line', async (line) => {
      if (!line.trim()) return;

      try {
        const request = JSON.parse(line);
        const response = await handleJSONRPCRequest(request, this.xaiClient);
        if (response) {
          process.stdout.write(JSON.stringify(response) + '\n');
        }
      } catch (error) {
        console.error('Error handling request:', error);
      }
    });

    process.on('SIGINT', () => {
      this.rl.close();
      process.exit(0);
    });
  }
}

// Only run the server if this file is executed directly
const isMain = process.argv[1] && (
  process.argv[1] === fileURLToPath(import.meta.url) ||
  process.argv[1].endsWith('index.ts') ||
  process.argv[1].endsWith('index.js')
);

if (isMain) {
  const server = new MCPServer();
  server.run().catch((error) => {
    console.error('Fatal error in MCP server:', error);
    process.exit(1);
  });
}
