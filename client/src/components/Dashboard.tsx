import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { auth } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import { API_ENDPOINTS } from '../config/api';
import { FontAwesome } from '@expo/vector-icons';

interface UserProfile {
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: string;
}

const Dashboard = () => {
  const navigation = useNavigation();
  const user = auth.currentUser;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const saveUserToDb = async () => {
      if (user) {
        try {
          console.log('Current user photo URL:', user.photoURL);
          // Save user to MongoDB
          const response = await fetch(API_ENDPOINTS.users, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
            }),
          });
          
          const data = await response.json();
          console.log('Server response data:', data);
          setProfile(data);
        } catch (error) {
          console.error('Error saving user:', error);
        }
      }
    };

    saveUserToDb();
  }, [user]);

  useEffect(() => {
    console.log('Current profile state:', profile);
  }, [profile]);

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
        <Text style={styles.title}>FinanceTrack</Text>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.welcomeCard}>
          {profile?.photoURL && !imageError ? (
            <Image
              source={{
                uri: profile.photoURL,
                headers: {
                  Accept: '*/*',
                },
                cache: 'force-cache'
              }}
              style={styles.profileImage}
              onError={() => setImageError(true)}
            />
          ) : (
            <View style={styles.defaultAvatarContainer}>
              <FontAwesome name="user-circle" size={80} color="#95a5a6" />
            </View>
          )}
          <Text style={styles.welcomeText}>Welcome,</Text>
          <Text style={styles.userName}>{profile?.displayName || user?.email}</Text>
          <Text style={styles.userEmail}>{profile?.email}</Text>
          <Text style={styles.joinDate}>
            Joined: {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : ''}
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>Total Balance</Text>
            <Text style={styles.statValue}>$0.00</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>Income</Text>
            <Text style={styles.statValue}>$0.00</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>Expenses</Text>
            <Text style={styles.statValue}>$0.00</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  signOutButton: {
    padding: 8,
  },
  signOutText: {
    color: '#e74c3c',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  welcomeCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
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
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  defaultAvatarContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  welcomeText: {
    fontSize: 18,
    color: '#7f8c8d',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 5,
  },
  joinDate: {
    fontSize: 14,
    color: '#95a5a6',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 12,
    flex: 1,
    minWidth: '30%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statTitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
});

export default Dashboard; 