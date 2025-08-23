
import React from 'react';
import { Web3Provider } from '@/contexts/Web3Context';
import SmartChatBot from '@/components/SmartChatBot';
import { Toaster } from 'sonner';

const Index: React.FC = () => {
  return (
    <Web3Provider>
      <div className="min-h-screen bg-cyber-dark cyber-bg">
        {/* Background Effects */}
        <div className="fixed inset-0 bg-gradient-to-br from-cyber-blue/5 via-transparent to-cyber-purple/5 pointer-events-none" />
        
        {/* Main SmartChatBot Interface */}
        <main className="relative z-10 h-screen">
          <SmartChatBot />
        </main>
        
        <Toaster />
      </div>
    </Web3Provider>
  );
};

export default Index;
