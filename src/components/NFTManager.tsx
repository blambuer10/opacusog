
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Image, 
  Plus, 
  Send, 
  Loader2, 
  ExternalLink,
  Palette
} from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { web3Service } from '@/lib/web3';
import { toast } from 'sonner';
import { ethers } from 'ethers';

interface NFTData {
  tokenId: string;
  owner: string;
  tokenURI: string;
  metadataHash: string;
}

const NFTManager: React.FC = () => {
  const { address, isConnected } = useWeb3();
  const [nfts, setNfts] = useState<NFTData[]>([]);
  const [loading, setLoading] = useState(false);
  const [minting, setMinting] = useState(false);
  const [transferring, setTransferring] = useState(false);
  
  // Form states
  const [mintTo, setMintTo] = useState('');
  const [metadataUri, setMetadataUri] = useState('');
  const [metadataJson, setMetadataJson] = useState('');
  const [transferTokenId, setTransferTokenId] = useState('');
  const [transferTo, setTransferTo] = useState('');
  
  const [userBalance, setUserBalance] = useState('0');

  useEffect(() => {
    if (isConnected && address) {
      setMintTo(address); // Default to current user
      loadUserNFTs();
    }
  }, [isConnected, address]);

  const loadUserNFTs = async () => {
    if (!address) return;
    
    setLoading(true);
    try {
      const contract = web3Service.getINFTContract();
      const balance = await contract.balanceOf(address);
      setUserBalance(balance.toString());
      
      // Note: This is a simplified version. In a real app, you'd need to track token IDs
      // or use events to get the full list of user's NFTs
      console.log(`User has ${balance} NFTs`);
    } catch (error) {
      console.error('Error loading NFTs:', error);
    } finally {
      setLoading(false);
    }
  };

  const mintNFT = async () => {
    if (!address || !mintTo || !metadataUri) return;
    
    setMinting(true);
    try {
      // Check if user has UDID
      const udidContract = web3Service.getUDIDContract();
      const udid = await udidContract.udidOf(address);
      
      if (udid === '0x0000000000000000000000000000000000000000000000000000000000000000') {
        toast.error('You need a UDID to mint NFTs');
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
      
      toast.info('Minting NFT... Please wait for confirmation');
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
        toast.success(`NFT minted successfully! Token ID: ${tokenId}`);
      } else {
        toast.success('NFT minted successfully!');
      }
      
      await loadUserNFTs();
      setMetadataUri('');
      setMetadataJson('');
    } catch (error: any) {
      console.error('Error minting NFT:', error);
      toast.error(`Failed to mint NFT: ${error.message || 'Unknown error'}`);
    } finally {
      setMinting(false);
    }
  };

  const transferNFT = async () => {
    if (!address || !transferTokenId || !transferTo) return;
    
    setTransferring(true);
    try {
      const contract = web3Service.getINFTContract();
      
      const tx = await contract.transferFrom(address, transferTo, transferTokenId);
      toast.info('Transferring NFT... Please wait for confirmation');
      
      await tx.wait();
      toast.success('NFT transferred successfully!');
      
      await loadUserNFTs();
      setTransferTokenId('');
      setTransferTo('');
    } catch (error: any) {
      console.error('Error transferring NFT:', error);
      toast.error(`Failed to transfer NFT: ${error.message || 'Unknown error'}`);
    } finally {
      setTransferring(false);
    }
  };

  if (!isConnected) {
    return (
      <Card className="card-cyber p-8 text-center">
        <Image className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-bold mb-2">NFT Management</h3>
        <p className="text-muted-foreground">Connect your wallet to manage your NFTs</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="card-cyber p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Palette className="w-6 h-6 mr-2 text-cyber-neon" />
            <h2 className="text-2xl font-bold glow-text">NFT Manager</h2>
          </div>
          <Badge variant="outline" className="border-cyber-green/50 text-cyber-green">
            {userBalance} NFTs owned
          </Badge>
        </div>

        {/* Mint NFT Section */}
        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-semibold flex items-center">
            <Plus className="w-5 h-5 mr-2 text-cyber-neon" />
            Mint New NFT
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
              placeholder='{"name": "My NFT", "description": "...", "image": "..."}'
              value={metadataJson}
              onChange={(e) => setMetadataJson(e.target.value)}
              className="input-cyber min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Used for creating metadata hash. Leave empty to use URI for hash.
            </p>
          </div>

          <Button 
            onClick={mintNFT} 
            disabled={minting || !mintTo || !metadataUri}
            className="btn-cyber w-full"
          >
            {minting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Minting NFT...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Mint NFT
              </>
            )}
          </Button>
        </div>

        {/* Transfer NFT Section */}
        <div className="space-y-4 border-t border-cyber-grid pt-6">
          <h3 className="text-lg font-semibold flex items-center">
            <Send className="w-5 h-5 mr-2 text-cyber-blue" />
            Transfer NFT
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
            onClick={transferNFT} 
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
                Transfer NFT
              </>
            )}
          </Button>
        </div>

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

export default NFTManager;
