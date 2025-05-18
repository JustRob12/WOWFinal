import { Platform } from 'react-native';

const DEV_API_URL = Platform.select({
  web: 'http://localhost:5000',
  android: 'http://10.0.2.2:5000', // Android emulator localhost
  ios: 'http://localhost:5000',
  default: 'http://localhost:5000',
});

const PROD_API_URL = 'YOUR_PRODUCTION_API_URL'; // Replace this with your production API URL

export const API_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

export const API_ENDPOINTS = {
  users: `${API_URL}/api/users`,
  wallets: `${API_URL}/api/wallets`,
}; 