import { describe, it, expect, vi } from 'vitest';
import { handleToolCall } from '../src/tools.js';
import { handleJSONRPCRequest } from '../src/index.js';

// Mocking handleToolCall to avoid calling real API
vi.mock('../src/tools.js', async () => {
  const actual = await vi.importActual('../src/tools.js') as any;
  return {
    ...actual,
    handleToolCall: vi.fn(),
  };
});

describe('MCP Server JSON-RPC handling', () => {
  it('should respond correctly to initialize', async () => {
    const request = { jsonrpc: '2.0', id: 1, method: 'initialize' };
    const response = await handleJSONRPCRequest(request, {} as any);
    expect(response?.result.protocolVersion).toBe('2024-11-05');
  });

  it('should call handleToolCall when tools/call is received', async () => {
    const request = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: { name: 'x_search', arguments: { query: 'test' } }
    };
    const mockResult = { content: [{ type: 'text', text: 'result' }], citations: [] };
    (handleToolCall as any).mockResolvedValue(mockResult);

    const response = await handleJSONRPCRequest(request, {} as any);
    expect(handleToolCall).toHaveBeenCalledWith('x_search', { query: 'test' }, expect.any(Object));
    expect(response?.result).toEqual(mockResult);
  });

  it('should return error for unknown method', async () => {
    const request = { jsonrpc: '2.0', id: 3, method: 'unknown' };
    const response = await handleJSONRPCRequest(request, {} as any);
    expect(response?.error.code).toBe(-32601);
  });
});
