
import { ethers } from 'ethers';

export const OG_CHAIN_CONFIG = {
  chainId: '0x40E9', // 16601 in hex
  chainName: '0G-Galileo-Testnet',
  nativeCurrency: {
    name: 'OG',
    symbol: 'OG',
    decimals: 18,
  },
  rpcUrls: ['https://evmrpc-testnet.0g.ai'],
  blockExplorerUrls: ['https://chainscan-galileo.0g.ai'],
};

// Contract addresses from the user's deployment
export const CONTRACT_ADDRESSES = {
  UDID_REGISTRY: '0xb86988f2b2e9f9a6f4efc8e34dfc4ff1d7325555',
  SECURE_TEE_ORACLE: '0x8cf76d1301497467a7e19656a514a8c86a81d8f4',
  OPACUS_INFT: '0xe5934e22a027e4f5e105a3b4ba3ea02955ae32a6',
  PERMISSION_MANAGER: '0xe7e969d5e5e71f3cead2bf0323024e82c74b682c',
  OG_STORAGE: '0xecbd3ccb96ed4dd339d70e700ae878479dc14cdd',
  ECHO_ORCHESTRATOR: '0xe552a2d827d648086d550fc96a184b404ab49353',
  OG_COMPUTE: '0xd6941af4871851d018a7d502221cd863904a8ce2',
  PAYMASTER: '0x6248fB9D80441c8a6bDD3997AcD8493c8C4ccA5A',
  PROJECT_OWNER: '0x75a0F70499b60c87443459871507f5E3beC247C7'
};

// ABIs for the contracts
export const UDID_REGISTRY_ABI = [
  'function createUdid(bytes32 desiredUdid, string calldata label) external',
  'function rotateUdid(bytes32 newUdid) external',
  'function setLabel(string calldata newLabel) external',
  'function revokeUdid() external',
  'function udidOf(address user) external view returns (bytes32)',
  'function infoOf(address user) external view returns (tuple(bytes32 udid, uint64 createdAt, uint64 revokedAt, string label))',
  'function isActive(address user) external view returns (bool)',
  'event UdidCreated(address indexed user, bytes32 indexed udid, string label)',
  'event UdidRotated(address indexed user, bytes32 indexed oldUdid, bytes32 indexed newUdid)',
  'event UdidLabelUpdated(address indexed user, string oldLabel, string newLabel)',
  'event UdidRevoked(address indexed user, bytes32 indexed udid)'
];

export const OPACUS_INFT_ABI = [
  'function mint(address to, string calldata uri, bytes32 h, address rr, uint96 bps) external returns (uint256 id)',
  'function transferFrom(address from, address to, uint256 tokenId) external',
  'function ownerOf(uint256 tokenId) external view returns (address)',
  'function balanceOf(address owner) external view returns (uint256)',
  'function tokenURI(uint256 tokenId) external view returns (string memory)',
  'function updateMetadata(uint256 id, bytes32 h, string calldata uri) external',
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
  'event MetadataUpdated(uint256 indexed id, bytes32 h, string uri)'
];

export const OG_COMPUTE_ABI = [
  'function submitLLMResponse(address user, string calldata prompt, string calldata response) external',
  'event ResponseGenerated(address indexed user, string prompt, string response, uint256 timestamp)'
];

export class Web3Service {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  async connectWallet(): Promise<string | null> {
    if (!window.ethereum) {
      console.error('MetaMask not found');
      return null;
    }

    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Switch to 0G Chain if not already connected
      await this.switchToOGChain();
      
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      
      const address = await this.signer.getAddress();
      console.log('Connected to wallet:', address);
      return address;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      return null;
    }
  }

  async switchToOGChain(): Promise<boolean> {
    if (!window.ethereum) return false;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: OG_CHAIN_CONFIG.chainId }],
      });
      return true;
    } catch (switchError: any) {
      // Chain not added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [OG_CHAIN_CONFIG],
          });
          return true;
        } catch (addError) {
          console.error('Error adding chain:', addError);
          return false;
        }
      }
      console.error('Error switching chain:', switchError);
      return false;
    }
  }

  getUDIDContract() {
    if (!this.signer) throw new Error('Wallet not connected');
    return new ethers.Contract(CONTRACT_ADDRESSES.UDID_REGISTRY, UDID_REGISTRY_ABI, this.signer);
  }

  getINFTContract() {
    if (!this.signer) throw new Error('Wallet not connected');
    return new ethers.Contract(CONTRACT_ADDRESSES.OPACUS_INFT, OPACUS_INFT_ABI, this.signer);
  }

  getOGComputeContract() {
    if (!this.signer) throw new Error('Wallet not connected');
    return new ethers.Contract(CONTRACT_ADDRESSES.OG_COMPUTE, OG_COMPUTE_ABI, this.signer);
  }

  async getBalance(address: string): Promise<string> {
    if (!this.provider) throw new Error('Provider not connected');
    const balance = await this.provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  isConnected(): boolean {
    return this.provider !== null && this.signer !== null;
  }

  getSigner() {
    return this.signer;
  }

  getProvider() {
    return this.provider;
  }
}

export const web3Service = new Web3Service();

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}
