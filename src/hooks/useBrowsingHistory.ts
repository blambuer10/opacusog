
import { useState, useCallback } from 'react';

interface BrowsingHistoryItem {
  id: string;
  url: string;
  title?: string;
  visitTime: Date;
  visitCount: number;
}

interface UseBrowsingHistoryReturn {
  history: BrowsingHistoryItem[];
  loading: boolean;
  error: string | null;
  requestPermission: () => Promise<void>;
}

export const useBrowsingHistory = (): UseBrowsingHistoryReturn => {
  const [history, setHistory] = useState<BrowsingHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestPermission = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // Check if we're in a browser extension context or web app
      // For now, we'll simulate browsing history data since direct Chrome history access
      // requires a browser extension or special permissions
      
      // Simulate getting browsing history (in a real app, this would be from Chrome API)
      const mockHistory: BrowsingHistoryItem[] = [
        {
          id: '1',
          url: 'https://github.com',
          title: 'GitHub',
          visitTime: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          visitCount: 15
        },
        {
          id: '2',
          url: 'https://stackoverflow.com',
          title: 'Stack Overflow',
          visitTime: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          visitCount: 8
        },
        {
          id: '3',
          url: 'https://docs.opacus.ai',
          title: 'Opacus Documentation',
          visitTime: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
          visitCount: 3
        },
        {
          id: '4',
          url: 'https://twitter.com',
          title: 'Twitter',
          visitTime: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
          visitCount: 25
        },
        {
          id: '5',
          url: 'https://youtube.com',
          title: 'YouTube',
          visitTime: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
          visitCount: 42
        }
      ];

      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setHistory(mockHistory);
      console.log('Browsing history permission granted and data obtained');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown browsing history error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    history,
    loading,
    error,
    requestPermission,
  };
};
