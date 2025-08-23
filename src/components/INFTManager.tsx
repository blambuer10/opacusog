
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Image, 
  Plus, 
  Send, 
  Loader2, 
  ExternalLink,
  Palette,
  Shield,
  Upload,
  Zap
} from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { web3Service } from '@/lib/web3';
import { toast } from 'sonner';
import { ethers } from 'ethers';

interface INFTData {
  tokenId: string;
  owner: string;
  tokenURI: string;
  metadataHash: string;
}

const INFTManager: React.FC = () => {
  const { address, isConnected } = useWeb3();
  const [infts, setInfts] = useState<INFTData[]>([]);
  const [loading, setLoading] = useState(false);
  const [minting, setMinting] = useState(false);
  const [transferring, setTransferring] = useState(false);
  
  // Form states
  const [mintTo, setMintTo] = useState('');
  const [metadataUri, setMetadataUri] = useState('');
  const [metadataJson, setMetadataJson] = useState('');
  const [transferTokenId, setTransferTokenId] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [secureTransferProof, setSecureTransferProof] = useState('');
  
  const [userBalance, setUserBalance] = useState('0');
  const [activeTab, setActiveTab] = useState('mint');

  useEffect(() => {
    if (isConnected && address) {
      setMintTo(address); // Default to current user
      loadUserINFTs();
    }
  }, [isConnected, address]);

  const loadUserINFTs = async () => {
    if (!address) return;
    
    setLoading(true);
    try {
      const contract = web3Service.getINFTContract();
      const balance = await contract.balanceOf(address);
      setUserBalance(balance.toString());
      
      // Note: This is a simplified version. In a real app, you'd need to track token IDs
      // or use events to get the full list of user's INFTs
      console.log(`User has ${balance} INFTs`);
    } catch (error) {
      console.error('Error loading INFTs:', error);
    } finally {
      setLoading(false);
    }
  };

  const mintINFT = async () => {
    if (!address || !mintTo || !metadataUri) return;
    
    setMinting(true);
    try {
      // Check if user has UDID
      const udidContract = web3Service.getUDIDContract();
      const udid = await udidContract.udidOf(address);
      
      if (udid === '0x0000000000000000000000000000000000000000000000000000000000000000') {
        toast.error('You need a UDID to mint INFTs');
        return;
      }

      const contract = web3Service.getINFTContract();
      
      // Create metadata hash
      const metadataHash = ethers.keccak256(ethers.toUtf8Bytes(metadataJson || metadataUri));
      
      const tx = await contract.mint(
        mintTo,
        metadataUri,
        metadataHash,
        ethers.ZeroAddress, // No royalty recipient
        0 // No royalty
      );
      
      toast.info('Minting INFT... Please wait for confirmation');
      const receipt = await tx.wait();
      
      // Get token ID from the Transfer event
      const transferEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed?.name === 'Transfer';
        } catch {
          return false;
        }
      });

      if (transferEvent) {
        const parsed = contract.interface.parseLog(transferEvent);
        const tokenId = parsed?.args.tokenId.toString();
        toast.success(`INFT minted successfully! Token ID: ${tokenId}`);
      } else {
        toast.success('INFT minted successfully!');
      }
      
      await loadUserINFTs();
      setMetadataUri('');
      setMetadataJson('');
    } catch (error: any) {
      console.error('Error minting INFT:', error);
      toast.error(`Failed to mint INFT: ${error.message || 'Unknown error'}`);
    } finally {
      setMinting(false);
    }
  };

  const transferINFT = async () => {
    if (!address || !transferTokenId || !transferTo) return;
    
    setTransferring(true);
    try {
      const contract = web3Service.getINFTContract();
      
      const tx = await contract.transferFrom(address, transferTo, transferTokenId);
      toast.info('Transferring INFT... Please wait for confirmation');
      
      await tx.wait();
      toast.success('INFT transferred successfully!');
      
      await loadUserINFTs();
      setTransferTokenId('');
      setTransferTo('');
    } catch (error: any) {
      console.error('Error transferring INFT:', error);
      toast.error(`Failed to transfer INFT: ${error.message || 'Unknown error'}`);
    } finally {
      setTransferring(false);
    }
  };

  const secureTransferINFT = async () => {
    if (!address || !transferTokenId || !transferTo || !secureTransferProof) return;
    
    setTransferring(true);
    try {
      const contract = web3Service.getINFTContract();
      
      // Parse proof (should be base64 or hex encoded)
      let proofBytes;
      try {
        proofBytes = secureTransferProof.startsWith('0x') 
          ? secureTransferProof 
          : '0x' + Buffer.from(secureTransferProof, 'base64').toString('hex');
      } catch {
        throw new Error('Invalid proof format');
      }
      
      const tx = await contract.secureTransfer(
        address, 
        transferTo, 
        transferTokenId, 
        '0x', // calldata
        proofBytes
      );
      
      toast.info('Executing secure transfer... Please wait for confirmation');
      
      await tx.wait();
      toast.success('Secure INFT transfer completed successfully!');
      
      await loadUserINFTs();
      setTransferTokenId('');
      setTransferTo('');
      setSecureTransferProof('');
    } catch (error: any) {
      console.error('Error in secure transfer:', error);
      toast.error(`Failed to execute secure transfer: ${error.message || 'Unknown error'}`);
    } finally {
      setTransferring(false);
    }
  };

  if (!isConnected) {
    return (
      <Card className="card-cyber p-8 text-center">
        <Image className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-bold mb-2">INFT Management</h3>
        <p className="text-muted-foreground">Connect your wallet to manage your Identity-bound NFTs</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="card-cyber p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Palette className="w-6 h-6 mr-2 text-cyber-neon" />
            <h2 className="text-2xl font-bold glow-text">INFT Manager</h2>
          </div>
          <Badge variant="outline" className="border-cyber-green/50 text-cyber-green">
            {userBalance} INFTs owned
          </Badge>
        </div>

        <Tabs defaultValue="mint" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-card/50 backdrop-blur-sm">
            <TabsTrigger 
              value="mint" 
              className="data-[state=active]:bg-cyber-neon/20 data-[state=active]:text-cyber-neon"
            >
              <Plus className="w-4 h-4 mr-2" />
              Mint INFT
            </TabsTrigger>
            <TabsTrigger 
              value="transfer"
              className="data-[state=active]:bg-cyber-blue/20 data-[state=active]:text-cyber-blue"
            >
              <Send className="w-4 h-4 mr-2" />
              Transfer
            </TabsTrigger>
            <TabsTrigger 
              value="secure"
              className="data-[state=active]:bg-cyber-purple/20 data-[state=active]:text-cyber-purple"
            >
              <Shield className="w-4 h-4 mr-2" />
              Secure Transfer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mint" className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Plus className="w-5 h-5 mr-2 text-cyber-neon" />
              Mint New INFT
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mintTo">Mint To Address</Label>
                <Input
                  id="mintTo"
                  placeholder="0x..."
                  value={mintTo}
                  onChange={(e) => setMintTo(e.target.value)}
                  className="input-cyber"
                />
              </div>
              
              <div>
                <Label htmlFor="metadataUri">Metadata URI</Label>
                <Input
                  id="metadataUri"
                  placeholder="https://... or ipfs://..."
                  value={metadataUri}
                  onChange={(e) => setMetadataUri(e.target.value)}
                  className="input-cyber"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="metadataJson">Metadata JSON (Optional)</Label>
              <Textarea
                id="metadataJson"
                placeholder='{"name": "My INFT", "description": "...", "image": "..."}'
                value={metadataJson}
                onChange={(e) => setMetadataJson(e.target.value)}
                className="input-cyber min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Used for creating metadata hash. Leave empty to use URI for hash.
              </p>
            </div>

            <Button 
              onClick={mintINFT} 
              disabled={minting || !mintTo || !metadataUri}
              className="btn-cyber w-full"
            >
              {minting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Minting INFT...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Mint INFT
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="transfer" className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Send className="w-5 h-5 mr-2 text-cyber-blue" />
              Standard Transfer
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="transferTokenId">Token ID</Label>
                <Input
                  id="transferTokenId"
                  placeholder="1"
                  value={transferTokenId}
                  onChange={(e) => setTransferTokenId(e.target.value)}
                  className="input-cyber"
                />
              </div>
              
              <div>
                <Label htmlFor="transferTo">Transfer To</Label>
                <Input
                  id="transferTo"
                  placeholder="0x..."
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                  className="input-cyber"
                />
              </div>
            </div>

            <Button 
              onClick={transferINFT} 
              disabled={transferring || !transferTokenId || !transferTo}
              variant="outline"
              className="w-full border-cyber-blue/50 text-cyber-blue hover:bg-cyber-blue/10"
            >
              {transferring ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Transferring...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Transfer INFT
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="secure" className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Shield className="w-5 h-5 mr-2 text-cyber-purple" />
              TEE-Secured Transfer
            </h3>
            
            <div className="bg-cyber-purple/10 border border-cyber-purple/30 rounded-lg p-4 mb-4">
              <p className="text-sm text-cyber-purple flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                Secure transfers require TEE attestation proof for enhanced security
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="secureTokenId">Token ID</Label>
                <Input
                  id="secureTokenId"
                  placeholder="1"
                  value={transferTokenId}
                  onChange={(e) => setTransferTokenId(e.target.value)}
                  className="input-cyber"
                />
              </div>
              
              <div>
                <Label htmlFor="secureTo">Transfer To</Label>
                <Input
                  id="secureTo"
                  placeholder="0x..."
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                  className="input-cyber"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="proof">TEE Attestation Proof</Label>
              <Textarea
                id="proof"
                placeholder="Paste TEE attestation proof (base64 or hex)"
                value={secureTransferProof}
                onChange={(e) => setSecureTransferProof(e.target.value)}
                className="input-cyber min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Proof must be obtained from a trusted TEE attester and validated by the oracle
              </p>
            </div>

            <Button 
              onClick={secureTransferINFT} 
              disabled={transferring || !transferTokenId || !transferTo || !secureTransferProof}
              className="w-full bg-gradient-to-r from-cyber-purple to-cyber-blue hover:from-cyber-purple/80 hover:to-cyber-blue/80"
            >
              {transferring ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Executing Secure Transfer...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Execute Secure Transfer
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>

        {/* Quick Links */}
        <div className="border-t border-cyber-grid pt-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('https://chainscan-galileo.0g.ai', '_blank')}
              className="border-cyber-neon/30 text-cyber-neon hover:bg-cyber-neon/10"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Block Explorer
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('https://docs.opacus.network', '_blank')}
              className="border-cyber-green/30 text-cyber-green hover:bg-cyber-green/10"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Documentation
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default INFTManager;
