
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Wallet, LogOut, Loader2 } from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';

const WalletConnect: React.FC = () => {
  const { address, balance, isConnected, isLoading, connectWallet, disconnectWallet } = useWeb3();

  if (isConnected && address) {
    return (
      <Card className="card-cyber p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-cyber-neon rounded-full animate-pulse"></div>
            <div>
              <p className="text-sm text-muted-foreground">Connected</p>
              <p className="font-mono text-sm glow-text">
                {address.slice(0, 6)}...{address.slice(-4)}
              </p>
              <p className="text-xs text-cyber-green">{parseFloat(balance).toFixed(4)} OG</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={disconnectWallet}
            className="border-destructive/50 text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4" />
            Disconnect
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="card-cyber p-6 text-center">
      <div className="mb-4">
        <Wallet className="w-12 h-12 mx-auto text-cyber-neon animate-glow-pulse" />
      </div>
      <h3 className="text-lg font-bold mb-2 glow-text">Connect Your Wallet</h3>
      <p className="text-muted-foreground mb-4">
        Connect to 0G Chain to access UDID services
      </p>
      <Button 
        onClick={connectWallet} 
        disabled={isLoading}
        className="btn-cyber w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Wallet className="w-4 h-4 mr-2" />
            Connect MetaMask
          </>
        )}
      </Button>
    </Card>
  );
};

export default WalletConnect;
