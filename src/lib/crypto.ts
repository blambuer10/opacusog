
// Client-side encryption utilities using WebCrypto API
// AES-256-GCM encryption with RSA-OAEP key wrapping

export class OpacusCrypto {
  private static enc = new TextEncoder();
  private static dec = new TextDecoder();

  // Convert ArrayBuffer to base64
  private static bufToBase64(buf: ArrayBuffer): string {
    const bytes = new Uint8Array(buf);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  // Convert base64 to ArrayBuffer
  private static base64ToBuf(b64: string): ArrayBuffer {
    const binary = atob(b64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  // Generate AES-256-GCM key
  static async generateAesKey(extractable = true): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      extractable,
      ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey']
    );
  }

  // Export AES key to JWK base64
  static async exportAesKeyToJwkBase64(key: CryptoKey): Promise<string> {
    const jwk = await crypto.subtle.exportKey('jwk', key);
    return btoa(JSON.stringify(jwk));
  }

  // Import AES key from JWK base64
  static async importAesKeyFromJwkBase64(jwkB64: string): Promise<CryptoKey> {
    const jwk = JSON.parse(atob(jwkB64));
    return await crypto.subtle.importKey(
      'jwk',
      jwk,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey']
    );
  }

  // Encrypt data with AES-GCM
  static async encryptData(
    plaintext: string | ArrayBuffer | Uint8Array,
    aesKey: CryptoKey
  ): Promise<{
    ciphertextBase64: string;
    ivBase64: string;
    alg: string;
    tagLength: number;
  }> {
    let plainBuf: Uint8Array;
    
    if (typeof plaintext === 'string') {
      plainBuf = this.enc.encode(plaintext);
    } else if (plaintext instanceof ArrayBuffer) {
      plainBuf = new Uint8Array(plaintext);
    } else {
      plainBuf = plaintext;
    }

    const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit nonce
    const cipherBuf = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv, tagLength: 128 },
      aesKey,
      plainBuf
    );

    return {
      ciphertextBase64: this.bufToBase64(cipherBuf),
      ivBase64: this.bufToBase64(iv.buffer),
      alg: 'AES-GCM',
      tagLength: 128
    };
  }

  // Decrypt data with AES-GCM
  static async decryptData(
    payload: {
      ciphertextBase64: string;
      ivBase64: string;
      tagLength?: number;
    },
    aesKey: CryptoKey,
    returnText = true
  ): Promise<string | ArrayBuffer> {
    const cipherBuf = this.base64ToBuf(payload.ciphertextBase64);
    const ivBuf = this.base64ToBuf(payload.ivBase64);
    
    const plainBuf = await crypto.subtle.decrypt(
      { 
        name: 'AES-GCM', 
        iv: new Uint8Array(ivBuf), 
        tagLength: payload.tagLength || 128 
      },
      aesKey,
      cipherBuf
    );
    
    if (returnText) {
      return this.dec.decode(plainBuf);
    }
    return plainBuf;
  }

  // Generate RSA-OAEP key pair
  static async generateRsaKeyPair(): Promise<CryptoKeyPair> {
    return await crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
      },
      true,
      ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey']
    );
  }

  // Export RSA public key to SPKI PEM format
  static async exportRsaPublicKeyToPem(publicKey: CryptoKey): Promise<string> {
    const exported = await crypto.subtle.exportKey('spki', publicKey);
    const exportedAsString = this.bufToBase64(exported);
    const pemExported = `-----BEGIN PUBLIC KEY-----\n${exportedAsString}\n-----END PUBLIC KEY-----`;
    return pemExported;
  }

  // Export RSA private key to PKCS8 PEM format
  static async exportRsaPrivateKeyToPem(privateKey: CryptoKey): Promise<string> {
    const exported = await crypto.subtle.exportKey('pkcs8', privateKey);
    const exportedAsString = this.bufToBase64(exported);
    const pemExported = `-----BEGIN PRIVATE KEY-----\n${exportedAsString}\n-----END PRIVATE KEY-----`;
    return pemExported;
  }

  // Import RSA public key from SPKI PEM
  static async importRsaPublicKeyFromPem(spkiPem: string): Promise<CryptoKey> {
    const b64 = spkiPem
      .replace(/-----BEGIN PUBLIC KEY-----/, '')
      .replace(/-----END PUBLIC KEY-----/, '')
      .replace(/\s+/g, '');
    const spki = this.base64ToBuf(b64);
    return await crypto.subtle.importKey(
      'spki',
      spki,
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      true,
      ['encrypt', 'wrapKey']
    );
  }

  // Import RSA private key from PKCS8 PEM
  static async importRsaPrivateKeyFromPem(pkcs8Pem: string): Promise<CryptoKey> {
    const b64 = pkcs8Pem
      .replace(/-----BEGIN PRIVATE KEY-----/, '')
      .replace(/-----END PRIVATE KEY-----/, '')
      .replace(/\s+/g, '');
    const pkcs8 = this.base64ToBuf(b64);
    return await crypto.subtle.importKey(
      'pkcs8',
      pkcs8,
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      true,
      ['decrypt', 'unwrapKey']
    );
  }

  // Wrap AES key with RSA public key
  static async wrapAesKeyWithRsa(aesKey: CryptoKey, rsaPublicKey: CryptoKey): Promise<string> {
    const wrapped = await crypto.subtle.wrapKey('raw', aesKey, rsaPublicKey, { name: 'RSA-OAEP' });
    return this.bufToBase64(wrapped);
  }

  // Unwrap AES key with RSA private key
  static async unwrapAesKeyWithRsa(wrappedKeyBase64: string, rsaPrivateKey: CryptoKey): Promise<CryptoKey> {
    const wrappedBuf = this.base64ToBuf(wrappedKeyBase64);
    return await crypto.subtle.unwrapKey(
      'raw',
      wrappedBuf,
      rsaPrivateKey,
      { name: 'RSA-OAEP' },
      { name: 'AES-GCM', length: 256 },
      true,
      ['decrypt']
    );
  }

  // High-level: encrypt string for recipient
  static async encryptStringForRecipient(
    plainText: string,
    recipientRsaPublicKeyPem: string
  ): Promise<{
    ciphertextBase64: string;
    ivBase64: string;
    wrappedKeyBase64: string;
    alg: string;
    tagLength: number;
  }> {
    const aesKey = await this.generateAesKey(true);
    const encRes = await this.encryptData(plainText, aesKey);
    const recipientKey = await this.importRsaPublicKeyFromPem(recipientRsaPublicKeyPem);
    const wrapped = await this.wrapAesKeyWithRsa(aesKey, recipientKey);

    return {
      ciphertextBase64: encRes.ciphertextBase64,
      ivBase64: encRes.ivBase64,
      wrappedKeyBase64: wrapped,
      alg: encRes.alg,
      tagLength: encRes.tagLength
    };
  }

  // High-level: decrypt string from metadata
  static async decryptStringFromMetadata(
    metadata: {
      ciphertextBase64: string;
      ivBase64: string;
      wrappedKeyBase64: string;
      tagLength?: number;
    },
    recipientRsaPrivateKeyPem: string
  ): Promise<string> {
    const rsaPriv = await this.importRsaPrivateKeyFromPem(recipientRsaPrivateKeyPem);
    const aesKey = await this.unwrapAesKeyWithRsa(metadata.wrappedKeyBase64, rsaPriv);
    const result = await this.decryptData(
      {
        ciphertextBase64: metadata.ciphertextBase64,
        ivBase64: metadata.ivBase64,
        tagLength: metadata.tagLength
      },
      aesKey,
      true
    );
    return result as string;
  }
}
