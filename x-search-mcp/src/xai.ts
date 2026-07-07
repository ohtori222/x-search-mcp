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

export interface Citation {
  url: string;
  text: string;
  author: string;
  date: string;
}

export interface XAIResponse {
  output: Array<{
    content: Array<{
      type: string;
      text: string;
    }>;
  }>;
  citations?: Citation[];
}

export class XAIClient {
  private apiKey: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.XAI_API_KEY || '';
    this.model = process.env.XAI_MODEL || 'grok-4.3';

    if (!this.apiKey) {
      throw new Error('XAI_API_KEY environment variable is required');
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
      include: ['citations'],
    };

    const response = await fetch('https://api.x.ai/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`xAI API error (${response.status}): ${errorBody}`);
    }

    return (await response.json()) as XAIResponse;
  }
}
