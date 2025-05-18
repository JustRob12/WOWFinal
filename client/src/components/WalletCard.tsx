import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface WalletCardProps {
  wallet: {
    _id: string;
    name: string;
    balance: number;
    currency: string;
  };
  onPress: () => void;
}

const WalletCard = ({ wallet, onPress }: WalletCardProps) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.leftContent}>
        <View style={styles.iconContainer}>
          <FontAwesome name="credit-card" size={24} color="#ffffff" />
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{wallet.name}</Text>
          <Text style={styles.balance}>
            {wallet.currency} {wallet.balance.toFixed(2)}
          </Text>
        </View>
      </View>
      <View style={styles.rightContent}>
        <FontAwesome name="angle-right" size={24} color="#95a5a6" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightContent: {
    paddingLeft: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  balance: {
    fontSize: 15,
    color: '#34495e',
    fontWeight: '500',
  },
});

export default WalletCard; 