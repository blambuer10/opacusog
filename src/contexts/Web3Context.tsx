
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { web3Service } from '@/lib/web3';
import { toast } from 'sonner';

interface Web3ContextType {
  address: string | null;
  balance: string;
  isConnected: boolean;
  isLoading: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const connectWallet = async () => {
    setIsLoading(true);
    try {
      const connectedAddress = await web3Service.connectWallet();
      if (connectedAddress) {
        setAddress(connectedAddress);
        setIsConnected(true);
        
        // Get balance
        const userBalance = await web3Service.getBalance(connectedAddress);
        setBalance(userBalance);
        
        toast.success(`Connected to ${connectedAddress.slice(0, 6)}...${connectedAddress.slice(-4)}`);
      } else {
        toast.error('Failed to connect wallet');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Error connecting wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    setBalance('0');
    setIsConnected(false);
    toast.info('Wallet disconnected');
  };

  useEffect(() => {
    // Check if already connected
    const checkConnection = async () => {
      if (window.ethereum && window.ethereum.selectedAddress) {
        try {
          const provider = web3Service.getProvider();
          if (provider) {
            const signer = await provider.getSigner();
            const addr = await signer.getAddress();
            setAddress(addr);
            setIsConnected(true);
            
            const userBalance = await web3Service.getBalance(addr);
            setBalance(userBalance);
          }
        } catch (error) {
          console.error('Error checking connection:', error);
        }
      }
    };

    checkConnection();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          connectWallet();
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  const value: Web3ContextType = {
    address,
    balance,
    isConnected,
    isLoading,
    connectWallet,
    disconnectWallet,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};
