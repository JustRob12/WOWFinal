import { encryptTransactionFields, decryptTransactionFields } from '../utils/encryption';

export interface Transaction {
  id: string;
  walletId: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: Date;
  // Add any other fields you need
}

// Fields that should be encrypted
const ENCRYPTED_FIELDS = ['amount', 'description', 'category'];

export class SecureTransaction implements Transaction {
  id: string;
  walletId: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: Date;

  constructor(transaction: Transaction) {
    this.id = transaction.id;
    this.walletId = transaction.walletId;
    this.amount = transaction.amount;
    this.type = transaction.type;
    this.category = transaction.category;
    this.description = transaction.description;
    this.date = transaction.date;
  }

  // Convert to encrypted format for storage
  toEncrypted(): any {
    return encryptTransactionFields(this, ENCRYPTED_FIELDS);
  }

  // Create from encrypted data
  static fromEncrypted(encryptedData: any): SecureTransaction {
    const decryptedData = decryptTransactionFields(encryptedData, ENCRYPTED_FIELDS);
    return new SecureTransaction(decryptedData);
  }

  // Helper method to create a new transaction
  static create(transactionData: Omit<Transaction, 'id'>): SecureTransaction {
    const transaction: Transaction = {
      id: crypto.randomUUID(), // Generate a unique ID
      ...transactionData
    };
    return new SecureTransaction(transaction);
  }
} 