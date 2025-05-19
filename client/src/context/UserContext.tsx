import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getUserData, storeUserData } from '../services/auth';

interface UserContextType {
  user: any;
  setUser: (user: any) => void;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await getUserData();
        if (userData) {
          setUser(userData);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Store user data in AsyncStorage whenever it changes
  useEffect(() => {
    if (user) {
      storeUserData(user);
    }
  }, [user]);

  // Show loading state while checking for stored user data
  if (isLoading) {
    return null; // Or a loading spinner if preferred
  }

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 