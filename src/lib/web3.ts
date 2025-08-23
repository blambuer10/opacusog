import { ethers } from 'ethers';
import { udidApiClient } from '@/api/udid';
import { inftApiClient } from '@/api/inft';
import { computeApiClient } from '@/api/compute';

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

// Contract addresses from deployment
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

// Complete ABIs for all contracts
export const UDID_REGISTRY_ABI = [
  'function createUdid(bytes32 desiredUdid, string calldata label) external',
  'function rotateUdid(bytes32 newUdid) external',
  'function setLabel(string calldata newLabel) external',
  'function revokeUdid() external',
  'function udidOf(address user) external view returns (bytes32)',
  'function infoOf(address user) external view returns (tuple(bytes32 udid, uint64 createdAt, uint64 revokedAt, string label))',
  'function isActive(address user) external view returns (bool)',
  'function nonces(address owner) external view returns (uint256)',
  'function createUdidWithSig(address user, bytes32 udid, string calldata label, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external',
  'function rotateUdidWithSig(address user, bytes32 newUdid, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external',
  'function setLabelWithSig(address user, string calldata newLabel, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external',
  'function revokeUdidWithSig(address user, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external',
  'event UdidCreated(address indexed user, bytes32 indexed udid, string label)',
  'event UdidRotated(address indexed user, bytes32 indexed oldUdid, bytes32 indexed newUdid)',
  'event UdidLabelUpdated(address indexed user, string oldLabel, string newLabel)',
  'event UdidRevoked(address indexed user, bytes32 indexed udid)'
];

export const OPACUS_INFT_ABI = [
  'function mint(address to, string calldata uri, bytes32 h, address rr, uint96 bps) external returns (uint256 id)',
  'function transferFrom(address from, address to, uint256 tokenId) external',
  'function secureTransfer(address f, address t, uint256 id, bytes calldata, bytes calldata pf) external',
  'function ownerOf(uint256 tokenId) external view returns (address)',
  'function balanceOf(address owner) external view returns (uint256)',
  'function tokenURI(uint256 tokenId) external view returns (string memory)',
  'function updateMetadata(uint256 id, bytes32 h, string calldata uri) external',
  'function permit(address o, address sp, uint256 id, uint256 dl, uint8 v, bytes32 r, bytes32 s) external',
  'function permitForAll(address o, address op, bool a, uint256 dl, uint8 v, bytes32 r, bytes32 s) external',
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
  'event MetadataUpdated(uint256 indexed id, bytes32 h, string uri)'
];

export const OG_COMPUTE_ABI = [
  'function submitLLMResponse(address user, string calldata prompt, string calldata response) external',
  'event ResponseGenerated(address indexed user, string prompt, string response, uint256 timestamp)'
];

export const SECURE_TEE_ORACLE_ABI = [
  'function verifyProof(bytes calldata proof) external view returns (bool)',
  'function verifyAndConsume(bytes calldata proof) external returns (bool)',
  'function isTrustedSigner(address who) external view returns (bool)',
  'function isMrenclaveAllowed(bytes calldata mrenclave) external view returns (bool)'
];

// EIP-712 Domain for UDIDRegistry
export const UDID_EIP712_DOMAIN = {
  name: 'OpacusUDID',
  version: '1',
  chainId: 16601,
  verifyingContract: CONTRACT_ADDRESSES.UDID_REGISTRY
};

// EIP-712 Types
export const EIP712_TYPES = {
  Create: [
    { name: 'user', type: 'address' },
    { name: 'udid', type: 'bytes32' },
    { name: 'label', type: 'string' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' }
  ],
  Rotate: [
    { name: 'user', type: 'address' },
    { name: 'newUdid', type: 'bytes32' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' }
  ],
  SetLabel: [
    { name: 'user', type: 'address' },
    { name: 'label', type: 'string' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' }
  ],
  Revoke: [
    { name: 'user', type: 'address' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' }
  ]
};

export class Web3Service {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  async connectWallet(): Promise<string | null> {
    if (!window.ethereum) {
      console.error('MetaMask not found');
      return null;
    }

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
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

  // Contract getters
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

  getTEEOracleContract() {
    if (!this.signer) throw new Error('Wallet not connected');
    return new ethers.Contract(CONTRACT_ADDRESSES.SECURE_TEE_ORACLE, SECURE_TEE_ORACLE_ABI, this.signer);
  }

  // EIP-712 signing helpers
  async signEIP712(domain: any, types: any, message: any): Promise<string> {
    if (!this.signer) throw new Error('Wallet not connected');
    
    return await this.signer.signTypedData(domain, types, message);
  }

  async getUserNonce(address: string): Promise<bigint> {
    const contract = this.getUDIDContract();
    return await contract.nonces(address);
  }

  // Gasless operation helpers using API clients
  async gaslessCreateUDID(user: string, udid: string, label: string): Promise<any> {
    try {
      const nonce = await this.getUserNonce(user);
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 15 * 60); // 15 minutes

      const message = {
        user,
        udid: udid || '0x0000000000000000000000000000000000000000000000000000000000000000',
        label,
        nonce,
        deadline
      };

      const signature = await this.signEIP712(UDID_EIP712_DOMAIN, { Create: EIP712_TYPES.Create }, message);

      return await udidApiClient.createUDID({
        user,
        udid: message.udid,
        label,
        deadline: deadline.toString(),
        signature
      });
    } catch (error) {
      console.error('Error in gasless create UDID:', error);
      throw error;
    }
  }

  async gaslessRotateUDID(user: string, newUdid: string): Promise<any> {
    try {
      const nonce = await this.getUserNonce(user);
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 15 * 60);

      const message = {
        user,
        newUdid,
        nonce,
        deadline
      };

      const signature = await this.signEIP712(UDID_EIP712_DOMAIN, { Rotate: EIP712_TYPES.Rotate }, message);

      return await udidApiClient.rotateUDID({
        user,
        newUdid,
        deadline: deadline.toString(),
        signature
      });
    } catch (error) {
      console.error('Error in gasless rotate UDID:', error);
      throw error;
    }
  }

  async gaslessUpdateLabel(user: string, label: string): Promise<any> {
    try {
      const nonce = await this.getUserNonce(user);
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 15 * 60);

      const message = {
        user,
        label,
        nonce,
        deadline
      };

      const signature = await this.signEIP712(UDID_EIP712_DOMAIN, { SetLabel: EIP712_TYPES.SetLabel }, message);

      return await udidApiClient.updateLabel({
        user,
        label,
        deadline: deadline.toString(),
        signature
      });
    } catch (error) {
      console.error('Error in gasless update label:', error);
      throw error;
    }
  }

  async gaslessRevokeUDID(user: string): Promise<any> {
    try {
      const nonce = await this.getUserNonce(user);
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 15 * 60);

      const message = {
        user,
        nonce,
        deadline
      };

      const signature = await this.signEIP712(UDID_EIP712_DOMAIN, { Revoke: EIP712_TYPES.Revoke }, message);

      return await udidApiClient.revokeUDID({
        user,
        deadline: deadline.toString(),
        signature
      });
    } catch (error) {
      console.error('Error in gasless revoke UDID:', error);
      throw error;
    }
  }

  // Chat operations
  async queryLLM(user: string, prompt: string, context?: string): Promise<any> {
    return await computeApiClient.queryLLM({ user, prompt, context });
  }

  async getChatHistory(user: string): Promise<any> {
    return await computeApiClient.getChatHistory(user);
  }

  // Utility functions
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

  // Helper to split signature
  splitSignature(signature: string) {
    const sig = ethers.Signature.from(signature);
    return {
      v: sig.v,
      r: sig.r,
      s: sig.s
    };
  }
}

export const web3Service = new Web3Service();

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}
