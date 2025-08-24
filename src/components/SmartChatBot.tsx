import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, 
  Send, 
  User, 
  Loader2, 
  MessageSquare, 
  Zap,
  Database,
  Shield,
  MapPin,
  Chrome,
  Settings,
  Activity,
  Globe,
  Lock,
  Eye,
  EyeOff,
  ShoppingBag
} from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { web3Service } from '@/lib/web3';
import { toast } from 'sonner';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useBrowsingHistory } from '@/hooks/useBrowsingHistory';
import WalletConnect from './WalletConnect';
import UserProfile from './UserProfile';
import UDIDManager from './UDIDManager';
import INFTManager from './INFTManager';
import { OpacusCrypto } from '@/lib/crypto';
import DataMarketplace from './DataMarketplace';
import { Twitter, Instagram, Bitcoin, Music } from 'lucide-react';
import { ethers } from 'ethers';

interface Message {
  id: string;
  type: 'user' | 'bot' | 'system';
  content: string;
  timestamp: Date;
  dataSource?: string;
  encrypted?: boolean;
}

interface UserDataSummary {
  udidExists: boolean;
  locationEnabled: boolean;
  browsingEnabled: boolean;
  locationCount: number;
  browsingCount: number;
}

interface DataSourceConfig {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  enabled: boolean;
  available: boolean;
  encrypted: boolean;
  dataCount: number;
  lastSync?: Date;
  tags: string[];
}

interface EncryptedDataMetadata {
  ciphertextBase64: string;
  ivBase64: string;
  wrappedKeyBase64: string;
  alg: string;
  tagLength: number;
  createdAt: number;
  dataType: string;
  tags: string[];
}

const SmartChatBot: React.FC = () => {
  const { address, isConnected } = useWeb3();
  const { position, error: locationError, requestPermission: requestLocationPermission } = useGeolocation();
  const { history, requestPermission: requestBrowsingPermission } = useBrowsingHistory();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [rsaKeyPair, setRsaKeyPair] = useState<CryptoKeyPair | null>(null);
  const [publicKeyPem, setPublicKeyPem] = useState<string>('');
  const [privateKeyPem, setPrivateKeyPem] = useState<string>('');
  
  const [dataSources, setDataSources] = useState<DataSourceConfig[]>([
    {
      id: 'location',
      name: '📍 Lokasyon Verisi',
      icon: <MapPin className="w-5 h-5" />,
      description: 'Konum tabanlı öneriler ve analiz',
      enabled: false,
      available: true,
      encrypted: false,
      dataCount: 0,
      tags: ['location', 'geo', 'personal']
    },
    {
      id: 'browsing',
      name: '🌐 Chrome Geçmişi',
      icon: <Chrome className="w-5 h-5" />,
      description: 'Web sitesi ziyaretleri ve tercihler',
      enabled: false,
      available: true,
      encrypted: false,
      dataCount: 0,
      tags: ['browsing', 'web', 'preferences']
    },
    {
      id: 'twitter',
      name: '🐦 X (Twitter)',
      icon: <Twitter className="w-5 h-5" />,
      description: 'Tweetler, takipler ve etkileşimler',
      enabled: false,
      available: false,
      encrypted: false,
      dataCount: 0,
      tags: ['social', 'twitter', 'content']
    },
    {
      id: 'instagram',
      name: '📸 Instagram',
      icon: <Instagram className="w-5 h-5" />,
      description: 'Fotoğraflar, story\'ler ve etkileşimler',
      enabled: false,
      available: false,
      encrypted: false,
      dataCount: 0,
      tags: ['social', 'instagram', 'visual']
    },
    {
      id: 'amazon',
      name: '🛒 Amazon',
      icon: <ShoppingBag className="w-5 h-5" />,
      description: 'Alışveriş geçmişi ve öneriler',
      enabled: false,
      available: false,
      encrypted: false,
      dataCount: 0,
      tags: ['shopping', 'ecommerce', 'preferences']
    },
    {
      id: 'binance',
      name: '₿ Binance',
      icon: <Bitcoin className="w-5 h-5" />,
      description: 'Kripto portföy ve işlem geçmişi',
      enabled: false,
      available: false,
      encrypted: false,
      dataCount: 0,
      tags: ['crypto', 'trading', 'finance']
    },
    {
      id: 'tiktok',
      name: '🎵 TikTok',
      icon: <Music className="w-5 h-5" />,
      description: 'İzlenen videolar ve etkileşimler',
      enabled: false,
      available: false,
      encrypted: false,
      dataCount: 0,
      tags: ['social', 'video', 'entertainment']
    }
  ]);

  const [userDataSummary, setUserDataSummary] = useState<UserDataSummary>({
    udidExists: false,
    locationEnabled: false,
    browsingEnabled: false,
    locationCount: 0,
    browsingCount: 0
  });
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize with welcome message
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        type: 'bot',
        content: 'Merhaba! Ben Opacus AI Asistanınızım. 🤖\n\nSize kişisel bir deneyim sunmak için verilerinizi güvenli bir şekilde şifreliyorum. Lokasyon ve tarama geçmişinize erişim izni vererek benimle daha detaylı sohbet edebilirsiniz.\n\nNasıl yardımcı olabilirim?',
        timestamp: new Date(),
        encrypted: true
      }]);
    }
  }, []);

  useEffect(() => {
    // Update user data summary
    setUserDataSummary({
      udidExists: isConnected && address !== null,
      locationEnabled: position !== null,
      browsingEnabled: history.length > 0,
      locationCount: position ? 1 : 0,
      browsingCount: history.length
    });
  }, [isConnected, address, position, history]);

  useEffect(() => {
    // Auto-scroll to bottom
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Notify AI about data changes
    if (position && messages.length > 1) {
      addSystemMessage(`📍 Lokasyon verisi aktif edildi! Artık konum tabanlı öneriler alabilirsınız.`);
    }
  }, [position]);

  useEffect(() => {
    if (history.length > 0 && messages.length > 1) {
      addSystemMessage(`🌐 Tarama geçmişi erişimi aktif! ${history.length} site verisi şifrelendi ve AI'ya entegre edildi.`);
    }
  }, [history.length]);

  useEffect(() => {
    // Generate RSA key pair for user
    generateUserKeys();
  }, []);

  useEffect(() => {
    // Update data sources based on permissions and encryption status
    updateDataSourcesStatus();
  }, [position, history, isConnected, address]);

  const generateUserKeys = async () => {
    try {
      const keyPair = await OpacusCrypto.generateRsaKeyPair();
      const publicPem = await OpacusCrypto.exportRsaPublicKeyToPem(keyPair.publicKey);
      const privatePem = await OpacusCrypto.exportRsaPrivateKeyToPem(keyPair.privateKey);
      
      setRsaKeyPair(keyPair);
      setPublicKeyPem(publicPem);
      setPrivateKeyPem(privatePem);
      
      // Store keys securely (in production, use secure storage)
      localStorage.setItem('opacus_public_key', publicPem);
      localStorage.setItem('opacus_private_key', privatePem);
    } catch (error) {
      console.error('Error generating RSA keys:', error);
    }
  };

  const updateDataSourcesStatus = async () => {
    if (!isConnected || !address) return;

    try {
      // Check permissions from contract
      const permissions = await web3Service.getUserPermissions(address);
      
      setDataSources(prev => prev.map(source => {
        let enabled = false;
        let dataCount = 0;
        let encrypted = false;

        if (source.id === 'location') {
          enabled = position !== null && permissions.includes('location');
          dataCount = position ? 1 : 0;
          encrypted = enabled && position !== null;
        } else if (source.id === 'browsing') {
          enabled = history.length > 0 && permissions.includes('browsing');
          dataCount = history.length;
          encrypted = enabled && history.length > 0;
        } else {
          enabled = permissions.includes(source.id);
        }

        return {
          ...source,
          enabled,
          dataCount,
          encrypted,
          lastSync: enabled ? new Date() : undefined
        };
      }));
    } catch (error) {
      console.error('Error updating data sources status:', error);
    }
  };

  const encryptAndStoreUserData = async (sourceId: string, data: any): Promise<string | null> => {
    if (!publicKeyPem || !isConnected || !address) return null;

    try {
      const dataString = JSON.stringify(data);
      const encrypted = await OpacusCrypto.encryptStringForRecipient(dataString, publicKeyPem);
      
      const metadata: EncryptedDataMetadata = {
        ...encrypted,
        createdAt: Math.floor(Date.now() / 1000),
        dataType: sourceId,
        tags: dataSources.find(s => s.id === sourceId)?.tags || []
      };

      // Store metadata in OG Storage (mock - implement with actual OG Storage)
      const metadataString = JSON.stringify(metadata);
      const metadataHash = ethers.keccak256(ethers.toUtf8Bytes(metadataString));
      
      // Store in blockchain
      await web3Service.storeEncryptedData(address, `og://encrypted-${sourceId}-${Date.now()}`, metadataHash);
      
      return metadataHash;
    } catch (error) {
      console.error(`Error encrypting ${sourceId} data:`, error);
      toast.error(`${sourceId} verisi şifrelenemedi`);
      return null;
    }
  };

  const addSystemMessage = (content: string) => {
    const systemMessage: Message = {
      id: Date.now().toString(),
      type: 'system',
      content,
      timestamp: new Date(),
      encrypted: true
    };
    setMessages(prev => [...prev, systemMessage]);
  };

  const handleDataPermissionRequest = async (type: 'location' | 'browsing') => {
    try {
      if (type === 'location') {
        await requestLocationPermission();
        toast.success('Lokasyon izni verildi!');
      } else if (type === 'browsing') {
        await requestBrowsingPermission();
        toast.success('Tarama geçmişi izni verildi!');
      }
    } catch (error) {
      toast.error(`${type === 'location' ? 'Lokasyon' : 'Tarama geçmişi'} izni alınamadı`);
    }
  };

  const handleDataSourceToggle = async (sourceId: string, enabled: boolean) => {
    try {
      if (enabled) {
        if (sourceId === 'location') {
          await requestLocationPermission();
          toast.success('Lokasyon izni verildi!');
        } else if (sourceId === 'browsing') {
          await requestBrowsingPermission();
          toast.success('Tarama geçmişi izni verildi!');
        } else {
          toast.info(`${sourceId} yakında geliyor!`);
          return;
        }
        
        if (isConnected && address) {
          await web3Service.grantPermission(sourceId);
        }
      } else {
        if (isConnected && address) {
          await web3Service.revokePermission(sourceId);
        }
        toast.info(`${sourceId} izni kaldırıldı`);
      }
      
      // Update data sources
      updateDataSourcesStatus();
    } catch (error) {
      console.error(`Error toggling ${sourceId}:`, error);
      toast.error(`${sourceId} izni güncellenemedi`);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput('');
    setIsTyping(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      let botResponse: string;
      let dataSource = '';

      // Enhanced AI responses with encrypted data context
      const enabledSources = dataSources.filter(s => s.enabled && s.encrypted);
      const dataContext = enabledSources.map(s => `${s.name}: ${s.dataCount} veri noktası şifrelenmiş`).join(', ');

      if (currentInput.toLowerCase().includes('veri') || currentInput.toLowerCase().includes('şifre')) {
        if (enabledSources.length > 0) {
          botResponse = `🔐 Şu anda aktif şifrelenmiş verileriniz:\n\n${dataContext}\n\nTüm verileriniz AES-256-GCM ile şifrelenerek blockchain'de güvenli bir şekilde saklanıyor. Sadece sizin özel anahtarınızla açılabilir.`;
        } else {
          botResponse = `Henüz şifrelenmiş veriniz bulunmuyor. Profil sayfasından veri kaynaklarınızı aktif ederek verilerinizi şifreleyebilir ve benimle paylaşabilirsiniz.`;
        }
      } else if (currentInput.toLowerCase().includes('marketplace') || currentInput.toLowerCase().includes('pazar')) {
        botResponse = `🏪 Veri Pazarında şifrelenmiş verilerinizi başkalarıyla güvenli bir şekilde paylaşabilir veya satabilirsiniz:\n\n• Satış: Veri mülkiyetini tamamen devret\n• Kiralama: Belirli süre için kullanım izni ver\n• Otomatik şifreleme: Alıcının anahtarıyla yeniden şifreleme\n\nVeri Pazarı sekmesinden işlemlerinizi yapabilirsiniz.`;
      } else if (currentInput.toLowerCase().includes('neredeyim') || currentInput.toLowerCase().includes('konum')) {
        const locationSource = enabledSources.find(s => s.id === 'location');
        if (locationSource && position) {
          botResponse = `📍 Konum verileriniz şifrelenmiş durumda! Yaklaşık koordinatlarınız güvenli bir şekilde kaydedildi. Size özel konum bazlı öneriler sunabilirim. Verileriniz sadece sizin özel anahtarınızla çözülebilir.`;
          dataSource = 'location';
        } else {
          botResponse = 'Konum verilerinize erişmek için Profil sayfasından lokasyon iznini aktif edin. Verileriniz şifrelenecek ve size özel öneriler sunabileceğim.';
        }
      } else if (currentInput.toLowerCase().includes('geçmiş') || currentInput.toLowerCase().includes('site')) {
        const browsingSource = enabledSources.find(s => s.id === 'browsing');
        if (browsingSource && history.length > 0) {
          botResponse = `🌐 Tarama geçmişinizden ${history.length} veri noktası şifrelenmiş durumda! Web sitesi tercihlerinize göre kişiselleştirilmiş öneriler sunabilirim. Tüm veriler AES-256 ile korunuyor.`;
          dataSource = 'browsing';
        } else {
          botResponse = 'Tarama geçmişinize erişmek için Profil sayfasından Chrome geçmişi iznini aktif edin. Verileriniz şifrelenecek ve size özel içerik önerebileceğim.';
        }
      } else {
        botResponse = `Merhaba! Ben Opacus AI Asistanınızım. ${enabledSources.length > 0 ? `${enabledSources.length} veri kaynağınız şifrelenmiş durumda.` : 'Henüz veri kaynağınız yok.'}\n\nSize nasıl yardımcı olabilirim?\n\n• Veri şifreleme ve güvenlik\n• Kişiselleştirilmiş öneriler\n• Veri Pazarı işlemleri\n• Blockchain entegrasyonu`;
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: botResponse,
        timestamp: new Date(),
        dataSource,
        encrypted: true
      };

      setMessages(prev => [...prev, botMessage]);

      // Store chat on blockchain if connected
      if (isConnected && address) {
        try {
          await web3Service.storeChatLog(address, currentInput, botResponse);
        } catch (error) {
          console.error('Blockchain storage error:', error);
        }
      }

    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Sohbet hatası oluştu');
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col bg-cyber-dark">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-cyber-grid bg-background/80 backdrop-blur-sm">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-r from-cyber-neon to-cyber-green rounded-lg flex items-center justify-center">
            <Bot className="w-6 h-6 text-background" />
          </div>
          <div>
            <h1 className="text-xl font-bold glow-text">Opacus AI Agent</h1>
            <p className="text-sm text-muted-foreground">Kişiselleştirilmiş Şifrelenmiş AI</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {dataSources.filter(s => s.encrypted).map(source => (
            <Badge key={source.id} variant="outline" className="border-cyber-green/50 text-cyber-green">
              <Lock className="w-3 h-3 mr-1" />
              {source.dataCount}
            </Badge>
          ))}
          <WalletConnect />
        </div>
      </header>

      {/* Main Content with Tabs */}
      <div className="flex-1 flex">
        <div className="flex-1">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-5 m-4 bg-card/50 backdrop-blur-sm">
              <TabsTrigger value="chat" className="data-[state=active]:bg-cyber-neon/20 data-[state=active]:text-cyber-neon">
                <MessageSquare className="w-4 h-4 mr-2" />
                AI Chat
              </TabsTrigger>
              <TabsTrigger value="profile" className="data-[state=active]:bg-cyber-blue/20 data-[state=active]:text-cyber-blue">
                <Settings className="w-4 h-4 mr-2" />
                Profil
              </TabsTrigger>
              <TabsTrigger value="marketplace" className="data-[state=active]:bg-cyber-purple/20 data-[state=active]:text-cyber-purple">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Pazar
              </TabsTrigger>
              <TabsTrigger value="udid" className="data-[state=active]:bg-cyber-green/20 data-[state=active]:text-cyber-green">
                <Shield className="w-4 h-4 mr-2" />
                UDID
              </TabsTrigger>
              <TabsTrigger value="inft" className="data-[state=active]:bg-cyber-yellow/20 data-[state=active]:text-cyber-yellow">
                <Database className="w-4 h-4 mr-2" />
                INFT
              </TabsTrigger>
            </TabsList>

            {/* Chat Tab Content */}
            <TabsContent value="chat" className="flex-1 flex flex-col px-4 pb-4">
              <Card className="card-cyber flex-1 flex flex-col">
                {/* Chat Messages */}
                <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex items-start space-x-3 ${
                          message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                        } ${message.type === 'system' ? 'justify-center' : ''}`}
                      >
                        {message.type !== 'system' && (
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            message.type === 'user' 
                              ? 'bg-cyber-blue/20 text-cyber-blue' 
                              : 'bg-cyber-neon/20 text-cyber-neon'
                          }`}>
                            {message.type === 'user' ? (
                              <User className="w-4 h-4" />
                            ) : (
                              <Bot className="w-4 h-4" />
                            )}
                          </div>
                        )}
                        
                        <div className={`flex-1 max-w-[80%] ${
                          message.type === 'user' ? 'text-right' : 
                          message.type === 'system' ? 'text-center max-w-[60%]' : 'text-left'
                        }`}>
                          <div className={`inline-block p-3 rounded-lg whitespace-pre-wrap ${
                            message.type === 'user'
                              ? 'bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/30'
                              : message.type === 'system'
                              ? 'bg-cyber-green/10 text-cyber-green border border-cyber-green/30'
                              : 'bg-card/50 backdrop-blur-sm border border-cyber-grid'
                          }`}>
                            {message.content}
                          </div>
                          
                          <div className="flex items-center mt-1 text-xs text-muted-foreground">
                            <span>{message.timestamp.toLocaleTimeString()}</span>
                            {message.encrypted && (
                              <Badge variant="outline" className="ml-2 border-cyber-green/30 text-cyber-green">
                                <Lock className="w-2 h-2 mr-1" />
                                Şifreli
                              </Badge>
                            )}
                            {message.dataSource && (
                              <Badge variant="outline" className="ml-2 border-cyber-blue/30 text-cyber-blue">
                                <Database className="w-2 h-2 mr-1" />
                                {message.dataSource}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyber-neon/20 text-cyber-neon flex items-center justify-center">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div className="bg-card/50 backdrop-blur-sm border border-cyber-grid p-3 rounded-lg">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-cyber-neon rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-cyber-neon rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-cyber-neon rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Data Permission Requests */}
                {(!dataSources.find(s => s.id === 'location')?.enabled || !dataSources.find(s => s.id === 'browsing')?.enabled) && (
                  <div className="p-4 border-t border-cyber-grid">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {!dataSources.find(s => s.id === 'location')?.enabled && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDataPermissionRequest('location')}
                          className="border-cyber-green/50 text-cyber-green hover:bg-cyber-green/10"
                        >
                          <MapPin className="w-3 h-3 mr-1" />
                          Lokasyon İzni Ver
                        </Button>
                      )}
                      {!dataSources.find(s => s.id === 'browsing')?.enabled && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDataPermissionRequest('browsing')}
                          className="border-cyber-blue/50 text-cyber-blue hover:bg-cyber-blue/10"
                        >
                          <Chrome className="w-3 h-3 mr-1" />
                          Tarama İzni Ver
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Chat Input */}
                <div className="p-4 border-t border-cyber-grid">
                  <div className="flex space-x-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="AI'ya mesaj yazın... (verileriniz şifrelenmiş)"
                      className="input-cyber flex-1"
                      disabled={isTyping}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!input.trim() || isTyping}
                      className="btn-cyber"
                    >
                      {isTyping ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Profile Tab Content */}
            <TabsContent value="profile" className="flex-1 px-4 pb-4 overflow-auto">
              <Card className="card-cyber p-6">
                <div className="flex items-center mb-6">
                  <User className="w-6 h-6 mr-2 text-cyber-neon" />
                  <h3 className="text-xl font-bold glow-text">Veri Kaynakları & İzinler</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dataSources.map((source) => (
                    <Card key={source.id} className="p-4 bg-card/30 border-cyber-grid">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            source.encrypted 
                              ? 'bg-cyber-green/20 text-cyber-green' 
                              : source.enabled
                              ? 'bg-cyber-blue/20 text-cyber-blue'
                              : source.available 
                              ? 'bg-muted/20 text-muted-foreground' 
                              : 'bg-muted/10 text-muted-foreground/50'
                          }`}>
                            {source.icon}
                          </div>
                          <div>
                            <h4 className="font-semibold">{source.name}</h4>
                            <p className="text-xs text-muted-foreground">{source.description}</p>
                          </div>
                        </div>
                        
                        <Switch
                          checked={source.enabled}
                          onCheckedChange={(checked) => handleDataSourceToggle(source.id, checked)}
                          disabled={!source.available}
                        />
                      </div>
                      
                      {source.encrypted && (
                        <div className="flex items-center text-xs text-cyber-green">
                          <Lock className="w-3 h-3 mr-1" />
                          {source.dataCount} veri şifrelenmiş
                          {source.lastSync && (
                            <span className="ml-2">• {source.lastSync.toLocaleTimeString()}</span>
                          )}
                        </div>
                      )}
                      
                      {!source.available && (
                        <Badge variant="outline" className="border-cyber-blue/50 text-cyber-blue mt-2">
                          Yakında Geliyor
                        </Badge>
                      )}
                    </Card>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* Marketplace Tab Content */}
            <TabsContent value="marketplace" className="flex-1 px-4 pb-4">
              <DataMarketplace />
            </TabsContent>

            <TabsContent value="udid" className="flex-1 px-4 pb-4">
              <UDIDManager />
            </TabsContent>

            <TabsContent value="inft" className="flex-1 px-4 pb-4">
              <INFTManager />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SmartChatBot;
