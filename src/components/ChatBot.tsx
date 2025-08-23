
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
  ExternalLink
} from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { web3Service } from '@/lib/web3';
import { toast } from 'sonner';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  onChain?: boolean;
}

const ChatBot: React.FC = () => {
  const { address, isConnected } = useWeb3();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial greeting message
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        type: 'bot',
        content: 'Hello! I\'m your Opacus AI assistant. I can help you with UDID management, INFT operations, and blockchain queries. What would you like to know?',
        timestamp: new Date()
      }]);
    }
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Load chat history when wallet connects
    if (isConnected && address) {
      loadChatHistory();
    }
  }, [isConnected, address]);

  const loadChatHistory = async () => {
    if (!address) return;
    
    try {
      setIsLoading(true);
      const history = await web3Service.getChatHistory(address);
      
      if (history && history.length > 0) {
        const historicalMessages: Message[] = history.map((chat: any, index: number) => ([
          {
            id: `hist-user-${index}`,
            type: 'user' as const,
            content: chat.prompt,
            timestamp: new Date(chat.timestamp),
            onChain: true
          },
          {
            id: `hist-bot-${index}`,
            type: 'bot' as const,
            content: chat.response,
            timestamp: new Date(chat.timestamp),
            onChain: true
          }
        ])).flat();

        setMessages(prev => [...prev, ...historicalMessages]);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      // Don't show error toast for history loading failures
    } finally {
      setIsLoading(false);
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
      // Simulate typing delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      let botResponse: string;
      let shouldStoreOnChain = false;

      // Simple AI responses based on keywords
      if (currentInput.toLowerCase().includes('udid')) {
        botResponse = 'UDID (Universal Digital Identity) is your unique blockchain identity on Opacus. You can create, rotate, update labels, or revoke your UDID through the UDID Manager. Each UDID is bound to your wallet address and enables you to mint INFTs.';
        shouldStoreOnChain = true;
      } else if (currentInput.toLowerCase().includes('inft')) {
        botResponse = 'INFT (Identity-bound NFT) represents encrypted AI agent data that\'s tied to your UDID. You can mint new INFTs, perform secure transfers with TEE attestation, clone existing INFTs, or authorize usage for AI-as-a-Service applications.';
        shouldStoreOnChain = true;
      } else if (currentInput.toLowerCase().includes('transfer') || currentInput.toLowerCase().includes('secure')) {
        botResponse = 'Secure transfers use TEE (Trusted Execution Environment) attestation to verify and re-encrypt INFT metadata during transfers. This ensures data privacy and integrity throughout the ownership change process.';
        shouldStoreOnChain = true;
      } else if (currentInput.toLowerCase().includes('oracle')) {
        botResponse = 'The SecureTEE Oracle verifies attestation proofs from trusted signers and validates mRENCLAVE measurements. It\'s essential for secure INFT operations and ensures only authorized TEE environments can process your data.';
        shouldStoreOnChain = true;
      } else if (currentInput.toLowerCase().includes('clone')) {
        botResponse = 'INFT cloning creates a copy of an existing INFT with re-encrypted metadata for a new owner. The original remains with the current owner while the clone gets fresh encryption keys for the recipient.';
        shouldStoreOnChain = true;
      } else if (currentInput.toLowerCase().includes('gas') || currentInput.toLowerCase().includes('fee')) {
        botResponse = 'All operations on Opacus require gas fees paid in OG tokens. Make sure your wallet has sufficient OG balance for transactions. You can get testnet OG from the faucet if needed.';
      } else if (currentInput.toLowerCase().includes('wallet') || currentInput.toLowerCase().includes('connect')) {
        botResponse = 'Connect your MetaMask wallet to interact with Opacus. We\'ll automatically add the 0G-Newton-Testnet network if it\'s not already configured. Make sure you\'re on the correct network (Chain ID: 16601).';
      } else if (currentInput.toLowerCase().includes('help') || currentInput.toLowerCase().includes('how')) {
        botResponse = 'I can help you with:\n• UDID creation and management\n• INFT minting and transfers\n• Secure operations with TEE attestation\n• Understanding blockchain concepts\n• Troubleshooting common issues\n\nWhat specific topic would you like to explore?';
      } else {
        botResponse = 'I understand you\'re asking about blockchain and identity management. Could you be more specific about UDID, INFT, secure transfers, or any other Opacus features you\'d like to know about?';
        shouldStoreOnChain = true;
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: botResponse,
        timestamp: new Date(),
        onChain: shouldStoreOnChain
      };

      setMessages(prev => [...prev, botMessage]);

      // Store on blockchain if connected and should store
      if (shouldStoreOnChain && isConnected && address) {
        try {
          console.log('Storing chat on blockchain...', { address, currentInput, botResponse });
          await web3Service.queryLLM(address, currentInput, botResponse);
          toast.success('Chat logged on-chain successfully!');
        } catch (error: any) {
          console.error('Error storing chat on blockchain:', error);
          toast.error(`Failed to log chat on-chain: ${error.message || 'Unknown error'}`);
        }
      }

    } catch (error: any) {
      console.error('Error in chat:', error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: 'bot',
        content: 'I apologize, but I encountered an error processing your message. Please try again or connect your wallet for full functionality.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error('Chat error occurred');
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
    <Card className="card-cyber h-[600px] flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-cyber-grid">
        <div className="flex items-center">
          <Bot className="w-6 h-6 mr-2 text-cyber-neon" />
          <h3 className="text-lg font-semibold glow-text">Opacus AI Assistant</h3>
        </div>
        <div className="flex items-center space-x-2">
          {isConnected && (
            <Badge variant="outline" className="border-cyber-green/50 text-cyber-green">
              <Database className="w-3 h-3 mr-1" />
              On-chain Ready
            </Badge>
          )}
          <Badge variant="outline" className="border-cyber-blue/50 text-cyber-blue">
            <MessageSquare className="w-3 h-3 mr-1" />
            {messages.length - 1} messages
          </Badge>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-cyber-neon mr-2" />
              <span className="text-muted-foreground">Loading chat history...</span>
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
                
                <div className="flex items-center mt-1 text-xs text-muted-foreground">
                  <span>{message.timestamp.toLocaleTimeString()}</span>
                  {message.onChain && (
                    <Badge variant="outline" className="ml-2 border-cyber-green/30 text-cyber-green">
                      <Zap className="w-2 h-2 mr-1" />
                      On-chain
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

      <div className="p-4 border-t border-cyber-grid">
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isConnected ? "Ask about UDID, INFT, or blockchain..." : "Connect wallet for full functionality..."}
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
            Connect your wallet to enable on-chain chat logging and full features
          </p>
        )}
      </div>
    </Card>
  );
};

export default ChatBot;
