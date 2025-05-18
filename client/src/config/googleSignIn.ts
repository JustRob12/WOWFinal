import { GoogleSignin } from '@react-native-google-signin/google-signin';

export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: '615048959288-411ri03eldq6hg0fu7k705f5jr5c0ceu.apps.googleusercontent.com',
    offlineAccess: true,
  });
}; 