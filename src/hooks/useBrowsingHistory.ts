
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { BrowsingHistory } from '@/types/user-data';

export const useBrowsingHistory = () => {
  const [browsingHistory, setBrowsingHistory] = useState<BrowsingHistory[]>([]);
  const [hasPermission, setHasPermission] = useState(false);

  const requestChromePermission = useCallback(async () => {
    try {
      // For web demo purposes, we'll simulate Chrome history
      // In a real mobile app, you'd use proper Chrome extension APIs
      if (typeof window !== 'undefined') {
        const granted = window.confirm(
          'Opacus AI Agent\'ın Chrome geçmişinize erişmesine izin veriyor musunuz?'
        );
        
        setHasPermission(granted);
        
        if (granted) {
          toast.success('Chrome geçmişi izni verildi! AI Agent artık tarama verilerinize erişebilir.');
          
          // Simulate some browsing history for demo
          const mockHistory: BrowsingHistory[] = [
            {
              url: 'https://github.com',
              title: 'GitHub - Developer Platform',
              timestamp: Date.now() - 3600000,
              visitCount: 5
            },
            {
              url: 'https://docs.0g.ai',
              title: '0G Chain Documentation',
              timestamp: Date.now() - 7200000,
              visitCount: 3
            },
            {
              url: 'https://etherscan.io',
              title: 'Etherscan - Blockchain Explorer',
              timestamp: Date.now() - 10800000,
              visitCount: 8
            }
          ];
          
          setBrowsingHistory(mockHistory);
          return true;
        } else {
          toast.error('Chrome geçmişi izni reddedildi');
          return false;
        }
      }
      return false;
    } catch (error) {
      console.error('Chrome permission error:', error);
      toast.error('Chrome izni alınamadı');
      return false;
    }
  }, []);

  const clearHistory = useCallback(() => {
    setBrowsingHistory([]);
    toast.info('Tarama geçmişi temizlendi');
  }, []);

  return {
    browsingHistory,
    hasPermission,
    requestChromePermission,
    clearHistory
  };
};
