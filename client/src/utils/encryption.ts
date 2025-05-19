import CryptoJS from 'crypto-js';

// In production, this should be stored securely (e.g., environment variables)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-secure-encryption-key-32-chars!!';

export const encryptTransaction = (data: any) => {
  try {
    // Convert sensitive data to string if it's not already
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    
    // Encrypt using AES-256
    const encrypted = CryptoJS.AES.encrypt(dataString, ENCRYPTION_KEY).toString();
    
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt transaction data');
  }
};

export const decryptTransaction = (encryptedData: string) => {
  try {
    // Decrypt the data
    const decrypted = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    
    // Convert to string and parse if it was an object
    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
    
    try {
      // Try to parse as JSON in case it was an object
      return JSON.parse(decryptedString);
    } catch {
      // Return as string if it's not JSON
      return decryptedString;
    }
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt transaction data');
  }
};

// Helper to encrypt specific fields in a transaction object
export const encryptTransactionFields = (transaction: any, fieldsToEncrypt: string[]) => {
  const encryptedTransaction = { ...transaction };
  
  fieldsToEncrypt.forEach(field => {
    if (transaction[field] !== undefined) {
      encryptedTransaction[field] = encryptTransaction(transaction[field]);
    }
  });
  
  return encryptedTransaction;
};

// Helper to decrypt specific fields in a transaction object
export const decryptTransactionFields = (transaction: any, fieldsToDecrypt: string[]) => {
  const decryptedTransaction = { ...transaction };
  
  fieldsToDecrypt.forEach(field => {
    if (transaction[field] !== undefined) {
      decryptedTransaction[field] = decryptTransaction(transaction[field]);
    }
  });
  
  return decryptedTransaction;
}; 