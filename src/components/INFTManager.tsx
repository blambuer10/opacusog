
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
  Copy
} from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { web3Service } from '@/lib/web3';
import { toast } from 'sonner';
import { ethers } from 'ethers';

const INFTManager: React.FC = () => {
  const { address, isConnected } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [minting, setMinting] = useState(false);
  const [transferring, setTransferring] = useState(false);
  
  // Form states
  const [mintTo, setMintTo] = useState('');
  const [encryptedUri, setEncryptedUri] = useState('');
  const [metadataHash, setMetadataHash] = useState('');
  const [transferTokenId, setTransferTokenId] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [sealedKey, setSealedKey] = useState('');
  const [transferProof, setTransferProof] = useState('');
  const [cloneTokenId, setCloneTokenId] = useState('');
  const [cloneTo, setCloneTo] = useState('');
  const [cloneProof, setCloneProof] = useState('');
  
  const [userBalance, setUserBalance] = useState('0');

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
      
      console.log(`User has ${balance} INFTs`);
    } catch (error) {
      console.error('Error loading INFTs:', error);
    } finally {
      setLoading(false);
    }
  };

  const mintINFT = async () => {
    if (!address || !mintTo || !encryptedUri) return;
    
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
      
      // Create metadata hash if not provided
      const hash = metadataHash || ethers.keccak256(ethers.toUtf8Bytes(encryptedUri));
      
      const tx = await contract.mint(mintTo, encryptedUri, hash);
      
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
      setEncryptedUri('');
      setMetadataHash('');
    } catch (error: any) {
      console.error('Error minting INFT:', error);
      toast.error(`Failed to mint INFT: ${error.message || 'Unknown error'}`);
    } finally {
      setMinting(false);
    }
  };

  const standardTransferINFT = async () => {
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
    if (!address || !transferTokenId || !transferTo || !sealedKey || !transferProof) return;
    
    setTransferring(true);
    try {
      const contract = web3Service.getINFTContract();
      
      // Parse sealed key and proof
      let sealedKeyBytes, proofBytes;
      try {
        sealedKeyBytes = sealedKey.startsWith('0x') 
          ? sealedKey 
          : '0x' + Buffer.from(sealedKey, 'base64').toString('hex');
        proofBytes = transferProof.startsWith('0x') 
          ? transferProof 
          : '0x' + Buffer.from(transferProof, 'base64').toString('hex');
      } catch {
        throw new Error('Invalid sealed key or proof format');
      }
      
      const tx = await contract.transfer(
        address, 
        transferTo, 
        transferTokenId, 
        sealedKeyBytes,
        proofBytes
      );
      
      toast.info('Executing secure transfer... Please wait for confirmation');
      
      await tx.wait();
      toast.success('Secure INFT transfer completed successfully!');
      
      await loadUserINFTs();
      setTransferTokenId('');
      setTransferTo('');
      setSealedKey('');
      setTransferProof('');
    } catch (error: any) {
      console.error('Error in secure transfer:', error);
      toast.error(`Failed to execute secure transfer: ${error.message || 'Unknown error'}`);
    } finally {
      setTransferring(false);
    }
  };

  const cloneINFT = async () => {
    if (!address || !cloneTokenId || !cloneTo || !cloneProof) return;
    
    setTransferring(true);
    try {
      const contract = web3Service.getINFTContract();
      
      // Parse proof
      let proofBytes;
      try {
        proofBytes = cloneProof.startsWith('0x') 
          ? cloneProof 
          : '0x' + Buffer.from(cloneProof, 'base64').toString('hex');
      } catch {
        throw new Error('Invalid proof format');
      }
      
      const tx = await contract.clone(
        cloneTo, 
        cloneTokenId, 
        '0x', // empty sealed key for clone
        proofBytes
      );
      
      toast.info('Cloning INFT... Please wait for confirmation');
      const receipt = await tx.wait();
      
      // Try to get new token ID from events
      const cloneEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed?.name === 'Cloned';
        } catch {
          return false;
        }
      });

      if (cloneEvent) {
        const parsed = contract.interface.parseLog(cloneEvent);
        const newTokenId = parsed?.args.newId.toString();
        toast.success(`INFT cloned successfully! New Token ID: ${newTokenId}`);
      } else {
        toast.success('INFT cloned successfully!');
      }
      
      await loadUserINFTs();
      setCloneTokenId('');
      setCloneTo('');
      setCloneProof('');
    } catch (error: any) {
      console.error('Error cloning INFT:', error);
      toast.error(`Failed to clone INFT: ${error.message || 'Unknown error'}`);
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
          <TabsList className="grid w-full grid-cols-4 mb-6 bg-card/50 backdrop-blur-sm">
            <TabsTrigger 
              value="mint" 
              className="data-[state=active]:bg-cyber-neon/20 data-[state=active]:text-cyber-neon"
            >
              <Plus className="w-4 h-4 mr-2" />
              Mint
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
            <TabsTrigger 
              value="clone"
              className="data-[state=active]:bg-cyber-green/20 data-[state=active]:text-cyber-green"
            >
              <Copy className="w-4 h-4 mr-2" />
              Clone
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
                <Label htmlFor="encryptedUri">Encrypted URI</Label>
                <Input
                  id="encryptedUri"
                  placeholder="https://... or ipfs://..."
                  value={encryptedUri}
                  onChange={(e) => setEncryptedUri(e.target.value)}
                  className="input-cyber"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="metadataHash">Metadata Hash (Optional)</Label>
              <Input
                id="metadataHash"
                placeholder="0x... (leave empty to auto-generate from URI)"
                value={metadataHash}
                onChange={(e) => setMetadataHash(e.target.value)}
                className="input-cyber"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Hash of the encrypted payload. Auto-generated if empty.
              </p>
            </div>

            <Button 
              onClick={mintINFT} 
              disabled={minting || !mintTo || !encryptedUri}
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
              onClick={standardTransferINFT} 
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
              ERC-7857 Secure Transfer
            </h3>
            
            <div className="bg-cyber-purple/10 border border-cyber-purple/30 rounded-lg p-4 mb-4">
              <p className="text-sm text-cyber-purple flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                Secure transfers with re-encryption and TEE attestation proof
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
              <Label htmlFor="sealedKey">Sealed Key</Label>
              <Textarea
                id="sealedKey"
                placeholder="Sealed encryption key (base64 or hex)"
                value={sealedKey}
                onChange={(e) => setSealedKey(e.target.value)}
                className="input-cyber min-h-[80px]"
              />
            </div>

            <div>
              <Label htmlFor="transferProof">TEE Attestation Proof</Label>
              <Textarea
                id="transferProof"
                placeholder="TEE attestation proof (base64 or hex)"
                value={transferProof}
                onChange={(e) => setTransferProof(e.target.value)}
                className="input-cyber min-h-[100px]"
              />
            </div>

            <Button 
              onClick={secureTransferINFT} 
              disabled={transferring || !transferTokenId || !transferTo || !sealedKey || !transferProof}
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

          <TabsContent value="clone" className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Copy className="w-5 h-5 mr-2 text-cyber-green" />
              Clone INFT
            </h3>
            
            <div className="bg-cyber-green/10 border border-cyber-green/30 rounded-lg p-4 mb-4">
              <p className="text-sm text-cyber-green flex items-center">
                <Copy className="w-4 h-4 mr-2" />
                Create a copy with re-encrypted metadata for a new owner
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cloneTokenId">Source Token ID</Label>
                <Input
                  id="cloneTokenId"
                  placeholder="1"
                  value={cloneTokenId}
                  onChange={(e) => setCloneTokenId(e.target.value)}
                  className="input-cyber"
                />
              </div>
              
              <div>
                <Label htmlFor="cloneTo">Clone To</Label>
                <Input
                  id="cloneTo"
                  placeholder="0x..."
                  value={cloneTo}
                  onChange={(e) => setCloneTo(e.target.value)}
                  className="input-cyber"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="cloneProof">TEE Attestation Proof</Label>
              <Textarea
                id="cloneProof"
                placeholder="TEE attestation proof for cloning (base64 or hex)"
                value={cloneProof}
                onChange={(e) => setCloneProof(e.target.value)}
                className="input-cyber min-h-[100px]"
              />
            </div>

            <Button 
              onClick={cloneINFT} 
              disabled={transferring || !cloneTokenId || !cloneTo || !cloneProof}
              className="w-full bg-gradient-to-r from-cyber-green to-cyber-neon hover:from-cyber-green/80 hover:to-cyber-neon/80"
            >
              {transferring ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cloning INFT...
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Clone INFT
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
              onClick={() => window.open('https://chainscan-newton.0g.ai', '_blank')}
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
