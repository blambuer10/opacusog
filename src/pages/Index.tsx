
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Web3Provider } from '@/contexts/Web3Context';
import WalletConnect from '@/components/WalletConnect';
import UDIDManager from '@/components/UDIDManager';
import INFTManager from '@/components/INFTManager';
import SmartChatBot from '@/components/SmartChatBot';
import UserProfile from '@/components/UserProfile';
import { 
  Shield, 
  Image, 
  MessageCircle, 
  User,
  Zap, 
  Network, 
  Users,
  Sparkles,
  Cloud,
  Smartphone
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
                  <h1 className="text-2xl font-bold glow-text">Opacus AI Agent</h1>
                  <p className="text-sm text-muted-foreground">Kişisel Yapay Zeka Asistanınız</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Logo */}
                <div className="flex items-center space-x-2">
                  <img 
                    src="/lovable-uploads/70d5593f-f3e7-4ea1-af4b-e761c45e10de.png" 
                    alt="Opacus Logo" 
                    className="w-8 h-8 object-contain"
                  />
                  <span className="text-sm font-medium text-cyber-neon">Opacus</span>
                </div>
                
                <Badge variant="outline" className="border-cyber-neon/50 text-cyber-neon animate-pulse">
                  0G-Newton-Testnet
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
                  AI Agent
                </h2>
                <img 
                  src="/lovable-uploads/70d5593f-f3e7-4ea1-af4b-e761c45e10de.png" 
                  alt="Opacus" 
                  className="w-12 h-12 ml-3 object-contain animate-float"
                />
              </div>
              <h3 className="text-2xl md:text-3xl mb-6 bg-gradient-to-r from-cyber-blue via-cyber-neon to-cyber-green bg-clip-text text-transparent">
                Verilerinizi Öğrenen Kişisel Asistanınız
              </h3>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Tüm verilerinizi güvenli şekilde şifreleyerek UDID'nize bağlayan akıllı AI Agent. 
                Yakında mobil uygulama olarak indirilebilir!
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
                <Card className="card-cyber p-6 text-center group hover:scale-105 transition-transform">
                  <div className="flex items-center justify-center mb-4">
                    <Shield className="w-12 h-12 text-cyber-neon group-hover:animate-pulse" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Güvenli UDID</h3>
                  <p className="text-sm text-muted-foreground">
                    Blockchain tabanlı kimlik sistemi
                  </p>
                </Card>
                
                <Card className="card-cyber p-6 text-center group hover:scale-105 transition-transform">
                  <div className="flex items-center justify-center mb-4">
                    <MessageCircle className="w-12 h-12 text-cyber-green group-hover:animate-pulse" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Akıllı Sohbet</h3>
                  <p className="text-sm text-muted-foreground">
                    Verilerinizi bilen AI asistan
                  </p>
                </Card>
                
                <Card className="card-cyber p-6 text-center group hover:scale-105 transition-transform">
                  <div className="flex items-center justify-center mb-4">
                    <Image className="w-12 h-12 text-cyber-blue group-hover:animate-pulse" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Şifreli INFT</h3>
                  <p className="text-sm text-muted-foreground">
                    Verilerinizi NFT olarak saklayın
                  </p>
                </Card>
                
                <Card className="card-cyber p-6 text-center group hover:scale-105 transition-transform">
                  <div className="flex items-center justify-center mb-4">
                    <Smartphone className="w-12 h-12 text-cyber-purple group-hover:animate-pulse" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Mobil App</h3>
                  <p className="text-sm text-muted-foreground">
                    Yakında APK olarak indir
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <main className="relative z-10 pb-16">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="agent" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8 bg-card/50 backdrop-blur-sm">
                <TabsTrigger 
                  value="agent" 
                  className="data-[state=active]:bg-cyber-green/20 data-[state=active]:text-cyber-green"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  AI Agent
                </TabsTrigger>
                <TabsTrigger 
                  value="profile"
                  className="data-[state=active]:bg-cyber-purple/20 data-[state=active]:text-cyber-purple"
                >
                  <User className="w-4 h-4 mr-2" />
                  Profil
                </TabsTrigger>
                <TabsTrigger 
                  value="udid" 
                  className="data-[state=active]:bg-cyber-neon/20 data-[state=active]:text-cyber-neon"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  UDID
                </TabsTrigger>
                <TabsTrigger 
                  value="inft"
                  className="data-[state=active]:bg-cyber-blue/20 data-[state=active]:text-cyber-blue"
                >
                  <Image className="w-4 h-4 mr-2" />
                  INFT
                </TabsTrigger>
              </TabsList>

              <TabsContent value="agent" className="space-y-6">
                <div className="max-w-4xl mx-auto">
                  <SmartChatBot />
                </div>
              </TabsContent>

              <TabsContent value="profile" className="space-y-6">
                <UserProfile />
              </TabsContent>

              <TabsContent value="udid" className="space-y-6">
                <UDIDManager />
              </TabsContent>

              <TabsContent value="inft" className="space-y-6">
                <INFTManager />
              </TabsContent>
            </Tabs>
          </div>
        </main>

        {/* Features Section */}
        <section className="relative z-10 py-16 border-t border-cyber-grid/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold glow-text mb-4">Gelişmiş Teknoloji</h2>
              <p className="text-muted-foreground">Blockchain ve AI'ın gücünü birleştiren platform</p>
            </div>
            
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
                <div className="text-2xl font-bold text-cyber-blue">Ultra Hızlı</div>
                <div className="text-sm text-muted-foreground">İşlem Hızı</div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-cyber-green/10 rounded-full flex items-center justify-center">
                  <Shield className="w-8 h-8 text-cyber-green" />
                </div>
                <div className="text-2xl font-bold text-cyber-green">TEE Güvenli</div>
                <div className="text-sm text-muted-foreground">Kimlik Protokolü</div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-cyber-purple/10 rounded-full flex items-center justify-center">
                  <Smartphone className="w-8 h-8 text-cyber-purple" />
                </div>
                <div className="text-2xl font-bold text-cyber-purple">Mobil</div>
                <div className="text-sm text-muted-foreground">APK İndir</div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 border-t border-cyber-grid/50 bg-background/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <img 
                  src="/lovable-uploads/70d5593f-f3e7-4ea1-af4b-e761c45e10de.png" 
                  alt="Opacus" 
                  className="w-6 h-6 object-contain"
                />
                <Shield className="w-6 h-6 text-cyber-neon" />
                <span className="font-bold glow-text">Opacus AI Agent</span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>0G Chain Üzerinde</span>
                <span>•</span>
                <span>AI & Blockchain</span>
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
