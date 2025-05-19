import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Platform } from 'react-native';
import { usePlaidLink } from 'react-plaid-link';
import { createLinkToken, exchangePublicToken } from '../services/plaidApi';

interface PlaidLinkProps {
  onSuccess?: (publicToken: string, metadata: any) => void;
  onExit?: () => void;
}

const PlaidLink = ({ onSuccess, onExit }: PlaidLinkProps) => {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const getLinkToken = async () => {
      try {
        setLoading(true);
        const response = await createLinkToken();
        if (response.link_token) {
          setLinkToken(response.link_token);
        }
      } catch (err) {
        console.error('Error getting link token:', err);
        setError('Failed to initialize Plaid Link');
      } finally {
        setLoading(false);
      }
    };

    getLinkToken();
  }, []);

  const onPlaidSuccess = useCallback(
    async (publicToken: string, metadata: any) => {
      try {
        // Exchange public token for access token
        await exchangePublicToken(publicToken);
        
        // Call the onSuccess callback if provided
        if (onSuccess) {
          onSuccess(publicToken, metadata);
        }
      } catch (err) {
        console.error('Error in Plaid success handler:', err);
        setError('Failed to connect to your bank account');
      }
    },
    [onSuccess]
  );

  const onPlaidExit = useCallback(() => {
    if (onExit) {
      onExit();
    }
  }, [onExit]);
  
  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: onPlaidSuccess,
    onExit: onPlaidExit,
  });

  const handlePress = () => {
    if (ready && linkToken) {
      open();
    }
  };

  // Show loading or error state
  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading Plaid Link...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // Button is disabled until the link token is ready
  return (
    <TouchableOpacity
      style={[styles.button, !ready && styles.buttonDisabled]}
      onPress={handlePress}
      disabled={!ready || !linkToken}
    >
      <Text style={styles.buttonText}>Connect Your Bank Account</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#4285f4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
  },
});

export default PlaidLink; 