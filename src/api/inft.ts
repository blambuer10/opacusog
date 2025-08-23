
// API client for INFT operations
export class INFTApiClient {
  private baseUrl = '/api';

  async mintINFT(params: {
    to: string;
    uri: string;
    metadataHash: string;
    royaltyRecipient?: string;
    royaltyBps?: number;
  }) {
    const response = await fetch(`${this.baseUrl}/inft/mint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to mint INFT');
    }

    return await response.json();
  }

  async secureTransfer(params: {
    from: string;
    to: string;
    tokenId: string;
    proof: string;
  }) {
    const response = await fetch(`${this.baseUrl}/inft/secure-transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to execute secure transfer');
    }

    return await response.json();
  }

  async getUserINFTs(address: string) {
    const response = await fetch(`${this.baseUrl}/inft/user/${address}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch user INFTs');
    }

    return await response.json();
  }
}

export const inftApiClient = new INFTApiClient();
