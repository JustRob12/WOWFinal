import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../firebase';

const TOKEN_KEY = '@auth_token';
const USER_KEY = '@user_data';

export const setToken = async (token: string) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error saving token:', error);
  }
};

export const storeUserData = async (userData: any) => {
  try {
    const jsonValue = JSON.stringify(userData);
    await AsyncStorage.setItem(USER_KEY, jsonValue);
  } catch (error) {
    console.error('Error saving user data:', error);
  }
};

export const getUserData = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(USER_KEY);
    return jsonValue ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

export const getToken = async () => {
  try {
    // First check Firebase current user
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      await setToken(token); // Store the latest token
      return token;
    }
    
    // If no Firebase user, check AsyncStorage
    const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
    return storedToken;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Error removing authentication data:', error);
  }
}; 