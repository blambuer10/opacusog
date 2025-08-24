
// OG Network client for 0G Storage, Compute, and DA integration
import axios from 'axios';
import { ethers } from 'ethers';
import { OpacusCrypto } from './crypto';

interface OGStorageResponse {
  uri: string;
  hash: string;
  size: number;
  timestamp: number;
}

interface OGComputeJob {
  jobId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  proof?: string;
  error?: string;
}

interface TEEAttestation {
  mrenclave: string;
  signature: string;
  timestamp: number;
  payload: string;
}

export class OGClient {
  private storageEndpoint: string;
  private computeEndpoint: string;
  private daEndpoint: string;
  private apiKey: string;
  private crypto: OpacusCrypto;

  constructor(config: {
    storageEndpoint: string;
    computeEndpoint: string;
    daEndpoint: string;
    apiKey: string;
  }) {
    this.storageEndpoint = config.storageEndpoint;
    this.computeEndpoint = config.computeEndpoint;
    this.daEndpoint = config.daEndpoint;
    this.apiKey = config.apiKey;
    this.crypto = new OpacusCrypto();
  }

  // 0G Storage Operations
  async storeEncryptedData(data: any, metadata?: any): Promise<OGStorageResponse> {
    try {
      // Encrypt data before storage
      const encryptedData = await this.crypto.encryptData(JSON.stringify(data));
      
      const formData = new FormData();
      formData.append('data', new Blob([JSON.stringify(encryptedData)], { type: 'application/json' }));
      if (metadata) {
        formData.append('metadata', JSON.stringify(metadata));
      }

      const response = await axios.post(`${this.storageEndpoint}/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      return {
        uri: response.data.uri || response.data.hash,
        hash: response.data.hash,
        size: response.data.size || 0,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('0G Storage upload error:', error);
      throw new Error('Failed to store data on 0G Storage');
    }
  }

  async retrieveEncryptedData(uri: string, decryptionKey?: string): Promise<any> {
    try {
      const response = await axios.get(`${this.storageEndpoint}/retrieve/${uri}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      const encryptedData = response.data;
      
      if (decryptionKey) {
        // Decrypt if key provided
        return await this.crypto.decryptData(encryptedData, decryptionKey);
      }
      
      return encryptedData;
    } catch (error) {
      console.error('0G Storage retrieve error:', error);
      throw new Error('Failed to retrieve data from 0G Storage');
    }
  }

  // 0G Compute Operations
  async submitSecureInference(params: {
    model: string;
    input: string;
    context?: any;
    verificationMode?: 'TEE' | 'ZKP';
    encryptedContext?: boolean;
  }): Promise<OGComputeJob> {
    try {
      let processedContext = params.context;
      
      // Encrypt sensitive context data
      if (params.encryptedContext && params.context) {
        processedContext = await this.crypto.encryptData(JSON.stringify(params.context));
      }

      const response = await axios.post(`${this.computeEndpoint}/inference`, {
        model: params.model,
        input: params.input,
        context: processedContext,
        verification_mode: params.verificationMode || 'TEE',
        encrypted: params.encryptedContext || false
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        jobId: response.data.job_id,
        status: 'pending'
      };
    } catch (error) {
      console.error('0G Compute inference error:', error);
      throw new Error('Failed to submit inference job');
    }
  }

  async getInferenceResult(jobId: string): Promise<OGComputeJob> {
    try {
      const response = await axios.get(`${this.computeEndpoint}/inference/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return {
        jobId,
        status: response.data.status,
        result: response.data.result,
        proof: response.data.proof,
        error: response.data.error
      };
    } catch (error) {
      console.error('0G Compute result fetch error:', error);
      throw new Error('Failed to get inference result');
    }
  }

  async submitModelTraining(params: {
    baseModel: string;
    trainingData: any[];
    hyperparameters?: any;
    encryptedData?: boolean;
  }): Promise<OGComputeJob> {
    try {
      let processedData = params.trainingData;
      
      // Encrypt training data if requested
      if (params.encryptedData) {
        processedData = await Promise.all(
          params.trainingData.map(async (data) => 
            await this.crypto.encryptData(JSON.stringify(data))
          )
        );
      }

      const response = await axios.post(`${this.computeEndpoint}/train`, {
        base_model: params.baseModel,
        training_data: processedData,
        hyperparameters: params.hyperparameters || {},
        encrypted: params.encryptedData || false
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        jobId: response.data.job_id,
        status: 'pending'
      };
    } catch (error) {
      console.error('0G Compute training error:', error);
      throw new Error('Failed to submit training job');
    }
  }

  // TEE Attestation Operations
  async generateTEEAttestation(payload: any): Promise<TEEAttestation> {
    try {
      const response = await axios.post(`${this.computeEndpoint}/tee/attest`, {
        payload: JSON.stringify(payload)
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        mrenclave: response.data.mrenclave,
        signature: response.data.signature,
        timestamp: response.data.timestamp,
        payload: response.data.payload
      };
    } catch (error) {
      console.error('TEE attestation error:', error);
      throw new Error('Failed to generate TEE attestation');
    }
  }

  async verifyTEEAttestation(attestation: TEEAttestation): Promise<boolean> {
    try {
      const response = await axios.post(`${this.computeEndpoint}/tee/verify`, {
        mrenclave: attestation.mrenclave,
        signature: attestation.signature,
        timestamp: attestation.timestamp,
        payload: attestation.payload
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.valid === true;
    } catch (error) {
      console.error('TEE verification error:', error);
      return false;
    }
  }

  // 0G DA Operations
  async submitDataAvailability(data: any): Promise<{ hash: string; proof: string }> {
    try {
      const response = await axios.post(`${this.daEndpoint}/submit`, {
        data: JSON.stringify(data)
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        hash: response.data.hash,
        proof: response.data.proof
      };
    } catch (error) {
      console.error('0G DA submission error:', error);
      throw new Error('Failed to submit data for availability');
    }
  }

  async verifyDataAvailability(hash: string): Promise<{ available: boolean; proof?: string }> {
    try {
      const response = await axios.get(`${this.daEndpoint}/verify/${hash}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return {
        available: response.data.available,
        proof: response.data.proof
      };
    } catch (error) {
      console.error('0G DA verification error:', error);
      return { available: false };
    }
  }

  // High-level Digital Twin Operations
  async createDigitalTwin(params: {
    owner: string;
    dataSources: string[];
    initialData: any[];
    qualityScore?: number;
  }): Promise<{ twinId: string; modelUri: string; dataUri: string }> {
    try {
      // 1. Store encrypted data
      const dataResponse = await this.storeEncryptedData({
        owner: params.owner,
        sources: params.dataSources,
        data: params.initialData,
        timestamp: Date.now()
      });

      // 2. Submit model training job
      const trainingJob = await this.submitModelTraining({
        baseModel: 'llama-3.3-70b-instruct',
        trainingData: params.initialData,
        encryptedData: true
      });

      // 3. Poll for training completion (simplified)
      let modelUri = '';
      let attempts = 0;
      while (attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        const jobResult = await this.getInferenceResult(trainingJob.jobId);
        
        if (jobResult.status === 'completed') {
          // Store trained model
          const modelResponse = await this.storeEncryptedData({
            type: 'trained_model',
            jobId: trainingJob.jobId,
            result: jobResult.result
          });
          modelUri = modelResponse.uri;
          break;
        }
        
        if (jobResult.status === 'failed') {
          throw new Error('Model training failed');
        }
        
        attempts++;
      }

      if (!modelUri) {
        throw new Error('Model training timeout');
      }

      return {
        twinId: ethers.keccak256(ethers.toUtf8Bytes(`${params.owner}-${Date.now()}`)),
        modelUri,
        dataUri: dataResponse.uri
      };
    } catch (error) {
      console.error('Digital twin creation error:', error);
      throw new Error('Failed to create digital twin');
    }
  }

  async queryDigitalTwin(params: {
    twinId: string;
    modelUri: string;
    query: string;
    context?: any;
  }): Promise<{ response: string; attestation: TEEAttestation }> {
    try {
      // Submit secure inference
      const job = await this.submitSecureInference({
        model: params.modelUri,
        input: params.query,
        context: params.context,
        verificationMode: 'TEE',
        encryptedContext: true
      });

      // Poll for result
      let result: any;
      let attempts = 0;
      while (attempts < 20) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const jobResult = await this.getInferenceResult(job.jobId);
        
        if (jobResult.status === 'completed') {
          result = jobResult.result;
          break;
        }
        
        if (jobResult.status === 'failed') {
          throw new Error('Inference failed: ' + jobResult.error);
        }
        
        attempts++;
      }

      if (!result) {
        throw new Error('Inference timeout');
      }

      // Generate attestation for the query
      const attestation = await this.generateTEEAttestation({
        twinId: params.twinId,
        query: params.query,
        response: result.response,
        timestamp: Date.now()
      });

      return {
        response: result.response,
        attestation
      };
    } catch (error) {
      console.error('Digital twin query error:', error);
      throw new Error('Failed to query digital twin');
    }
  }
}

// Export configured client instance
const ogClient = new OGClient({
  storageEndpoint: process.env.NEXT_PUBLIC_OG_STORAGE_ENDPOINT || 'https://storage-testnet.0g.ai',
  computeEndpoint: process.env.NEXT_PUBLIC_OG_COMPUTE_ENDPOINT || 'https://compute-testnet.0g.ai',
  daEndpoint: process.env.NEXT_PUBLIC_OG_DA_ENDPOINT || 'https://da-testnet.0g.ai',
  apiKey: process.env.NEXT_PUBLIC_OG_API_KEY || 'demo-api-key'
});

export { ogClient };
export default OGClient;
