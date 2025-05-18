import { Platform } from 'react-native';
import { Buffer } from 'buffer';
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = 'your-secure-encryption-key-here';

// Simple encryption for demo purposes
// In production, use a more secure encryption method
const encryptText = (text: string, key: string): string => {
  try {
    // Basic XOR encryption (for demonstration only)
    const textBuffer = Buffer.from(text);
    const keyBuffer = Buffer.from(key);
    const result = new Uint8Array(textBuffer.length);

    for (let i = 0; i < textBuffer.length; i++) {
      result[i] = textBuffer[i] ^ keyBuffer[i % keyBuffer.length];
    }

    return Buffer.from(result).toString('base64');
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

// Simple key derivation (for demo purposes)
const deriveKey = (text: string): string => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
};

export const tokenizeAccountNumber = (accountNumber: string): string => {
  try {
    // Keep last 4 digits visible
    const lastFourDigits = accountNumber.slice(-4);
    
    // Use a consistent key for demo purposes
    // In production, use a secure key management system
    const key = deriveKey('your-secure-key-here');
    
    // Encrypt the full account number
    const encrypted = encryptText(accountNumber, key);
    
    // Create a token that includes the encrypted data and last 4 digits
    const token = `TOK_${encrypted}_${lastFourDigits}`;
    
    return token;
  } catch (error) {
    console.error('Error tokenizing account number:', error);
    throw new Error('Failed to tokenize account number');
  }
};

export const detokenizeAccountNumber = (token: string): string => {
  try {
    // Extract the encrypted part
    const encryptedPart = token.split('_')[1];
    
    // Decrypt the account number
    const decrypted = CryptoJS.AES.decrypt(encryptedPart, ENCRYPTION_KEY);
    const accountNumber = decrypted.toString(CryptoJS.enc.Utf8);
    
    return accountNumber;
  } catch (error) {
    console.error('Error detokenizing account number:', error);
    throw new Error('Failed to detokenize account number');
  }
};

export const maskAccountNumber = (token: string): string => {
  try {
    // Extract last 4 digits from token
    const lastFourDigits = token.split('_')[2];
    return `****${lastFourDigits}`;
  } catch (error) {
    console.error('Error masking account number:', error);
    return '****';
  }
}; 