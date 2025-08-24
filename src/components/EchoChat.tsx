
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Bot, 
  Send, 
  User, 
  Loader2, 
  MapPin,
  Chrome,
  Database,
  Shield,
  Zap,
  Activity,
  Lock,
  Unlock,
  Globe,
  MessageSquare,
  Settings,
  Eye,
  EyeOff,
  Mic,
  MicOff,
  Image as ImageIcon,
  FileText,
  Heart,
  Star
} from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { web3Service } from '@/lib/web3';
import { OpacusCrypto } from '@/lib/crypto';
import { toast } from 'sonner';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useBrowsingHistory } from '@/hooks/useBrowsingHistory';
import { motion, AnimatePresence } from 'framer-motion';
import { ethers } from 'ethers';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  encrypted?: boolean;
  twinId?: string;
  qualityScore?: number;
  dataContext?: string[];
}

interface DataSource {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  available: boolean;
  encrypted: boolean;
  dataCount: number;
  lastSync?: Date;
  connectionStatus: 'connected' | 'pending' | 'error' | 'disconnected';
}

interface DigitalTwin {
  id: string;
  name: string;
  qualityScore: number;
  dataTypes: string[];
  modelUri?: string;
  lastTrained?: Date;
  inferenceCount: number;
}

const EchoChat: React.FC = () => {
  const { address, isConnected } = useWeb3();
  const { position, error: locationError, requestPermission: requestLocationPermission } = useGeolocation();
  const { history, requestPermission: requestBrowsingPermission } = useBrowsingHistory();
  
  // State
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'system',
      content: 'Merhaba! Ben Echo - senin kişisel AI dijital ikizin. Verilerini güvenle şifreleyerek sana özel yanıtlar üretebilirim. Başlamak için cüzdanını bağla ve veri kaynaklarını etkinleştir.',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [digitalTwins, setDigitalTwins] = useState<DigitalTwin[]>([]);
  const [selectedTwin, setSelectedTwin] = useState<string | null>(null);
  
  // Data sources with enhanced status
  const [dataSources, setDataSources] = useState<DataSource[]>([
    {
      id: 'location',
      name: 'Konum Verisi',
      description: 'GPS koordinatları ve lokasyon geçmişi',
      icon: <MapPin className="w-5 h-5" />,
      enabled: false,
      available: true,
      encrypted: false,
      dataCount: 0,
      connectionStatus: 'disconnected'
    },
    {
      id: 'browsing',
      name: 'Tarama Geçmişi',
      description: 'Web sitesi ziyaretleri ve tercihler',
      icon: <Chrome className="w-5 h-5" />,
      enabled: false,
      available: true,
      encrypted: false,
      dataCount: 0,
      connectionStatus: 'disconnected'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      description: 'Gönderiler, hikayeler ve etkileşimler',
      icon: <ImageIcon className="w-5 h-5" />,
      enabled: false,
      available: false,
      encrypted: false,
      dataCount: 0,
      connectionStatus: 'pending'
    },
    {
      id: 'twitter',
      name: 'Twitter/X',
      description: 'Tweetler, beğeniler ve takipler',
      icon: <MessageSquare className="w-5 h-5" />,
      enabled: false,
      available: false,
      encrypted: false,
      dataCount: 0,
      connectionStatus: 'pending'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Effects
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isConnected && address) {
      loadDigitalTwins();
      updateDataSourcesStatus();
    }
  }, [isConnected, address]);

  // Core functions
  const loadDigitalTwins = async () => {
    try {
      // Mock data - replace with actual contract calls
      const twins: DigitalTwin[] = [
        {
          id: '1',
          name: 'Ana Kişilik',
          qualityScore: 85,
          dataTypes: ['location', 'browsing'],
          lastTrained: new Date(Date.now() - 86400000),
          inferenceCount: 42
        }
      ];
      setDigitalTwins(twins);
      if (twins.length > 0) setSelectedTwin(twins[0].id);
    } catch (error) {
      console.error('Error loading digital twins:', error);
    }
  };

  const updateDataSourcesStatus = async () => {
    try {
      // Check permissions and update status
      const updatedSources = await Promise.all(
        dataSources.map(async (source) => {
          if (source.id === 'location' && position) {
            return {
              ...source,
              enabled: true,
              encrypted: true,
              dataCount: 1,
              lastSync: new Date(),
              connectionStatus: 'connected' as const
            };
          }
          if (source.id === 'browsing' && history.length > 0) {
            return {
              ...source,
              enabled: true,
              encrypted: true,
              dataCount: history.length,
              lastSync: new Date(),
              connectionStatus: 'connected' as const
            };
          }
          return source;
        })
      );
      setDataSources(updatedSources);
    } catch (error) {
      console.error('Error updating data sources:', error);
    }
  };

  const handleDataSourceToggle = async (sourceId: string, enabled: boolean) => {
    try {
      setDataSources(prev => prev.map(source => 
        source.id === sourceId 
          ? { ...source, enabled, connectionStatus: enabled ? 'pending' : 'disconnected' }
          : source
      ));

      if (enabled) {
        if (sourceId === 'location') {
          await requestLocationPermission();
          await grantDataPermission('location', 'read');
          toast.success('Lokasyon verisi bağlandı ve şifrelendi!');
        } else if (sourceId === 'browsing') {
          await requestBrowsingPermission();
          await grantDataPermission('browsing', 'read');
          toast.success('Tarama geçmişi bağlandı ve şifrelendi!');
        } else {
          toast.info(`${sourceId} bağlantısı yakında geliyor!`);
          return;
        }
      } else {
        await revokeDataPermission(sourceId, 'read');
        toast.info(`${sourceId} bağlantısı kapatıldı`);
      }

      await updateDataSourcesStatus();
    } catch (error) {
      console.error(`Error toggling ${sourceId}:`, error);
      toast.error(`${sourceId} bağlantısı güncellenemedi`);
    }
  };

  const grantDataPermission = async (dataType: string, scope: string) => {
    if (!isConnected || !address) return;
    
    try {
      await web3Service.grantDataPermission(dataType, scope);
      
      // Add system message
      addMessage({
        role: 'system',
        content: `✅ ${dataType} verisi Echo'ya bağlandı. Artık bu veriyi güvenli şekilde kullanabilirim.`,
        dataContext: [dataType]
      });
    } catch (error) {
      console.error('Error granting permission:', error);
      throw error;
    }
  };

  const revokeDataPermission = async (dataType: string, scope: string) => {
    if (!isConnected || !address) return;
    
    try {
      await web3Service.revokeDataPermission(dataType, scope);
      
      // Add system message
      addMessage({
        role: 'system',
        content: `❌ ${dataType} verisi bağlantısı kapatıldı. Bu veriyi artık kullanmayacağım.`
      });
    } catch (error) {
      console.error('Error revoking permission:', error);
      throw error;
    }
  };

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const sendMessage = async () => {
    if (!input.trim() || isTyping || !isConnected) return;

    const userMessage = input.trim();
    setInput('');
    setIsTyping(true);

    // Add user message
    addMessage({
      role: 'user',
      content: userMessage
    });

    try {
      // Get enabled data context
      const enabledSources = dataSources
        .filter(source => source.enabled && source.encrypted)
        .map(source => source.id);

      // Build context data
      const contextData: any = {};
      if (enabledSources.includes('location') && position) {
        contextData.location = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          timestamp: position.timestamp
        };
      }
      if (enabledSources.includes('browsing') && history.length > 0) {
        contextData.browsing = history.slice(-10); // Last 10 entries
      }

      // Submit to OG Compute for secure inference
      const jobReceipt = await web3Service.submitSecureInference({
        twinId: selectedTwin || '1',
        prompt: userMessage,
        context: JSON.stringify(contextData),
        verificationMode: 'TEE'
      });

      // For demo, simulate response (in production, poll for result)
      setTimeout(async () => {
        const responses = [
          `Anlıyorum! ${enabledSources.length > 0 ? `${enabledSources.join(', ')} verilerini kullanarak` : 'Mevcut bilgilerimle'} size yardımcı olabilirim.`,
          `Bu sorunuz ilginç. ${contextData.location ? 'Konumunuza göre' : ''} ${contextData.browsing ? 'tarama tercihlerinize bakarak' : ''} özelleştirilmiş bir yanıt hazırladım.`,
          `Kişisel verileriniz güvenle şifrelendi ve sadece bu konuşma için kullanıldı. Başka nasıl yardımcı olabilirim?`
        ];
        
        const response = responses[Math.floor(Math.random() * responses.length)];
        
        addMessage({
          role: 'assistant',
          content: response,
          encrypted: enabledSources.length > 0,
          twinId: selectedTwin || undefined,
          dataContext: enabledSources
        });

        // Store chat log on-chain (encrypted)
        if (address) {
          await web3Service.storeEncryptedChatLog(address, userMessage, response, true);
        }
        
        setIsTyping(false);
      }, 2000);

    } catch (error) {
      console.error('Error sending message:', error);
      addMessage({
        role: 'assistant',
        content: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.'
      });
      setIsTyping(false);
    }
  };

  const createDigitalTwin = async () => {
    if (!isConnected || !address) {
      toast.error('Lütfen cüzdanınızı bağlayın');
      return;
    }

    try {
      const enabledSources = dataSources.filter(source => source.enabled && source.encrypted);
      
      if (enabledSources.length === 0) {
        toast.error('Dijital ikiz oluşturmak için en az bir veri kaynağı bağlayın');
        return;
      }

      // Calculate quality score based on data sources
      const qualityScore = Math.min(95, 50 + (enabledSources.length * 15));

      // Create encrypted metadata
      const metadata = {
        owner: address,
        dataSources: enabledSources.map(s => s.id),
        createdAt: Date.now(),
        qualityScore
      };

      const crypto = new OpacusCrypto();
      const encryptedMetadata = await crypto.encryptData(JSON.stringify(metadata));
      const metadataHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(metadata)));

      // Mint digital twin INFT
      const { tokenId } = await web3Service.mintDigitalTwinINFT({
        to: address,
        encryptedDataUri: `data:application/json;base64,${btoa(JSON.stringify(encryptedMetadata))}`,
        metadataHash,
        qualityScore,
        dataTypes: enabledSources.map(s => s.id)
      });

      toast.success(`Dijital ikiz oluşturuldu! Token ID: ${tokenId}`);
      
      // Add new twin to list
      const newTwin: DigitalTwin = {
        id: tokenId,
        name: `Dijital İkiz #${tokenId}`,
        qualityScore,
        dataTypes: enabledSources.map(s => s.id),
        lastTrained: new Date(),
        inferenceCount: 0
      };
      
      setDigitalTwins(prev => [...prev, newTwin]);
      setSelectedTwin(tokenId);

      addMessage({
        role: 'system',
        content: `🎉 Dijital ikiziniz başarıyla oluşturuldu! Kalite skoru: ${qualityScore}/100. Token ID: ${tokenId}`
      });

    } catch (error) {
      console.error('Error creating digital twin:', error);
      toast.error('Dijital ikiz oluşturulamadı');
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-24 h-24 bg-gradient-to-r from-cyber-neon to-cyber-green rounded-full flex items-center justify-center mb-6">
          <Bot className="w-12 h-12 text-background" />
        </div>
        <h2 className="text-2xl font-bold glow-text mb-2">Echo - Dijital İkizin</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Kişisel verilerini güvenle şifreleyip AI ile etkileşime geç. Başlamak için cüzdanını bağla.
        </p>
        <Button className="btn-cyber">
          <Shield className="w-4 h-4 mr-2" />
          Cüzdan Bağla
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-background via-background to-card/30">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-cyber-grid bg-background/80 backdrop-blur-sm">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-cyber-neon to-cyber-green rounded-lg flex items-center justify-center">
            <Bot className="w-6 h-6 text-background" />
          </div>
          <div>
            <h1 className="text-xl font-bold glow-text flex items-center">
              Echo
              {selectedTwin && (
                <Badge variant="outline" className="ml-2 border-cyber-green/50 text-cyber-green">
                  Twin #{selectedTwin}
                </Badge>
              )}
            </h1>
            <p className="text-sm text-muted-foreground">
              {dataSources.filter(s => s.encrypted).length} veri kaynağı şifrelenmiş
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Data source indicators */}
          {dataSources.filter(s => s.encrypted).map(source => (
            <Badge key={source.id} variant="outline" className="border-cyber-green/50 text-cyber-green">
              <Lock className="w-3 h-3 mr-1" />
              {source.dataCount}
            </Badge>
          ))}
          
          <Button onClick={createDigitalTwin} className="btn-cyber" size="sm">
            <Zap className="w-4 h-4 mr-2" />
            Dijital İkiz Oluştur
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4 max-w-4xl mx-auto">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] p-4 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-cyber-neon to-cyber-blue text-background'
                        : message.role === 'system'
                        ? 'bg-cyber-grid/30 border border-cyber-grid text-foreground/80'
                        : 'bg-card border border-cyber-grid text-foreground'
                    }`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {message.role === 'user' ? (
                            <User className="w-4 h-4" />
                          ) : message.role === 'system' ? (
                            <Settings className="w-4 h-4" />
                          ) : (
                            <Bot className="w-4 h-4" />
                          )}
                          <span className="text-sm font-medium">
                            {message.role === 'user' ? 'Sen' : message.role === 'system' ? 'Sistem' : 'Echo'}
                          </span>
                          {message.encrypted && (
                            <Lock className="w-3 h-3 text-cyber-green" />
                          )}
                        </div>
                        
                        {message.qualityScore && (
                          <Badge variant="outline" className="border-cyber-yellow/50 text-cyber-yellow">
                            <Star className="w-3 h-3 mr-1" />
                            {message.qualityScore}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      
                      {message.dataContext && message.dataContext.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {message.dataContext.map((context) => (
                            <Badge key={context} variant="outline" className="text-xs border-cyber-grid">
                              <Database className="w-2 h-2 mr-1" />
                              {context}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="text-xs text-muted-foreground/60 mt-2">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-card border border-cyber-grid rounded-2xl p-4 max-w-[80%]">
                    <div className="flex items-center space-x-2">
                      <Bot className="w-4 h-4" />
                      <span className="text-sm font-medium">Echo</span>
                    </div>
                    <div className="flex items-center space-x-1 mt-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Düşünüyor...</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t border-cyber-grid bg-background/50 backdrop-blur-sm">
            <div className="flex items-center space-x-3 max-w-4xl mx-auto">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Echo'ya bir şey sor..."
                  className="input-cyber pr-24"
                  disabled={isTyping}
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsListening(!isListening)}
                    className="w-8 h-8 p-0"
                    disabled={isTyping}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              
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
        </div>

        {/* Data Sources Sidebar */}
        <div className="w-80 border-l border-cyber-grid bg-card/30 backdrop-blur-sm p-4 space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Database className="w-5 h-5 mr-2 text-cyber-neon" />
              Veri Kaynakları
            </h3>
            
            <div className="space-y-3">
              {dataSources.map((source) => (
                <Card key={source.id} className="p-4 bg-background/50 border-cyber-grid">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
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
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">{source.name}</h4>
                        <p className="text-xs text-muted-foreground">{source.description}</p>
                      </div>
                    </div>
                    
                    <Switch
                      checked={source.enabled}
                      onCheckedChange={(checked) => handleDataSourceToggle(source.id, checked)}
                      disabled={!source.available}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      {source.encrypted && (
                        <Badge variant="outline" className="border-cyber-green/50 text-cyber-green">
                          <Lock className="w-2 h-2 mr-1" />
                          Şifrelenmiş
                        </Badge>
                      )}
                      {source.dataCount > 0 && (
                        <span className="text-muted-foreground">{source.dataCount} veri</span>
                      )}
                    </div>
                    
                    {source.lastSync && (
                      <span className="text-muted-foreground">
                        {source.lastSync.toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Digital Twins */}
          {digitalTwins.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Bot className="w-5 h-5 mr-2 text-cyber-purple" />
                Dijital İkizler
              </h3>
              
              <div className="space-y-2">
                {digitalTwins.map((twin) => (
                  <Card 
                    key={twin.id} 
                    className={`p-3 cursor-pointer transition-all ${
                      selectedTwin === twin.id 
                        ? 'bg-cyber-neon/10 border-cyber-neon' 
                        : 'bg-background/50 border-cyber-grid hover:bg-cyber-grid/20'
                    }`}
                    onClick={() => setSelectedTwin(twin.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium">{twin.name}</h4>
                      <Badge variant="outline" className="border-cyber-yellow/50 text-cyber-yellow">
                        <Star className="w-2 h-2 mr-1" />
                        {twin.qualityScore}
                      </Badge>
                    </div>
                    
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>Veri türleri: {twin.dataTypes.join(', ')}</div>
                      <div>İnference: {twin.inferenceCount}</div>
                      {twin.lastTrained && (
                        <div>Son eğitim: {twin.lastTrained.toLocaleDateString()}</div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EchoChat;
