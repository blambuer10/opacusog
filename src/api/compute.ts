
// API client for OG Compute operations
export class ComputeApiClient {
  private baseUrl = '/api';

  async submitChatResponse(params: {
    user: string;
    prompt: string;
    response: string;
  }) {
    const response = await fetch(`${this.baseUrl}/compute/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to submit chat response');
    }

    return await response.json();
  }

  async getChatHistory(user: string) {
    const response = await fetch(`${this.baseUrl}/compute/history/${user}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch chat history');
    }

    return await response.json();
  }

  async queryLLM(params: {
    user: string;
    prompt: string;
    context?: string;
  }) {
    const response = await fetch(`${this.baseUrl}/compute/llm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to query LLM');
    }

    return await response.json();
  }
}

export const computeApiClient = new ComputeApiClient();
