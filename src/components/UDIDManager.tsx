
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Plus, 
  RotateCcw, 
  Edit3, 
  XCircle, 
  Loader2, 
  Copy, 
  Check,
  Shield
} from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { web3Service } from '@/lib/web3';
import { toast } from 'sonner';
import { ethers } from 'ethers';

interface UDIDInfo {
  udid: string;
  createdAt: number;
  revokedAt: number;
  label: string;
}

const UDIDManager: React.FC = () => {
  const { address, isConnected } = useWeb3();
  const [udidInfo, setUdidInfo] = useState<UDIDInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newUdid, setNewUdid] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      loadUDIDInfo();
    }
  }, [isConnected, address]);

  const loadUDIDInfo = async () => {
    if (!address) return;
    
    setLoading(true);
    try {
      const contract = web3Service.getUDIDContract();
      const info = await contract.infoOf(address);
      
      if (info.udid !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
        setUdidInfo({
          udid: info.udid,
          createdAt: Number(info.createdAt),
          revokedAt: Number(info.revokedAt),
          label: info.label
        });
      } else {
        setUdidInfo(null);
      }
    } catch (error) {
      console.error('Error loading UDID info:', error);
    } finally {
      setLoading(false);
    }
  };

  const createUDID = async () => {
    if (!address) return;
    
    setCreating(true);
    try {
      const contract = web3Service.getUDIDContract();
      const desiredUdid = newUdid ? ethers.keccak256(ethers.toUtf8Bytes(newUdid)) : '0x0000000000000000000000000000000000000000000000000000000000000000';
      
      const tx = await contract.createUdid(desiredUdid, newLabel || 'My UDID');
      toast.info('Creating UDID... Please wait for confirmation');
      
      await tx.wait();
      toast.success('UDID created successfully!');
      
      // Reload UDID info
      await loadUDIDInfo();
      setNewLabel('');
      setNewUdid('');
    } catch (error: any) {
      console.error('Error creating UDID:', error);
      toast.error(`Failed to create UDID: ${error.message || 'Unknown error'}`);
    } finally {
      setCreating(false);
    }
  };

  const rotateUDID = async () => {
    if (!address || !newUdid) return;
    
    setLoading(true);
    try {
      const contract = web3Service.getUDIDContract();
      const newUdidHash = ethers.keccak256(ethers.toUtf8Bytes(newUdid));
      
      const tx = await contract.rotateUdid(newUdidHash);
      toast.info('Rotating UDID... Please wait for confirmation');
      
      await tx.wait();
      toast.success('UDID rotated successfully!');
      
      await loadUDIDInfo();
      setNewUdid('');
    } catch (error: any) {
      console.error('Error rotating UDID:', error);
      toast.error(`Failed to rotate UDID: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const updateLabel = async () => {
    if (!address || !newLabel) return;
    
    setLoading(true);
    try {
      const contract = web3Service.getUDIDContract();
      
      const tx = await contract.setLabel(newLabel);
      toast.info('Updating label... Please wait for confirmation');
      
      await tx.wait();
      toast.success('Label updated successfully!');
      
      await loadUDIDInfo();
      setNewLabel('');
    } catch (error: any) {
      console.error('Error updating label:', error);
      toast.error(`Failed to update label: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const revokeUDID = async () => {
    if (!address) return;
    
    setLoading(true);
    try {
      const contract = web3Service.getUDIDContract();
      
      const tx = await contract.revokeUdid();
      toast.info('Revoking UDID... Please wait for confirmation');
      
      await tx.wait();
      toast.success('UDID revoked successfully!');
      
      await loadUDIDInfo();
    } catch (error: any) {
      console.error('Error revoking UDID:', error);
      toast.error(`Failed to revoke UDID: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  if (!isConnected) {
    return (
      <Card className="card-cyber p-8 text-center">
        <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-bold mb-2">UDID Management</h3>
        <p className="text-muted-foreground">Connect your wallet to manage your Universal Digital ID</p>
      </Card>
    );
  }

  if (loading && !udidInfo) {
    return (
      <Card className="card-cyber p-8 text-center">
        <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-cyber-neon" />
        <p className="text-muted-foreground">Loading UDID information...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="card-cyber p-6">
        <div className="flex items-center mb-6">
          <User className="w-6 h-6 mr-2 text-cyber-neon" />
          <h2 className="text-2xl font-bold glow-text">UDID Manager</h2>
        </div>

        {udidInfo ? (
          <div className="space-y-6">
            {/* Current UDID Info */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Your UDID</h3>
                <Badge 
                  variant={udidInfo.revokedAt > 0 ? "destructive" : "default"}
                  className="bg-cyber-green/20 text-cyber-green border-cyber-green/50"
                >
                  {udidInfo.revokedAt > 0 ? 'Revoked' : 'Active'}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-sm text-muted-foreground">UDID Hash</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 text-sm font-mono bg-muted/50 p-2 rounded border">
                      {udidInfo.udid}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(udidInfo.udid)}
                      className="glow-border"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm text-muted-foreground">Label</Label>
                  <p className="mt-1 text-cyber-neon">{udidInfo.label || 'No label'}</p>
                </div>
                
                <div>
                  <Label className="text-sm text-muted-foreground">Created</Label>
                  <p className="mt-1">{formatDate(udidInfo.createdAt)}</p>
                </div>
                
                {udidInfo.revokedAt > 0 && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Revoked</Label>
                    <p className="mt-1 text-destructive">{formatDate(udidInfo.revokedAt)}</p>
                  </div>
                )}
              </div>
            </div>

            <Separator className="border-cyber-grid" />

            {/* Actions */}
            {udidInfo.revokedAt === 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Actions</h3>
                
                {/* Update Label */}
                <div className="flex gap-2">
                  <Input
                    placeholder="New label"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    className="input-cyber"
                  />
                  <Button 
                    onClick={updateLabel} 
                    disabled={loading || !newLabel.trim()}
                    className="btn-cyber"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit3 className="w-4 h-4" />}
                    Update Label
                  </Button>
                </div>

                {/* Rotate UDID */}
                <div className="flex gap-2">
                  <Input
                    placeholder="New UDID seed (optional)"
                    value={newUdid}
                    onChange={(e) => setNewUdid(e.target.value)}
                    className="input-cyber"
                  />
                  <Button 
                    onClick={rotateUDID} 
                    disabled={loading || !newUdid.trim()}
                    variant="outline"
                    className="border-cyber-blue/50 text-cyber-blue hover:bg-cyber-blue/10"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                    Rotate
                  </Button>
                </div>

                {/* Revoke UDID */}
                <Button 
                  onClick={revokeUDID} 
                  disabled={loading}
                  variant="destructive"
                  className="w-full"
                >
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                  Revoke UDID
                </Button>
              </div>
            )}
          </div>
        ) : (
          /* Create New UDID */
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-cyber-neon/10 rounded-full flex items-center justify-center">
                <Plus className="w-8 h-8 text-cyber-neon" />
              </div>
              <h3 className="text-xl font-bold mb-2">Create Your UDID</h3>
              <p className="text-muted-foreground">
                Generate your Universal Digital Identity on the 0G Chain
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="label">Label (Optional)</Label>
                <Input
                  id="label"
                  placeholder="e.g., My Primary Identity"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="input-cyber"
                />
              </div>
              
              <div>
                <Label htmlFor="seed">Custom Seed (Optional)</Label>
                <Input
                  id="seed"
                  placeholder="Leave empty for auto-generated UDID"
                  value={newUdid}
                  onChange={(e) => setNewUdid(e.target.value)}
                  className="input-cyber"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  If empty, a deterministic UDID will be generated based on your address
                </p>
              </div>
            </div>

            <Button 
              onClick={createUDID} 
              disabled={creating}
              className="btn-cyber w-full"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating UDID...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create UDID
                </>
              )}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default UDIDManager;
