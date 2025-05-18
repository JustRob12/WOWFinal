import React, { useEffect, useState } from 'react';
import { Platform, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { User } from 'firebase/auth';
import Login from './src/components/Login';
import Dashboard from './src/components/Dashboard';
import WalletDetails from './src/components/WalletDetails';
import { configureGoogleSignIn } from './src/config/googleSignIn';
import { auth } from './src/firebase';

const Stack = createStackNavigator();

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      configureGoogleSignIn();
    }

    // Set up Firebase auth state listener
    const unsubscribe = auth.onAuthStateChanged((user: User | null) => {
      setUser(user);
      if (initializing) {
        setInitializing(false);
      }
    });

    // Cleanup subscription
    return unsubscribe;
  }, [initializing]);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2ecc71" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login" component={Login} />
        ) : (
          <>
            <Stack.Screen name="Dashboard" component={Dashboard} />
            <Stack.Screen name="WalletDetails" component={WalletDetails} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
