
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Web3Provider } from '@/contexts/Web3Context';
import WalletConnect from '@/components/WalletConnect';
import UDIDManager from '@/components/UDIDManager';
import NFTManager from '@/components/NFTManager';
import ChatBot from '@/components/ChatBot';
import { 
  Shield, 
  Image, 
  MessageCircle, 
  Zap, 
  Network, 
  Users,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const Index: React.FC = () => {
  return (
    <Web3Provider>
      <div className="min-h-screen bg-cyber-dark cyber-bg">
        {/* Background Effects */}
        <div className="fixed inset-0 bg-gradient-to-br from-cyber-blue/5 via-transparent to-cyber-purple/5 pointer-events-none" />
        
        {/* Header */}
        <header className="relative z-10 border-b border-cyber-grid/50 bg-background/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-cyber-neon to-cyber-green rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-background" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold glow-text">Opacus UDID Hub</h1>
                  <p className="text-sm text-muted-foreground">Universal Digital Identity Network</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="border-cyber-neon/50 text-cyber-neon animate-pulse">
                  0G-Galileo-Testnet
                </Badge>
                <WalletConnect />
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative z-10 py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-cyber-neon mr-3 animate-pulse" />
                <h2 className="text-4xl md:text-6xl font-bold glow-text">
                  Digital Identity
                </h2>
                <Sparkles className="w-8 h-8 text-cyber-neon ml-3 animate-pulse" />
              </div>
              <h3 className="text-2xl md:text-3xl mb-6 bg-gradient-to-r from-cyber-blue via-cyber-neon to-cyber-green bg-clip-text text-transparent">
                Reimagined for Web3
              </h3>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Create, manage, and secure your Universal Digital Identity on the high-performance 0G Chain. 
                Mint identity-bound NFTs and interact with AI-powered services.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <Card className="card-cyber p-6 text-center group hover:scale-105 transition-transform">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-cyber-neon group-hover:animate-pulse" />
                  <h3 className="text-lg font-bold mb-2">Secure Identity</h3>
                  <p className="text-sm text-muted-foreground">
                    Create tamper-proof digital identities with cryptographic security
                  </p>
                </Card>
                
                <Card className="card-cyber p-6 text-center group hover:scale-105 transition-transform">
                  <Image className="w-12 h-12 mx-auto mb-4 text-cyber-blue group-hover:animate-pulse" />
                  <h3 className="text-lg font-bold mb-2">Identity NFTs</h3>
                  <p className="text-sm text-muted-foreground">
                    Mint NFTs tied to your UDID for verified digital assets
                  </p>
                </Card>
                
                <Card className="card-cyber p-6 text-center group hover:scale-105 transition-transform">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-cyber-green group-hover:animate-pulse" />
                  <h3 className="text-lg font-bold mb-2">AI Assistant</h3>
                  <p className="text-sm text-muted-foreground">
                    Get help from our intelligent chatbot for all operations
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <main className="relative z-10 pb-16">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="udid" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8 bg-card/50 backdrop-blur-sm">
                <TabsTrigger 
                  value="udid" 
                  className="data-[state=active]:bg-cyber-neon/20 data-[state=active]:text-cyber-neon"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  UDID Manager
                </TabsTrigger>
                <TabsTrigger 
                  value="nft"
                  className="data-[state=active]:bg-cyber-blue/20 data-[state=active]:text-cyber-blue"
                >
                  <Image className="w-4 h-4 mr-2" />
                  NFT Studio
                </TabsTrigger>
                <TabsTrigger 
                  value="chat"
                  className="data-[state=active]:bg-cyber-green/20 data-[state=active]:text-cyber-green"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  AI Assistant
                </TabsTrigger>
              </TabsList>

              <TabsContent value="udid" className="space-y-6">
                <UDIDManager />
              </TabsContent>

              <TabsContent value="nft" className="space-y-6">
                <NFTManager />
              </TabsContent>

              <TabsContent value="chat" className="space-y-6">
                <div className="max-w-4xl mx-auto">
                  <ChatBot />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>

        {/* Stats Section */}
        <section className="relative z-10 py-16 border-t border-cyber-grid/50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-cyber-neon/10 rounded-full flex items-center justify-center">
                  <Network className="w-8 h-8 text-cyber-neon" />
                </div>
                <div className="text-2xl font-bold glow-text">16601</div>
                <div className="text-sm text-muted-foreground">Chain ID</div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-cyber-blue/10 rounded-full flex items-center justify-center">
                  <Zap className="w-8 h-8 text-cyber-blue" />
                </div>
                <div className="text-2xl font-bold text-cyber-blue">Ultra Fast</div>
                <div className="text-sm text-muted-foreground">Transaction Speed</div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-cyber-green/10 rounded-full flex items-center justify-center">
                  <Shield className="w-8 h-8 text-cyber-green" />
                </div>
                <div className="text-2xl font-bold text-cyber-green">Secure</div>
                <div className="text-sm text-muted-foreground">Identity Protocol</div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-cyber-purple/10 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-cyber-purple" />
                </div>
                <div className="text-2xl font-bold text-cyber-purple">Growing</div>
                <div className="text-sm text-muted-foreground">Community</div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 border-t border-cyber-grid/50 bg-background/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <Shield className="w-6 h-6 text-cyber-neon" />
                <span className="font-bold glow-text">Opacus UDID Hub</span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>Built on 0G Chain</span>
                <span>•</span>
                <span>Powered by Web3</span>
                <span>•</span>
                <span>© 2024 Opacus Network</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Web3Provider>
  );
};

export default Index;
