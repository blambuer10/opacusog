
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Sparkles 
} from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { toast } from 'sonner';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

const ChatBot: React.FC = () => {
  const { address, isConnected } = useWeb3();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! I\'m your Opacus AI assistant. I can help you with UDID management, NFT operations, and blockchain queries. How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const simulateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('udid')) {
      return `I can help you with UDID operations! ${isConnected ? `Your connected address is ${address?.slice(0, 6)}...${address?.slice(-4)}. ` : 'Please connect your wallet first. '}You can create, rotate, or manage your Universal Digital Identity through the UDID Manager section.`;
    }
    
    if (lowerMessage.includes('nft')) {
      return 'NFTs on Opacus require a valid UDID. You can mint new NFTs, transfer existing ones, or update metadata through our NFT Manager. Would you like me to guide you through the process?';
    }
    
    if (lowerMessage.includes('wallet') || lowerMessage.includes('connect')) {
      return isConnected 
        ? `Great! Your wallet is connected to ${address?.slice(0, 6)}...${address?.slice(-4)}. You can now access all Opacus features.`
        : 'To connect your wallet, click the "Connect MetaMask" button. Make sure you\'re on the 0G-Galileo-Testnet network.';
    }
    
    if (lowerMessage.includes('0g') || lowerMessage.includes('chain')) {
      return 'You\'re on the 0G-Galileo-Testnet! This is a high-performance blockchain optimized for data availability and AI applications. Chain ID: 16601, Native Token: OG.';
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('guide')) {
      return 'Here\'s what I can help you with:\n\n🔐 UDID Management - Create and manage your digital identity\n🎨 NFT Operations - Mint, transfer, and manage NFTs\n💼 Wallet Connection - Connect to 0G Chain\n🔍 Blockchain Queries - Check transactions and contracts\n\nWhat would you like to explore?';
    }
    
    // Default responses
    const responses = [
      'That\'s an interesting question! As an AI assistant for the Opacus network, I\'m here to help with blockchain operations and digital identity management.',
      'I understand you\'re looking for information. Feel free to ask me about UDIDs, NFTs, or any Opacus-related features!',
      'Great question! I can assist you with various blockchain operations on the 0G network. What specific task would you like help with?'
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI processing delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: simulateAIResponse(userMessage.content),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="card-cyber p-0 h-[600px] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-cyber-grid">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-r from-cyber-blue to-cyber-purple rounded-full flex items-center justify-center mr-3">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold glow-text">Opacus AI Assistant</h3>
            <p className="text-sm text-muted-foreground">
              {isTyping ? 'Typing...' : 'Online'}
            </p>
          </div>
          <Sparkles className="ml-auto w-5 h-5 text-cyber-neon animate-pulse" />
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.type === 'bot' && (
                <div className="w-8 h-8 bg-gradient-to-r from-cyber-blue to-cyber-purple rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-cyber-neon/20 text-foreground ml-auto'
                    : 'bg-muted/50 text-foreground'
                }`}
              >
                <p className="text-sm whitespace-pre-line">{message.content}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>

              {message.type === 'user' && (
                <div className="w-8 h-8 bg-cyber-green/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-cyber-green" />
                </div>
              )}
            </div>
          ))}
          
          {isTyping && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-cyber-blue to-cyber-purple rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
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

      {/* Input */}
      <div className="p-4 border-t border-cyber-grid">
        <div className="flex space-x-2">
          <Input
            placeholder="Ask me about UDIDs, NFTs, or blockchain operations..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="input-cyber flex-1"
            disabled={isTyping}
          />
          <Button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isTyping}
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
  );
};

export default ChatBot;
