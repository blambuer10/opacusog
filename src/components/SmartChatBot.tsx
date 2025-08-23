
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
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
  EyeOff
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

const SmartChatBot: React.FC = () => {
  const { address, isConnected } = useWeb3();
  const { position, error: locationError, requestPermission: requestLocationPermission } = useGeolocation();
  const { history, requestPermission: requestBrowsingPermission } = useBrowsingHistory();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
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

      // AI responses enhanced with user data
      if (currentInput.toLowerCase().includes('neredeyim') || currentInput.toLowerCase().includes('konum')) {
        if (position) {
          botResponse = `📍 Şu anda ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)} koordinatlarındasınız. Bu konum verisi şifrelenmiş olarak UDID'nize kaydedildi. Yakınınızdaki öneriler için yardımcı olabilir miyim?`;
          dataSource = 'location';
        } else {
          botResponse = 'Konum bilginize erişemiyorum. Lokasyon izni vermek ister misiniz? Bu sayede size özel öneriler sunabilirim.';
        }
      } else if (currentInput.toLowerCase().includes('geçmiş') || currentInput.toLowerCase().includes('site')) {
        if (history.length > 0) {
          const recentSites = history.slice(0, 3).map(h => h.title || h.url).join(', ');
          botResponse = `🌐 Tarama geçmişinizden ${history.length} site verisi şifrelenmiş durumda. Son ziyaret ettiğiniz siteler: ${recentSites}. Bu veriler üzerinden size özel öneriler yapabilirim.`;
          dataSource = 'browsing';
        } else {
          botResponse = 'Tarama geçmişinize erişemiyorum. Chrome geçmişi izni vermek ister misiniz? Bu sayede kişiselleştirilmiş öneriler sunabilirim.';
        }
      } else if (currentInput.toLowerCase().includes('udid')) {
        botResponse = isConnected 
          ? `🔐 UDID'niz aktif ve tüm verileriniz şifrelenmiş durumda. Blockchain üzerinde güvenli kimlik doğrulamanız mevcut.`
          : 'UDID oluşturmak için cüzdanınızı bağlamanız gerekiyor. Bu sayede verileriniz blockchain üzerinde güvenli bir şekilde şifrelenir.';
      } else if (currentInput.toLowerCase().includes('veri') || currentInput.toLowerCase().includes('bilgi')) {
        const enabledData = [];
        if (userDataSummary.udidExists) enabledData.push('🔐 UDID Kimlik');
        if (userDataSummary.locationEnabled) enabledData.push('📍 Lokasyon');
        if (userDataSummary.browsingEnabled) enabledData.push('🌐 Tarama Geçmişi');
        
        if (enabledData.length > 0) {
          botResponse = `Şu anda aktif veri kaynaklarınız: ${enabledData.join(', ')}. Tüm verileriniz şifrelenmiş ve güvenli bir şekilde saklanıyor. Bu veriler sayesinde size kişisel öneriler sunabiliyorum.`;
        } else {
          botResponse = 'Henüz hiç veri kaynağı aktif değil. Lokasyon ve tarama geçmişi izinleri vererek benimle daha detaylı sohbet edebilirsiniz.';
        }
      } else if (currentInput.toLowerCase().includes('x') || currentInput.toLowerCase().includes('twitter')) {
        botResponse = '🔜 X (Twitter) entegrasyonu yakında geliyor! Tweetleriniz ve sosyal medya aktiviteniz şifrelenmiş olarak AI\'ya entegre edilecek.';
      } else if (currentInput.toLowerCase().includes('instagram')) {
        botResponse = '🔜 Instagram entegrasyonu yakında geliyor! Fotoğraflarınız ve story\'leriniz şifrelenmiş olarak analiz edilebilecek.';
      } else if (currentInput.toLowerCase().includes('amazon')) {
        botResponse = '🔜 Amazon entegrasyonu yakında geliyor! Alışveriş geçmişiniz ve önerileriniz kişiselleştirilecek.';
      } else if (currentInput.toLowerCase().includes('binance')) {
        botResponse = '🔜 Binance entegrasyonu yakında geliyor! Kripto portföyünüz güvenli bir şekilde analiz edilebilecek.';
      } else if (currentInput.toLowerCase().includes('tiktok')) {
        botResponse = '🔜 TikTok entegrasyonu yakında geliyor! İzlediğiniz videolar ve etkileşimleriniz kişiselleştirilecek.';
      } else {
        botResponse = 'Anlıyorum! Size daha iyi yardımcı olabilmek için veri kaynaklarınızı aktif edebilirsiniz. Lokasyon, tarama geçmişi gibi verilerinizi şifreleyerek kişiselleştirilmiş deneyim sunabilirim. Ne konuda yardım istiyorsunuz?';
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

      // Store on blockchain if connected
      if (isConnected && address) {
        try {
          await web3Service.queryLLM(address, currentInput, botResponse);
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
          {userDataSummary.locationEnabled && (
            <Badge variant="outline" className="border-cyber-green/50 text-cyber-green">
              <MapPin className="w-3 h-3 mr-1" />
              Lokasyon
            </Badge>
          )}
          {userDataSummary.browsingEnabled && (
            <Badge variant="outline" className="border-cyber-blue/50 text-cyber-blue">
              <Chrome className="w-3 h-3 mr-1" />
              Tarama
            </Badge>
          )}
          <WalletConnect />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        <div className="flex-1">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4 m-4 bg-card/50 backdrop-blur-sm">
              <TabsTrigger value="chat" className="data-[state=active]:bg-cyber-neon/20 data-[state=active]:text-cyber-neon">
                <MessageSquare className="w-4 h-4 mr-2" />
                AI Chat
              </TabsTrigger>
              <TabsTrigger value="profile" className="data-[state=active]:bg-cyber-blue/20 data-[state=active]:text-cyber-blue">
                <Settings className="w-4 h-4 mr-2" />
                Profil
              </TabsTrigger>
              <TabsTrigger value="udid" className="data-[state=active]:bg-cyber-green/20 data-[state=active]:text-cyber-green">
                <Shield className="w-4 h-4 mr-2" />
                UDID
              </TabsTrigger>
              <TabsTrigger value="inft" className="data-[state=active]:bg-cyber-purple/20 data-[state=active]:text-cyber-purple">
                <Database className="w-4 h-4 mr-2" />
                INFT
              </TabsTrigger>
            </TabsList>

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
                {(!userDataSummary.locationEnabled || !userDataSummary.browsingEnabled) && (
                  <div className="p-4 border-t border-cyber-grid">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {!userDataSummary.locationEnabled && (
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
                      {!userDataSummary.browsingEnabled && (
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

            <TabsContent value="profile" className="flex-1 px-4 pb-4">
              <UserProfile />
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
