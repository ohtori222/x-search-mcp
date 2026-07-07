import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleToolCall } from '../src/tools.js';
import { XAIClient } from '../src/xai.js';

vi.mock('../src/xai.js', () => {
  const XAIClientMock = vi.fn();
  XAIClientMock.prototype.xSearch = vi.fn();
  return {
    XAIClient: XAIClientMock,
  };
});

describe('handleToolCall', () => {
  let mockXAIClient: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockXAIClient = new XAIClient();
  });

  it('should handle x_search tool call correctly', async () => {
    const mockResponse = {
      output: [
        { id: 'rs_1', type: 'reasoning', status: 'completed', summary: [{ type: 'summary_text', text: '...' }] },
        {
          id: 'msg_1', type: 'message', status: 'completed',
          content: [{
            type: 'output_text',
            text: 'Grok search result summary',
            annotations: [
              { type: 'url_citation', url: 'https://x.com/1', start_index: 0, end_index: 10, title: '1' },
            ],
          }],
        },
      ],
    };
    mockXAIClient.xSearch.mockResolvedValue(mockResponse);

    const args = { query: 'test query' };
    const result = await handleToolCall('x_search', args, mockXAIClient);

    expect(mockXAIClient.xSearch).toHaveBeenCalledWith(args);
    expect(result.content[0].text).toBe('Grok search result summary');
    expect(result.citations).toHaveLength(1);
    expect(result.citations[0].url).toBe('https://x.com/1');
  });

  it('should throw error if both allowed_x_handles and excluded_x_handles are provided', async () => {
    const args = {
      query: 'test',
      allowed_x_handles: ['a'],
      excluded_x_handles: ['b']
    };

    await expect(handleToolCall('x_search', args, mockXAIClient)).rejects.toThrow(
      'allowed_x_handles and excluded_x_handles cannot be used together'
    );
  });

  it('should handle x_user_search tool call correctly', async () => {
    const mockResponse = {
      output: [
        { id: 'rs_1', type: 'reasoning', status: 'completed', summary: [{ type: 'summary_text', text: '...' }] },
        {
          id: 'msg_1', type: 'message', status: 'completed',
          content: [{ type: 'output_text', text: 'User profile and posts' }],
        },
      ],
    };
    mockXAIClient.xSearch.mockResolvedValue(mockResponse);

    const args = { username: 'elonmusk' };
    const result = await handleToolCall('x_user_search', args, mockXAIClient);

    expect(mockXAIClient.xSearch).toHaveBeenCalledWith({
      query: 'from:elonmusk',
      allowed_x_handles: ['elonmusk']
    });
    expect(result.content[0].text).toBe('User profile and posts');
  });

  it('should throw error for unknown tool', async () => {
    await expect(handleToolCall('unknown_tool', {}, mockXAIClient)).rejects.toThrow(
      'Tool not found: unknown_tool'
    );
  });
});
