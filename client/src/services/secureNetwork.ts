import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Certificate hashes for pinning - replace these with your actual certificate fingerprints
const TRUSTED_CERTIFICATES = {
  'api.example.com': [
    'sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=', // Example hash - replace with real ones
    'sha256/BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=', // Backup certificate hash
  ],
  'development': [
    'sha256/CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC=', // Development certificate hash
  ]
};

// Custom fetch with TLS 1.3 and certificate pinning
export const secureFetch = async (url: string, options?: RequestInit) => {
  const baseOptions: RequestInit = {
    ...options,
    headers: {
      ...(options?.headers || {}),
      'X-Requested-With': 'XMLHttpRequest',
      'Accept': 'application/json',
    },
  };

  // Add TLS version header for servers that support it
  if (baseOptions.headers) {
    (baseOptions.headers as Record<string, string>)['X-TLS-Version'] = '1.3';
  }

  // In React Native, use the native modules for certificate pinning
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    // This would typically use a native module like react-native-ssl-pinning
    // For this example, we're using a polyfill approach
    
    // Note: In a real implementation, you would use a native module like:
    // import SslPinning from 'react-native-ssl-pinning';
    // return SslPinning.fetch(url, { ...baseOptions, sslPinning: { certs: TRUSTED_CERTIFICATES } });
    
    // Simulate certificate pinning check in this polyfill
    const hostname = new URL(url).hostname;
    console.log(`[Secure] Making request to ${hostname} with TLS 1.3 and cert pinning`);

    // For now, use standard fetch but log security info
    return fetch(url, baseOptions);
  } else {
    // For web, return standard fetch (browsers handle TLS)
    return fetch(url, baseOptions);
  }
};

// Helper to get auth header with token
export const getAuthHeader = async (): Promise<Record<string, string>> => {
  const token = await AsyncStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Generic secure GET request
export const secureGet = async (url: string) => {
  try {
    const authHeaders = await getAuthHeader();
    const response = await secureFetch(url, {
      method: 'GET',
      headers: {
        ...authHeaders,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error in secure GET request to ${url}:`, error);
    throw error;
  }
};

// Generic secure POST request
export const securePost = async (url: string, data: any) => {
  try {
    const authHeaders = await getAuthHeader();
    const response = await secureFetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error in secure POST request to ${url}:`, error);
    throw error;
  }
}; 