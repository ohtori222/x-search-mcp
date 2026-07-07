import { XAIClient, XSearchParameters, XAIResponse } from './xai.js';

export const TOOL_SCHEMAS = [
  {
    name: 'x_search',
    description: 'Search for posts on X (Twitter) using natural language query.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query (natural language). Example: "What are people saying about AI regulation"',
        },
        allowed_x_handles: {
          type: 'array',
          items: { type: 'string' },
          description: 'Search only these specific accounts (max 20)',
        },
        excluded_x_handles: {
          type: 'array',
          items: { type: 'string' },
          description: 'Exclude these specific accounts (max 20)',
        },
        from_date: {
          type: 'string',
          description: 'Start date (ISO8601, YYYY-MM-DD)',
        },
        to_date: {
          type: 'string',
          description: 'End date (ISO8601, YYYY-MM-DD)',
        },
        max_results: {
          type: 'number',
          description: 'Maximum number of results (default 10, max 50)',
        },
        enable_image_understanding: {
          type: 'boolean',
          description: 'Whether to analyze image content',
        },
        enable_video_understanding: {
          type: 'boolean',
          description: 'Whether to analyze video content',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'x_user_search',
    description: 'Search for a specific X user profile and their recent posts.',
    inputSchema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          description: 'X username (without @)',
        },
        query: {
          type: 'string',
          description: 'Additional filter query within the user\'s posts',
        },
      },
      required: ['username'],
    },
  },
];

export async function handleToolCall(name: string, args: any, xaiClient: XAIClient) {
  if (name === 'x_search') {
    if (args.allowed_x_handles && args.excluded_x_handles) {
      throw new Error('allowed_x_handles and excluded_x_handles cannot be used together');
    }

    const response = await xaiClient.xSearch(args as XSearchParameters);
    return formatXAIResponse(response, xaiClient.authMethod);
  }

  if (name === 'x_user_search') {
    const { username, query } = args;
    const searchParams: XSearchParameters = {
      query: query || `from:${username}`,
      allowed_x_handles: [username],
    };

    const response = await xaiClient.xSearch(searchParams);
    return formatXAIResponse(response, xaiClient.authMethod);
  }

  throw new Error(`Tool not found: ${name}`);
}

function formatXAIResponse(response: XAIResponse, authLabel: string) {
  const messageOutput = response.output?.find((o: any) => o.type === 'message');
  const textContent = messageOutput?.content?.[0]?.text || 'No results found.';

  const annotations = messageOutput?.content?.[0]?.annotations || [];
  const citations = annotations
    .filter((a: any) => a.type === 'url_citation')
    .map((a: any) => ({
      url: a.url,
      start_index: a.start_index,
      end_index: a.end_index,
      title: a.title,
    }));

  const usage = response.usage;
  const diagParts = [`認証: ${authLabel}`];
  if (usage?.num_server_side_tools_used !== undefined) {
    diagParts.push(`x_search: ${usage.num_server_side_tools_used}回`);
  }
  if (usage?.cost_in_usd_ticks !== undefined) {
    const costUsd = usage.cost_in_usd_ticks / 10_000_000_000;
    const costYen = Math.round(costUsd * 150 * 100) / 100;
    diagParts.push(`費用: 約${costYen}円`);
  }
  const diag = `\n\n---\n${diagParts.join(' | ')}`;

  return {
    content: [{ type: 'text', text: textContent + diag }],
    citations,
  };
}
