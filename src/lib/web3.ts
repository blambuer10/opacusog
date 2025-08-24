import { ethers } from 'ethers';
import { udidApiClient } from '@/api/udid';
import { inftApiClient } from '@/api/inft';
import { computeApiClient } from '@/api/compute';

export const OG_CHAIN_CONFIG = {
  chainId: '0x40E9', // 16601 in hex
  chainName: '0G-Newton-Testnet',
  nativeCurrency: {
    name: 'OG',
    symbol: 'OG',
    decimals: 18,
  },
  rpcUrls: ['https://evmrpc-testnet.0g.ai'],
  blockExplorerUrls: ['https://chainscan-newton.0g.ai'],
};

// Updated contract addresses with all deployed contracts
export const CONTRACT_ADDRESSES = {
  UDID_REGISTRY: '0xb86988f2b2e9f9a6f4efc8e34dfc4ff1d7325555',
  SECURE_TEE_ORACLE: '0x8cf76d1301497467a7e19656a514a8c86a81d8f4',
  OPACUS_INFT: '0x1953cc8d4edf5c2a1a26b89d4c45edc01e3d3a3d',
  PERMISSION_MANAGER: '0xe7e969d5e5e71f3cead2bf0323024e82c74b682c',
  OG_STORAGE: '0xecbd3ccb96ed4dd339d70e700ae878479dc14cdd',
  ECHO_ORCHESTRATOR: '0xe552a2d827d648086d550fc96a184b404ab49353',
  OG_COMPUTE: '0xd6941af4871851d018a7d502221cd863904a8ce2',
  DATA_CATALOG: '0x878b719ef09deb766d158abe1ba5d7a34b84f127',
  DATA_MARKETPLACE: '0x136911a3bfe8bff8b8fba9c742002c253da62890',
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
  'event UdidCreated(address indexed user, bytes32 indexed udid, string label)',
  'event UdidRotated(address indexed user, bytes32 indexed oldUdid, bytes32 indexed newUdid)',
  'event UdidLabelUpdated(address indexed user, string oldLabel, string newLabel)',
  'event UdidRevoked(address indexed user, bytes32 indexed udid)'
];

// Updated ABI for new ERC-7857 OpacusINFT contract
export const OPACUS_INFT_ABI = [
  'function mint(address to, string calldata encURI, bytes32 h) external returns (uint256 id)',
  'function transfer(address from, address to, uint256 tokenId, bytes calldata sealedKey, bytes calldata proof) external',
  'function clone(address to, uint256 tokenId, bytes calldata sealedKey, bytes calldata proof) external returns (uint256 newId)',
  'function authorizeUsage(uint256 tokenId, address executor, bytes calldata permissions) external',
  'function transferFrom(address from, address to, uint256 tokenId) external',
  'function ownerOf(uint256 tokenId) external view returns (address)',
  'function balanceOf(address owner) external view returns (uint256)',
  'function getMetadataHash(uint256 id) external view returns (bytes32)',
  'function getEncryptedURI(uint256 id) external view returns (string memory)',
  'function getAuthorization(uint256 id, address executor) external view returns (bytes memory)',
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
  'event MetadataUpdated(uint256 indexed tokenId, bytes32 newHash, string newURI)',
  'event UsageAuthorized(uint256 indexed tokenId, address indexed executor, bytes permissions)',
  'event Cloned(uint256 indexed originalId, uint256 indexed newId, address newOwner)'
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

// DataCatalog ABI
export const DATA_CATALOG_ABI = [
  'function setTags(address collection, uint256 tokenId, bytes32[] calldata tags) external',
  'function setAttributes(address collection, uint256 tokenId, tuple(bytes32 key, bytes32 value)[] calldata attrs) external',
  'function setMetaHash(address collection, uint256 tokenId, bytes32 metaHash) external',
  'function getTags(address collection, uint256 tokenId) external view returns (bytes32[])',
  'function getAttributes(address collection, uint256 tokenId) external view returns (tuple(bytes32 key, bytes32 value)[])',
  'function getMetaHash(address collection, uint256 tokenId) external view returns (bytes32)',
  'event TagsSet(address indexed collection, uint256 indexed tokenId, bytes32[] tags)',
  'event AttributesSet(address indexed collection, uint256 indexed tokenId, tuple(bytes32 key, bytes32 value)[] attrs)',
  'event MetaHashSet(address indexed collection, uint256 indexed tokenId, bytes32 metaHash)'
];

// DataMarketplace ABI
export const DATA_MARKETPLACE_ABI = [
  'function listItem(address collection, uint256 tokenId, uint8 saleType, address currency, uint256 price, uint64 rentDuration, bytes calldata rentPermissions, bytes32[] calldata tags) external returns (uint256 id)',
  'function updateListing(uint256 id, address currency, uint256 price, uint64 rentDuration, bytes calldata rentPermissions, bytes32[] calldata tags) external',
  'function unlist(uint256 id) external',
  'function buy(uint256 id) external payable',
  'function getListingsByTag(bytes32 tag) external view returns (uint256[])',
  'function getListingsByCollection(address collection) external view returns (uint256[])',
  'function getListingsBySeller(address seller) external view returns (uint256[])',
  'function getListing(uint256 id) external view returns (tuple(address collection, uint256 tokenId, address seller, uint8 saleType, address currency, uint256 price, uint64 rentDuration, bytes rentPermissions, bool active, bytes32[] tags))',
  'function listings(uint256 id) external view returns (tuple(address collection, uint256 tokenId, address seller, uint8 saleType, address currency, uint256 price, uint64 rentDuration, bytes rentPermissions, bool active, bytes32[] tags))',
  'function nextListingId() external view returns (uint256)',
  'function feeBps() external view returns (uint96)',
  'function feeReceiver() external view returns (address)',
  'event Listed(uint256 indexed id, address indexed collection, uint256 indexed tokenId, address seller, uint8 saleType, address currency, uint256 price)',
  'event ListingUpdated(uint256 indexed id, address currency, uint256 price, uint64 rentDuration, bytes rentPermissions, bytes32[] tags)',
  'event Unlisted(uint256 indexed id)',
  'event Purchased(uint256 indexed id, address indexed buyer, uint256 pricePaid)'
];

// PermissionManager ABI
export const PERMISSION_MANAGER_ABI = [
  'function grantPermission(string calldata permission) external',
  'function revokePermission(string calldata permission) external',
  'function hasPermission(address user, string calldata permission) external view returns (bool)',
  'function getUserPermissions(address user) external view returns (string[])',
  'event PermissionGranted(address indexed user, string permission)',
  'event PermissionRevoked(address indexed user, string permission)'
];

// OGStorage ABI
export const OG_STORAGE_ABI = [
  'function storeChatLog(address user, string calldata prompt, string calldata response) external',
  'function getChatHistory(address user) external view returns (tuple(string prompt, string response, uint256 timestamp)[])',
  'function storeEncryptedData(address user, string calldata encryptedUri, bytes32 metadataHash) external',
  'event ChatLogStored(address indexed user, string prompt, string response, uint256 timestamp)',
  'event EncryptedDataStored(address indexed user, string encryptedUri, bytes32 metadataHash)'
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

  getDataCatalogContract() {
    if (!this.signer) throw new Error('Wallet not connected');
    return new ethers.Contract(CONTRACT_ADDRESSES.DATA_CATALOG, DATA_CATALOG_ABI, this.signer);
  }

  getDataMarketplaceContract() {
    if (!this.signer) throw new Error('Wallet not connected');
    return new ethers.Contract(CONTRACT_ADDRESSES.DATA_MARKETPLACE, DATA_MARKETPLACE_ABI, this.signer);
  }

  getPermissionManagerContract() {
    if (!this.signer) throw new Error('Wallet not connected');
    return new ethers.Contract(CONTRACT_ADDRESSES.PERMISSION_MANAGER, PERMISSION_MANAGER_ABI, this.signer);
  }

  getOGStorageContract() {
    if (!this.signer) throw new Error('Wallet not connected');
    return new ethers.Contract(CONTRACT_ADDRESSES.OG_STORAGE, OG_STORAGE_ABI, this.signer);
  }

  // Enhanced Echo Orchestrator operations
  async createDigitalTwin(params: {
    dataUri: string;
    metadataHash: string;
    qualityScore: number;
    modelUri?: string;
  }): Promise<any> {
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.ECHO_ORCHESTRATOR, 
      [
        'function createDigitalTwin(string calldata dataUri, bytes32 metadataHash, uint256 qualityScore, string calldata modelUri) external returns (uint256)',
        'event DigitalTwinCreated(address indexed owner, uint256 indexed twinId, string dataUri, bytes32 metadataHash)'
      ], 
      this.signer!
    );
    const tx = await contract.createDigitalTwin(params.dataUri, params.metadataHash, params.qualityScore, params.modelUri || '');
    return await tx.wait();
  }

  async updateTwinModel(twinId: string, modelUri: string): Promise<any> {
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.ECHO_ORCHESTRATOR,
      ['function updateTwinModel(uint256 twinId, string calldata newModelUri) external'],
      this.signer!
    );
    const tx = await contract.updateTwinModel(twinId, modelUri);
    return await tx.wait();
  }

  // Enhanced OG Compute operations
  async submitSecureInference(params: {
    twinId: string;
    prompt: string;
    context: string;
    verificationMode: 'TEE' | 'ZKP';
  }): Promise<any> {
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.OG_COMPUTE,
      [
        'function submitSecureInference(uint256 twinId, string calldata prompt, string calldata context, uint8 verificationMode) external returns (bytes32)',
        'function getInferenceResult(bytes32 jobId) external view returns (string memory, bytes memory proof, bool completed)',
        'event InferenceRequested(bytes32 indexed jobId, address indexed requester, uint256 twinId)',
        'event InferenceCompleted(bytes32 indexed jobId, string response, bytes proof)'
      ],
      this.signer!
    );
    const verificationModeValue = params.verificationMode === 'TEE' ? 0 : 1;
    const tx = await contract.submitSecureInference(
      params.twinId, 
      params.prompt, 
      params.context, 
      verificationModeValue
    );
    return await tx.wait();
  }

  async getInferenceResult(jobId: string): Promise<{ response: string; proof: string; completed: boolean }> {
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.OG_COMPUTE,
      ['function getInferenceResult(bytes32 jobId) external view returns (string memory, bytes memory proof, bool completed)'],
      this.signer!
    );
    const result = await contract.getInferenceResult(jobId);
    return {
      response: result[0],
      proof: result[1],
      completed: result[2]
    };
  }

  // Enhanced marketplace operations with rental support
  async createRentalListing(params: {
    tokenId: string;
    pricePerHour: string;
    maxDuration: number;
    permissions: string[];
  }): Promise<any> {
    const contract = this.getDataMarketplaceContract();
    const permissionsBytes = params.permissions.map(p => ethers.keccak256(ethers.toUtf8Bytes(p)));
    const tx = await contract.createRentalListing(
      params.tokenId,
      ethers.parseEther(params.pricePerHour),
      params.maxDuration,
      permissionsBytes
    );
    return await tx.wait();
  }

  async rentAccess(listingId: string, duration: number, value: string): Promise<any> {
    const contract = this.getDataMarketplaceContract();
    const tx = await contract.rentAccess(listingId, duration, {
      value: ethers.parseEther(value)
    });
    return await tx.wait();
  }

  // Enhanced permission management with granular controls
  async grantDataPermission(dataType: string, scope: string, duration?: number): Promise<any> {
    const contract = this.getPermissionManagerContract();
    const permissionKey = `${dataType}:${scope}`;
    const tx = duration 
      ? await contract.grantTemporaryPermission(permissionKey, duration)
      : await contract.grantPermission(permissionKey);
    return await tx.wait();
  }

  async revokeDataPermission(dataType: string, scope: string): Promise<any> {
    const contract = this.getPermissionManagerContract();
    const permissionKey = `${dataType}:${scope}`;
    const tx = await contract.revokePermission(permissionKey);
    return await tx.wait();
  }

  // Data catalog enhanced operations
  async setDataQualityScore(collection: string, tokenId: string, score: number): Promise<any> {
    const contract = this.getDataCatalogContract();
    const scoreAttr = [{
      key: ethers.keccak256(ethers.toUtf8Bytes('qualityScore')),
      value: ethers.keccak256(ethers.toUtf8Bytes(score.toString()))
    }];
    const tx = await contract.setAttributes(collection, tokenId, scoreAttr);
    return await tx.wait();
  }

  async getDataQualityScore(collection: string, tokenId: string): Promise<number> {
    const contract = this.getDataCatalogContract();
    const attrs = await contract.getAttributes(collection, tokenId);
    const qualityAttr = attrs.find((attr: any) => 
      attr.key === ethers.keccak256(ethers.toUtf8Bytes('qualityScore'))
    );
    return qualityAttr ? parseInt(qualityAttr.value) : 0;
  }

  // Enhanced storage operations
  async storeEncryptedChatLog(user: string, prompt: string, response: string, encrypted: boolean = true): Promise<any> {
    const contract = this.getOGStorageContract();
    const tx = await contract.storeChatLog(user, prompt, response);
    return await tx.wait();
  }

  async getChatThreads(user: string, limit: number = 50): Promise<any[]> {
    const contract = this.getOGStorageContract();
    const history = await contract.getChatHistory(user);
    return history.slice(-limit);
  }

  // Utility functions for Echo integration
  async mintDigitalTwinINFT(params: {
    to: string;
    encryptedDataUri: string;
    metadataHash: string;
    qualityScore: number;
    dataTypes: string[];
  }): Promise<any> {
    // First mint the INFT
    const inftTx = await this.mintINFT({
      to: params.to,
      uri: params.encryptedDataUri,
      metadataHash: params.metadataHash
    });
    
    const receipt = await inftTx.wait();
    const tokenId = receipt.logs[0].args.tokenId.toString();

    // Set data catalog tags
    await this.setTags(CONTRACT_ADDRESSES.OPACUS_INFT, tokenId, params.dataTypes);
    
    // Set quality score
    await this.setDataQualityScore(CONTRACT_ADDRESSES.OPACUS_INFT, tokenId, params.qualityScore);

    return { tokenId, receipt };
  }

  // Permission management operations
  async grantPermission(permission: string): Promise<any> {
    const contract = this.getPermissionManagerContract();
    const tx = await contract.grantPermission(permission);
    return await tx.wait();
  }

  async revokePermission(permission: string): Promise<any> {
    const contract = this.getPermissionManagerContract();
    const tx = await contract.revokePermission(permission);
    return await tx.wait();
  }

  async hasPermission(user: string, permission: string): Promise<boolean> {
    const contract = this.getPermissionManagerContract();
    return await contract.hasPermission(user, permission);
  }

  async getUserPermissions(user: string): Promise<string[]> {
    const contract = this.getPermissionManagerContract();
    return await contract.getUserPermissions(user);
  }

  // Data catalog operations
  async setTags(collection: string, tokenId: string, tags: string[]): Promise<any> {
    const contract = this.getDataCatalogContract();
    const tagBytes = tags.map(tag => ethers.keccak256(ethers.toUtf8Bytes(tag)));
    const tx = await contract.setTags(collection, tokenId, tagBytes);
    return await tx.wait();
  }

  async setAttributes(collection: string, tokenId: string, attributes: {key: string, value: string}[]): Promise<any> {
    const contract = this.getDataCatalogContract();
    const attrBytes = attributes.map(attr => ({
      key: ethers.keccak256(ethers.toUtf8Bytes(attr.key)),
      value: ethers.keccak256(ethers.toUtf8Bytes(attr.value))
    }));
    const tx = await contract.setAttributes(collection, tokenId, attrBytes);
    return await tx.wait();
  }

  async getTags(collection: string, tokenId: string): Promise<string[]> {
    const contract = this.getDataCatalogContract();
    return await contract.getTags(collection, tokenId);
  }

  // Marketplace operations
  async listItem(params: {
    collection: string;
    tokenId: string;
    saleType: number; // 0 = Transfer, 1 = Rent
    currency: string;
    price: string;
    rentDuration?: number;
    rentPermissions?: string;
    tags: string[];
  }): Promise<any> {
    const contract = this.getDataMarketplaceContract();
    const tagBytes = params.tags.map(tag => ethers.keccak256(ethers.toUtf8Bytes(tag)));
    const tx = await contract.listItem(
      params.collection,
      params.tokenId,
      params.saleType,
      params.currency,
      ethers.parseEther(params.price),
      params.rentDuration || 0,
      params.rentPermissions || '0x',
      tagBytes
    );
    return await tx.wait();
  }

  async buyListing(listingId: string, value?: string): Promise<any> {
    const contract = this.getDataMarketplaceContract();
    const tx = await contract.buy(listingId, {
      value: value ? ethers.parseEther(value) : 0
    });
    return await tx.wait();
  }

  async getListingsByTag(tag: string): Promise<string[]> {
    const contract = this.getDataMarketplaceContract();
    const tagBytes = ethers.keccak256(ethers.toUtf8Bytes(tag));
    return await contract.getListingsByTag(tagBytes);
  }

  async getListing(id: string): Promise<any> {
    const contract = this.getDataMarketplaceContract();
    return await contract.getListing(id);
  }

  // Chat and storage operations
  async storeChatLog(user: string, prompt: string, response: string): Promise<any> {
    const contract = this.getOGStorageContract();
    const tx = await contract.storeChatLog(user, prompt, response);
    return await tx.wait();
  }

  async getChatHistory(user: string): Promise<any> {
    const contract = this.getOGStorageContract();
    return await contract.getChatHistory(user);
  }

  // Chat operations - direct contract calls (no gasless)
  async queryLLM(user: string, prompt: string, context?: string): Promise<any> {
    return await computeApiClient.queryLLM({ user, prompt, context });
  }

  async getChatHistoryCompute(user: string): Promise<any> {
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

  async storeEncryptedData(user: string, encryptedUri: string, metadataHash: string): Promise<any> {
    const contract = this.getOGStorageContract();
    const tx = await contract.storeEncryptedData(user, encryptedUri, metadataHash);
    return await tx.wait();
  }

  // Mint INFT
  async mintINFT(params: {
    to: string;
    uri: string;
    metadataHash: string;
  }): Promise<any> {
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.OPACUS_INFT,
      [
        'function mint(address to, string calldata encURI, bytes32 h) external returns (uint256 id)',
        'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)'
      ],
      this.signer!
    );
    const tx = await contract.mint(params.to, params.uri, params.metadataHash);
    return await tx.wait();
  }

  // Set tags
  async setTags(collection: string, tokenId: string, tags: string[]): Promise<any> {
    const contract = new ethers.Contract(
      collection,
      [
        'function setTags(address collection, uint256 tokenId, bytes32[] calldata tags) external',
        'event TagsSet(address indexed collection, uint256 indexed tokenId, bytes32[] tags)'
      ],
      this.signer!
    );
    const tagBytes = tags.map(tag => ethers.keccak256(ethers.toUtf8Bytes(tag)));
    const tx = await contract.setTags(collection, tokenId, tagBytes);
    return await tx.wait();
  }
}

export const web3Service = new Web3Service();

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}
