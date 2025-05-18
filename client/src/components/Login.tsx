import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { auth, googleProvider, signInWithPopup } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

let GoogleSignin: any;
if (Platform.OS !== 'web') {
  GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
}

const { width, height } = Dimensions.get('window');

const Login = () => {
  const [error, setError] = useState('');
  const navigation = useNavigation();

  const handleGoogleSignIn = async () => {
    try {
      if (Platform.OS === 'web') {
        await signInWithPopup(auth, googleProvider);
        navigation.navigate('Dashboard' as never);
      } else {
        await GoogleSignin.hasPlayServices();
        const { idToken } = await GoogleSignin.signIn();
        const googleCredential = auth.GoogleAuthProvider.credential(idToken);
        await auth().signInWithCredential(googleCredential);
        navigation.navigate('Dashboard' as never);
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#4c669f', '#3b5998', '#192f6a']}
        style={styles.gradientBackground}
      >
        <View style={styles.overlay} />
        <View style={styles.content}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>FinanceTrack</Text>
            <Text style={styles.subtitle}>Your Personal Finance Journey Starts Here</Text>
          </View>

          <View style={styles.cardContainer}>
            <View style={styles.card}>
              <Text style={styles.welcomeText}>Welcome Back!</Text>
              <Text style={styles.description}>
                Track your expenses, manage multiple wallets, and take control of your financial future.
              </Text>
              
              <TouchableOpacity
                style={styles.googleButton}
                onPress={handleGoogleSignIn}
              >
                <LinearGradient
                  colors={['#4285f4', '#3578e5']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.buttonText}>Continue with Google</Text>
                </LinearGradient>
              </TouchableOpacity>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Secure • Private • Easy to Use
            </Text>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: height * 0.1,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.9,
    maxWidth: 300,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#546e7a',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  googleButton: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  errorText: {
    color: '#e74c3c',
    marginTop: 16,
    textAlign: 'center',
    fontSize: 14,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  footerText: {
    color: '#ffffff',
    fontSize: 14,
    opacity: 0.8,
  },
});

export default Login;