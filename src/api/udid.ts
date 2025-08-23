
// API client for gasless UDID operations
export class UDIDApiClient {
  private baseUrl = '/api';

  async createUDID(params: {
    user: string;
    udid: string;
    label: string;
    deadline: string;
    signature: string;
  }) {
    const response = await fetch(`${this.baseUrl}/udid/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create UDID');
    }

    return await response.json();
  }

  async rotateUDID(params: {
    user: string;
    newUdid: string;
    deadline: string;
    signature: string;
  }) {
    const response = await fetch(`${this.baseUrl}/udid/rotate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to rotate UDID');
    }

    return await response.json();
  }

  async updateLabel(params: {
    user: string;
    label: string;
    deadline: string;
    signature: string;
  }) {
    const response = await fetch(`${this.baseUrl}/udid/label`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update label');
    }

    return await response.json();
  }

  async revokeUDID(params: {
    user: string;
    deadline: string;
    signature: string;
  }) {
    const response = await fetch(`${this.baseUrl}/udid/revoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to revoke UDID');
    }

    return await response.json();
  }
}

export const udidApiClient = new UDIDApiClient();
