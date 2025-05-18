import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './src/components/Login';
import Dashboard from './src/components/Dashboard';
import { configureGoogleSignIn } from './src/config/googleSignIn';

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    if (Platform.OS !== 'web') {
      configureGoogleSignIn();
    }
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
