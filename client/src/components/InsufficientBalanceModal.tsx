import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface InsufficientBalanceModalProps {
  visible: boolean;
  onClose: () => void;
  currentBalance: number;
  currency: string;
  attemptedAmount: number;
}

const { width } = Dimensions.get('window');

const InsufficientBalanceModal = ({
  visible,
  onClose,
  currentBalance,
  currency,
  attemptedAmount,
}: InsufficientBalanceModalProps) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.header}>
                <View style={styles.iconContainer}>
                  <FontAwesome name="exclamation-triangle" size={28} color="#ffffff" />
                </View>
                <Text style={styles.title}>Insufficient Balance</Text>
              </View>
              
              <View style={styles.balanceInfo}>
                <View style={styles.balanceRow}>
                  <Text style={styles.balanceLabel}>Available Balance</Text>
                  <Text style={[styles.balanceValue, styles.availableBalance]}>
                    {currency} {currentBalance.toFixed(2)}
                  </Text>
                </View>
                
                <View style={styles.balanceRow}>
                  <Text style={styles.balanceLabel}>Transaction Amount</Text>
                  <Text style={[styles.balanceValue, styles.expenseAmount]}>
                    - {currency} {attemptedAmount.toFixed(2)}
                  </Text>
                </View>
                
                <View style={[styles.balanceRow, styles.shortageRow]}>
                  <Text style={styles.shortageLabel}>Amount Short</Text>
                  <Text style={[styles.balanceValue, styles.shortageAmount]}>
                    {currency} {(attemptedAmount - currentBalance).toFixed(2)}
                  </Text>
                </View>
              </View>

              <Text style={styles.message}>
                The transaction amount exceeds your available balance. Please add funds or reduce the amount.
              </Text>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
              >
                <Text style={styles.closeButtonText}>Got It</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: width * 0.9,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    backgroundColor: '#e74c3c',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  balanceInfo: {
    padding: 24,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  shortageRow: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#e74c3c',
    borderBottomWidth: 0,
    backgroundColor: '#fff5f5',
    padding: 12,
    borderRadius: 8,
  },
  balanceLabel: {
    fontSize: 15,
    color: '#666666',
    flex: 1,
  },
  shortageLabel: {
    fontSize: 15,
    color: '#e74c3c',
    fontWeight: '600',
    flex: 1,
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
    textAlign: 'right',
  },
  availableBalance: {
    color: '#2ecc71',
  },
  expenseAmount: {
    color: '#e74c3c',
  },
  shortageAmount: {
    color: '#e74c3c',
    fontWeight: 'bold',
    fontSize: 18,
  },
  message: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
    lineHeight: 20,
  },
  closeButton: {
    margin: 24,
    marginTop: 0,
    backgroundColor: '#34495e',
    paddingVertical: 14,
    borderRadius: 10,
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default InsufficientBalanceModal; 