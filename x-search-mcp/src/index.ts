import { XAIClient } from './xai.js';
import { TOOL_SCHEMAS, handleToolCall } from './tools.js';
import * as readline from 'node:readline';

class MCPServer {
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
        const response = await this.handleRequest(request);
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

  private async handleRequest(request: any) {
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
        const result = await handleToolCall(params.name, params.arguments, this.xaiClient);
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
}

const server = new MCPServer();
server.run().catch((error) => {
  console.error('Fatal error in MCP server:', error);
  process.exit(1);
});
