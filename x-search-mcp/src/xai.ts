import dotenv from 'dotenv';

dotenv.config();

export interface XSearchParameters {
  query: string;
  allowed_x_handles?: string[];
  excluded_x_handles?: string[];
  from_date?: string;
  to_date?: string;
  max_results?: number;
  enable_image_understanding?: boolean;
  enable_video_understanding?: boolean;
}

export interface XAIResponse {
  output: Array<{
    id: string;
    type: string;
    status: string;
    content?: Array<{
      type: string;
      text: string;
      annotations?: Array<{
        type: string;
        url: string;
        start_index: number;
        end_index: number;
        title: string;
      }>;
    }>;
    summary?: Array<{
      type: string;
      text: string;
    }>;
  }>;
}

export class XAIClient {
  private token: string;
  private model: string;
  private authLabel: string;

  constructor() {
    this.token = process.env.XAI_OAUTH_TOKEN || process.env.XAI_API_KEY || '';
    this.model = process.env.XAI_MODEL || 'grok-4.3';
    this.authLabel = process.env.XAI_OAUTH_TOKEN ? 'XAI_OAUTH_TOKEN' : 'XAI_API_KEY';

    if (!this.token) {
      throw new Error(
        'Authentication required: set XAI_API_KEY (pay-as-you-go) or XAI_OAUTH_TOKEN (X Premium OAuth)',
      );
    }
  }

  async xSearch(params: XSearchParameters): Promise<XAIResponse> {
    const { query, ...toolParams } = params;

    const requestBody = {
      model: this.model,
      input: [
        {
          role: 'user',
          content: query,
        },
      ],
      tools: [
        {
          type: 'x_search',
          ...toolParams,
        },
      ],
    };

    const response = await fetch('https://api.x.ai/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`xAI API error (${response.status}) [auth:${this.authLabel}]: ${errorBody}`);
    }

    return (await response.json()) as XAIResponse;
  }
}
