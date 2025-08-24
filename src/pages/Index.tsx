
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, 
  Shield, 
  Database, 
  Zap, 
  Globe, 
  Lock,
  ArrowRight,
  Star,
  Users,
  DollarSign,
  Play,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import WalletConnect from '@/components/WalletConnect';
import EchoChat from '@/components/EchoChat';
import DataMarketplace from '@/components/DataMarketplace';
import UDIDManager from '@/components/UDIDManager';
import INFTManager from '@/components/INFTManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWeb3 } from '@/contexts/Web3Context';

const HomePage = () => {
  const { isConnected } = useWeb3();
  const [activeTab, setActiveTab] = useState('home');

  const features = [
    {
      icon: <Shield className="w-12 h-12" />,
      title: 'Güvenli Şifreleme',
      description: 'Verileriniz AES-256-GCM ile şifrelenir ve sadece siz erişebilirsiniz',
      gradient: 'from-cyber-green to-cyber-neon'
    },
    {
      icon: <Bot className="w-12 h-12" />,
      title: 'Kişisel AI İkiz',
      description: 'Echo, sizin verilerinizle eğitilmiş özel AI asistanınız',
      gradient: 'from-cyber-neon to-cyber-blue'
    },
    {
      icon: <DollarSign className="w-12 h-12" />,
      title: 'Veri Monetizasyonu',
      description: 'Şifrelenmiş verilerinizi güvenle satın veya kiralayın',
      gradient: 'from-cyber-blue to-cyber-purple'
    },
    {
      icon: <Database className="w-12 h-12" />,
      title: '0G Network Altyapısı',
      description: 'Merkezi olmayan depolama ve hesaplama gücü',
      gradient: 'from-cyber-purple to-cyber-yellow'
    }
  ];

  const steps = [
    {
      step: '01',
      title: 'Cüzdan Bağla',
      description: 'MetaMask ile güvenli bağlantı kurun ve UDID oluşturun'
    },
    {
      step: '02', 
      title: 'Veri Topla',
      description: 'Sosyal medya, lokasyon ve tarama verilerinizi bağlayın'
    },
    {
      step: '03',
      title: 'Şifrele & Eğit',
      description: 'Veriler AES-256 ile şifrelenir ve kişisel AI ikiziniz eğitilir'
    },
    {
      step: '04',
      title: 'Monetize Et',
      description: 'INFT olarak mintleyin ve marketplace\'te satın/kiralayın'
    }
  ];

  const stats = [
    { value: '10K+', label: 'Aktif Kullanıcı', icon: <Users className="w-5 h-5" /> },
    { value: '50K+', label: 'Şifrelenmiş Veri', icon: <Lock className="w-5 h-5" /> },
    { value: '$2M+', label: 'Veri Geliri', icon: <DollarSign className="w-5 h-5" /> },
    { value: '99.9%', label: 'Güvenlik', icon: <Shield className="w-5 h-5" /> }
  ];

  if (isConnected && activeTab !== 'home') {
    return (
      <div className="min-h-screen bg-cyber-dark">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-screen flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-cyber-grid bg-background/80 backdrop-blur-sm">
            <TabsList className="grid w-fit grid-cols-5 bg-card/50 backdrop-blur-sm">
              <TabsTrigger 
                value="home"
                className="data-[state=active]:bg-cyber-neon/20 data-[state=active]:text-cyber-neon"
              >
                Ana Sayfa
              </TabsTrigger>
              <TabsTrigger 
                value="echo"
                className="data-[state=active]:bg-cyber-neon/20 data-[state=active]:text-cyber-neon"
              >
                <Bot className="w-4 h-4 mr-2" />
                Echo
              </TabsTrigger>
              <TabsTrigger 
                value="marketplace"
                className="data-[state=active]:bg-cyber-purple/20 data-[state=active]:text-cyber-purple"
              >
                <Globe className="w-4 h-4 mr-2" />
                Pazar
              </TabsTrigger>
              <TabsTrigger 
                value="udid"
                className="data-[state=active]:bg-cyber-green/20 data-[state=active]:text-cyber-green"
              >
                <Shield className="w-4 h-4 mr-2" />
                UDID
              </TabsTrigger>
              <TabsTrigger 
                value="inft"
                className="data-[state=active]:bg-cyber-yellow/20 data-[state=active]:text-cyber-yellow"
              >
                <Database className="w-4 h-4 mr-2" />
                INFT
              </TabsTrigger>
            </TabsList>
            
            <WalletConnect />
          </div>

          <TabsContent value="echo" className="flex-1">
            <EchoChat />
          </TabsContent>
          
          <TabsContent value="marketplace" className="flex-1 overflow-auto">
            <DataMarketplace />
          </TabsContent>
          
          <TabsContent value="udid" className="flex-1 overflow-auto">
            <UDIDManager />
          </TabsContent>
          
          <TabsContent value="inft" className="flex-1 overflow-auto">
            <INFTManager />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-dark">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-cyber-grid">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-cyber-neon to-cyber-green rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6 text-background" />
            </div>
            <div>
              <h1 className="text-xl font-bold glow-text">Opacus</h1>
              <p className="text-xs text-muted-foreground">Kişisel Veri Egemenliği</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <Button 
                onClick={() => setActiveTab('echo')}
                className="btn-cyber"
              >
                <Bot className="w-4 h-4 mr-2" />
                Echo'ya Git
              </Button>
            ) : (
              <WalletConnect />
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-cyber-neon via-cyber-green to-cyber-blue bg-clip-text text-transparent">
                Verinin Geleceği
              </span>
              <br />
              <span className="glow-text">Sizin Elinizde</span>
            </h2>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Kişisel verilerinizi güvenle şifreleyin, AI ikizinizi oluşturun ve 
              veri ekonomisinden gelir elde edin. Web3'ün gücüyle tam kontrol sizde.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              {!isConnected ? (
                <WalletConnect />
              ) : (
                <Button 
                  onClick={() => setActiveTab('echo')}
                  className="btn-cyber text-lg px-8 py-6"
                >
                  <Bot className="w-5 h-5 mr-2" />
                  Echo ile Başla
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              )}
              
              <Button variant="outline" className="border-cyber-grid text-lg px-8 py-6">
                <Play className="w-5 h-5 mr-2" />
                Demo İzle
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
          >
            {stats.map((stat, index) => (
              <Card key={index} className="card-cyber p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-cyber-neon to-cyber-green rounded-lg flex items-center justify-center mx-auto mb-4">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold glow-text mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h3 className="text-4xl font-bold glow-text mb-4">Neden Opacus?</h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Verilerinizin gerçek değerini keşfedin ve tam kontrolü elinizde tutun
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="card-cyber p-8 h-full">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center mb-6 text-background`}>
                    {feature.icon}
                  </div>
                  <h4 className="text-2xl font-bold glow-text mb-4">{feature.title}</h4>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-card/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h3 className="text-4xl font-bold glow-text mb-4">Nasıl Çalışır?</h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Sadece 4 adımda dijital ikizinizi oluşturun ve gelir elde etmeye başlayın
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="card-cyber p-6 text-center h-full">
                  <div className="w-16 h-16 bg-gradient-to-r from-cyber-neon to-cyber-green rounded-full flex items-center justify-center mx-auto mb-6 text-background text-2xl font-bold">
                    {step.step}
                  </div>
                  <h4 className="text-xl font-bold glow-text mb-4">{step.title}</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Card className="card-cyber p-12 text-center bg-gradient-to-r from-cyber-neon/10 via-cyber-green/10 to-cyber-blue/10 border-cyber-neon/30">
              <div className="w-20 h-20 bg-gradient-to-r from-cyber-neon to-cyber-green rounded-full flex items-center justify-center mx-auto mb-8">
                <Shield className="w-10 h-10 text-background" />
              </div>
              
              <h3 className="text-4xl font-bold glow-text mb-6">
                Veri Egemenliğinizi Başlatın
              </h3>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Şimdiye kadar verilerinizden büyük şirketler kazanç elde etti. 
                Artık sıra sizde! Opacus ile verilerinizin gerçek sahibi siz olun.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {!isConnected ? (
                  <WalletConnect />
                ) : (
                  <Button 
                    onClick={() => setActiveTab('echo')}
                    className="btn-cyber text-lg px-8 py-6"
                  >
                    <Bot className="w-5 h-5 mr-2" />
                    Şimdi Başla
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                )}
                
                <Button variant="outline" className="border-cyber-grid text-lg px-8 py-6">
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Güvenlik Detayları
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-cyber-grid bg-card/20">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-r from-cyber-neon to-cyber-green rounded-lg flex items-center justify-center">
                <Bot className="w-6 h-6 text-background" />
              </div>
              <div>
                <h4 className="text-lg font-bold glow-text">Opacus</h4>
                <p className="text-sm text-muted-foreground">Kişisel Veri Egemenliği</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <span>© 2024 Opacus Network</span>
              <span>•</span>
              <span>Gizlilik Politikası</span>
              <span>•</span>
              <span>Kullanım Şartları</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
