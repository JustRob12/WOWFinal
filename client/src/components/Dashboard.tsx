import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, RefreshControl, Image, TextInput, FlatList } from 'react-native';
import { auth } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { API_ENDPOINTS } from '../config/api';
import { FontAwesome } from '@expo/vector-icons';
import WalletCard from './WalletCard';
import CreateWalletModal from './CreateWalletModal';
import LogoutConfirmationModal from './LogoutConfirmationModal';
import { getToken, removeToken } from '../services/auth';
import { maskAccountNumber } from '../services/tokenization';
import { useUser } from '../context/UserContext';
import PlaidLink from './PlaidLink';

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
  accountNumber?: string; // Tokenized account number
}

const Dashboard = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user, setUser } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [totalBalance, setTotalBalance] = useState(0);
  const [displayName, setDisplayName] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredWallets, setFilteredWallets] = useState<Wallet[]>([]);

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
        // Fetch user profile from backend
        const response = await fetch(`${API_ENDPOINTS.users}/${user.email}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch user data');
        }
        const data = await response.json();
        setProfile(data);
        if (data.displayName) {
          setDisplayName(data.displayName);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
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

  useEffect(() => {
    // Filter wallets based on search query
    if (searchQuery.trim() === '') {
      setFilteredWallets(wallets);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = wallets.filter(wallet => 
        wallet.name.toLowerCase().includes(query) || 
        (wallet.accountNumber && wallet.accountNumber.includes(query))
      );
      setFilteredWallets(filtered);
    }
  }, [searchQuery, wallets]);

  const handleCreateWallet = async (name: string, currency: string, accountNumber: string) => {
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
            accountNumber, // Send tokenized account number
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
    setIsLogoutModalVisible(true);
  };

  const confirmLogout = async () => {
    try {
      // Sign out from Firebase if using it
      if (auth.currentUser) {
        await auth.signOut();
      }
      
      // Clear tokens and user data from storage
      await removeToken();
      
      // Clear user context
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handlePlaidSuccess = (publicToken: string, metadata: any) => {
    console.log('Plaid linked successfully');
    // Refresh wallets to show any newly connected accounts
    fetchWallets();
  };

  const handlePlaidExit = () => {
    console.log('Plaid link exited');
  };

  const renderWalletItem = ({ item }: { item: Wallet }) => (
    <WalletCard
      wallet={{
        ...item,
        accountNumber: item.accountNumber ? maskAccountNumber(item.accountNumber) : undefined,
      }}
      onPress={() => handleWalletPress(item._id)}
    />
  );

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
          
          <View style={styles.plaidLinkContainer}>
            <PlaidLink onSuccess={handlePlaidSuccess} onExit={handlePlaidExit} />
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

          <View style={styles.searchContainer}>
            <FontAwesome name="search" size={18} color="#95a5a6" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search wallets..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
          </View>

          {filteredWallets.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <FontAwesome name="credit-card-alt" size={48} color="#bdc3c7" />
              <Text style={styles.noWalletsText}>
                {wallets.length === 0 ? "No wallets found" : "No matching wallets"}
              </Text>
              <Text style={styles.noWalletsSubText}>
                {wallets.length === 0 ? "Create one to get started!" : "Try a different search term"}
              </Text>
            </View>
          ) : (
            <View style={styles.walletsGrid}>
              {filteredWallets.map((wallet) => (
                <WalletCard
                  key={wallet._id}
                  wallet={{
                    ...wallet,
                    accountNumber: wallet.accountNumber ? maskAccountNumber(wallet.accountNumber) : undefined,
                  }}
                  onPress={() => handleWalletPress(wallet._id)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <CreateWalletModal
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
        onSubmit={handleCreateWallet}
      />

      <LogoutConfirmationModal
        visible={isLogoutModalVisible}
        onClose={() => setIsLogoutModalVisible(false)}
        onConfirm={confirmLogout}
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
  plaidLinkContainer: {
    marginTop: 16,
    width: '100%',
  },
  walletsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 48,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#2c3e50',
  },
});

export default Dashboard; 