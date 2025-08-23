
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Send, 
  User, 
  Loader2, 
  MessageSquare, 
  Zap,
  Database,
  ExternalLink,
  MapPin,
  Globe,
  Activity,
  Shield
} from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useBrowsingHistory } from '@/hooks/useBrowsingHistory';
import { web3Service } from '@/lib/web3';
import { toast } from 'sonner';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  onChain?: boolean;
  dataUsed?: string[];
}

const SmartChatBot: React.FC = () => {
  const { address, isConnected } = useWeb3();
  const { locationHistory, hasPermission: hasLocationPermission } = useGeolocation();
  const { browsingHistory, hasPermission: hasChromePermission } = useBrowsingHistory();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial AI Agent greeting
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        type: 'bot',
        content: 'Merhaba! Ben sizin kişisel AI Agent\'ınızım. UDID\'nize bağlı tüm verilerinizden haberdarım ve size yardımcı olmak için buradayım. Size nasıl yardımcı olabilirim?',
        timestamp: new Date()
      }]);
    }
  }, []);

  // Notify AI Agent about permission changes
  useEffect(() => {
    if (hasLocationPermission && messages.length > 1) {
      const notificationMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: '🎉 Harika! Lokasyon verisini açtınız. Artık konumunuz ve geçmiş lokasyon verilerinizle ilgili sorularınızı yanıtlayabilirim. Örneğin "Son gittiğim yerler nereler?" diye sorabilirsiniz.',
        timestamp: new Date(),
        dataUsed: ['location']
      };
      setMessages(prev => [...prev, notificationMessage]);
    }
  }, [hasLocationPermission]);

  useEffect(() => {
    if (hasChromePermission && messages.length > 1) {
      const notificationMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: '🌐 Chrome geçmişi erişimi aktif! Artık web tarama geçmişinizle ilgili sorular sorabilirsiniz. "Bugün hangi siteleri ziyaret ettim?" gibi...',
        timestamp: new Date(),
        dataUsed: ['chrome']
      };
      setMessages(prev => [...prev, notificationMessage]);
    }
  }, [hasChromePermission]);

  useEffect(() => {
    // Auto-scroll to bottom
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const generateContextualResponse = (userInput: string): { response: string; dataUsed: string[] } => {
    const input = userInput.toLowerCase();
    const dataUsed: string[] = [];
    let response = '';

    // Location-based queries
    if ((input.includes('konum') || input.includes('nerede') || input.includes('lokasyon') || input.includes('gittiğim')) && hasLocationPermission) {
      dataUsed.push('location');
      if (locationHistory.length > 0) {
        const recentLocation = locationHistory[locationHistory.length - 1];
        response = `Son konumunuz: ${recentLocation.latitude.toFixed(4)}, ${recentLocation.longitude.toFixed(4)} koordinatlarında. Toplam ${locationHistory.length} lokasyon kaydınız var. Size daha detaylı bilgi verebilirim.`;
      } else {
        response = 'Henüz lokasyon geçmişiniz bulunmuyor. Konum takibi aktif olduğunda verilerinizi analiz edebileceğim.';
      }
    }
    // Browsing history queries
    else if ((input.includes('site') || input.includes('web') || input.includes('chrome') || input.includes('ziyaret')) && hasChromePermission) {
      dataUsed.push('chrome');
      if (browsingHistory.length > 0) {
        const recentSites = browsingHistory.slice(0, 3).map(site => site.title).join(', ');
        response = `Son ziyaret ettiğiniz siteler: ${recentSites}. Toplam ${browsingHistory.length} site geçmişiniz var. Detaylı analizler yapabilirim.`;
      } else {
        response = 'Chrome geçmişi verisi henüz yüklenmedi. Tarama geçmişinize erişim sağlandığında size yardımcı olabilirim.';
      }
    }
    // UDID related queries
    else if (input.includes('udid') || input.includes('kimlik')) {
      response = `UDID'niz aktif ve tüm verileriniz güvenli şekilde şifrelenerek bağlanıyor. ${hasLocationPermission ? 'Lokasyon, ' : ''}${hasChromePermission ? 'Chrome geçmişi, ' : ''}ve diğer verilerinize erişebiliyorum.`;
    }
    // Data permissions
    else if (input.includes('veri') || input.includes('izin') || input.includes('erişim')) {
      const activePermissions = [];
      if (hasLocationPermission) activePermissions.push('Lokasyon');
      if (hasChromePermission) activePermissions.push('Chrome Geçmişi');
      
      response = `Şu anda aktif veri izinleriniz: ${activePermissions.length > 0 ? activePermissions.join(', ') : 'Henüz hiçbiri'}. Profil sayfasından daha fazla veri türüne izin verebilirsiniz.`;
    }
    // Platform features
    else if (input.includes('platform') || input.includes('özellik')) {
      response = 'Bu platform size kişisel bir AI Agent sağlıyor. Verilerinizi şifreleyerek UDID\'nize bağlıyor ve size akıllı asistan hizmeti sunuyor. Yakında mobil uygulama olarak da kullanabileceksiniz!';
    }
    // General help
    else if (input.includes('yardım') || input.includes('help') || input.includes('neler yapabilir')) {
      response = `Size şu konularda yardımcı olabilirim:
• Lokasyon geçmişinizi analiz etme ${hasLocationPermission ? '✅' : '❌'}
• Web tarama geçmişinizi inceleme ${hasChromePermission ? '✅' : '❌'}
• UDID ve blockchain işlemleri
• Veri güvenliği danışmanlığı
• Platform kullanımı rehberliği

Profil sayfasından daha fazla veri türüne erişim verebilirsiniz.`;
    }
    else {
      response = `Anladım! Size ${hasLocationPermission || hasChromePermission ? 'mevcut verilerinizle' : ''} yardımcı olmaya çalışıyorum. Daha spesifik sorular sorabilirsiniz. Örneğin lokasyon geçmişiniz, web tarama alışkanlıklarınız veya UDID işlemleri hakkında...`;
    }

    return { response, dataUsed };
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
      // Simulate thinking delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const { response: botResponse, dataUsed } = generateContextualResponse(currentInput);
      let shouldStoreOnChain = dataUsed.length > 0 || currentInput.length > 20;

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: botResponse,
        timestamp: new Date(),
        onChain: shouldStoreOnChain,
        dataUsed
      };

      setMessages(prev => [...prev, botMessage]);

      // Store on blockchain if connected and should store
      if (shouldStoreOnChain && isConnected && address) {
        try {
          console.log('Storing AI Agent conversation on-chain...', { address, currentInput, botResponse });
          await web3Service.queryLLM(address, currentInput, botResponse);
          toast.success('AI Agent sohbeti zincire kaydedildi!');
        } catch (error: any) {
          console.error('Error storing chat on blockchain:', error);
          toast.error(`Zincire kayıt hatası: ${error.message || 'Bilinmeyen hata'}`);
        }
      }

    } catch (error: any) {
      console.error('Error in AI Agent chat:', error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: 'bot',
        content: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin veya cüzdanınızı kontrol edin.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error('AI Agent hatası oluştu');
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

  const getDataIcon = (dataType: string) => {
    switch (dataType) {
      case 'location': return <MapPin className="w-3 h-3" />;
      case 'chrome': return <Globe className="w-3 h-3" />;
      default: return <Activity className="w-3 h-3" />;
    }
  };

  return (
    <Card className="card-cyber h-[600px] flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-cyber-grid">
        <div className="flex items-center">
          <Bot className="w-6 h-6 mr-2 text-cyber-neon" />
          <h3 className="text-lg font-semibold glow-text">AI Agent</h3>
        </div>
        <div className="flex items-center space-x-2">
          {isConnected && (
            <Badge variant="outline" className="border-cyber-green/50 text-cyber-green">
              <Database className="w-3 h-3 mr-1" />
              Zincir Aktif
            </Badge>
          )}
          <Badge variant="outline" className="border-cyber-blue/50 text-cyber-blue">
            <Shield className="w-3 h-3 mr-1" />
            {hasLocationPermission || hasChromePermission ? 'Veri Aktif' : 'Standart'}
          </Badge>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-cyber-neon mr-2" />
              <span className="text-muted-foreground">AI Agent düşünüyor...</span>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
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
              
              <div className={`flex-1 max-w-[80%] ${
                message.type === 'user' ? 'text-right' : 'text-left'
              }`}>
                <div className={`inline-block p-3 rounded-lg whitespace-pre-wrap ${
                  message.type === 'user'
                    ? 'bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/30'
                    : 'bg-card/50 backdrop-blur-sm border border-cyber-grid'
                }`}>
                  {message.content}
                </div>
                
                <div className="flex items-center mt-1 text-xs text-muted-foreground flex-wrap gap-1">
                  <span>{message.timestamp.toLocaleTimeString()}</span>
                  {message.onChain && (
                    <Badge variant="outline" className="ml-2 border-cyber-green/30 text-cyber-green">
                      <Zap className="w-2 h-2 mr-1" />
                      Zincir
                    </Badge>
                  )}
                  {message.dataUsed?.map((dataType, index) => (
                    <Badge key={index} variant="outline" className="ml-1 border-cyber-purple/30 text-cyber-purple">
                      {getDataIcon(dataType)}
                      <span className="ml-1 capitalize">{dataType}</span>
                    </Badge>
                  ))}
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

      <div className="p-4 border-t border-cyber-grid">
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isConnected ? "AI Agent'ınıza mesaj yazın..." : "Cüzdanı bağlayın..."}
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
        
        {!isConnected && (
          <p className="text-xs text-muted-foreground mt-2 flex items-center">
            <ExternalLink className="w-3 h-3 mr-1" />
            Tam özellikler için cüzdanınızı bağlayın ve UDID oluşturun
          </p>
        )}
      </div>
    </Card>
  );
};

export default SmartChatBot;
