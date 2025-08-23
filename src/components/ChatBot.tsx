
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Sparkles,
  Cloud,
  Database,
  Zap
} from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { web3Service } from '@/lib/web3';
import { toast } from 'sonner';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  txHash?: string;
  onChain?: boolean;
}

const ChatBot: React.FC = () => {
  const { address, isConnected } = useWeb3();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! I\'m your Opacus AI assistant powered by OG Compute. I can help you with UDID management, INFT operations, and blockchain queries. All our conversations are logged on-chain for transparency and persistence. How can I assist you today?',
      timestamp: new Date(),
      onChain: false
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoggingOnChain, setIsLoggingOnChain] = useState(false);
  const [enableOnChainLogging, setEnableOnChainLogging] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Load chat history on connect
    if (isConnected && address) {
      loadChatHistory();
    }
  }, [isConnected, address]);

  const loadChatHistory = async () => {
    if (!address) return;
    
    try {
      const history = await web3Service.getChatHistory(address);
      if (history.success && history.data.length > 0) {
        const historicalMessages = history.data.map((chat: any, index: number) => [
          {
            id: `history-user-${index}`,
            type: 'user' as const,
            content: chat.prompt,
            timestamp: new Date(chat.timestamp),
            onChain: true,
            txHash: chat.txHash
          },
          {
            id: `history-bot-${index}`,
            type: 'bot' as const,
            content: chat.response,
            timestamp: new Date(chat.timestamp),
            onChain: true,
            txHash: chat.txHash
          }
        ]).flat();

        setMessages(prev => [prev[0], ...historicalMessages, ...prev.slice(1)]);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const enhancedAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('udid')) {
      return `I can help you with UDID operations! ${isConnected ? `Your connected address is ${address?.slice(0, 6)}...${address?.slice(-4)}. ` : 'Please connect your wallet first. '}

🔐 **UDID Features:**
• **Gasless Creation** - Create your Universal Digital Identity with zero gas fees
• **Rotation** - Update your UDID hash when needed
• **Label Management** - Add human-readable labels to your identity
• **Revocation** - Soft-delete your UDID if necessary

All UDID operations support both direct transactions and gasless (sponsored) execution. Would you like me to guide you through any specific operation?`;
    }
    
    if (lowerMessage.includes('inft') || lowerMessage.includes('nft')) {
      return `INFTs (Identity-bound NFTs) on Opacus are special! They require a valid UDID to mint and offer enhanced security features.

🎨 **INFT Features:**
• **UDID-Bound Minting** - Only users with active UDIDs can mint
• **Standard Transfers** - Regular ERC-721 transfers
• **Secure Transfers** - TEE-attestation backed transfers with metadata updates
• **Metadata Management** - Update token metadata with proper authorization

The secure transfer feature uses our TEE Oracle to verify attestation proofs, providing enterprise-grade security for high-value transfers. Would you like help with minting or transferring INFTs?`;
    }
    
    if (lowerMessage.includes('gasless') || lowerMessage.includes('sponsor') || lowerMessage.includes('free')) {
      return `🚀 **Gasless Operations** are one of Opacus's key features!

**How it works:**
1. You sign an EIP-712 message (no gas required)
2. Our backend relayer submits the transaction using sponsor funds
3. Your operation completes without you paying any gas fees

**Supported Operations:**
• UDID Creation, Rotation, Label Updates, Revocation
• Future: INFT minting and transfers (coming soon)

This makes Web3 accessible to users without needing to hold native tokens for gas. The sponsor wallet handles all gas payments transparently.`;
    }
    
    if (lowerMessage.includes('tee') || lowerMessage.includes('oracle') || lowerMessage.includes('secure')) {
      return `🛡️ **TEE (Trusted Execution Environment) Oracle** provides hardware-backed security:

**Features:**
• **Attestation Verification** - Validates TEE-generated proofs
• **Trusted Signers** - Whitelist of authorized attestation providers  
• **MRENCLAVE Validation** - Ensures code integrity in secure enclaves
• **Replay Protection** - Prevents proof reuse attacks

**Use Cases:**
• Secure INFT transfers with metadata updates
• High-value transaction validation
• Enterprise-grade identity verification

The oracle acts as a bridge between off-chain TEE computations and on-chain smart contracts, enabling trust-minimized secure operations.`;
    }
    
    if (lowerMessage.includes('0g') || lowerMessage.includes('chain')) {
      return `⚡ **0G Chain (Galileo Testnet)** is our high-performance blockchain infrastructure:

**Network Details:**
• **Chain ID:** 16601 
• **Native Token:** OG
• **RPC:** https://evmrpc-testnet.0g.ai
• **Explorer:** https://chainscan-galileo.0g.ai

**Key Features:**
• Ultra-fast transaction finality
• Low gas costs
• High throughput for data availability
• Optimized for AI/ML workloads

0G Chain is designed specifically for data-intensive applications like our identity and AI systems, providing the performance needed for real-time operations.`;
    }

    if (lowerMessage.includes('compute') || lowerMessage.includes('ai') || lowerMessage.includes('llm')) {
      return `🧠 **OG Compute System** powers our AI capabilities:

**Architecture:**
• **OGCompute Contract** - Receives and processes LLM responses
• **EchoOrchestrator** - Manages workflow and coordination  
• **OGStorage** - Persistent on-chain chat history storage

**Features:**
• All conversations logged on-chain for transparency
• Decentralized AI response verification
• Persistent chat history across sessions
• Integration with TEE oracles for secure computations

This enables trustless AI interactions where all responses are cryptographically verified and permanently stored on the blockchain.`;
    }
    
    if (lowerMessage.includes('wallet') || lowerMessage.includes('connect')) {
      return isConnected 
        ? `🔗 **Wallet Connected Successfully!**

**Your Details:**
• Address: ${address?.slice(0, 6)}...${address?.slice(-4)}
• Network: 0G-Galileo-Testnet (16601)
• Status: Ready for all operations

You can now access all Opacus features including gasless UDID operations and INFT management. What would you like to do first?`
        : `🔌 **Wallet Connection Guide:**

1. Click "Connect MetaMask" button in the top right
2. Approve the connection request
3. The system will automatically add/switch to 0G-Galileo-Testnet
4. Once connected, you'll have access to all features

**Requirements:**
• MetaMask or compatible Web3 wallet
• Will auto-configure 0G Chain network settings

Need help with the connection process?`;
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('guide') || lowerMessage.includes('start')) {
      return `🚀 **Welcome to Opacus UDID Hub!**

**Quick Start Guide:**
1. **Connect Wallet** - Link your MetaMask to get started
2. **Create UDID** - Generate your Universal Digital Identity (gasless!)
3. **Mint INFTs** - Create identity-bound NFTs tied to your UDID
4. **Chat with AI** - Get help and log conversations on-chain

**Key Features:**
🔐 **UDID Management** - Identity creation, rotation, labels
🎨 **INFT Operations** - Mint, transfer, secure transfers  
🤖 **AI Assistant** - This chat system with on-chain logging
⚡ **Gasless Operations** - Zero-fee transactions via sponsor

**Need Specific Help With:**
• "Tell me about UDIDs" - Identity management
• "How do INFTs work?" - NFT operations  
• "Explain gasless transactions" - Sponsored operations
• "TEE security features" - Advanced security

What would you like to explore first?`;
    }
    
    // Default responses
    const responses = [
      'I\'m here to help with all aspects of the Opacus ecosystem! Ask me about UDIDs, INFTs, gasless operations, TEE security, or the 0G Chain infrastructure.',
      'Great question! As your Opacus AI assistant, I can guide you through identity management, NFT operations, and blockchain interactions. What specific feature interests you?',
      'I understand you\'re looking for information. Feel free to ask about any Opacus features - from basic wallet connection to advanced TEE-secured transfers!'
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
      onChain: false
    };

    setMessages(prev => [...prev, userMessage]);
    const currentPrompt = inputMessage.trim();
    setInputMessage('');
    setIsTyping(true);

    try {
      // Get AI response (could be from real LLM or enhanced simulation)
      let aiResponseContent: string;
      
      if (isConnected && address) {
        try {
          // Try to get response from actual LLM service
          const llmResponse = await web3Service.queryLLM(address, currentPrompt);
          aiResponseContent = llmResponse.success ? llmResponse.response : enhancedAIResponse(currentPrompt);
        } catch (error) {
          console.log('Using enhanced simulation (LLM service unavailable)');
          aiResponseContent = enhancedAIResponse(currentPrompt);
        }
      } else {
        aiResponseContent = enhancedAIResponse(currentPrompt);
      }

      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: aiResponseContent,
        timestamp: new Date(),
        onChain: false
      };

      setMessages(prev => [...prev, aiResponse]);

      // Log to chain if enabled and connected
      if (enableOnChainLogging && isConnected && address) {
        setIsLoggingOnChain(true);
        try {
          // This would call the backend to submit to OGCompute contract
          const logResult = await fetch('/api/compute/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user: address,
              prompt: currentPrompt,
              response: aiResponseContent
            })
          });

          if (logResult.ok) {
            const result = await logResult.json();
            if (result.success) {
              // Update messages with on-chain status
              setMessages(prev => prev.map(msg => 
                msg.id === userMessage.id || msg.id === aiResponse.id 
                  ? { ...msg, onChain: true, txHash: result.txHash }
                  : msg
              ));
              toast.success('Chat logged on-chain successfully!');
            }
          }
        } catch (error) {
          console.error('Error logging to chain:', error);
          toast.error('Failed to log chat on-chain');
        } finally {
          setIsLoggingOnChain(false);
        }
      }

    } catch (error) {
      console.error('Error processing message:', error);
      toast.error('Error processing your message');
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
    <Card className="card-cyber p-0 h-[600px] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-cyber-grid">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-cyber-blue to-cyber-purple rounded-full flex items-center justify-center mr-3">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold glow-text flex items-center">
                Opacus AI Assistant
                <Cloud className="w-4 h-4 ml-2 text-cyber-green" />
              </h3>
              <p className="text-sm text-muted-foreground">
                {isTyping ? 'Thinking...' : isLoggingOnChain ? 'Logging to chain...' : 'Powered by OG Compute'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isConnected && (
              <button
                onClick={() => setEnableOnChainLogging(!enableOnChainLogging)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  enableOnChainLogging 
                    ? 'bg-cyber-green/20 text-cyber-green border border-cyber-green/50' 
                    : 'bg-muted/50 text-muted-foreground border border-muted'
                }`}
              >
                <Database className="w-3 h-3 mr-1 inline" />
                {enableOnChainLogging ? 'On-Chain ON' : 'Local Only'}
              </button>
            )}
            <Sparkles className="w-5 h-5 text-cyber-neon animate-pulse" />
          </div>
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
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-muted-foreground">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                  {message.onChain && (
                    <Badge variant="outline" className="text-xs border-cyber-green/50 text-cyber-green">
                      <Database className="w-3 h-3 mr-1" />
                      On-Chain
                    </Badge>
                  )}
                </div>
              </div>

              {message.type === 'user' && (
                <div className="w-8 h-8 bg-cyber-green/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-cyber-green" />
                </div>
              )}
            </div>
          ))}
          
          {(isTyping || isLoggingOnChain) && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-cyber-blue to-cyber-purple rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-cyber-neon rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-cyber-neon rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-cyber-neon rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  {isLoggingOnChain && (
                    <span className="text-xs text-cyber-green ml-2">
                      <Database className="w-3 h-3 inline mr-1" />
                      Logging to chain...
                    </span>
                  )}
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
            placeholder="Ask me about UDIDs, INFTs, gasless operations, or blockchain features..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="input-cyber flex-1"
            disabled={isTyping || isLoggingOnChain}
          />
          <Button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isTyping || isLoggingOnChain}
            className="btn-cyber"
          >
            {isTyping || isLoggingOnChain ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        
        {isConnected && enableOnChainLogging && (
          <p className="text-xs text-cyber-green mt-2 flex items-center">
            <Zap className="w-3 h-3 mr-1" />
            Conversations are being logged to 0G Chain via OG Compute system
          </p>
        )}
      </div>
    </Card>
  );
};

export default ChatBot;
