import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface WalletCardProps {
  wallet: {
    _id: string;
    name: string;
    balance: number;
    currency: string;
    accountNumber?: string;
  };
  onPress: () => void;
}

const WalletCard = ({ wallet, onPress }: WalletCardProps) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.iconContainer}>
        <FontAwesome name="credit-card" size={24} color="#ffffff" />
      </View>
      <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
        {wallet.name}
      </Text>
      <Text style={styles.balance}>
        {wallet.currency} {wallet.balance.toFixed(2)}
      </Text>
      {wallet.accountNumber && (
        <Text style={styles.accountNumber} numberOfLines={1} ellipsizeMode="tail">
          {wallet.accountNumber}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '48%', // Almost half of screen width to show 2 per row
    aspectRatio: 1, // Square shape
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  balance: {
    fontSize: 15,
    color: '#34495e',
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  accountNumber: {
    fontSize: 13,
    color: '#7f8c8d',
    fontFamily: 'monospace',
    textAlign: 'center',
  },
});

export default WalletCard; 