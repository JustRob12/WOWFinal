import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { API_ENDPOINTS } from '../config/api';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getToken } from '../services/auth';
import InsufficientBalanceModal from './InsufficientBalanceModal';
import TransactionConfirmationModal from './TransactionConfirmationModal';

interface Transaction {
  _id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
}

interface Wallet {
  _id: string;
  name: string;
  balance: number;
  currency: string;
  transactions: Transaction[];
}

const WalletDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { walletId } = route.params as { walletId: string };
  
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [isInsufficientBalanceVisible, setIsInsufficientBalanceVisible] = useState(false);
  const [attemptedAmount, setAttemptedAmount] = useState(0);
  const [isConfirmationModalVisible, setIsConfirmationModalVisible] = useState(false);

  const fetchWallet = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_ENDPOINTS.wallets}/${walletId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setWallet(data);
    } catch (error) {
      console.error('Error fetching wallet:', error);
    }
  };

  const fetchTransactionsSummary = async () => {
    try {
      const token = await getToken();
      const response = await fetch(
        `${API_ENDPOINTS.wallets}/${walletId}/transactions?period=${period}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      // Update wallet with new transactions data
      setWallet(prev => prev ? { ...prev, transactions: data.transactions } : null);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, [walletId]);

  useEffect(() => {
    fetchTransactionsSummary();
  }, [period]);

  const handleAddTransaction = async () => {
    if (!amount || !description || !category) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const transactionAmount = parseFloat(amount);

    // Check if there's enough balance for expense transactions
    if (transactionType === 'expense' && wallet && transactionAmount > wallet.balance) {
      setAttemptedAmount(transactionAmount);
      setIsInsufficientBalanceVisible(true);
      return;
    }

    // Show confirmation modal instead of immediately adding the transaction
    setIsConfirmationModalVisible(true);
  };

  const handleConfirmTransaction = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_ENDPOINTS.wallets}/${walletId}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: transactionType,
          amount: parseFloat(amount),
          description,
          category,
        }),
      });

      if (response.ok) {
        setAmount('');
        setDescription('');
        setCategory('');
        fetchWallet();
        fetchTransactionsSummary();
        setIsConfirmationModalVisible(false);
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.error || 'Failed to add transaction');
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      Alert.alert('Error', 'Failed to add transaction. Please try again.');
    }
  };

  if (!wallet) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <FontAwesome name="refresh" size={32} color="#3498db" />
          <Text style={styles.loadingText}>Loading wallet...</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <FontAwesome name="angle-left" size={28} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.title}>{wallet.name}</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.balanceCard}>
          <View style={styles.balanceCardContent}>
            <Text style={styles.balanceLabel}>Current Balance</Text>
            <Text style={styles.balanceAmount}>
              {wallet.currency} {typeof wallet.balance === 'number' ? wallet.balance.toFixed(2) : '0.00'}
            </Text>
          </View>
          <View style={styles.balanceCardOverlay} />
        </View>

        <View style={styles.addTransactionSection}>
          <Text style={styles.sectionTitle}>Add Transaction</Text>
          
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                transactionType === 'expense' && styles.selectedTypeButton,
              ]}
              onPress={() => setTransactionType('expense')}
            >
              <FontAwesome 
                name="minus-circle" 
                size={20} 
                color={transactionType === 'expense' ? '#ffffff' : '#7f8c8d'} 
                style={styles.typeIcon}
              />
              <Text style={[
                styles.typeButtonText,
                transactionType === 'expense' && styles.selectedTypeButtonText,
              ]}>Expense</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                transactionType === 'income' && styles.selectedTypeButton,
                transactionType === 'income' && styles.selectedIncomeButton,
              ]}
              onPress={() => setTransactionType('income')}
            >
              <FontAwesome 
                name="plus-circle" 
                size={20} 
                color={transactionType === 'income' ? '#ffffff' : '#7f8c8d'} 
                style={styles.typeIcon}
              />
              <Text style={[
                styles.typeButtonText,
                transactionType === 'income' && styles.selectedTypeButtonText,
              ]}>Income</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="Amount"
            placeholderTextColor="#95a5a6"
            keyboardType="numeric"
          />

          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder="Description"
            placeholderTextColor="#95a5a6"
          />

          <TextInput
            style={styles.input}
            value={category}
            onChangeText={setCategory}
            placeholder="Category"
            placeholderTextColor="#95a5a6"
          />

          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddTransaction}
          >
            <Text style={styles.addButtonText}>Add Transaction</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.transactionsSection}>
          <Text style={styles.sectionTitle}>Transactions</Text>
          
          <View style={styles.periodSelector}>
            {(['day', 'week', 'month', 'year'] as const).map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.periodButton,
                  period === p && styles.selectedPeriodButton,
                ]}
                onPress={() => setPeriod(p)}
              >
                <Text style={[
                  styles.periodButtonText,
                  period === p && styles.selectedPeriodButtonText,
                ]}>{p.charAt(0).toUpperCase() + p.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {wallet.transactions.length === 0 ? (
            <View style={styles.emptyTransactionsContainer}>
              <FontAwesome name="exchange" size={48} color="#bdc3c7" />
              <Text style={styles.emptyTransactionsText}>No transactions yet</Text>
              <Text style={styles.emptyTransactionsSubText}>Add your first transaction above</Text>
            </View>
          ) : (
            wallet.transactions.map((transaction) => (
              <View key={transaction._id} style={styles.transactionItem}>
                <View style={styles.transactionIcon}>
                  <FontAwesome 
                    name={transaction.type === 'income' ? 'plus-circle' : 'minus-circle'} 
                    size={24} 
                    color={transaction.type === 'income' ? '#2ecc71' : '#e74c3c'} 
                  />
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionDescription}>
                    {transaction.description}
                  </Text>
                  <Text style={styles.transactionCategory}>
                    {transaction.category}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {new Date(transaction.date).toLocaleDateString()}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.transactionAmount,
                    transaction.type === 'income'
                      ? styles.incomeAmount
                      : styles.expenseAmount,
                  ]}
                >
                  {transaction.type === 'income' ? '+' : '-'}{wallet.currency} {transaction.amount.toFixed(2)}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
      
      <InsufficientBalanceModal
        visible={isInsufficientBalanceVisible}
        onClose={() => setIsInsufficientBalanceVisible(false)}
        currentBalance={wallet.balance}
        currency={wallet.currency}
        attemptedAmount={attemptedAmount}
      />

      <TransactionConfirmationModal
        visible={isConfirmationModalVisible}
        onClose={() => setIsConfirmationModalVisible(false)}
        onConfirm={handleConfirmTransaction}
        transactionType={transactionType}
        amount={amount}
        description={description}
        category={category}
        currency={wallet.currency}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#2c3e50',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  balanceCard: {
    backgroundColor: '#3498db',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  balanceCardContent: {
    padding: 24,
  },
  balanceCardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transform: [{ rotate: '45deg' }],
  },
  balanceLabel: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  addTransactionSection: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f5f6fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeIcon: {
    marginRight: 8,
  },
  selectedTypeButton: {
    backgroundColor: '#e74c3c',
  },
  selectedIncomeButton: {
    backgroundColor: '#2ecc71',
  },
  typeButtonText: {
    color: '#7f8c8d',
    fontWeight: '600',
    fontSize: 15,
  },
  selectedTypeButtonText: {
    color: '#ffffff',
  },
  input: {
    backgroundColor: '#f5f6fa',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    color: '#2c3e50',
  },
  addButton: {
    backgroundColor: '#3498db',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  transactionsSection: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  periodSelector: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  periodButton: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f5f6fa',
    alignItems: 'center',
  },
  selectedPeriodButton: {
    backgroundColor: '#3498db',
  },
  periodButtonText: {
    color: '#7f8c8d',
    fontSize: 13,
    fontWeight: '600',
  },
  selectedPeriodButtonText: {
    color: '#ffffff',
  },
  emptyTransactionsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTransactionsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyTransactionsSubText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f6fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 4,
    fontWeight: '500',
  },
  transactionCategory: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#95a5a6',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  incomeAmount: {
    color: '#2ecc71',
  },
  expenseAmount: {
    color: '#e74c3c',
  },
});

export default WalletDetails; 