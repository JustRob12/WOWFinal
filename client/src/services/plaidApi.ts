import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { securePost, secureGet } from './secureNetwork';
import { API_ENDPOINTS } from '../config/api';

const PLAID_PUBLIC_KEY = '6822e1fce7c0ba00230a1447';

// Helper to get auth header with token
const getAuthHeader = async (): Promise<Record<string, string>> => {
  const token = await AsyncStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Function to exchange public token for access token
export const exchangePublicToken = async (publicToken: string) => {
  try {
    return await securePost(`${API_ENDPOINTS.plaid}/exchange_token`, { 
      public_token: publicToken 
    });
  } catch (error) {
    console.error('Error exchanging public token:', error);
    throw error;
  }
};

// Function to get accounts linked with Plaid
export const getPlaidAccounts = async () => {
  try {
    return await secureGet(`${API_ENDPOINTS.plaid}/accounts`);
  } catch (error) {
    console.error('Error fetching Plaid accounts:', error);
    throw error;
  }
};

// Get Plaid Link token from the server
export const createLinkToken = async () => {
  try {
    return await securePost(`${API_ENDPOINTS.plaid}/create_link_token`, {});
  } catch (error) {
    console.error('Error creating link token:', error);
    throw error;
  }
}; 