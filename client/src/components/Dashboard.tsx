import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, RefreshControl, Image } from 'react-native';
import { auth } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { API_ENDPOINTS } from '../config/api';
import { FontAwesome } from '@expo/vector-icons';
import WalletCard from './WalletCard';
import CreateWalletModal from './CreateWalletModal';
import { getToken } from '../services/auth';

type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  WalletDetails: { walletId: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface UserProfile {
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: string;
}

interface Wallet {
  _id: string;
  name: string;
  balance: number;
  currency: string;
}

const Dashboard = () => {
  const navigation = useNavigation<NavigationProp>();
  const user = auth.currentUser;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [totalBalance, setTotalBalance] = useState(0);
  const [displayName, setDisplayName] = useState<string>('');

  useEffect(() => {
    if (user) {
      // Set display name from Google account
      setDisplayName(user.displayName || user.email?.split('@')[0] || 'User');
    }
  }, [user]);

  const fetchUserData = async () => {
    if (user) {
      try {
        const token = await getToken();
        // Save user to MongoDB with display name
        const response = await fetch(API_ENDPOINTS.users, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: user.email,
            displayName: user.displayName || user.email?.split('@')[0] || 'User',
            photoURL: user.photoURL,
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to save user data');
        }
        
        const data = await response.json();
        setProfile(data);
        // Update display name from server response if available
        if (data.displayName) {
          setDisplayName(data.displayName);
        }
      } catch (error) {
        console.error('Error saving user:', error);
      }
    }
  };

  const fetchWallets = async () => {
    if (user?.email) {
      try {
        const token = await getToken();
        const response = await fetch(`${API_ENDPOINTS.wallets}/user/${user.email}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch wallets');
        }
        
        const data = await response.json();
        console.log('Fetched wallets data:', data); // Debug log
        
        // Ensure data is an array
        if (!Array.isArray(data)) {
          console.error('Expected array of wallets but got:', typeof data);
          setWallets([]);
          setTotalBalance(0);
          return;
        }

        // Validate wallet data
        const validWallets = data.filter((wallet): wallet is Wallet => {
          const isValid = wallet &&
            typeof wallet === 'object' &&
            typeof wallet._id === 'string' &&
            typeof wallet.name === 'string' &&
            typeof wallet.balance === 'number' &&
            typeof wallet.currency === 'string';
          
          if (!isValid) {
            console.log('Invalid wallet:', wallet); // Debug log
          }
          return isValid;
        });

        console.log('Valid wallets:', validWallets); // Debug log
        setWallets(validWallets);
        
        // Calculate total balance
        const total = validWallets.reduce((sum, wallet) => {
          console.log(`Adding wallet balance: ${wallet.balance} to sum: ${sum}`); // Debug log
          return sum + wallet.balance;
        }, 0);
        
        console.log('Total balance calculated:', total); // Debug log
        setTotalBalance(Number(total.toFixed(2)));
      } catch (error) {
        console.error('Error fetching wallets:', error);
        setWallets([]);
        setTotalBalance(0);
      }
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchWallets();
  }, [user]);

  const handleCreateWallet = async (name: string, currency: string) => {
    if (user?.email) {
      try {
        const token = await getToken();
        const response = await fetch(API_ENDPOINTS.wallets, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            currency,
            userId: user.email,
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to create wallet');
        }
        
        await fetchWallets(); // Refresh wallets list
      } catch (error) {
        console.error('Error creating wallet:', error);
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchUserData(), fetchWallets()]);
    setRefreshing(false);
  };

  const handleWalletPress = (walletId: string) => {
    navigation.navigate('WalletDetails', { walletId });
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigation.navigate('Login' as never);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>FinanceTrack</Text>
          <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
            <FontAwesome name="sign-out" size={24} color="#e74c3c" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.welcomeCard}>
          <View style={styles.profileHeader}>
            <View style={[
              styles.defaultAvatarContainer,
              { backgroundColor: user?.photoURL ? 'transparent' : '#3498db' }
            ]}>
              {user?.photoURL ? (
                <Image
                  source={{ uri: user.photoURL }}
                  style={styles.profileImage}
                />
              ) : (
                <FontAwesome name="user" size={32} color="#ffffff" />
              )}
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{displayName}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              {profile?.createdAt && (
                <Text style={styles.joinDate}>
                  Member since {new Date(profile.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.totalBalanceCard}>
          <Text style={styles.totalBalanceLabel}>Total Balance</Text>
          <Text style={styles.totalBalanceAmount}>
            PHP {totalBalance.toFixed(2)}
          </Text>
          <View style={styles.balanceCardOverlay} />
        </View>

        <View style={styles.walletsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Wallets</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setIsCreateModalVisible(true)}
            >
              <FontAwesome name="plus" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {wallets.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <FontAwesome name="credit-card-alt" size={48} color="#bdc3c7" />
              <Text style={styles.noWalletsText}>No wallets found</Text>
              <Text style={styles.noWalletsSubText}>Create one to get started!</Text>
            </View>
          ) : (
            wallets.map((wallet) => (
              <WalletCard
                key={wallet._id}
                wallet={wallet}
                onPress={() => handleWalletPress(wallet._id)}
              />
            ))
          )}
        </View>
      </ScrollView>

      <CreateWalletModal
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
        onSubmit={handleCreateWallet}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  signOutButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  welcomeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  defaultAvatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 12,
    color: '#95a5a6',
  },
  totalBalanceCard: {
    backgroundColor: '#3498db',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
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
  totalBalanceLabel: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 8,
    fontWeight: '500',
  },
  totalBalanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  walletsSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2ecc71',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginTop: 8,
  },
  noWalletsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 8,
  },
  noWalletsSubText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
});

export default Dashboard; 