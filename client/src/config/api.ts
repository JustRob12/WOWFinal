import { Platform } from 'react-native';

// Development API URLs
const DEV_API_URL = Platform.select({
  web: 'http://localhost:5000',  // Changed to HTTP
  android: 'http://10.0.2.2:5000', // Changed to HTTP
  ios: 'http://localhost:5000',  // Changed to HTTP
  default: 'http://localhost:5000', // Changed to HTTP
});

const PROD_API_URL = 'https://api.yourfinanceapp.com'; // Replace with your secure production API URL

export const API_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

export const API_ENDPOINTS = {
  users: `${API_URL}/api/users`,
  wallets: `${API_URL}/api/wallets`,
  auth: `${API_URL}/api/auth`,
  plaid: `${API_URL}/api/plaid`,
}; 